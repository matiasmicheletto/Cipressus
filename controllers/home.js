app.controller("home", ['$scope', '$rootScope', '$location', 'localStorageService', function ($scope, $rootScope, $location, localStorageService) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    // Las publicaciones se deshabilitan configurando la fecha en el futuro
    $scope.now = Date.now(); // Se usa para comparar la fecha de publicacion con actual y controlar visibilidad

    ///// Cuestionario Felder-Silvermann
    $scope.testStatus = 0; // 0->Espera inicio, 1->Espera completar respuestas, 2->Respuestas completas, espera "Finalizar", 3->Respuestas enviados
    if(!$rootScope.user.test_fs && !$rootScope.user.admin){ // Si el usuario no es admin y aun no responde el test de FS, mostrar modal
        var test_modal = M.Modal.init(document.getElementById("test_modal"), {
            dismissible: false
        });

        $scope.loadTest = function () { // Mostrar preguntas
            $scope.test_FS = Cipressus.test_FS.questions;
            $scope.results = localStorageService.get("testFS");
            if (!$scope.results)
                $scope.results = {
                    startTime: Date.now(),
                    answers: [],
                    timeline: [],
                    changes: []
                };
            $scope.testStatus = 1; // Mostrar test
        };

        $scope.putOption = function (quest, opt) {
            if ($scope.results.answers[quest] != undefined) { // Si ya existia la respuesta, registrar cambio
                $scope.results.changes.push({
                    quest: quest,
                    prev: $scope.results.answers[quest],
                    next: opt
                });
            }
            $scope.results.answers[quest] = opt; // Respuesta
            $scope.results.timeline[quest] = (Date.now() - $scope.results.startTime) / 1000; // Tiempo de respuesta en segundos
            localStorageService.set("testFS", $scope.results); // Actualizar en LS
            if ($scope.results.answers.filter(function (value) {
                    return value !== undefined && value !== null
                }).length == 44) // Cantidad de preguntas contestadas
                $scope.testStatus = 2; // Habilitar boton "finalizar"
        };

        $scope.saveTestResults = function () { // Guardar los resultados del test y mostrar resultados
            $rootScope.loading = true;
            console.log($scope.results);
            Cipressus.db.set($scope.results, "users_public/" + $rootScope.user.uid + "/test_fs")
                .then(function (res) {
                    //console.log(res);
                    M.toast({
                        html: "Gracias por tu tiempo!",
                        classes: 'rounded green darken-3',
                        displayLength: 2000
                    });
                    showResults();
                    $rootScope.loading = false;
                    $scope.$apply();
                })
                .catch(function (err) {
                    console.log(err);
                    M.toast({
                        html: "Ocurrió un error al guardar resultados",
                        classes: 'rounded red',
                        displayLength: 2000
                    });
                })
        };

        var showResults = function () { // Mostrar los resultados en las barras de escala
            var scales = Cipressus.test_FS.eval($scope.results.answers);

            for (var k = 0; k < 4; k++) {
                var elem = document.getElementById("scale_" + k);
                var width = Math.abs(scales[k]) * 50 / 11;
                elem.style.width = width + '%';
                if (scales[k] < 0) {
                    elem.style.marginLeft = 50 - width + '%';
                    document.getElementById("prof_" + k).innerHTML = Cipressus.test_FS.profileDesc[k][0];
                } else {
                    elem.style.marginLeft = "50%";
                    document.getElementById("prof_" + k).innerHTML = Cipressus.test_FS.profileDesc[k][1];
                }
                elem.innerHTML = Math.abs(scales[k]);
            }

            $scope.testStatus = 3; // Mostrar resultados
        }

        test_modal.open();
    }

    var downloadNews = function () { // Descargar noticias y usuarios de la db
        $scope.news = []; // Para que las noticias aparezcan en orden, se guardan en array
        var authors = []; // Uids de usuarios que hicieron publicaciones
        Cipressus.db.getSorted('news', 'order') // Descargar lista de novedades
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) { // Lista ordenada
                    var child = childSnapshot.val();
                    child.content = Cipressus.utils.quillToHTML(child.content); // Parsear para quitar formato de quill
                    if (authors.indexOf(child.author) == -1) // Si todavia no se guardo el uid del autor de esta publicacion
                        authors.push(child.author); // Agregar a la lista
                    $scope.news.unshift(child); // Sentido inverso para que las nuevas noticias queden arriba
                });
                var ready = authors.length; // Cantidad de descargas que hay que hacer
                $scope.users = {};
                for (var k in authors) {
                    Cipressus.db.get('users_public/' + authors[k]) // Descargar datos de los autores de publicaciones solamente
                        .then(function (user_data) {
                            $scope.users[authors[k]] = user_data;
                            ready--; // Contar descarga
                            if (ready == 0) { // Si no quedan mas, terminar
                                newsData = { // Objeto a guardar en localStorage
                                    news: $scope.news,
                                    authors: $scope.users,
                                    last_update: Date.now()
                                };
                                localStorageService.set("newsData", newsData);
                                $rootScope.loading = false;
                                $rootScope.$apply();
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                            M.toast({
                                html: "Ocurrió un error al acceder a la base de datos",
                                classes: 'rounded red',
                                displayLength: 2000
                            });
                        });
                }
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrió un error al acceder a la base de datos",
                    classes: 'rounded red',
                    displayLength: 2000
                });
            });
    };


    // Monitoreo de actividad
    Cipressus.utils.activityCntr($rootScope.user.uid, "home").catch(function (err) {
        console.log(err)
    });

    var newsData = localStorageService.get("newsData"); // Localmente se guarda news, authors y last_update
    if (newsData) { // Si hay datos en local storage
        $scope.news = newsData.news;
        $scope.users = newsData.authors;
        Cipressus.db.get("metadata/updates/news") // Descargar estampa de tiempo de ultima actualizacion de esta seccion
            .then(function (news_update) {
                if (newsData.last_update < news_update) // Hay cambios en la base de datos
                    downloadNews(); // Descargar de db y guardar en localstorage
                else { // Si no hay cambios, terminar
                    $rootScope.loading = false;
                    $rootScope.$apply();
                }
            })
            .catch(function (err) {
                console.log(err);
                M.toast({
                    html: "Ocurrió un error al acceder a la base de datos",
                    classes: 'rounded red',
                    displayLength: 2000
                });
                $rootScope.loading = false;
                $rootScope.$apply();
            });
    } else { // Si no hay datos, descargar si o si
        downloadNews();
    }
}]);
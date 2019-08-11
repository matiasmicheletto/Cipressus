app.controller("home", ['$scope', '$rootScope', '$location', 'localStorageService', function ($scope, $rootScope, $location, localStorageService) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    $scope.testFSAnswers = []; // Objeto auxiliar para mostrar las respuestas del tests (esta con un watch dentro de la directiva)

    ///// Cuestionario Felder-Silvermann
    $scope.testStatus = 0; // 0->Espera inicio, 1->Espera completar respuestas, 2->Respuestas completas, espera "Finalizar", 3->Respuestas enviados
    if(!$rootScope.user.test_fs && !$rootScope.user.admin && $rootScope.user.enrolled){ // Si el usuario no es admin y aun no responde el test de FS, mostrar modal
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
            $scope.testFSAnswers = $scope.results.answers; // Copio en otra variable para que se ejecute la fc de la directiva
            Cipressus.db.set($scope.results, "users_public/" + $rootScope.user.uid + "/test_fs")
                .then(function (res) {
                    //console.log(res);
                    M.toast({
                        html: "Gracias por tu tiempo!",
                        classes: 'rounded green darken-3',
                        displayLength: 2000
                    });                    
                    $scope.testStatus = 3; // Para mostrar resultados, pasar al modo 3
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

        test_modal.open();
    }

    var downloadNews = function () { // Descargar noticias y usuarios de la db
        $scope.news = []; // Para que las noticias aparezcan en orden, se guardan en array
        var authors = []; // Uids de usuarios que hicieron publicaciones
        if($rootScope.user.course){ // Si tiene asignado un curso, descargar noticias
            Cipressus.db.getSorted('news/'+$rootScope.user.course, 'order') // Descargar lista de novedades
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
                    if(authors.length > 0){
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
                                        localStorageService.set("newsData_"+$rootScope.user.course, newsData);
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
                    }else{
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
        }else{ // Si el usuario no tiene curso asignado
            $rootScope.loading = false;
        }
    };


    // Monitoreo de actividad
    Cipressus.utils.activityCntr($rootScope.user.uid, "home").catch(function (err) {
        console.log(err);
    });

    var newsData = localStorageService.get("newsData_"+$rootScope.user.course); // Localmente se guarda news, authors y last_update
    if (newsData) { // Si hay datos en local storage
        $scope.news = newsData.news;
        $scope.users = newsData.authors;
        Cipressus.db.get("metadata/updates/news/"+$rootScope.user.course) // Descargar estampa de tiempo de ultima actualizacion de esta seccion
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
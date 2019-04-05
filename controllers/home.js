app.controller("home", ['$scope','$rootScope','$location','localStorageService', function ($scope,$rootScope,$location,localStorageService) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    // Las publicaciones se deshabilitan configurando la fecha en el futuro
    $scope.now = Date.now(); // Se usa para comparar la fecha de publicacion con actual y controlar visibilidad
    
    var downloadNews = function(){ // Descargar noticias y usuarios de la db
        $scope.news = []; // Para que las noticias aparezcan en orden, se guardan en array
        var authors = []; // Uids de usuarios que hicieron publicaciones
        Cipressus.db.getSorted('news','order') // Descargar lista de novedades
        .then(function(snapshot){
            snapshot.forEach(function(childSnapshot){ // Lista ordenada
                var child = childSnapshot.val();
                child.content = Cipressus.utils.quillToHTML(child.content); // Parsear para quitar formato de quill
                if(authors.indexOf(child.author) == -1) // Si todavia no se guardo el uid del autor de esta publicacion
                    authors.push(child.author); // Agregar a la lista
                $scope.news.unshift(child); // Sentido inverso para que las nuevas noticias queden arriba
            });  
            var ready = authors.length; // Cantidad de descargas que hay que hacer
            $scope.users = {};
            for(var k in authors){
                Cipressus.db.get('users_public/'+authors[k]) // Descargar datos de los autores de publicaciones solamente
                .then(function(user_data){
                    $scope.users[authors[k]] = user_data; 
                    ready--; // Contar descarga
                    if(ready == 0){ // Si no quedan mas, terminar
                        newsData = { // Objeto a guardar en localStorage
                            news: $scope.news,
                            authors: $scope.users,
                            last_update: Date.now()
                        };
                        localStorageService.set("newsData",newsData);
                        $rootScope.loading = false;
                        $rootScope.$apply(); 
                    }
                })
                .catch(function(err){
                    console.log(err);
                    M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                });
            }
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
    };

    // Monitoreo de actividad
    Cipressus.utils.activityCntr($rootScope.user.uid,"home").catch(function(err){console.log(err)});

    var newsData = localStorageService.get("newsData"); // Localmente se guarda news, authors y last_update
    if(newsData){ // Si hay datos en local storage
        $scope.news = newsData.news;
        $scope.users = newsData.authors;
        Cipressus.db.get("metadata/updates/news") // Descargar estampa de tiempo de ultima actualizacion de esta seccion
        .then(function(updateTimestamp){
            if(newsData.last_update < updateTimestamp) // Hay cambios en la base de datos
                downloadNews(); // Descargar
            else{ // Si no hay cambios, terminar
                $rootScope.loading = false;
                $rootScope.$apply();
            }
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
    }else{ // Si no hay datos, descargar si o si
        downloadNews();
    }
}]);
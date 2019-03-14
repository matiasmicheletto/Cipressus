app.controller("home", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();


    // Las publicaciones se deshabilitan configurando la fecha en el futuro
    $scope.now = Date.now(); // Se usa para comparar la fecha de publicacion con actual
    
    Cipressus.utils.activityCntr($rootScope.user.uid,"home").catch(function(err){console.log(err)});
    $scope.news = [];    
    Cipressus.db.getSorted('news','order') // Descargar lista de novedades
    .then(function(snapshot){
        snapshot.forEach(function(childSnapshot){ // Lista ordenada
            var child = childSnapshot.val();
            child.content = Cipressus.utils.quillToHTML(child.content); // Parsear para quitar formato de quill
            $scope.news.push(child);
        });  
        Cipressus.db.get('users_public') // Descargar lista de usuarios
        .then(function(users_data){
           $scope.users = users_data; 
            $rootScope.loading = false;
            $rootScope.$apply(); 
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
    })
    .catch(function(err){
        console.log(err);
        M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
    });

}]);
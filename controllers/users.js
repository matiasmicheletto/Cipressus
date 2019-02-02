app.controller("users", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    

    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();
    
    $scope.readableTime = function(timestamp){ // Fecha y hora formal
        return moment(timestamp).format("DD/MM/YYYY HH:mm");
    };

    $scope.relativeTime = function(timestamp){ // Tiempo relativo al actual
        return moment(timestamp).fromNow();
    };

    Cipressus.db.get('users_public') // Descargar lista de novedades
    .then(function(users_data){
        $scope.users = users_data;
        $rootScope.loading = false;
        $scope.$apply();
    })
    .catch(function(err){
        console.log(err);
        M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
    });

}]);
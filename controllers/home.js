app.controller("home", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    
    $rootScope.loading = true;
    $rootScope.sidenav.close();
    
    // Descargar lista de novedades
    Cipressus.db.get('/news')
        .then(function(data){
            $scope.news = data;   
            $rootScope.loading = false;
            $rootScope.$apply(); 
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });

}]);
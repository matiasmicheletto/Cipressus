app.controller("activities", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    $rootScope.sidenav.close();

    $rootScope.loading = true;
    
    Cipressus.db.get('/activities') // Descargar arbol de actividades
        .then(function(data){
            $scope.activities = data;
            // Graficar 
            Sunburst()
                .data($scope.activities)
                .size('size')
                .color('color')
                .width(window.innerWidth*0.8)
                .height(window.innerHeight*0.8)
                (document.getElementById('chart'));                
                
            $rootScope.loading = false;
            $scope.$apply();
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
}]);
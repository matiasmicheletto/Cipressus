app.controller("scores", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    $rootScope.sidenav.close();
    
    $rootScope.loading = true;
    
    Cipressus.db.get('/activities') // Descargar arbol de actividades
        .then(function(activities_data){
            $scope.activities = activities_data;
            Cipressus.db.get('users_private/'+$rootScope.user.uid) // Descargar notas del usuario
                .then(function(user_data){
                    $scope.student = user_data;

                    ////// TEST ////
                    if($scope.student){
                        var student = $scope.student;
                        var node = $scope.activities;
                        console.log(node.name)
                        console.log(Cipressus.utils.eval(student,node));
                        
                        // Evaluacion de los laboratorios
                        node = $scope.activities.children[2];
                        console.log(node.name)
                        console.log(Cipressus.utils.eval(student,node));
                        
                        // Evaluacion de un laboratorio particular
                        node = $scope.activities.children[2].children[1];
                        console.log(node.name)
                        console.log(Cipressus.utils.eval(student,node));
                        
                        // Evaluacion de primer parcial
                        node = $scope.activities.children[1].children[0];
                        console.log(node.name)
                        console.log(Cipressus.utils.eval(student,node));
                    }
                    //// TEST /////

                    
                    $rootScope.loading = false;
                    $rootScope.$apply(); 
                })
                .catch(function(err){
                    console.log(err);
                    M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
                    $rootScope.loading = false;
                    $rootScope.$apply(); 
                });        
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            $rootScope.loading = false;
            $rootScope.$apply(); 
        });
}]);
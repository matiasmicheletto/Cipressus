app.controller("hardware", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();        
    Cipressus.utils.activityCntr($rootScope.user.uid, "hardware").catch(function (err) {console.log(err)});
    
    $scope.tester = [ // Entrada/salida del probador
        {output: false, input: false}, 
        {output: true, input: false}, 
        {output: false, input: true}, 
        {output: false, input: true}, 
        {output: false, input: false}, 
        {output: false, input: false}, 
        {output: true, input: false}, 
        {output: false, input: true}
    ];

    Cipressus.hardware.io = $scope.tester; // Hacer binding con esta variable
    Cipressus.hardware.onUpdate = function(){ // En actualizacion de io, refrescar la vista
        $scope.$apply(); 
    };
}]);
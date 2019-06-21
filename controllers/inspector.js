app.controller("inspector", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();        
    Cipressus.utils.activityCntr($rootScope.user.uid, "hardware").catch(function (err) {console.log(err)});
    
    var initTester = function(){ // Inicializar controladores de la vista
        if(Cipressus.hardware.status == "CONNECTED"){
            
            $scope.tester = [ // Entrada/salida del probador
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}
            ];
        
            Cipressus.hardware.io = $scope.tester; // Hacer binding con esta variable

            Cipressus.hardware.onUpdate = function(){ // En actualizacion de io, refrescar la vista
                $scope.$apply(); 
            };
        }
    };

    var stopTester = function(){ // Al desconectar, borrar objeto para que no muestre nada
        if($scope.tester)
            $scope.tester = null;
    };
    
    // Inicializar
    initTester();

    // Conectar callbacks
    $rootScope.onWssDisconnect = function(){
        stopTester();
    };

    $rootScope.onWssConnect = function(){
        initTester();
    };
    
}]);
app.controller("hardware", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }
   
    $rootScope.loading = true;
    $scope.wssFound = false;     
    $rootScope.sidenav.close();    

    M.Modal.init(document.getElementById("tutorial_modal"),{});
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

    var hardwareConfig = { // Configuracion del probador
        io: $scope.tester, // Objeto de entrada/salida (es un array con el que se hace un binding)
        timeout: 1000, // Tiempo maximo de espera de coneccion con wss
        sp: 50, // Intervalo de actualizacion de salidas
        onUpdate:function(){ // Funcion a ejecutar cuando se actualizan las entradas
            $scope.$apply(); // Solo refrescar la vista
        }
    };

    Cipressus.hardware.initialize(hardwareConfig)
    .then(function(serialPortList){
        //console.log(serialPortList);
        $scope.serialPorts = serialPortList;
        $rootScope.loading = false;  
        $scope.wssFound = true;      
        $scope.$apply();        
        M.FormSelect.init(document.querySelectorAll('select'), {});
    })
    .catch(function(err){
        console.log(err);
        $rootScope.loading = false;
        M.toast({html: "No se pudo conectar con server",classes: 'rounded red',displayLength: 2000});
        $scope.$apply();
    });

    Cipressus.hardware.onSocketClose = function(){ // Se llama si se cierra el wss
        console.log("Socket cerrado.");
        M.toast({html: "Se desconectó el Web Socket",classes: 'rounded red',displayLength: 2000});
    };

    $scope.connect = function(){ // Cuando se elige dispositivo y se presiona "conectar"
        Cipressus.hardware.connectTo(document.getElementById("portSelect").value); // Port Connection Request        
    };
}]);
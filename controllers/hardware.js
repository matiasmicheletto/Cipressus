app.controller("hardware", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    const sample_period = 50;    
    $rootScope.loading = true;
    $scope.wssFound = false;     
    $rootScope.sidenav.close();    

    M.Modal.init(document.getElementById("tutorial_modal"),{});
    Cipressus.utils.activityCntr($rootScope.user.uid, "hardware").catch(function (err) {console.log(err)});

    
    $scope.tester = [ // Entrada/salida del probador
        {switch: false,led: false}, 
        {switch: true,led: false}, 
        {switch: false,led: true}, 
        {switch: false,led: true}, 
        {switch: false,led: false}, 
        {switch: false,led: false}, 
        {switch: true,led: false}, 
        {switch: false,led: true}
    ];

    var leds = "00000000";

    Cipressus.hardware.initialize(1500)
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


    Cipressus.hardware.onSocketClose = function(){
        console.log("Socket cerrado.");
        M.toast({html: "Se desconectó el Web Socket",classes: 'rounded red',displayLength: 2000});
    };

    Cipressus.hardware.onInputChange = function (data) { // Datos de lectura de pines
        //console.log(data);
        leds = data;        
    };

    $scope.connect = function(){ // Cuando se elige dispositivo y se presiona "conectar"
        Cipressus.hardware.connectTo(document.getElementById("portSelect").value); // Port Connection Request        
        updateIO(); // Iniciar actualizador de I/O
    };

    var updateIO = function() { // Envia el estado de los swiches cada {sample_period} ms
        var switches = ""; // String temporal para generar secuencia binaria
        for (var k in $scope.tester) { // Deben ser 8
            switches += $scope.tester[k].switch ? "1" : "0";            
            $scope.tester[k].led = (leds[k] == "1"); // Actualizar leds a partir del string leds
        }        
        
        //console.log(switches);
        Cipressus.hardware.setOutput(switches); // Convertir el valor binario en base 16 para mandar (dos byte)
        setTimeout(function () {
            updateIO();
            $scope.$apply();
        }, sample_period);    
    }
}]);
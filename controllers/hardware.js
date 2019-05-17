app.controller("hardware", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    const sample_period = 50;
    $scope.wssFound = false;
    $rootScope.loading = true;
    $rootScope.sidenav.close();    

    M.Modal.init(document.getElementById("tutorial_modal"),{});
    Cipressus.utils.activityCntr($rootScope.user.uid, "hardware").catch(function (err) {console.log(err)});

    setTimeout(function(){
        if(!$scope.wssFound){ // Todavía no se pudo conectar con websocket
            $rootScope.loading = false;
            M.toast({html: "No se pudo acceder al Web Socket",classes: 'rounded red',displayLength: 2000});
            $scope.$apply();
        }
    },2500);

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

    var socket = new WebSocket("ws://localhost:8081");

    socket.onerror = function(error){
        console.log(error);
    };

    socket.onopen = function () { // Puerto conectado
        console.log("Socket abierto.");
    };

    socket.onclose = function() {
        console.log("Socket cerrado.");
        M.toast({html: "Se desconectó el Web Socket",classes: 'rounded red',displayLength: 2000});
    };

    socket.onmessage = function (message) { // Respuesta del server
        if($scope.serialPorts){                        
            leds = message.data;            
        }else{
            $scope.serialPorts = JSON.parse(message.data);
            $rootScope.loading = false;  
            $scope.wssFound = true;      
            $scope.$apply();        
            M.FormSelect.init(document.querySelectorAll('select'), {});
        }
    };

    $scope.connect = function(){ // Cuando se elige dispositivo y se presiona "conectar"
        socket.send(document.getElementById("portSelect").value); // Port Connection Request        
        updateIO(); // Iniciar actualizador de I/O
    };

    var updateIO = function() { // Envia el estado de los swiches cada {sample_period} ms
        var switches = ""; // String temporal para generar secuencia binaria
        for (var k in $scope.tester) { // Deben ser 8
            switches += $scope.tester[k].switch ? "1" : "0";            
            $scope.tester[k].led = (leds[k] == "1"); // Actualizar leds a partir del string leds
        }        
        
        if(socket.readyState != socket.CLOSED){ // Preguntar si el socket esta conectado antes de seguir
            socket.send(switches); // Convertir el valor binario en base 16 para mandar (dos byte)
            setTimeout(function () {
                updateIO();
                $scope.$apply();
            }, sample_period);    
        }else{
            $scope.serialPorts = null;            
        }
    }
}]);
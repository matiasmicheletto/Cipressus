app.controller("hardware", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

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

    var switches = "00000000";
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
            //console.log("Mensaje recibido:" + message.data); 
            var data = message.data; // String con datos que envia el websocketserver            
            var bin = parseInt(data,16).toString(2); // Convertir el numero a base 2 (primeros 4)                
            while(bin.length < 8) bin = "0"+bin;                
            leds = bin;            
        }else{
            $scope.serialPorts = JSON.parse(message.data);
            $rootScope.loading = false;  
            $scope.wssFound = true;      
            $scope.$apply();        
            M.FormSelect.init(document.querySelectorAll('select'), {});
        }
    };

    $scope.connect = function(){ // Cuando se elige dispositivo
        var value = document.getElementById("portSelect").value;
        var baudrate = document.getElementById("baudrateSelect").value;
        socket.send(JSON.stringify({portIndex:parseInt(value), baudrate:parseInt(baudrate)})); // Port Connection Request        
        updateIO(); // Iniciar actualizador
    };

    var replaceAt = function(string, index, replace) {
        return string.substring(0, index) + replace + string.substring(index + 1);
    };

    var updateIO = function() { // Envia el estado de los swiches cada 200ms
        for (var k in $scope.tester) { // Deben ser 8
            switches = replaceAt(switches,k,$scope.tester[k].switch ? "1" : "0"); // Actualizar string switches para enviar
            $scope.tester[k].led = (leds[k] == "1"); // Actualizar leds a partir del string leds
        }        
        
        if(socket.readyState != socket.CLOSED){ // Preguntar si el socket esta conectado antes de seguir
            var bin = parseInt(switches,2).toString(16); // Convertir a 8 bit
            if(bin.length == 1) bin = bin+"0"; // Agregar el 0 si los primeros switches estan en 0
            socket.send(bin); // Convertir el valor binario en base 16 para mandar (dos byte)
            setTimeout(function () {
                updateIO();
                $scope.$apply();
            }, 200);    
        }else{
            $scope.serialPorts = null;            
        }
    }
}]);
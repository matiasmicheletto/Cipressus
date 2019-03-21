app.controller("hardware", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();    

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

    socket.onmessage = function (message) { // Respuesta del server
        if($scope.serialPorts){
            leds=message.data;
            //console.log("Mensaje recibido:" + message.data); 
            //leds = message.data.substring(1, 9);            
        }else{
            $scope.serialPorts = JSON.parse(message.data);
            $rootScope.loading = false;        
            $scope.$apply();        
            M.FormSelect.init(document.querySelectorAll('select'), {});
        }
    };

    $scope.connect = function(){ // Cuando se elige
        var value = document.getElementById("portSelect").value;
        var baudrate = document.getElementById("baudrateSelect").value;
        socket.send(JSON.stringify({portIndex:parseInt(value), baudrate:parseInt(baudrate)})); // Port Connection Request        
        updateIO(); // Iniciar actualizador
    };

    var replaceAt = function(string, index, replace) {
        return string.substring(0, index) + replace + string.substring(index + 1);
    };

    var updateIO = function() { // Envia el estado de los swiches cada 200ms
        for (var k in $scope.tester) {
            switches = replaceAt(switches,k,$scope.tester[k].switch ? "1" : "0"); // Actualizar string switches para enviar
            $scope.tester[k].led = (leds[k] == "1"); // Actualizar leds a partir del string leds
        }        
        socket.send(switches);
        setTimeout(function () {
            updateIO();
            $scope.$apply();
        }, 200);
    }
}]);
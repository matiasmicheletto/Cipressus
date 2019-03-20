app.controller("hardware", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    //$rootScope.loading = true;
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

    var socket = new WebSocket("ws://localhost:8081");

    var switches = "00000000";
    var leds = "00000000";

    socket.onopen = function () { // Puerto conectado
        console.log("Socket abierto");
        updateIO(); // Iniciar actualizador
    };

    socket.onmessage = function (result) { // Respuesta del server
        //console.log("Dato recibido:" + result.data);
        leds = result.data.substring(1, 9);
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
        $scope.$apply();
        setTimeout(function () {
            updateIO();
        }, 200);
    }
}]);
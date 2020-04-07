(function (public) { ////// HARDWARE /////
    var socket; // Objeto privado para comunicarse con el server
    var timerId = null; // Timer para temporizar los llamados al socket
    var serialPorts = []; // Lista de puertos serie disponibles (objeto privado)

    public.hardware.initServer = function (params) { // Inicializar conexion con WebSocketServer      
        /*
            params: {
                io: array con estados de entradas/salidas (para hacer binding con objetos de controllers)
                sp: periodo de muestreo (ms) de envio de salidas
                ci: periodo de intento de reconexion con server (ms)
                onUpdate(): funcion que se llama en cada actualizacion de la entrada (para hacer apply por ej)
            }
        */

        public.hardware.status = "CONNECTING"; // Inicialmente, el estado es de conectando (intenta cada tanto volver a abrir la conexion)
        public.hardware.sample_period = params.sp; // Periodo de actualizacion de salidas
        public.hardware.io = params.io; // Binding con view
        public.hardware.onUpdate = params.onUpdate;

        socket = new WebSocket("ws://localhost:8081"); // Conectarse al server por web socket

        socket.onerror = function (error) {
            console.log(error);
        };

        socket.onopen = function () { // Puerto conectado
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
            public.hardware.onSocketOpen(); // Ejecutar el callback
        };

        socket.onclose = function () { // Server no disponible (seguir intentando conectar)
            if (public.hardware.status == "CONNECTED" || public.hardware.status == "IDLE") // Si la conexion con server estaba abierta significa que se cerro el server
                public.hardware.status = "CONNECTING"; // Pasar a estado conectando
            if (!timerId) {
                timerId = setInterval(function () {
                    socket = null;
                    public.hardware.initServer(params);
                }, params.ci);
            }
            public.hardware.onSocketClose(); // Ejecutar el callback
        };

        socket.onmessage = function (message) { // Respuesta del server
            serialPorts = JSON.parse(message.data); // El primer mensaje que manda el server es la lista de puertos
            public.hardware.status = "IDLE"; // Una vez que recibe la lista de puertos, espera conexion
            socket.onmessage = function (message) { // Redefinir la funcion a partir de aqui                                        
                for (var k = 0; k < 8; k++) // Debe mandar siempre un string de 8 caracteres 
                    public.hardware.io[k].input = (message.data[k] == "1"); // Configurar inputs segun caracter sea 1 o 0
                public.hardware.onUpdate();
            };
        };
    };

    public.hardware.stopServer = function () { // Desconectarse del server (para liberar el uso de recursos)
        public.hardware.status = "DISCONNECTED";
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        socket.onclose = function () {}; // Borrar la funcion para que no se vuelva a conectar
        socket.close();
        socket = null;
    };

    public.hardware.ioUpdate = function () { // Envio de string al server para actualizar salidas
        var outputs = "";
        for (var k in public.hardware.io)
            outputs += public.hardware.io[k].output ? "1" : "0";
        socket.send(outputs);
        if (public.hardware.status == "CONNECTED")
            setTimeout(public.hardware.ioUpdate, public.hardware.sample_period);
    };

    public.hardware.connectTo = function (portIndex) { // Conectarse con un puerto de la lista    
        if (serialPorts.length > 0) {
            socket.send(portIndex); // Esto solo funciona mientras no se haya iniciado el streaming con el probador
            public.hardware.status = "CONNECTED";
            setTimeout(public.hardware.ioUpdate, 500); // Esperar 500ms e iniciar envio de comandos
        } else
            console.log("El listado de puertos no está disponible");
    };

    public.hardware.getSerialPorts = function () { // Se puede pedir la lista de puertos en cualquier momento
        return serialPorts; // Puede que un puerto ya no este disponible
    };

    public.hardware.onSocketOpen = function () { // Overridable - al conectarse con server
        console.log("Socket abierto.");
    };

    public.hardware.onSocketClose = function () { // Overridable - cuando se detiene el server
        console.log("Socket cerrado.");
    }
})(Cipressus);
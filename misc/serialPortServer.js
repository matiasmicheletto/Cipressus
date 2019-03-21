var SerialPort = require('serialport');
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket
var client, tester;

// Generar lista de puertos serie disponibles
var serialPorts = []; // Lista de puertos serie
SerialPort.list(function (err, ports) {
    ports.forEach(function (port) {
        //console.log(port.comName+'\t'+port.pnpId+'\t'+port.manufacturer);
        serialPorts.push(port);
    });
});

var openSerialPort = function(portName,baudrate){ // Cuando el cliente selecciona puerto, conectar
    //console.log("Abriendo puerto serie: "+portName+" "+baudrate);

    tester = new SerialPort(portName, baudrate); // Abrir puerto serie  
    var Readline = SerialPort.parsers.Readline;	// Instanciar el parser de la libreria
    var parser = new Readline(); // Hacer nuevo parser para leer ACII hasta fin de linea
    tester.pipe(parser);
              
    tester.on('open', function () { // Al abrir puerto serie
        console.log('Conexión exitosa. Baudrate: ' + tester.baudRate);
        // Avisar al cliente?
    });

    tester.on('close', function () { // Al cerrar el puerto serie
        console.log('Puerto desconectado.');
    });

    tester.on('error', function (error) {
        console.log('Error de puerto serie.');
        console.log(error);
    });

    parser.on('data', function (data) { // Al recibir nuevos datos    
        //console.log(data);
        if (client) client.send(data);
    });
};

wss.on('connection', function (cl) { // Callback de conexion con nuevo cliente
    
    console.log("Cliente conectado."); // Debug

    client = cl; // Asignar a variable global para acceder en otras partes

    client.on('message', function (data) { // Callback cuando el cliente envia datos
        if(tester){
            //console.log(data);
            tester.write(data+'\n');
        }else{
            var objReceived = JSON.parse(data); // Contiene el indice de puerto
            console.log(objReceived);
            // El primer mensaje que envia el cliente es el puerto al que quiere conectarse
            if (typeof(objReceived.portIndex) != null) // Si el objeto se parseo bien, conectar con puerto serie
                openSerialPort(serialPorts[objReceived.portIndex].comName, objReceived.baudrate);
        }
    });

    client.on('close', function () { // Callback cierre de conexion
        console.log("Conexión cerrada");
        client = null;
    });

    // Enviar lista de puertos serie disponibles
    client.send(JSON.stringify(serialPorts));
});
var SerialPort = require('serialport');
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket
const baudrate = 57600; // Velocidad de puerto serie
var client; // Cliente conectado (solo se usa el ultimo en conectarse)
var tester; // Puerto serie que se crea cuando el cliente manda el nombre del puerto

// Generar lista de puertos serie disponibles (se hace al principio por lo tanto hay que rein)
var serialPorts = []; // Lista de puertos serie
console.log("Lista de puertos: ");
SerialPort.list(function (err, ports) {
    ports.forEach(function (port) {
        console.log(port.comName+'\t'+port.pnpId+'\t'+port.manufacturer);
        serialPorts.push(port);
    });
});

var openSerialPort = function(portName,baudrate){ // Cuando el cliente selecciona puerto, conectar
    
    console.log("Abriendo puerto serie: "+portName+" "+baudrate);

    tester = new SerialPort(portName, baudrate); // Abrir puerto serie  
              
    tester.on('open', function () { // Al abrir puerto serie
        console.log('Conexión exitosa. Baudrate: ' + tester.baudRate);        
    });

    tester.on('close', function () { // Al cerrar conexion
        console.log('Puerto desconectado.');
    });

    tester.on('error', function (error) {
        console.log('Error de puerto serie.');
        console.log(error);
    });

    tester.on('data', function (data) { // Al recibir nuevos datos    
        //console.log("res.: ",data);
        var bin = parseInt(data.toString('hex'),16).toString(2); // Convertir el numero a base 2 (primeros 4)                
        while(bin.length < 8) // Completar con 0s hasta tener la palabra de 8 bit
            bin = "0"+bin;    
        if (client) client.send(bin); // Enviar como string binario (8 caracteres)
    });
};

wss.on('connection', function (cl) { // Callback de conexion con nuevo cliente
    
    console.log("Cliente conectado."); // Debug

    client = cl; // Asignar a variable global para acceder en otras partes

    client.on('message', function (data) { // Callback cuando el cliente envia datos
        if(tester){ // Si el puerto serie esta conectado, enviarle los datos
            var bin = parseInt(data,2).toString(16); // Convertir a 16 bit
            if(bin.length == 1) bin = "0"+bin;
            var buf = Buffer.from(bin,'hex'); // Convertir string en buffer base 16           
            //console.log("send: ",buf); 
            tester.write(buf); // Enviar al puerto serie
        }else{ // Si no hay puerto serie, los datos recibidos corresponden al puerto serie al que se quiere conectar
            //console.log(data);
            // El primer mensaje que envia el cliente es el puerto al que quiere conectarse
            if (typeof(data) != null) // Si el objeto se parseo bien, conectar con puerto serie
                openSerialPort(serialPorts[data].comName, baudrate);
        }
    });

    client.on('close', function () { // Callback cierre de conexion
        console.log("Conexión cerrada");
        client = null;
    });

    // Enviar al cliente conectado, la lista de puertos serie disponibles
    client.send(JSON.stringify(serialPorts));
});
// Ejemplo:
// $ node wsServer.js /dev/ttyUSB0

var SerialPort = require('serialport');
var WebSocketServer = require('ws').Server;

var portName = process.argv[2]; // Nombre del puerto serie (pasado como argumento al ejecutar con nodeJs)

if (!portName) { // Si no se indico un puerto, listar los puertos disponibles  
  SerialPort.list(function (err, ports) {
    ports.forEach(function (port) {
      console.log(port);
      //console.log(port.comName+'\t'+port.pnpId+'\t'+port.manufacturer);
    });
  });
} else { // Si se indico puerto, intentar conectar e iniciar WebSocketServer
  // Configuracion del servidor WebSocket
  var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket
  var currentClient;
  var tester = new SerialPort(portName, 9600); // Abrir puerto serie  

  tester.on('open', function () { // Al abrir puerto serie
    console.log('Conexión exitosa. Baudrate: ' + tester.baudRate);
  });

  tester.on('close', function () { // Al cerrar el puerto serie
    console.log('Puerto desconectado.');
  });

  tester.on('error', function (error) {
    console.log('Error de puerto serie.');
    console.log(error);
  });

  tester.on('data', function (data) { // Al recibir nuevos datos    
    if (currentClient)      
      currentClient.send(data);
  });

  wss.on('connection', function (client) { // Nuevo cliente
    console.log("Nueva conexión");
    currentClient = client; // Agregar este cliente al arreglo de conexiones

    client.on('message', function (data) { // Cuando el cliente manda datos, pasar al puerto serie      
      console.log(JSON.stringify(data));
      //tester.write(data);
    });

    client.on('close', function () { // Cuando el cliente cierra la conexion
      console.log("Conexión cerrada");
      currentClient = null;
    });
  });
}
// Ejemplo:
// $ node wsServer.js /dev/ttyUSB0

var SerialPort = require('serialport');
var WebSocketServer = require('ws').Server;

var portName = process.argv[2]; // Nombre del puerto serie (pasado como argumento al ejecutar con nodeJs)

// Configuracion del servidor WebSocket
var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket
var connections = new Array; // Lista de conexiones al servidor
var myPort = new SerialPort(portName, 9600); // Abrir puerto serie
var Readline = SerialPort.parsers.Readline; // Instanciar el parser
var parser = new Readline(); // Hacer nuevo parser para leer ACII

myPort.pipe(parser); // Mandar el stream serie al parser

myPort.on('open', function () { // Al abrir puerto serie
  console.log('Conexión exitosa. Baudrate: ' + myPort.baudRate);
});

myPort.on('close', function () { // Al cerrar el puerto serie
  console.log('Puerto desconectado.');
});

myPort.on('error', function (error) {
  console.log('Error de puerto serie: ' + error);
}); // En caso de que haya errores

parser.on('data', function (data) { // Al recibir nuevos datos
  // Si hay nuevas conexiones websocket, enviar los datos serie a todos
  console.log(data);
  if (connections.length > 0)
    for (c in connections)
      connections[c].send(JSON.stringify(data));
});

wss.on('connection', function (client) {
  console.log("Nueva conexión"); // Nuevo cliente
  connections.push(client); // Agregar este cliente al arreglo de conexiones

  client.on('message', function (data) {
    // Enviar datos por puerto serie
    console.log("Enviando al puerto serie: " + data);
    myPort.write(data); 
  }); // Cuando un cliente manda un mensaje

  client.on('close', function () { // Cuando el cliente cierra la consexion
    console.log("Puerto desconectado");
    var position = connections.indexOf(client); // Obtener el indice del cliente
    connections.splice(position, 1); // Borrarlo
  });
});
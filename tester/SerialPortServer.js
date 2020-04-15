/**
    *  Name        : serialPortServer.js
    *  Author      : Matias J. Micheletto
    *  Website     : www.cipressus.uns.edu.ar
    *  Version     : 1.0
    *  Copyright   : GPLv3
    *  Description : Server para probador de circuitos digitales - Cipressus    
    *
    *  Copyright (c) 2020
    *  Matias Micheletto <matias.micheletto@uns.edu.ar>
    *  Departamento de Ingeniería Eléctrica - Universidad Nacional del Sur
    *  Cátedra de Diseño de Circuitos Logicos (2559)
    *
    *
    *  This program is free software: you can redistribute it and/or modify
    *  it under the terms of the GNU General Public License as published by
    *  the Free Software Foundation, either version 3 of the License.
    *
    *  This program is distributed in the hope that it will be useful,
    *  but WITHOUT ANY WARRANTY; without even the implied warranty of
    *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    *  GNU General Public License for more details.
    *
    *  You should have received a copy of the GNU General Public License
    *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var SerialPort = require('serialport');
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket
const baudrate = 57600; // Velocidad de puerto serie
var client; // Cliente conectado (solo se usa el ultimo en conectarse)
var tester; // Puerto serie que se crea cuando el cliente manda el nombre del puerto

// Generar lista de puertos serie disponibles (se hace al principio por lo tanto hay que reiniciar el script al reconectar probador)
var serialPorts = []; // Lista de puertos serie
console.log("Lista de puertos: ");
SerialPort.list()
.then(function (ports) {
    ports.forEach(function (port) {
    	//console.log(port); // Imprimir el objeto completo
        console.log((port.comName||port.path)+'\t'+port.pnpId+'\t'+port.manufacturer);
        serialPorts.push(port);
    });
})
.catch(function(err){
    console.log(err);
});

var openSerialPort = function(portName){ // Cuando el cliente selecciona puerto, conectar
    
    console.log("Abriendo puerto serie: "+portName+" "+baudrate);

    tester = new SerialPort(portName, {baudRate:baudrate}); // Abrir puerto serie  
              
    tester.on('open', function () { // Al abrir puerto serie
        console.log('Conexión exitosa. Baudrate: ' + tester.baudRate);        
    });

    tester.on('close', function () { // Al cerrar conexion
        console.log('Puerto serie desconectado.');
    });

    tester.on('error', function (error) {
        console.log('Error de puerto serie.');
        console.log(error);
        process.exit(1); // Terminar programa?
    });

    tester.on('data', function (data) { // Al recibir nuevos datos    
        var bin = parseInt(data.toString('hex'),16).toString(2); // Convertir el numero a base 2 (primeros 4)                
        while(bin.length < 8) // Completar con 0s hasta tener la palabra de 8 bit
            bin = "0"+bin; 
        //console.log(bin);
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
            if (typeof(data) != null && serialPorts[data]) // Si el objeto se parseo bien, conectar con puerto serie
                openSerialPort(serialPorts[data].comName || serialPorts[data].path);
            else
                console.log("Error de comando recibido. Puerto serie desconectado");
        }
    });

    client.on('close', function () { // Callback cierre de conexion
        console.log("Conexión cerrada");
        client = null; // Borrar cliente (siempre puede ser uno por vez)
        if(tester) // Puede que aun no se haya conectado
            tester.close(); // Cerrar el puerto serie para reconectar luego
        tester = null; // Borrar el objeto del puerto serie (por si hay que elegir otro)
    });

    // Enviar al cliente conectado, la lista de puertos serie disponibles
    var sPorts = []; // Utilizar una lista paralela para evitar dependencia con serialport.js
    for(var k in serialPorts)
    	sPorts.push({
    		name: serialPorts[k].comName || serialPorts[k].path, // Nombre del puerto
    		man: serialPorts[k].manufacturer // Fabricante (si arduino original debe mostrarse bien)
    	});
    client.send(JSON.stringify(sPorts)); // Enviar lista
});
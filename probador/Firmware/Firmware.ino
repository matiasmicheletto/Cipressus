/**
  ******************************************************************************
  *  Name        : Probador.ino
  *  Author      : Matias J. Micheletto
  *  Website     : www.cipressus.uns.edu.ar
  *  Version     : 1.0
  *  Copyright   : GPLv3
  *  Description : Probador de circuitos digitales - Cipressus
  ******************************************************************************
  *
  *  Copyright (c) 2019
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
  *
  ******************************************************************************
  */


///// Configuracion (leer) /////
//#define UNO true // Descomentar para programar Arduino UNO
//#define BTOOTH true // Descomentar para usar bluetooth
//#define BTOOTH_CONFIG true // Descomentar para configurar modulo bluetooth (para la primera vez)
#define SAMPLE_PERIOD 50 // Periodo de muestreo pines de entrada (ms)
#define BAUD_N 57600 // Baudrate de puerto serie nativo
#ifdef BTOOTH
  #define BAUD_B 9600 // Baudrate de puerto serie bluetooth (softwareserial)
#endif
///// Fin configuracion /////


#ifdef BTOOTH
  #include <SoftwareSerial.h>
  SoftwareSerial Btooth(10, 11); // RX, TX
#endif

const char mask[8] = { 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80 }; // Mascaras para comparar bit por bit
unsigned long previousMillis = 0; // Instante de muestreo
const int outputPins[8] = {2,3,4,5,6,7,8,9}; // Pines de salida (Igual para UNO y NANO)

#ifdef UNO // Uno y Nano emplean distintos pines
  const int inputPins[8] = {11,10,A0,A1,A2,A3,A4,A5}; // Pines de entrada para Arduino UNO
#else 
  const int inputPins[8] = {A0,A1,A2,A3,A4,A5,A6,A7}; // Pines de entrada para Arduino NANO
#endif


void setup() {
  Serial.begin(BAUD);

  #ifdef BTOOTH
    Btooth.begin(BAUD);  
  #endif

  // Modos de pines
  for (int k = 0; k < 8; k++){
    pinMode(inputPins[k],INPUT);
    pinMode(outputPins[k],OUTPUT);
  }

  // Configuracion del modulo BLE
  #ifdef BTOOTH_CONFIG
    delay(1000);
    Btooth.println("AT");
    delay(200);
    Btooth.println("AT+ROLE0"); // Slave
    delay(200);
    Btooth.println("AT+UUID0xFFE0"); // UUID
    delay(200);
    Btooth.println("AT+CHAR0xFFE1"); // Characteristic
    delay(200);
    Btooth.println("AT+NAMEProbador"); // Name
    delay(200);
  #endif
}

void updateOutputs(char r){ // Escribir el valor de r en los pines de salida
  for (int k = 0; k < 8; k++) // TODO: Reemplazar este metodo por escritura directa del registro
    digitalWrite(outputPins[k], r & mask[k]); // Actualizar estado
}

char updateInputs(){ // Leer pines de entrada y retornar valor en char
  char s = 0x00;
  for(int k = 0; k < 8; k++) // TODO: Reemplazar este metodo por lectura directa del puerto
    s |= ((int) analogRead(inputPins[7-k]) > 512) << k; // A6 y A7 no soportan digitalRead()
  return (s & 0xFF);
}

void loop() {
  if (Serial.available()) { // Al recibir caracter, actualizar salidas
    char r = Serial.read(); // Cada catacter tiene los 8 bit para escribir en salidas
    updateOutputs(r);
  }

  #ifdef BTOOTH
    if (Btooth.available()) { // Al recibir caracter, actualizar salidas
      char r = Btooth.read();  
      updateOutputs(r); 
    }
  #endif

  if (millis() - previousMillis >= SAMPLE_PERIOD) { // Fijar frecuencia de muestreo
    previousMillis = millis();
    char s = updateInputs(); // Leer entradas
    Serial.write(s); // Mandar por serie
    #ifdef BTOOTH
      Btooth.write(s); // Mandar por bluetooth
    #endif
  }
}

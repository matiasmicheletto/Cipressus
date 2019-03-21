/**
  ******************************************************************************
  *  Name        : Firmware.cpp
  *  Author      : Matias J. Micheletto
  *  Version     : 1.0
  *  Copyright   : GPLv3
  *  Description : Probador de circuitos digitales
  ******************************************************************************
  *
  *  Copyright (c) 2018
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

#include <SoftwareSerial.h>

SoftwareSerial Btooth(10, 11); // RX, TX
String inputs = "00000000"; // 
int idxCntr = 0; // Contador de indice de salidas
const int inputPins[8] = {A0,A1,A2,A3,A4,A5,A6,A7};
unsigned long previousMillis = 0;

void setup() {
  Serial.begin(9600);
  Btooth.begin(9600);  

  // Pines de entrada
  pinMode(A0,INPUT);
  pinMode(A1,INPUT);
  pinMode(A2,INPUT);
  pinMode(A3,INPUT);
  pinMode(A4,INPUT);
  pinMode(A5,INPUT);
  pinMode(A6,INPUT);
  pinMode(A7,INPUT);
  
  // Pines de salida
  pinMode(2,OUTPUT);
  pinMode(3,OUTPUT);
  pinMode(4,OUTPUT);
  pinMode(5,OUTPUT);
  pinMode(6,OUTPUT);
  pinMode(7,OUTPUT);
  pinMode(8,OUTPUT);
  pinMode(9,OUTPUT);

  /*
  // Configuracion del modulo BLE
  delay(1000);
  Serial.println("AT");
  delay(200);
  Serial.println("AT+ROLE0"); // Slave
  delay(200);
  Serial.println("AT+UUID0xFFE0"); // UUID
  delay(200);
  Serial.println("AT+CHAR0xFFE1"); // Characteristic
  delay(200);
  Serial.println("AT+NAMEProbador"); // Name
  delay(200);
  */
}

void updateInputs(){
  for(int k = 0; k < 8; k++)
    inputs.setCharAt(k, (analogRead(inputPins[k]) > 500)?'1':'0');
}

void loop() {
  if (Serial.available()) {
    char r = Serial.read();  
    if(r == '\n' || (r != '0' && r != '1')) // Fin de linea
      idxCntr = 0;      
    else{
      if(r == '1')
        digitalWrite(idxCntr+2,HIGH);
      else // r == '0'
        digitalWrite(idxCntr+2,LOW);
      // Incrementar contador de entrada
      idxCntr = idxCntr >= 8 ? 0:idxCntr+1;
    }
  }

  if (Btooth.available()) {
    char r = Btooth.read();  
    if(r == '\n' || (r != '0' && r != '1')) // Fin de linea
      idxCntr = 0;      
    else{
      if(r == '1')
        digitalWrite(idxCntr+2,HIGH);
      else // r == '0'
        digitalWrite(idxCntr+2,LOW);
      // Incrementar contador de entrada
      idxCntr = idxCntr >= 8 ? 0:idxCntr+1;
    }
  }

  if (millis() - previousMillis >= 200) {
    previousMillis = millis();
    updateInputs();
    Serial.println(inputs);
    Btooth.println(inputs);
  }
}

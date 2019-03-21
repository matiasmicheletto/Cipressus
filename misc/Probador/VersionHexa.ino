#include <SoftwareSerial.h>

#define SAMPLE_PERIOD 200 // Periodo de muestreo pines de entrada

SoftwareSerial Btooth(10, 11); // RX, TX

const char mask[8] = { 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80 };
const int inputPins[8] = {A0,A1,A2,A3,A4,A5,A6,A7};
const int outputPins[8] = {2,3,4,5,6,7,8,9};
unsigned long previousMillis = 0;

void setup() {
  Serial.begin(9600);
  Btooth.begin(9600);  

  // Modos de pines
  for (int k = 0; k < 8; k++){
    pinMode(inputPins[k],INPUT);
    pinMode(outputPins[k],OUTPUT);
  }

  /*
  // Configuracion del modulo BLE (ejecutar solo primera vez)
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
  */
}

void updateOutputs(char r){ // Escribir el valor de r en los pines de salida
  for (int k = 0; k < 8; k++) // Para cada pin de salida
    digitalWrite(outputPins[k], r & mask[k]); // Actualizar estado
}

char updateInputs(){ // Leer pines de entrada y retornar valor en char
  char s = 0x00;
  for(int k = 0; k < 8; k++)
    s |= ((int) analogRead(inputPins[7-k]) > 512) << k; // A6 y A7 no soportan digitalRead()
  return (s & 0xFF);
}

void loop() {
  if (Serial.available()) {
    char r = Serial.read();  
    updateOutputs(r);
  }

  if (Btooth.available()) {
    char r = Btooth.read();  
    updateOutputs(r); 
  }

  if (millis() - previousMillis >= SAMPLE_PERIOD) {
    previousMillis = millis();
    char s = updateInputs();
    Serial.write(s);
    Btooth.write(s);
  }
}

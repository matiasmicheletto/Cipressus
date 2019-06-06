///// Configuracion /////
#define SAMPLE_PERIOD 1000 // Periodo de muestreo pines de entrada
#define BAUD 57600 // Baudrate de puertos serie
//#define BTOOTH true // Usar bluetooth (comentar linea para deshabilitar)
//#define BTOOTH_CONFIG true // Configurar modulo bluetooth (para la primera vez) (comentar linea para deshabilitar)

#ifdef BTOOTH
  #include <SoftwareSerial.h>
  SoftwareSerial Btooth(10, 11); // RX, TX
#endif

const char mask[8] = { 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80 };
const int inputPins[8] = {A0,A1,A2,A3,A4,A5,A6,A7};
const int outputPins[8] = {2,3,4,5,6,7,8,9};
unsigned long previousMillis = 0;

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
  for (int k = 0; k < 8; k++) // TODO: Reemplazar este metodo por escritura directa del puerto
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

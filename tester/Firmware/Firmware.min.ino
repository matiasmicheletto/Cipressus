
#define SAMPLE_PERIOD 50
#define BAUD_N 57600
#ifdef BTOOTH
#define BAUD_B 9600
#endif

#ifdef BTOOTH
#include<SoftwareSerial.h>
SoftwareSerial Btooth(10,11);
#endif
const char mask[8]={0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80};unsigned long previousMillis=0;const int outputPins[8]={2,3,4,5,6,7,8,9};
#ifdef UNO
const int inputPins[8]={11,10,A0,A1,A2,A3,A4,A5};
#else 
const int inputPins[8]={A0,A1,A2,A3,A4,A5,A6,A7};
#endif
void setup(){Serial.begin(BAUD_N);
#ifdef BTOOTH
Btooth.begin(BAUD_B);
#endif
for(int k=0;k<8;k++){pinMode(inputPins[k],INPUT);pinMode(outputPins[k],OUTPUT);}
#ifdef BTOOTH_CONFIG
delay(1000);Btooth.println("AT");delay(200);Btooth.println("AT+ROLE0");delay(200);Btooth.println("AT+UUID0xFFE0");delay(200);Btooth.println("AT+CHAR0xFFE1");delay(200);Btooth.println("AT+NAMEProbador");delay(200);
#endif
}void updateOutputs(char r){for(int k=0;k<8;k++)digitalWrite(outputPins[k],r&mask[k]);}char updateInputs(){char s=0x00;for(int k=0;k<8;k++)s|=((int)analogRead(inputPins[7-k])>512)<<k;return(s&0xFF);}void loop(){if(Serial.available()){char r=Serial.read();updateOutputs(r);}
#ifdef BTOOTH
if(Btooth.available()){char r=Btooth.read();updateOutputs(r);}
#endif
if(millis()-previousMillis>=SAMPLE_PERIOD){previousMillis=millis();char s=updateInputs();Serial.write(s);
#ifdef BTOOTH
Btooth.write(s);
#endif
}}

#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

// Pines RFID y Servo
#define SS_PIN 10
#define RST_PIN 9
#define SERVO_PIN 6

MFRC522 mfrc522(SS_PIN, RST_PIN);
Servo servoMotor;

// Configuración
#define SERVO_ABIERTO 90
#define SERVO_CERRADO 0


String ultimoUID = "";

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  servoMotor.attach(SERVO_PIN);
  servoMotor.write(SERVO_CERRADO); // Iniciar con puerta cerrada

  Serial.println("WEB:info:Sistema iniciado - Control de Entrada/Salida");
}

// ---------------- LOOP ----------------
void loop() {
  // Verificar comandos desde NestJS
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    procesarComando(comando);
  }

  // Procesar RFID
  if (!mfrc522.PICC_IsNewCardPresent()) {
    delay(50);
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial()) return;

  byte* uid = mfrc522.uid.uidByte;
  String uidStr = uidToString(uid);



 ultimoUID = uidStr;

  // Enviar UID a NestJS
  Serial.print("CHECK_ACCESS:");
  Serial.println(uidStr);


  mfrc522.PICC_HaltA();
  delay(200);
}

// ---------------- COMANDOS ----------------
void procesarComando(String comando) {
  Serial.print("WEB:debug:Comando recibido: ");
  Serial.println(comando);
  
  if (comando == "TOGGLE_DOOR") {
    toggleEntradaSalida();
  }
  else if (comando == "REQUEST_REGISTER") {
    if(ultimoUID != ""){
      enviarEvento("double", ultimoUID);
    }else {
      enviarEvento("error", "No hay UID disponible para registro");
    }
 
  }
  else if (comando.startsWith("REGISTER_SUCCESS:")) {
    String uid = comando.substring(16);
    enviarEvento("success", "Tarjeta registrada: " + uid);
  }
}

// ---------------- FUNCIÓN PRINCIPAL ----------------
void toggleEntradaSalida() {
   abrirYCerrarPuerta();
}

void abrirYCerrarPuerta() {
  // Abrir puerta
  servoMotor.write(SERVO_ABIERTO);
  delay(3000); // Mantener abierta 3 segundos
  
  // Cerrar puerta (siempre se cierra automáticamente)
  servoMotor.write(SERVO_CERRADO);
}

void enviarEvento(String tipo, String mensaje) {
  Serial.println("WEB:" + tipo + ":" + mensaje);
}

// ---------------- FUNCIONES AUXILIARES ----------------
String uidToString(byte* uid) {
  String s = "";
  for (byte i = 0; i < 4; i++) {
    if (uid[i] < 0x10) s += "0";
    s += String(uid[i], HEX);
  }
  s.toLowerCase();
  return s;
}
#include <WiFi.h>
#include <PubSubClient.h>

// Konfigurasi WiFi Wokwi (SSID dan Password)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Server MQTT gratisan (HiveMQ)
const char* mqtt_server = "broker.hivemq.com";
const char* mqtt_topic = "proyekuts/kampuslu/paket";

// --- PIN TOMBOL ---
const int btnMerah = 12; // Tombol untuk simulasi paket Merah
const int btnBiru = 14;  // Tombol untuk simulasi paket Biru

WiFiClient espClient;
PubSubClient client(espClient);

// Fungsi Koneksi ke WiFi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Konek ke WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi terhubung! IP Address: ");
  Serial.println(WiFi.localIP());
}

// Fungsi Koneksi (ulang) ke MQTT
void reconnect() {
  while (!client.connected()) {
    Serial.print("Menghubungkan ke MQTT Server...");
    
    String clientId = "ESP32-SistemSortir-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("Berhasil Terhubung!");
    } else {
      Serial.print("Gagal, status=");
      Serial.print(client.state());
      Serial.println(" Coba lagi dalam 5 detik...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  pinMode(btnMerah, INPUT_PULLUP);
  pinMode(btnBiru, INPUT_PULLUP);

  setup_wifi();
  
  // Port standar MQTT
  client.setServer(mqtt_server, 1883); 
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // --- LOGIKA BACA TOMBOL ---
  if (digitalRead(btnMerah) == LOW) {
    Serial.println("Paket MERAH terdeteksi! Mengirim data...");
    client.publish(mqtt_topic, "MERAH");
    delay(1000);
  }

  if (digitalRead(btnBiru) == LOW) {
    Serial.println("Paket BIRU terdeteksi! Mengirim data...");
    client.publish(mqtt_topic, "BIRU");
    delay(1000);
  }
}
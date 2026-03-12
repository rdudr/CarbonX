#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <SPI.h>
#include <Wire.h>
#include <RTClib.h>
#include "TFT_22_ILI9225.h"
#include <DHT.h>

// Firebase Addons
#include "addons/TokenHelper.h"

// --- CONFIG ---
const char* ssid = "Rishabh's iphone";
const char* password = "12345678";
#define DATABASE_URL "techfusion-930cf-default-rtdb.firebaseio.com"
#define DATABASE_SECRET "mLHJiLRwQWyAxwSKv3vuQFASptBdZFPHdRvQTrlb"

// --- PIN ASSIGNMENTS ---
#define TFT_RST 4
#define TFT_RS  2
#define TFT_CS  15
#define TFT_SDI 23 
#define TFT_CLK 18
#define SD_CS   5   
#define DHTPIN  16
#define MQ7_PIN 14  
#define VIB_PIN 25  

// --- ANALOG PINS (ADC1) ---
#define PIN_V_R 35
#define PIN_A_R 36
#define PIN_V_Y 32
#define PIN_A_Y 39
#define PIN_V_B 33
#define PIN_A_B 34

// --- CALIBRATION FACTORS ---
// Adjust these based on your physical measurements
float CAL_V_R = 450.0, CAL_A_R = 30.0;
float CAL_V_Y = 450.0, CAL_A_Y = 30.0;
float CAL_V_B = 450.0, CAL_A_B = 30.0;

const float V_LOW = 70.0;   // Below 70V forces 0.0V
const float A_LOW = 0.05;   // Below 0.05A forces 0.0A
#define ADC_RES 4095.0
#define V_REF 3.3

// --- OBJECTS ---
TFT_22_ILI9225 tft = TFT_22_ILI9225(TFT_RST, TFT_RS, TFT_CS, TFT_SDI, TFT_CLK, -1);
RTC_DS3231 rtc;
DHT dht(DHTPIN, DHT11);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- GLOBAL DATA ---
unsigned long lastUpdate = 0;
unsigned long lastTFTTime = 0;
float vR, aR, vY, aY, vB, aB, temp;
int co2;
bool vib;

float val(float v) { return (isnan(v) || isinf(v)) ? 0.0 : v; }

// --- HIGH ACCURACY SAMPLING LOGIC ---
void samplePhase(int vPin, int aPin, float vFact, float aFact, float &vRMS, float &aRMS) {
  int vMax = 0, vMin = 4095;
  int aMax = 0, aMin = 4095;
  uint32_t start = millis();

  // 100ms window captures 5 full cycles at 50Hz for high accuracy
  while((millis() - start) < 100) {
    int rv = analogRead(vPin);
    int ra = analogRead(aPin);
    if (rv > vMax) vMax = rv; if (rv < vMin) vMin = rv;
    if (ra > aMax) aMax = ra; if (ra < aMin) aMin = ra;
  }

  // Voltage Peak-to-Peak to RMS
  float Vpp = ((vMax - vMin) * V_REF) / ADC_RES;
  vRMS = (Vpp / 2.0) * 0.707 * vFact;
  if (vRMS < V_LOW) vRMS = 0.0;

  // Current Peak-to-Peak to RMS
  float App = ((aMax - aMin) * V_REF) / ADC_RES;
  aRMS = (App / 2.0) * 0.707 * aFact;
  if (aRMS < A_LOW) aRMS = 0.0;
}

void setup() {
  Serial.begin(115200);
  pinMode(SD_CS, OUTPUT);
  digitalWrite(SD_CS, HIGH); // Disable SD to prevent SPI conflict

  Wire.begin(21, 22);
  dht.begin();
  pinMode(VIB_PIN, INPUT);
  analogSetAttenuation(ADC_11db); // ESP32 Analog Calibration

  tft.begin();
  tft.setOrientation(1); 
  tft.clear();
  
  if (rtc.begin()) rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));

  WiFi.begin(ssid, password);
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  Firebase.begin(&config, &auth);

  tft.clear();
}

void loop() {
  // 1. DATA SAMPLING (Successive 100ms windows per phase)
  samplePhase(PIN_V_R, PIN_A_R, CAL_V_R, CAL_A_R, vR, aR);
  samplePhase(PIN_V_Y, PIN_A_Y, CAL_V_Y, CAL_A_Y, vY, aY);
  samplePhase(PIN_V_B, PIN_A_B, CAL_V_B, CAL_A_B, vB, aB);

  temp = val(dht.readTemperature());
  co2 = analogRead(MQ7_PIN);
  vib = digitalRead(VIB_PIN);
  
  DateTime now = rtc.now();
  bool cw = (WiFi.status() == WL_CONNECTED);

  // 2. PURIFIED TFT DASHBOARD (Landscape)
  if (millis() - lastTFTTime > 1000) {
    lastTFTTime = millis();
    
    tft.setFont(Terminal12x16);
    tft.drawText(5, 5, "CarbonX", COLOR_CYAN);
    tft.setFont(Terminal6x8);
    if(cw) tft.drawText(175, 10, "ONLINE", COLOR_GREEN);
    else   tft.drawText(175, 10, "OFFLINE", COLOR_RED);
    tft.drawLine(0, 22, 220, 22, COLOR_WHITE);

    tft.setFont(Terminal11x16);
    // Red Phase
    tft.drawText(5, 30, "R", COLOR_RED);
    tft.drawText(25, 30, ("V:" + String((int)vR) + "  ").c_str(), COLOR_WHITE);
    tft.drawText(100, 30, ("A:" + String(aR, 2) + "  ").c_str(), COLOR_WHITE);
    // Yellow Phase
    tft.drawText(5, 55, "Y", COLOR_YELLOW);
    tft.drawText(25, 55, ("V:" + String((int)vY) + "  ").c_str(), COLOR_WHITE);
    tft.drawText(100, 55, ("A:" + String(aY, 2) + "  ").c_str(), COLOR_WHITE);
    // Blue Phase
    tft.drawText(5, 80, "B", COLOR_CYAN);
    tft.drawText(25, 80, ("V:" + String((int)vB) + "  ").c_str(), COLOR_WHITE);
    tft.drawText(100, 80, ("A:" + String(aB, 2) + "  ").c_str(), COLOR_WHITE);

    tft.drawLine(0, 102, 220, 102, COLOR_WHITE);
    tft.drawText(5, 110, ("Temp: " + String((int)temp) + "C ").c_str(), COLOR_MAGENTA);
    tft.drawText(120, 110, ("CO2: " + String(co2) + " ").c_str(), COLOR_MAGENTA);
    tft.drawText(5, 135, "VIB: ", COLOR_WHITE);
    if(vib) tft.drawText(55, 135, "CRITICAL", COLOR_RED);
    else    tft.drawText(55, 135, "NORMAL  ", COLOR_GREEN);

    tft.drawLine(0, 158, 220, 158, COLOR_WHITE);
    tft.setFont(Terminal6x8);
    tft.drawText(5, 164, now.timestamp(DateTime::TIMESTAMP_TIME).c_str(), COLOR_WHITE);
    tft.drawText(140, 164, now.timestamp(DateTime::TIMESTAMP_DATE).c_str(), COLOR_WHITE);
  }

  // 3. CLOUD LOGGING (Every 10 Seconds)
  if (millis() - lastUpdate > 10000) {
    lastUpdate = millis();
    FirebaseJson j;
    j.set("Time", now.timestamp(DateTime::TIMESTAMP_FULL));
    j.set("R_V", (int)vR); j.set("R_A", aR);
    j.set("Y_V", (int)vY); j.set("Y_A", aY);
    j.set("B_V", (int)vB); j.set("B_A", aB);
    j.set("Temp", temp); j.set("CO2", co2);
    j.set("Vib", vib ? "CRIT" : "NORM");
    j.set("TS/.sv", "timestamp");

    if (cw && Firebase.ready()) Firebase.RTDB.pushJSON(&fbdo, "/AI_Logs", &j);

    // Verified Real-time Serial Output
    Serial.printf("[%s] R:%dV/%.2fA | Y:%dV/%.2fA | B:%dV/%.2fA\n", 
                  now.timestamp(DateTime::TIMESTAMP_TIME).c_str(), (int)vR, aR, (int)vY, aY, (int)vB, aB);
  }
}
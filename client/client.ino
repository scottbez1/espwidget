
#include "config.h"

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#include <TFT_eSPI.h> // Hardware-specific library
#include <SPI.h>

#define WIDTH 240
#define HEIGHT 240
#define ROW_READ 8

WiFiClient client;

TFT_eSPI tft = TFT_eSPI();

void setup(void)
{
  Serial.begin(38400);
  tft.begin();

  tft.setRotation(0);
  tft.fillScreen(TFT_BLACK);

  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setFreeFont(&Roboto_Thin_24);
  tft.setTextDatum(TL_DATUM);
  tft.drawString("Connecting...", 0, 0, 1);
  Serial.println("Connecting...");
  
  WiFi.setAutoConnect(true);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
}


uint8_t buf[WIDTH * 2 * ROW_READ];

int lastWifiState = -1;
unsigned long lastLoad = 0;
uint8_t f = 0;


void loop() {
  f++;

  if ((f & B1111) == 0) {
    tft.fillRect(220, 220, 20, 20, 0);
    tft.fillCircle(230, 230, abs(8 - ((f >> 4) & 0xF)), 0x0DD5);
  }
  
  int newWifiState = WiFi.status();
  if (lastWifiState != newWifiState) {
    lastWifiState = newWifiState;
    tft.fillScreen(TFT_BLACK);
    String wifistatus = "Wifi status: " + String(WiFi.status(), DEC);
    tft.drawString(wifistatus, 0, 0, 1);
    Serial.println(wifistatus);
  }

  unsigned long now = millis();
  if (now - lastLoad > 90000 || lastLoad == 0) {
    if (newWifiState == WL_CONNECTED) {
      lastLoad = now;
    
      tft.fillScreen(TFT_BLACK);
      tft.drawString("Loading...", 0, 0, 1);
      Serial.println("loading...");
      HTTPClient http;
      http.setTimeout(10000);
      http.begin(ENDPOINT);
      int status_code = http.GET();
  
      if (status_code == HTTP_CODE_OK) {
        Serial.println("Got OK");
        WiFiClient& stream = http.getStream();
        int r = 0;
        int i = 0;
        while (http.connected() && r < HEIGHT) {
          while (http.connected() && (i < sizeof(buf))) {
            size_t s = stream.available();
            if (s) {
              int c = stream.readBytes(buf, sizeof(buf) - i);
              i += c;
            }
            yield;
          }
  
          tft.setWindow(0, r, WIDTH-1, r + ROW_READ - 1);
          tft.pushColors(buf, sizeof(buf));
          yield;
          
          i = 0;
          r += ROW_READ;
        }
      } else {
        tft.fillScreen(TFT_BLACK);
        String httpString = "Got: " + String(status_code, DEC);
        tft.drawString(httpString, 0, 0, 1);
        Serial.println(httpString);
      }
    }
  }

  delay(5);
}

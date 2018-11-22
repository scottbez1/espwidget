Work in progress ESP8266 and ST7789 (240x240 IPS LCD) mini info display framework.

<img src="https://pbs.twimg.com/media/DsbQYDfUcAAAItL.jpg:small"/>

The idea is to make cheap wifi-connected info displays to put on your desk or around the house as always-on dashboards. The ST7789-based LCD is crisp and bright and [can be found for less than $4 online](https://www.aliexpress.com/wholesale?catId=0&SearchText=st7789), and the ESP8266 module I'm using (a Wemos D1 Mini) [can be found for just over $2](https://www.aliexpress.com/wholesale?catId=0&SearchText=wemos%20d1%20mini).

<img src="https://pbs.twimg.com/media/DskVuSEUwAAtUuY.jpg:small"/>

Since the ESP8266 doesn't have enough RAM for a full framebuffer (240 * 240 * 2 bytes per pixel) and the Arduino graphics libraries are lacking important features like anti-aliasing, the rendering is done server-side using [node-canvas](https://github.com/Automattic/node-canvas) and streamed over HTTP as a raw RGB565 bitmap directly to the LCD driver.

Right now there's a single widget implementation which displays the median Air Quality Index for a geographical area using data from purpleair.com (shown above). It should be easy to add new widgets since all of the data loading, processing, and rendering is done in Javascript with the powerful [canvas api](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D).

In theory the server could be run as a Google Cloud Function (and in fact it was originally designed that way), but it seems Google Cloud Functions [are not reliable](https://issuetracker.google.com/issues/117889747) as of this writing (2018-11-20) and the deployment process was opaque and unreliable as well which didn't inspire confidence. I haven't tried AWS Lambda, but it's worth considering as an alternative. 

However, one thing to keep in mind with cloud hosting is that network transfers may exceed free tier limits due to the size of the raw bitmaps being transferred. Assuming 5 widgets refreshing once every 5 minutes (or equivalently, a single widget refreshing every minute), there's 240 * 240 * 2 = 112.5 KB per minute, which means 158.2 MB per day, or 4.8 GB in a 31-day month, and that's not including any HTTP overhead. That said, it's likely only a few dollars of data transfer per year, and could be reduced further by making the client sleep or at least reduce its update frequency during the night.


## Server setup
```
# Install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```
(restart shell)
```
# Install node 8
nvm install 8

# Clone repo
git clone https://github.com/scottbez1/espwidget.git

cd espwidget/server

# For Raspberry Pi only (uncomment next command): install build dependencies for node-canvas (prebuilt library isn't available for arm)
#sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Install node module
npm install

# Enter configuration
cp config.js.example config.js
vim config.js

# Run
node index.js
```

## Client setup
- (TODO: TFT_eSPI library setup)
- (TODO: document pin connections)
- Copy config.h.example to config.h
- Edit config.h to contain your Wifi credentials and the hostname of the server
- Install!

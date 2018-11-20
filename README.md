Work in progress ESP8266 and ST7789 (240x240 IPS LCD) widget framework.


Server setup:
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

# For Raspberry Pi only: install build dependencies for node-canvas (prebuilt library isn't available for arm)
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Install node module
npm install

# Enter configuration
cp config.js.example config.js
vim config.js

# Run
node index.js
```


const express = require('express');

const { widgetify } = require('./widget');
const { drawAqiWidget } = require('./aqi');
const { drawWeatherWidget } = require('./weather');

const app = express()
const port = 3000
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/renderwidget', widgetify(drawAqiWidget));
app.get('/weather', widgetify(drawWeatherWidget));

app.listen(port, '0.0.0.0', () => console.log(`Example app listening on port ${port}!`))

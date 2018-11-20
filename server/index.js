const { aqi_widget } = require('./widget');
const express = require('express');

const app = express()
const port = 3000

app.get('/renderwidget', aqi_widget);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

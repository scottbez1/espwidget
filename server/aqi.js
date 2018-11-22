const { roundRect, wrapText } = require('./canvas_util');
const { registerFont } = require('canvas');
const { get_json } = require('./api_util')

try {
    var { config } = require('./config.js');
} catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
    } else {
        throw "No configuration found! Copy config.js.example to config.js, update the values inside, and try again"
    }
}
registerFont('fonts/Roboto-Light.ttf', { family: 'Roboto Light' });
registerFont('fonts/Roboto-Thin.ttf', { family: 'Roboto Thin' });
registerFont('fonts/Roboto-MediumItalic.ttf', { family: 'Roboto Medium Italic' });

const aqiLookup = [
    {
        "min": 0,
        "max": 12,
        "index": {
            "min": 0,
            "max": 50
        },
        "label": "Good",
        "gradient": ["#43e97b", "#38f9d7"],
        "color": "#393057"
    },
    {
        "min": 12,
        "max": 35,
        "index": {
            "min": 51,
            "max": 100
        },
        "label": "Moderate",
        "gradient": ["#96fbc4", "#f9f586"],
        "color": "#393057"
    },
    {
        "min": 35,
        "max": 55,
        "index": {
            "min": 101,
            "max": 150
        },
        "label": "Unhealthy for Sensitive Groups",
        "gradient": ["#f794a4", "#fdd6bd"],
        "color": "#393057"
    },
    {
        "min": 55,
        "max": 150,
        "index": {
            "min": 151,
            "max": 200
        },
        "label": "Unhealthy",
        "gradient": ["#f77062", "#fe5196"],
        "color": "white"
    },
    {
        "min": 150,
        "max": 250,
        "index": {
            "min": 201,
            "max": 300
        },
        "label": "Very Unhealthy",
        "gradient": ["#667eea", "#764ba2"],
        "color": "white"
    },
    {
        "min": 250,
        "max": 350,
        "index": {
            "min": 301,
            "max": 400
        },
        "label": "Hazardous",
        "gradient": ["#874da2", "#c43a30"],
        "color": "white"
    },
    {
        "min": 350,
        "max": 500,
        "index": {
            "min": 401,
            "max": 500
        },
        "label": "Hazardous",
        "gradient": ["#874da2", "#c43a30"],
        "color": "white"
    }
];

const aqiFromPm2_5 = function(pm2_5) {
    if (pm2_5 >= 500) {
        return Object.assign({value: 500}, aqiLookup[aqiLookup.length-1]);
    }
    for (var range of aqiLookup) {
        if (pm2_5 >= range.min && pm2_5 < range.max) {
            return Object.assign({value: Math.round((range.index.max - range.index.min) / (range.max - range.min) * (pm2_5 - range.min) + range.index.min)}, range);
        }
    }
    throw "Invalid PM 2.5 value " + pm2_5;
};

/**
 * Get median outdoor AQI 
 * @param {*} d Data object returned by purpleair's data.json endpoint.
 */
const getMedianAQI = function(d) {
    const f = {};
    for (var i = 0; i < d.fields.length; i++) {
        f[d.fields[i]] = i;
    }
    let aqis = [];
    for (var entry of d.data) {
        if (entry[f.Type] != 0) {
            // Not an outside sensor
            continue;
        }
        if (entry[f.age] > 60) {
            // More than an hour old
            continue;
        }
        aqis.push(aqiFromPm2_5(entry[f.pm]));
    }
    aqis.sort((a, b) => a.value - b.value);
    console.log("AQIs: " + aqis);
    return aqis[Math.trunc(aqis.length/2)];
}

exports.drawAqiWidget = async function(ctx) {
    try {
        console.log("Requesting purpleair");
        const response = await get_json(config.aqi_url);

        const aqi = getMedianAQI(response);
        console.log("Got aqi", aqi);

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 240, 240);
        
        ctx.beginPath();
        const grd=ctx.createLinearGradient(0,0,0,200);
        grd.addColorStop(0,aqi.gradient[0]);
        grd.addColorStop(1,aqi.gradient[1]);
        ctx.fillStyle=grd;
        roundRect(ctx, 10, 10, 220, 200, 8);
        ctx.fill();
        


        ctx.textAlign="center"; 
        ctx.fillStyle = aqi.color;

        ctx.font = '36px Roboto Light';
        ctx.fillText('Current AQI', 120, 50);

        ctx.font = '84px Roboto Light';
        ctx.fillText(aqi.value, 120, 140);

        ctx.font = '24px Roboto Light';
        wrapText(ctx, aqi.label, 120, 180, 200, 24);

        ctx.textAlign="left"; 
        ctx.font = '14px Roboto Medium Italic';
        ctx.fillStyle = "#888";
        ctx.fillText(new Date().toLocaleString(), 10, 230);
    } catch (e) {
        console.error(e);
        res.status(500).send("uh oh");
    }
}
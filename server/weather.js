const { get_json } = require('./api_util');
const { config } = require('./config');

exports.drawWeatherWidget = async function(ctx) {
    try {
        console.log("Requesting weather");
        const response = await get_json(config.weather_url);

        const { city } = response;


        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 240, 240);
        

        ctx.textAlign="center"; 
        ctx.fillStyle = "white";

        ctx.font = '36px Roboto Light';
        ctx.fillText(city.name, 120, 50);



        ctx.textAlign="left"; 
        ctx.font = '14px Roboto Medium Italic';
        ctx.fillStyle = "#888";
        ctx.fillText(new Date().toLocaleString(), 10, 230);
    } catch (e) {
        console.error(e);
        res.status(500).send("uh oh");
    }
}
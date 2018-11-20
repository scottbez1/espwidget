const { drawAqiWidget } = require('./aqi');

exports.aqi_widget = async function(req, res) {

    console.log("started");
    const { createCanvas, loadImage } = require('canvas')
    console.log("loaded node-canvas");
    const canvas = createCanvas(240, 240)
    console.log("created canvas");
    const ctx = canvas.getContext('2d')

    await drawAqiWidget(ctx);

    const raw565 = req.query['rgb565'];
    const imdata = ctx.getImageData(0, 0, 240, 240);
    const data = imdata.data;

    var outbuf;
    if (raw565) {
        outbuf = Buffer.alloc(240 * 240 * 2);
    }
    for(var i=0; i<data.length; i+=4) {
        const red = data[i];
        const green = data[i+1];
        const blue = data[i+2];
        // ignore alpha

        if (raw565) {
            const v16 = ((red & 0xF8) << 8) | ((green & 0xFC) << 3) | (blue >> 3);
            outbuf[i/2] = v16 >> 8;
            outbuf[i/2 + 1] = v16 & 0xFFFF;
        } else {
            // Convert to RGB 565 in place for PNG preview
            data[i] = red & 0xF8;
            data[i+1] = green & 0xFC;
            data[i+2] = blue & 0xF8;
        }
    }

    if (raw565) {
        res.status(200).send(outbuf);
    } else {
        ctx.putImageData(imdata, 0, 0);
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        var stream = canvas.createPNGStream();
        var endPromise = new Promise(fulfill => stream.on("finish", fulfill));
        stream.pipe(res);
        await endPromise;
    }
}

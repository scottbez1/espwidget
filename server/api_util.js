
const rp = require('request-promise-native');

exports.get_json = async function(url) {
    const options = {
        method: 'GET',
        uri: url,
        json: true
    };
    return await rp(options);
}
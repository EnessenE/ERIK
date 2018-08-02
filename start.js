const config = require("./config.json");

function timeout(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, delay);
    });
}

function debug(msg) {
    if (config.debug) {
        console.log(msg);
    }
}
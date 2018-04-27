var giphy;

var config;

module.exports = {
    init: function (c) {
        config = c;
        giphy = require('giphy-api')(config.giphytoken);
    },

    search: async function (client, message, parameters) {
        bigpara = "";
        for (var i = 0; i < parameters.length; i++) {
            bigpara = bigpara + " " + parameters[i]

        }
        giphy.search(bigpara).then(function (res) {
            message.reply(`Here's your random gif: ${res.data.url}`);
        });
    }
}

function PermCheck(message, user, roleid) {
    var val = false;
    return new Promise(function (resolve, reject) {
        roletarget = parseInt(roleid);
        message.member.roles.forEach(function (element) {
            if (roletarget == parseInt(element.id)) {
                val = true;
            }
        });
        if (message.member.hasPermission("ADMINISTRATOR")) {
            val = true;
        }
        resolve(val);
    })
}
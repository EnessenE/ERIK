const imdb = require('imdb-api');
imdbkey = config.imdbtoken;

var config;

module.exports = {
    init: function (c) {
        config = c;
    },

    search: async function (client, message, parameters) {
        bigpara = "";
        for (var i = 0; i < parameters.length; i++) {
            bigpara = bigpara + " " + parameters[i]

        }
        console.log("ABOUT TO SEARCH: " + bigpara);
        imdb.get(bigpara, { apiKey: imdbkey, timeout: 30000 }).then(function (data) {
            if (data != undefined) {
                messagearray = {
                    embed: {
                        color: 3066993,
                        author: {
                            name: "Movie information for " + data.title,
                            icon_url: data.poster,
                        },
                        fields: [{
                            name: "Generic",
                            value: "Title: " + data.title +
                                "\n" + "Sort: " + data.type +
                                "\n" + "Release date: " + data.released +
                                "\n" + "Runtime: " + data.runtime +
                                "\n" + "Orgin country: " + data.country +
                                "\n" + "DVD release: " + data.dvd +
                                "\n" + "Box office: " + data.boxoffice +
                                "\n" + "Production company: " + data.production +
                                "\n" + "Awards: " + data.awards
                        },
                        {
                            name: "Movie plot: ",
                            value: data.plot
                        },
                        {
                            name: "Cast:",
                            value: "Writer(s): " + data.writer +
                                "\n" + "Actor(s): " + data.actors
                        },
                        {
                            name: "IMDB Score:",
                            value: "Total rating: " + data.rating +
                                "\n" + "Votes: " + data.votes +
                                "\n" + "Metascore: " + data.metascore + "/100"
                        },
                        ],
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: discordbotlink
                        }
                    }
                };
                message.reply(messagearray);
            }
            else {
                message.reply("I couldn't find your movie on IMDB.")
            }
        }).catch(function (data) {
            console.log(data);
            message.reply("Something went wrong while searching your movie on the IMDB api.")
        });
    }
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
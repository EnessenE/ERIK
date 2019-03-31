var repo;
var config;
const flipper = require("../Helper/flipper.js");
var aprilfools = false;

function print(message, override) {
    if (config.costum.debugging || override) {
        console.log(`LOGIC.JS: ${message}`);
    }
}

function aprilFools(client) {
    print("Happy april fools");
    client.guilds.get("the guild id");
    config.settings.specialguilds.forEach(async function (element) {
        print("Looking for: " + element);
        var guild = client.guilds.get(element);
        if (guild.name != undefined) {
            print("Found: " + guild.name)
            guild.channels.forEach(function (element) {
                print("Current turn of channel: " + element.name)
                element.setName(flipper.flipmyString(element.name), "A great april fools joke in 2019");
                if (element.type == "text") {
                    element.setTopic(flipper.flipmyString(element.topic), "A great april fools joke in 2019");
                }
            });

            guild.members.forEach(member => {
                try {
                    print(`Finding member: ${member.displayName} of ${guild.name}`)
                    member.setNickname(flipper.flipmyString(member.displayName), "A great april fools joke in 2019");
                }
                catch (error) {
                    print("Failed changing name of " + member.displayName + ": " + error);
                }

            });
        }
    });
}

module.exports = {
    init: function (s, c) {
        repo = s;
        config = c;
    },

    timeCode: async function (client) {
        var currentTime = Math.floor(Date.now() / 1000)
        var startTime = currentTime + (12 * 60 * 60); //Add 12 hours so we get the current time in the UTC+12 timezone
        var endTime = currentTime - (12 * 60 * 60); //Remove 12 hours so we get the current time in the UTC-12 timezone
        startTime = Math.round(startTime / 100) * 100;
        endTime = Math.round(endTime / 100) * 100;

        print("Time logic is being executed.");
        print(`Time in unix: ${currentTime}. Checking start ${startTime} and end ${endTime}`);
        print(`${startTime} vs 1554076800`)
        print(`${endTime} vs 1554206400`)

        if (startTime == 1554076800 && !aprilfools) { //Hardcoded check = bad
            aprilfools = true;
            aprilFools(client);
        }
        if (endTime == 1554206400 && aprilfools) {
            aprilfools = false;
            aprilFools(client);
        }
    }
}
var sql;
var config;

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

module.exports = {
    init: function (s, c) {
        sql = s;
        config = c;
    },

    play: async function (client, message) {
        const voiceChannel = await message.member.voiceChannel;
        if (!voiceChannel) return message.reply("Please be in a voice channel first!");
        if (permmember.has("CONNECT") != true) return message.reply("Sorry, I can't connect to your voicechannel. I have insufficient permissions.");
        if (parameters.length != 0 && (parameters[0].includes("search_query") || parameters[0].includes("results"))) {
            message.reply("Sorry, I don't accept search queries. I only accept or search terms or youtube links.")
        }
        else if (parameters.length != 0 && (parameters[0].includes("youtu.be") || parameters[0].includes("youtube.com"))) {
            vidname = "Error in name";
            if (youtube_parser(parameters[0]) != ("" || undefined)) {
                callplaylist(1, message, message.guild.id, voiceChannel, parameters[0], vidname);
            }
        }
        else if (parameters.length != 0 && (parameters[0].includes("https://") || parameters[0].includes("http://"))) {
            message.reply("Sorry, you are not allowed to use any other links then youtube!");
        }
        else if (parameters.length != 0) {
            bigpara = "";
            for (var i = 0; i < parameters.length; i++) {
                bigpara = bigpara + " " + parameters[i]

            }
            console.log("GONNA SEARCH: " + bigpara);
            youTube.search(bigpara, 2, function (error, result) {
                if (error) {
                    console.log(error);
                }
                else {
                    for (var i = 1; i < result.items.length; i++) {
                        if (result.items[i].snippet.liveBroadcastContent = "none") {
                            if (result.items[i].id.videoId != undefined) {
                                link = "https://www.youtube.com/watch?v=" + result.items[i].id.videoId;
                                callplaylist(1, message, message.guild.id, voiceChannel, link, "");
                                break;
                            }
                        }
                    }
                }
            });
        }
    },

    skip: async function (client, message) {
        if (playing[message.guild.id] === true && playlist[message.guild.id][0] != undefined) {
            skipped = false;
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel && voiceChannel != client.voiceConnections.get(message.guild.id)) {
                return message.reply("Please be in my voice channel first!");
            };
            if (alreadyvoted(message.author.id, message.guild.id) == true) {
                return message.reply("You are only allowed to vote skip once per song.")
            }
            votes[message.guild.id] = votes[message.guild.id] + 1;
            totalvotes = votes[message.guild.id];
            neededvotes = Math.round((playlist[message.guild.id][0].voice.members.size - 1) / 2);
            if (message.author.tag === playlist[message.guild.id][0].author) {
                skipped = true;
                message.reply("Song owner skipped current song.");
            };
            if (neededvotes <= 2) {
                neededvotes = 2
            };
            if (skipped == false) {
                if (totalvotes >= neededvotes) {
                    skipped = true;
                    message.channel.send("Skipping current song with " + totalvotes + " votes.");
                }
                else {
                    message.reply("You have voted to skip this song " + totalvotes + "/" + neededvotes + " votes.")
                }
            };
            if (skipped == true) {
                votes[message.guild.id] = new Array();
                skipsong[message.guild.id] = true;
                killsong(message.guild.id);
            }
        }
    },

    queue: async function (client, message) {
        if (playlist[message.guild.id].length === 0) {
            messagearray = {
                embed: {
                    color: 15158332,
                    author: {
                        name: "Queue for " + message.guild.name,
                        icon_url: message.guild.iconURL
                    },
                    fields: [{
                        name: "Nothing in queue at this moment",
                        value: "Empty"
                    }
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
            messagearray = {
                embed: {
                    color: 15158332,
                    author: {
                        name: "Queue for " + message.guild.name,
                        icon_url: message.guild.iconURL
                    },
                    fields: [
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: discordbotlink
                    }
                }
            };
            for (i = 0; i < playlist[message.guild.id].length; i++) {
                if (i != 0) {
                    messagearray.embed.fields.push(
                        {
                            name: playlist[message.guild.id][i].vidname,
                            value: "Added by: " + playlist[message.guild.id][i].author + "\n" +
                                "Channel: " + playlist[message.guild.id][i].channel + "\n" +
                                "Length: " + playlist[message.guild.id][i].time + "\n" +
                                "Link: " + playlist[message.guild.id][i].link + "\n"
                        }
                    )
                }
                else {
                    messagearray.embed.fields.push({
                        name: "Currently playing: " + playlist[message.guild.id][i].vidname,
                        value: "Added by: " + playlist[message.guild.id][i].author + "\n" +
                            "Channel: " + playlist[message.guild.id][i].channel + "\n" +
                            "Length: " + playlist[message.guild.id][i].time + "\n" +
                            "Link: " + playlist[message.guild.id][i].link + "\n"
                    })
                }
            }
            message.reply(messagearray);
        }
    },

    setplaytime: async function (client, message, parameters) {
        if (await PermCheck(message, message.author, gotroleid) == true) {
            if (parameters[0] != ("" || undefined)) {
                var c = TryParseInt(parameters[0], null);
                if (c != null) {
                    if (c <= maxyoutubevideotime && c >= 0) {
                        sql.setplaytime(message.guild.id, c);
                        message.reply("Set maximal video playtime to " + c + " seconds");
                    }
                    else {
                        message.reply("Sorry, you aren't allowed to set a lower then 0 and higher playtime than " + maxyoutubevideotime + " seconds.");
                    }
                }
                else {
                    message.reply("Sorry, I didn't recognize that number!");
                }
            }
            else {
                message.reply("Playtime for this server is: " + await sql.getplaytime(message.guild.id) + " seconds");
            }
        }
        else {
            message.reply("Sorry, you do not have permission to change this.")
        }
    },

    stop: async function (client, message,gotroleid) {
        if (await PermCheck(message, message.author, gotroleid) == true) {
            playlist[message.guild.id] = new Array();
            killsong(message.guild.id);
            message.reply("Stopped and cleared the playlist.")
        }
        else {
            message.reply(notallowed("stop", message.guild.id));
        }
    },
}
var config;
var OS;
var sql;

module.exports = {
    init: function (c, s) {
        config = c;
        OS = s;
        sql = require("../Context/" + config.SQL + ".js");
    },

    ping: async function (client, message) {
        message.reply('My ping to discord is ' + client.ping + ' ms.');
    },

    help: async function (client, message, commands) {
        var helparray = "";
        var list = 0
        for (i = 0; i < commands.length / 2; i++) {
            helparray = helparray + "**" + prefix + commands[list] + "** - " + commands[list + 1] + "\n";
            list += 2;
        }
        try {
            messagearray = {
                embed: {
                    color: 3066993,
                    author: {
                        name: "Commands for " + message.guild.name,
                        icon_url: message.guild.iconURL
                    },
                    fields: [
                        {
                            name: "Help",
                            value: helparray
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: config.discordbotlink
                    }
                }
            };
            message.reply(messagearray);

        }
        catch (err) {
            console.Log(err);
            message.reply("```" + helparray + "```");
        }
        //var list = 0
        //for (i = 0; i < commands.length / 2; i++) {
        //    messagearray.embed.fields.push(
        //        {
        //            name: prefix + commands[list],
        //            // inline: true,
        //            value: commands[list + 1]
        //        }
        //    )
        //    list += 2;
        //}
    },

    ping: async function (client, message) {
        message.reply('My ping to discord is ' + client.ping + ' ms.');
    },

    serverinfo: async function (client, message) {
        roleoutput = "";
        message.guild.roles.forEach(function (element) {
            roleoutput = roleoutput + ", " + element.name;
        });

        roleoutput = roleoutput.substr(2, roleoutput.length);
        roleoutput = roleoutput.replace("@", "");

        message.reply({
            embed: {
                color: 3447003,
                author: {
                    name: "Server information for " + message.guild.name,
                    icon_url: message.guild.iconURL
                },
                fields: [{
                    name: "Generic",
                    value: "**ID:** " + message.guild.id + "\n"
                        + "**Members:** " + message.guild.memberCount + "\n"
                        + "**Owner:** " + message.guild.owner.user.tag + " - " + message.guild.ownerID + "\n"
                        + "**Region:** " + message.guild.region + "\n"
                        + "**Created at:** " + message.guild.createdAt + "\n"
                        + "**Verification level:** " + message.guild.verificationLevel + "\n"
                        + "**AFK timeout:** " + message.guild.afkTimeout / 60 + " minute(s)\n"
                        + "**Icon:** " + message.guild.iconURL + "\n"
                },
                {
                    name: "Roles",
                    value: roleoutput
                },
                {
                    name: "Statistics",
                    value: "Played songs: " + await sql.getvalue(message.guild.id, "played") + "\n" +
                        "Skipped songs: " + await sql.getvalue(message.guild.id, "skipped") + "\n"
                },
                {
                    name: "ERIK Configuration",
                    value: "**Maximal playtime:** " + await sql.getplaytime(message.guild.id) + " seconds \n" +
                        "**Prefix:** " + prefix + "\n"
                },
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: config.discordbotlink
                }
            }
        });
    },

    botinfo: async function (client, message) {
        message.reply({
            embed: {
                color: 3447003,
                author: {
                    name: "Bot information for " + client.user.tag + "",
                    icon_url: client.user.avatarURL
                },
                fields: [{
                    name: "Generic",
                    value:
                        "Uptime: " + Math.floor(((client.uptime / 1000.0) / 60 / 60), 1) + " hour(s)\n"
                        + "Running on: " + client.guilds.size + " servers\n"
                        + "Running for: " + client.users.size + " online users\n" + "\n"
                        + "Github: " + config.github
                },
                {
                    name: "Version " + config.botver,
                    value: config.versioninfo
                },
                {
                    name: "Back-end info",
                    value:
                        "Current server: " + OS.hostname() + "\n"
                }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: config.botlink
                }
            }
        });
    },

    userinfo: async function (client, message) {
        auser = message.author.id;
        if (parameters[0] != (undefined)) {
            dothis = parameters[0];
            dothis = dothis.replace("<@!", "");
            dothis = dothis.replace("<@", "");
            auser = dothis.replace(">", "");
        }
        gotuser = await client.fetchUser(auser);
        gotmember = await message.guild.fetchMember(gotuser);
        try {
            presencetable = {};
            if (gotuser.presence.game == undefined) {
                presencetable = {
                    name: "Status",
                    value: "\n" + "**Presence:** " + gotuser.presence.status
                };
            }
            else if (gotuser.presence.game.streaming == false) {
                presencetable = {
                    name: "Status",
                    value: "\n" + "**Presence:** " + gotuser.presence.status +
                        "\n" + "**Current game:** " + gotuser.presence.game.name
                };
            }
            else {
                presencetable = {
                    name: "Status",
                    value: "\n" + "**Presence:** " + gotuser.presence.status +
                        "\n" + "**Current game:** " + gotuser.presence.game.name +
                        "\n" + "**Streaming:** " + gotuser.presence.game.streaming + " - " + gotuser.presence.game.url +
                        "\n" + "**Game type:** " + gotuser.presence.game.type
                };
            }
            roleoutput = "";
            gotmember.roles.forEach(function (element) {
                roleoutput = roleoutput + ", " + element.name;
            });
            roleoutput = roleoutput.substr(3, roleoutput.length);
            messagearray = {
                embed: {
                    color: 3066993,
                    author: {
                        name: "User information for " + gotuser.username,
                        icon_url: gotuser.avatarURL
                    },
                    fields: [{
                        name: "Generic",
                        value: "**Bot**: " + gotuser.bot +
                            "\n" + "**Tag**: " + gotuser.tag +
                            "\n" + "**User ID**: " + gotuser.id +
                            "\n" + "**Avatar**: " + gotuser.avatarURL +
                            "\n" + "**Joined discord on**: " + gotuser.createdAt
                    },
                    {
                        name: "Guild specific info",
                        value: "**Nickname**: " + (gotmember.nickname || "None") + "\n" +
                            "**Joined this guild on**: " + gotmember.joinedAt + "\n" +
                            "**Strongest role**: " + gotmember.highestRole.name + "\n" +
                            "**Server muted**: " + gotmember.serverMute + "\n" +
                            "**Roles**: " + roleoutput
                    },

                        presencetable
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: config.botlink
                    }
                }
            };
            message.reply(messagearray);
        }
        catch (err) {
            console.log(err);
            message.reply("Couldn't make an embedded post for you. Sorry!");
        }
    }
}
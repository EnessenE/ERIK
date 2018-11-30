var repo;
var config;
var OS;
const { Discord, RichEmbed } = require('discord.js');

function getAllRoles(message) {
    var roleoutput = ``;
    message.guild.roles.forEach(function (element) {
        if (roleoutput.length > 0) {
            roleoutput = `${roleoutput}, ${element.name}`;
        }
        else {
            roleoutput = `${element.name}`;
        }

    });
    return roleoutput;
}

module.exports = {
    init: function (s, c, os) {
        repo = s;
        config = c;
        OS = os;
    },

    ping: async function (client, message) {
        message.reply(`My ping to discord is ${Math.round(client.ping)} ms.`);
    },

    botinfo: async function (client, message) {
        var uptime = Math.floor(((client.uptime / 1000.0) / 60 / 60), 1);
        var hours = "hour";
        var servers = "server";

        if (uptime !== 1) {
            hours = `hours`;
        }
        if (client.guilds.size !== 1) {
            server = "servers";
        }

        var genericInfo = `Uptime: ${uptime} ${hours} \n` +
            `Running on: ${client.guilds.size} ${servers} \n` +
            `Running for: ${client.users.size} online users \n` +
            `Github: ${config.info.github}`;

        const embed = new RichEmbed()
            // Set the title of the field
            // Set the color of the embed
            .setColor("#4286f4")
            // Set the main content of the embed
            .setDescription(`Bot information that was gathered`);

        embed.addField("Generic info", genericInfo);

        embed.addField(`Version ${config.info.version}`, `${config.info.description}` || `No info for this version.`);

        embed.addField("Host", OS.hostname());
        embed.setTimestamp(new Date());
        embed.setAuthor(`Bot information for ${client.user.tag}`, client.user.avatarURL);

        message.reply(embed);

    },

    userinfo: async function (client, message, parameters) {
        auser = message.author.id;
        if (parameters[0] != (undefined)) {
            dothis = parameters[0];
            dothis = dothis.replace(`<@!`, ``);
            dothis = dothis.replace(`<@`, ``);
            auser = dothis.replace(`>`, ``);
        }
        gotuser = await client.fetchUser(auser);
        gotmember = await message.guild.fetchMember(gotuser);
        try {
            presencetable = {};
            if (gotuser.presence.game == undefined) {
                presencetable = {
                    name: `**Presence:** ${gotuser.presence.status}`,
                    value: "Not streaming."
                };
            }
            else if (gotuser.presence.game.streaming == false) {
                presencetable = {
                    name: `**Presence:** ${gotuser.presence.status} `,
                    value: `**Current game:** ${gotuser.presence.game.name}`
                };
            }
            else {
                presencetable = {
                    name: `**Presence:** ${gotuser.presence.status}`,
                    value: `** Current game:** ${gotuser.presence.game.name}\n` +
                        `**Streaming:** ${gotuser.presence.game.streaming} - ${gotuser.presence.game.url} \n` +
                        `**Game type:** ${gotuser.presence.game.type}`
                };
            }
            roleoutput = ``;
            gotmember.roles.forEach(function (element) {
                roleoutput = `${roleoutput}, ${element.name}`;
            });
            roleoutput = roleoutput.substr(3, roleoutput.length);
            messagearray = {
                embed: {
                    color: 3066993,
                    author: {
                        name: `User information for ${gotuser.username}`,
                        icon_url: gotuser.avatarURL
                    },
                    fields: [{
                        name: `Generic`,
                        value: `**Bot**: ${gotuser.bot}\n` +
                            `**Tag**: ${gotuser.tag}\n` +
                            `**User ID**: ${gotuser.id}\n` +
                            `**Avatar**: ${gotuser.avatarURL}\n` +
                            `**Joined discord on**: ${gotuser.createdAt}`
                    },
                    {
                        name: `Guild specific info`,
                        value: `**Nickname**: ${(gotmember.nickname || `None`)} \n` +
                            `**Joined this guild on**: ${gotmember.joinedAt} \n` +
                            `**Strongest role**: ${gotmember.highestRole.name} \n` +
                            `**Server muted**: ${gotmember.serverMute} \n` +
                            `**Roles**: ${roleoutput}`
                    },

                        presencetable
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: config.info.link
                    }
                }
            };
            message.reply(messagearray);
        }
        catch (err) {
            console.log(err);
            message.reply(`Couldn't make an embedded post for you. Sorry!`);
        }
    },

    serverinfo: async function (client, message) {
        var icon = message.guild.iconURL;

        if (icon == null) {
            icon = "No icon was set";
        }

        var data = new RichEmbed();

        data.title = `Server information for ${message.guild.name}`;

        data.color = 3447003;
        data.thumbnail = message.guild.iconURL;
        data.timestamp = new Date();
        data.url = config.info.link;

        var generic = `**ID:** ${message.guild.id} \n` +
            `**Members:** ${message.guild.memberCount} \n` +
            `**Owner:** ${message.guild.owner.user.tag} - ${message.guild.ownerID} \n` +
            `**Region:** ${message.guild.region} \n` +
            `**Created at:** ${message.guild.createdAt} \n` +
            `**Verification level:** ${message.guild.verificationLevel} \n` +
            `**AFK timeout:** ${message.guild.afkTimeout / 60} minute(s) \n` +
            `**Icon:** ${icon}\n`;
        data.addField(`Generic`, generic, false);

        data.addField(`Roles`, getAllRoles(message), false);

        var prefix = "Not able to retrieve prefix for this server.";
        var botcontrol = 0;

        if (repo != null) {
            prefix = await repo.GetPrefix(message.guild.id);
            botcontrol = await repo.GetValue(message.guild.id, "PermRole");
        }
        else {
            botcontrol = -1;
        }

        permissionrole = "** BotControl:** ";
        if (botcontrol > 0) {
            permissionrole += `<@&${botcontrol}>`;
        }
        else if (botcontrol == -1) {
            permissionrole += "Not able to retrieve a role from the database";
        }

        var settings = `**Prefix:** ${prefix} \n` + permissionrole;

        data.addField(`Server specific bot configuration`, settings, false);

        message.reply(data);
    },

    help: function (client, prefix, message, commands) {
        helparray = "";

        var list = 0;
        for (i = 0; i < commands.length / 2; i++) {
            helparray = helparray + "**" + prefix + commands[list] + "** - " + commands[list + 1] + "\n";
            list += 2;
        }

        const embed = new RichEmbed()
            // Set the title of the field
            // Set the color of the embed
            .setColor("#4286f4")
            // Set the main content of the embed
            .setDescription(`Public bot commands`);

        embed.addField("Commands", helparray);

        embed.setTimestamp(new Date());
        embed.setAuthor(`Bot information for ${client.user.tag}`, client.user.avatarURL);

        message.reply(embed);
    }
}
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
    init: function (s, c, os, sendadmin) {
        repo = s;
        config = c;
        OS = os;
    },

    ping: async function (client, message) {
        message.reply(`My ping to discord is ${Math.round(client.ping)} ms.`);
    },

    botinfo: async function (client, message) {
        try {
            var uptime = Math.floor(((client.uptime / 1000.0) / 60 / 60), 1);
            var hours = "hour";
            var servers = "server";

            if (uptime !== 1) {
                hours = `hours`;
            }
            if (client.guilds.size !== 1) {
                server = "servers";
            }

            var broadcasts = "Currently " + client.broadcasts.length + " active voice broadcasts";

            var genericInfo = `Uptime: ${uptime} ${hours} \n` +
                `Running on: ${client.guilds.size} ${servers} \n` +
                `Running for: ${client.users.size} online users \n` +
                `Github: ${config.info.github}`;

            var currentBotInfo = broadcasts;

            const embed = new RichEmbed()
            // Set the title of the field
            // Set the color of the embed
            embed.setColor("#4286f4");
            // Set the main content of the embed
            embed.setDescription(`Bot information that was gathered`);

            embed.setAuthor(`Bot information for ${client.user.tag}`, client.user.avatarURL);

            embed.addField("Generic info", genericInfo);

            embed.addField("Active bot info", currentBotInfo);

            embed.addField(`Version ${config.info.version}`, `${config.info.description}` || `No info for this version.`);

            embed.addField("Host", OS.hostname());
            embed.setTimestamp(new Date());

            message.reply(embed);
        }
        catch (err) {
            console.log(err);
            message.reply(`Sorry, couldn't retrieve the target bot info properly for you. \n Error: ${err.message}`);
        }
    },

    userinfo: async function (client, message, parameters) {
        target = message.author.id;
        if (parameters[0] != undefined) {
            dothis = parameters[0];
            dothis = dothis.replace(`<@!`, ``);
            dothis = dothis.replace(`<@`, ``);
            target = dothis.replace(`>`, ``);
        }

        try {

            user = await client.fetchUser(target);
            servermember = await message.guild.fetchMember(user);

            var presence;

            if (user.presence.game == undefined) {
                presence = "Not doing anything according to discord."
            }
            else {
                presence = `**Current application:** ${user.presence.game.name}`;
                if (user.presence.game.applicationID != undefined) {
                    presence += `\n **Application ID:** ${user.presence.game.applicationID}`;
                }
                if (user.presence.game.details != undefined) {
                    presence += `\n **Details:** ${user.presence.game.details}`;
                }
                if (user.presence.game.party != undefined) {
                    presence += `\n **Party id:** ${user.presence.game.party.id}`;
                    presence += `\n **Party size:** ${user.presence.game.party.size[0]}/${user.presence.game.party.size[1]}`;
                }
                if (user.presence.game.state != undefined) {
                    presence += `\n **Application state:** ${user.presence.game.state}`;
                }
                if (user.presence.game.assets != undefined) {
                    presence += `\n **Assets:** Yes`;
                    presence += `\n **Large image:** ${user.presence.game.assets.largeImage}`;
                    presence += `\n **Large image url:** ${user.presence.game.assets.largeImageURL}`;
                    presence += `\n **Large text:** ${user.presence.game.assets.smallText}`;
                    presence += `\n **Small image url:** ${user.presence.game.assets.smallImage}`;
                    presence += `\n **Small image:** ${user.presence.game.assets.smallImageURL}`;
                    presence += `\n **Small text:** ${user.presence.game.assets.smallText}`;
                }
                if (user.presence.game.streaming) {
                    presence += `\n **Streaming:** ${user.presence.game.streaming} - ${user.presence.game.url}`;
                }
            }

            roles = ``;
            servermember.roles.forEach(function (element) {
                if (roles.length > 0) {
                    roles = `${roles}, ${element.name}`;
                }
                else {
                    roles = `${element.name}`;
                }
            });

            var user_info = `**Bot**: ${(user.bot ? "Yes" : "No")}\n` +
                `**Tag**: ${user.tag}\n` +
                `**User ID**: ${user.id}\n` +
                `**Avatar**: ${user.avatarURL}\n` +
                `**Joined discord on**: ${user.createdAt}`


            var guild_info = `**Nickname**: ${(servermember.nickname || `None`)} \n` +
                `**Joined this guild on**: ${servermember.joinedAt} \n` +
                `**Strongest role**: ${servermember.highestRole.name} \n` +
                `**Server muted**: ${servermember.serverMute ? "Yes" : "No"} \n` +
                `**Roles**: ${roles}`;

            const embed = new RichEmbed();
            // Set the title of the field
            // Set the color of the embed

            embed.setColor("#4286f4");
            // Set the main content of the embed
            embed.setDescription(``);

            embed.setAuthor(`User information for ${user.username}`, user.avatarURL);

            embed.addField("User info", user_info);
            embed.addField("Guild specific info", guild_info);
            embed.addField("Presence", presence);

            embed.setTimestamp(new Date());

            message.reply(embed);

        }
        catch (err) {
            console.log(err);
            message.reply(`Sorry, couldn't retrieve the target user info properly for you. \n Error: ${err.message}`);
        }
    },

    serverinfo: async function (client, message) {
        try {
            var icon = message.guild.iconURL;

            if (icon == null) {
                icon = "No icon was set";
            }

            var data = new RichEmbed();

            data.color = 3447003;

            var generic = `**ID:** ${message.guild.id} \n` +
                `**Members:** ${message.guild.memberCount} \n` +
                `**Owner:** ${message.guild.owner.user.tag} - ${message.guild.ownerID} \n` +
                `**Region:** ${message.guild.region} \n` +
                `**Created at:** ${message.guild.createdAt} \n` +
                `**Verification level:** ${message.guild.verificationLevel} \n` +
                `**AFK timeout:** ${message.guild.afkTimeout / 60} minute(s) \n` +
                `**Icon:** ${icon}\n`;

            data.setAuthor(`Server information for ${message.guild.name}`, message.guild.iconURL);
            data.addField(`Generic`, generic, false);

            data.addField(`Roles`, getAllRoles(message), false);

            var prefix = "";
            var botcontrol = 0;

            if (repo != null) {
                prefix = await repo.GetPrefix(message.guild.id);
                //botcontrol = await repo.GetValue(message.guild.id, "PermRole");
                botcontrol = -1;
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

            if (prefix == null) {
                prefix = "Not able to retrieve a prefix for this server. Default prefix is being used.";
            }
            var settings = `**Prefix:** ${prefix} \n` + permissionrole;

            data.addField(`Server specific bot configuration`, settings, false);

            message.reply(data);
        }
        catch (err) {
            console.log(err);
            message.reply(`Sorry, couldn't retrieve the server info properly for you. \n Error: ${err.message}`);
        }
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
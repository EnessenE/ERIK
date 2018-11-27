const config = require("./Settings/config.json");
//const repo = require("./Repo/Repository.js");
const repo = null;
const OS = require('os');

const configcommands = require("./Commands/configuration.js");
const infocommands = require("./Commands/info.js");

const Discord = require("discord.js");
const { RichEmbed } = require('discord.js');

const client = new Discord.Client();

var statusbot = config.info.status[0];

var commands = [
    "help", "List of commands.",
    "prefix [new prefix]", "Set a new prefix for the bot.",
    "ping", "Ping of the bot to discord.",
    "you", "Bot information",
    "serverinfo", "Server information",
    "userinfo @user", "Information about a user",
    "me", "Information about you"
];

var admins = [];


async function SendToAdmin(message) {
    if (admins == undefined) {
        admins = await GetAdmins();
    }
    admins.forEach(function (admin) {
        admin.send(message);
    });
}

function sendErrorToAdmin(header, text, message) {
    const embed = new RichEmbed()
        // Set the title of the field
        .setTitle(header)
        // Set the color of the embed
        .setColor(0xFF0000)
        // Set the main content of the embed

        .setDescription(text);
    // Send the embed to the same channel as the message
    if (message != undefined) {

        embed.addField("Guild", message.guild.id + " - " + message.guild.name);
        embed.addField("Author", "<@" + message.author.id + "> - " + message.author.tag);
        embed.addField("Command", message.content);
    }
    embed.setTimestamp(new Date());

    SendToAdmin(embed);
}

configcommands.init(repo, config);
infocommands.init(repo, config, OS);

function print(message, override) {
    if (config.costum.debugging || override) {
        console.log(`MAIN.JS: ${message}`);
    }
}

async function getPrefix(guildid) {
    var result = config.default.prefix;
    if (repo !== null) {
        result = await repo.GetPrefix(message.guild.id);
        if (result == null) {
            result = config.default.prefix;
        }
    }
    return result;
}

function initialize_misc() {
    async function GetAdmins() {
        return new Promise(function (resolve, reject) {
            config.settings.admins.forEach(async function (id) {
                var x = await client.fetchUser(id.toString());
                admins.push(x);
            });
            resolve(admins);
        });
    }

    client.on('ready', async () => {
        await GetAdmins();
        const embed = new RichEmbed()
            // Set the title of the field
            .setTitle("Startup information")
            // Set the color of the embed
            .setColor("#0000ff")
            // Set the main content of the embed
            .setDescription("Bot information that was gathered when the bot was started");

        print(`Logged in as ${client.user.tag}!`, true);
        embed.setThumbnail(client.user.avatarURL);
        embed.addField("Host", OS.hostname());
        embed.addField("Version", config.info.version);
        embed.addField("Guilds", client.guilds.size);
        embed.addField("Online users", client.users.size);
        embed.setTimestamp(new Date());
        SendToAdmin(embed);
        client.user.setActivity(statusbot);
    });

    client.on('guildCreate', async guild => {
        SendToAdmin(`Connected to a discord: ${guild.name} - ${guild.memberCount} members`);
    });

    client.on('guildDelete', async guild => {
        SendToAdmin(`Disconnected from a discord: ${guild.name} - ${guild.memberCount} members`);
    });
}

function initialize_main() {
    var contacts = "";
    config.settings.admins.forEach(async function (admin) {
        contacts += " or <@" + admin + ">";
    });

    client.on('message', msg => messageEvent(msg));
}

async function messageEvent(message) {

    if (message.author != client.user) {
        if (message.channel.type === 'dm') {
            message.reply(`Hi! I have no functioning commands here. If you want to talk about me contact${contacts}. Or to add me visit ${config.info.invitelink}`);
        }
        else {
            if (message.guild.available) {
                const user = message.author;

                var serverdata = null;//await repo.GetServer(await message.guild.id);

                if (serverdata === null) {//id,servername,members,prefix,owner
                    //print("Creation of record: " + await repo.CreateServer(message.guild.id, message.guild.name, message.guild.memberCount, config.default.prefix, message.guild.ownerID, message.guild.region), true);
                }
                else {
                    //TODO: apply cashing here
                    //repo.UpdateServer(message.guild.id, message.guild.name, message.guild.memberCount, await message.guild.ownerID, message.guild.region);
                }
                if (user.tag !== client.user.tag) {
                    print("[" + message.guild.name + "]" + message.author.tag + " - " + message.content);

                    var messageParts = message.content.split(' ');
                    var input = messageParts[0].toLowerCase();
                    var parameters = messageParts.splice(1, messageParts.length);

                    var prefix = await getPrefix();
                    //var role_id = await repo.GetValue(message.guild.id, "PermRole");

                    if (prefix != null) {
                        try {

                            commandLogic(prefix, message, role_id);
                        }
                        catch (error) {
                            print("Error: " + error);
                            sendErrorToAdmin("Error occured in commandLogic", error, message);
                        }
                    }
                }
            }
        }
    }
}

function commandLogic(prefix, message, role_id) {
    if (input.charAt(0) == prefix) {
        var command = input.substr(1);
        if (command === prefix + "ping") {
            infocommands.ping(client, message);
        }
        else if (command === "you") {
            infocommands.botinfo(client, message);
        }
        else if (command === "prefix") {
            configcommands.setprefix(client, message, parameters);
        }
        else if (command === "serverinfo") {
            infocommands.serverinfo(client, message);
        }
        else if (command === "help") {
            helparray = "";
            var list = 0;
            for (i = 0; i < commands.length / 2; i++) {
                helparray = helparray + "**" + prefix + commands[list] + "** - " + commands[list + 1] + "\n";
                list += 2;
            }
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
                        text: config.info.link
                    }
                }
            };
            message.reply(messagearray);
        }
        else if (command === "botcontrol") {
            configcommands.setbotcontrol(message, parameters);
        }
        else if ((command === "userinfo") || (command === "me")) {
            infocommands.userinfo(client, message, parameters);
        }
        else {
            GuildSpecificCommands(message);
        }
    }
}

function GuildSpecificCommands(message) {
    var pass = false;
    for (var i = 0; i < config.specialguilds.length; i++) {
        if (message.guild.id == config.specialguilds[i]) {
            pass = true;
        }
    }
    if (pass) {
        messageParts = message.content.split(' ');
        input = messageParts[0].toLowerCase();
        parameters = messageParts.splice(1, messageParts.length);

        if (input === prefix + "credits") {
            message.reply("Try again later.");
        }
    }
}

function notallowed(command, id) {
    return "You are not allowed to use the " + prefix + command + " command."
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

async function Start_Bot() {
    await initialize_misc();
    await client.login(config.token.discord);
    print("Bot has started", true);
    initialize_main();

}

Start_Bot();



//setTimeout(function () {
//    StartWebserver();
//}, 3000);




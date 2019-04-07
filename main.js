const config = require("./Settings/config.json");
const repo = require("./Repo/Repository.js");
const OS = require('os');

const configcommands = require("./Commands/configuration.js");
const infocommands = require("./Commands/info.js");
const time = require("./Logic/time.js");

const { Discord, Client, RichEmbed } = require('discord.js');

const client = new Client();

var commands = [
    "help/commands", "List of commands.",
    "prefix [new prefix]", "Set a new prefix for the bot.",
    "ping", "Ping of the bot to discord.",
    "you/botinfo", "Bot information",
    "serverinfo", "Server information",
    "userinfo @user", "Information about a user",
    "me", "Information about you"
];

var admins = [];
var contacts;

function print(message, override) {
    if (config.costum.debugging || override) {
        console.log(`MAIN.JS: ${message}`);
    }
}

function randomStatus() {
    var random = Math.floor(Math.random() * config.info.status.length) + 0;
    var status = config.info.status[random];
    client.user.setActivity(`${status}`);
}

async function SendToAdmin(message) {
    if (admins == undefined) {
        admins = await GetAdmins();
    }
    admins.forEach(function (admin) {
        admin.send(message);
    });
}

function sendErrorToAdmin(header, text, message) {
    const embed = new RichEmbed();
    // Set the title of the field
    embed.setTitle(header);
    // Set the color of the embed
    embed.setColor(0xFF0000);
    // Set the main content of the embed

    embed.setDescription(text);
    // Send the embed to the same channel as the message
    if (message != undefined) {

        embed.addField("Guild", message.guild.id + " - " + message.guild.name);
        embed.addField("Author", "<@" + message.author.id + "> - " + message.author.tag);
        embed.addField("Command", message.content);
    }
    embed.setTimestamp(new Date());

    SendToAdmin(embed);
}

async function getPrefix(guildid) {
    var result = config.default.prefix;
    if (repo !== null) {
        result = await repo.GetPrefix(guildid);
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
                var x = await client.fetchUser(id);
                admins.push(x);
            });
            resolve(admins);
        });
    }

    client.on('ready', async () => {
        await GetAdmins();
        const embed = new RichEmbed()
        // Set the title of the field
        embed.setTitle("Startup information")
        // Set the color of the embed
        embed.setColor("#00a9ff")
        // Set the main content of the embed
        embed.setDescription("Bot information that was gathered when the bot was started");

        print(`Logged in as ${client.user.tag}!`, true);
        embed.setThumbnail(client.user.avatarURL);
        embed.addField("Host", OS.hostname());
        embed.addField("Version", config.info.version);
        embed.addField("Guilds", client.guilds.size);
        embed.addField("Online users", client.users.size);
        embed.setTimestamp(new Date());
        SendToAdmin(embed);
        randomStatus();
    });

    client.on('guildCreate', async guild => joinedGuild(guild));

    client.on('guildDelete', async guild => {
        SendToAdmin(`Disconnected from a discord: ${guild.name} - ${guild.memberCount} members`);
    });

    setInterval(function () {
        timeCode();
    }, 60 * 1000); // 60 * 1000 * 60 milsec aka every hour

}

function timeCode() {
    print("Time code is executing");
    if (Math.floor(Math.random() * 100) == 1) {
        randomStatus();
    }
    time.timeCode(client);
}

function initialize_main() {
    contacts = "";
    config.settings.admins.forEach(async function (admin) {
        contacts += " or <@" + admin + ">";
    });

    client.on('message', msg => messageEvent(msg));

    client.on("guildMemberAdd", member => memberJoined(member));

    client.on("guildMemberRemove", member => memberLeft(member));

    client.on("error", info => clientError(info));
}

function clientError(error) {
    console.log('Error event:\n' + JSON.stringify(error));
    // handle the error here
}

async function memberJoined(member) {
    print(`${member.user.username} has joined ${member.guild.name}`)
}

async function memberLeft(member) {
    print(`${member.user.username} has left ${member.guild.name}`)
    if (repo.getLeaveMessages()) {
        member.guild.channels.forEach(function (element) {
            if (element.name == "general") {
                element.send(`<@${member.user.id}> has left this server. Wave goodbye.`);
            }
        });
        //TODO: Cache the userid that has left incase he rejoins so we can reassign roles.
    }
}

function joinedGuild(guild) {
    const embed = new RichEmbed()
    embed.setTitle("General information")
    embed.setColor("#00a9ff")
    embed.setDescription("This bot has joined a new guild");

    embed.setThumbnail(guild.iconURL);
    embed.addField("Name", guild.name);
    embed.addField("Members", guild.memberCount);
    embed.setTimestamp(new Date());
    SendToAdmin(embed);
}

async function messageEvent(message) {
    try {
        if (message.author != client.user) {
            if (message.channel.type === 'dm') {
                message.reply(`Hi! I have no functioning commands here. If you want to talk about me contact${contacts}. Or to add me visit ${config.info.invitelink}`);
            }
            else {
                if (message.guild.available) {
                    const user = message.author;

                    var serverdata = await repo.GetServer(await message.guild.id);

                    if (serverdata === null) {
                        var result = await repo.CreateServer(message.guild.id, message.guild.name, message.guild.memberCount, config.default.prefix, message.guild.owner.user.tag, message.guild.ownerID, message.guild.region);
                        print("Creation of record: " + result, true);
                    }
                    else {
                        print("Exists, have to update")
                        //TODO: apply cache-ing here
                        //repo.UpdateServer(message.guild.id, message.guild.name, message.guild.memberCount, await message.guild.ownerID, message.guild.region);
                    }

                    if (user.tag !== client.user.tag) {
                        print(`[${message.guild.name}]${message.author.tag} - ${message.content}`);

                        var messageParts = message.content.split(' ');
                        var input = messageParts[0].toLowerCase();

                        var parameters = messageParts.splice(1, messageParts.length);

                        var prefix = await getPrefix(message.guild.id);
                        //var role_id = await repo.GetValue(message.guild.id, "PermRole");

                        try {
                            if (prefix != null) {
                                GuildSpecificChecks(message);
                                if (input.charAt(0) == prefix) {
                                    var command = input.substr(1);
                                    commandLogic(prefix, null, message, command, parameters);
                                }
                            }
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
    catch (error) {
        sendErrorToAdmin("Error occured in messageEvent", error, message);
    }
}

async function commandLogic(prefix, role_id, message, command, parameters) {
    try {
        if (command === "ping") {
            infocommands.ping(client, message);
        }
        else if (command === "you" || command === "botinfo") {
            infocommands.botinfo(client, message);
        }
        else if (command === "prefix") {
            print(`${message.author.tag} has this permission: ${await hasPermission(message)}`);
            if (await hasPermission(message)) {
                configcommands.setprefix(client, prefix, message, parameters);
            }
            else {
                message.reply(notallowed());
            }
        }
        else if (command === "serverinfo") {
            infocommands.serverinfo(client, message);
        }
        else if (command === "help" || command === "commands") {
            infocommands.help(client, prefix, message, commands);
        }
        else if (command === "botcontrol") {
            if (await hasPermission(message)) {
                configcommands.setbotcontrol(message, parameters);
            }
            else {
                message.reply(notallowed());
            }
        }
        else if ((command === "userinfo") || (command === "me")) {
            infocommands.userinfo(client, message, parameters);
        }
        else {
            GuildSpecificCommands(message);
        }
    }
    catch (error) {
        throw error;
    }
}

function GuildSpecificCommands(message) {
    print("GuildSpecificCommands");
    var pass = false;
    for (var i = 0; i < config.settings.specialguilds.length; i++) {
        if (message.guild.id == config.settings.specialguilds[i]) {
            pass = true;


            message.attachments.forEach(function (element) {
                print("checking file: " + element.filename);
                for (var i = 0; i < config.settings.blockedfilenames.length; i++) {
                    if (element.filename == config.settings.blockedfilenames[i]) {
                        print("BLOCKED FILE");
                        message.reply("Bad boy!");
                        message.delete();
                    }
                }
            });

        }
    }
}


async function GuildSpecificChecks(message) {
    print("GuildSpecificCommands");
    var pass = false;
    for (var i = 0; i < config.settings.specialguilds.length; i++) {
        if (message.guild.id == config.settings.specialguilds[i]) {
            pass = true;
            message.attachments.forEach(function (element) {
                print("checking file: " + element.filename);
                for (var i = 0; i < config.settings.blockedfilenames.length; i++) {
                    if (element.filename == config.settings.blockedfilenames[i]) {
                        print("BLOCKED FILE");
                        message.reply("Bad boy!");
                        message.delete();
                    }
                }
                for (var i = 0; i < config.settings.blockedfilesize.length; i++) {
                    print("SIZE: " + element.filesize);
                    if (element.filesize == config.settings.blockedfilesize[i]) {
                        print("BLOCKED FILE");
                        message.reply("Bad boy!");
                        message.delete();
                    }
                }
            });
            for (var i = 0; i < config.settings.blockedwords.length; i++) {
                if (message.content.includes(config.settings.blockedwords[i])) {
                    print("BLOCKED WORD");
                    message.reply("Bad boy!");
                    message.delete();
                }
            }

        }
    }
}

function notallowed() {
    return "you are not allowed to use that command.";
}

async function hasPermission(message) {
    var val = false;
    return new Promise(async function (resolve, reject) {
        try {
            roletarget = parseInt(await repo.GetControl(message.guild.id));
            message.member.roles.forEach(function (element) {
                if (roletarget == parseInt(element.id)) {
                    val = true;
                }
            });
            if (message.member.hasPermission("ADMINISTRATOR")) {
                val = true;
            }
            resolve(val);
        }
        catch (error) {
            resolve(false);
        }
    });
}


function IsAdmin(id) {
    return new Promise(function (resolve, reject) {
        config.settings.admins.forEach(async function (x) {
            if (x == id) {
                resolve(true);
            }
        });
        resolve(false);
    });
}

async function Start_Bot() {
    configcommands.init(repo, config);
    infocommands.init(repo, config, OS);
    time.init(repo, config);

    await initialize_misc();
    await client.login(config.token.discord);

    print("Bot has started", true);
    initialize_main();

}

Start_Bot();





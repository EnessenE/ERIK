function timeout(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, delay);
    });
}

const config = require("./config.json");
const sql = require("./sql.js");

const configcommands = require("./Commands/configuration.js");
const infocommands = require("./Commands/info.js");

const Discord = require('discord.js');
const client = new Discord.Client();
const token = config.discordtoken;

const ytdl = require('ytdl-core');
const OS = require('os');
var fs = require('fs');

const imdb = require('imdb-api');
imdbkey = config.imdbtoken;

var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(config.youtubetoken);

var giphy = require('giphy-api')(config.giphytoken);

var maxyoutubevideotime = config.maxyoutubevideotimedefault; //seconds

var defaultprefix = config.defaultprefix;
var discordbotlink = config.discordbotlink;
var botver = config.botver;
var statusbot = botver + " | " + "/" + "help";
var versioninfo = config.versioninfo;

var playlist = new Array();
var playing = new Array();
var votes = new Array();
var skipsong = new Array();
var skiplist = new Array();

//inits//

configcommands.init(sql, config);
infocommands.init(sql, config, OS);

//end inits//
var commands = [
    "help", "List of commands.",
    "prefix [new prefix]", "Set a new prefix for the bot.",
    "ping", "Ping of the bot to discord.",
    "you", "Bot info.",
    "serverinfo", "Info about the server.",
    "play [URL/video name]", "Add a youtube video to the queue.",
    "queue", "Show the current queue.",
    "stop", "Stops the bot from playing music and clears the queue.",
    "playtime [seconds]", "Set the max video length for the bot",
    "botcontrol [role name]","This role can set settings for the bot",
    "skip", "Vote to skip the current song. If you are the one who requested the song then song will be force skipped.",
    "avatar", "Links your avatar",
    "userinfo @[username]", "Get info about your and other discord accounts.",
    "help - API's","From here we have commands based on a external API",
    "IMDB [movie title]", "Get info about your favorite movie!"
];

console.log(OS.hostname());
client.login(token);
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await sendtoadmin("I have been started on: " + OS.hostname() + " - " + botver);
    await sendtoadmin(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`);
    client.user.setActivity(statusbot);
});

client.on('guildCreate', async guild => {
    sendtoadmin(`Added to a discord: ` + guild.name + " - " + (guild.memberCount - 1) + " members");
});

client.on('guildDelete', async guild => {
    sendtoadmin(`Removed from a discord: ` + guild.name + " - " + (guild.memberCount) + " members");
});

function getadminuser() {
    return new Promise(async function (resolve, reject) {
        console.log("getting admin user.")
        resolve(await client.fetchUser(config.adminuser));
    })
}

var admin;
async function sendtoadmin(message) {
    console.log(message);
    if (admin == undefined) {
        console.log("Getting admin user");
        admin = await getadminuser();
    }
    console.log("Sending message: " + message.toString());
    admin.send(message.toString());
}

function TryParseInt(str, defaultValue) {
    var retValue = defaultValue;
    if (str !== null) {
        if (str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}

async function getmember(message,user) {
    const botmember = await message.guild.fetchMember(user);
    return botmember;
}

function PermCheck(message, user, roleid) {
    var val=false;
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

client.on('message', async message => {
    if (message.channel.type === 'dm' && message.author != client.user) { //dm
        message.reply("Hi! I have no functioning commands here. But if you want me to add me to your own discord to interact with me click here: https://" + discordbotlink)
    }
    else if (message.author != client.user && message.guild.available) {
        console.log("[" + message.guild.name + "]" + message.author.tag + " - " + message.content);
        const user = message.author;
        sql.getserver(message.guild.id).then(out => {
            if (out == false) {//id,servername,members,prefix,owner
                console.log("Creation of record: " + sql.create(message.guild.id, message.guild.name, message.guild.memberCount, defaultprefix, message.guild.owner.user.tag, message.guild.region));
            }
            else {
                sql.update(message.guild.id, message.guild.name, message.guild.memberCount, message.guild.owner.user.tag, message.guild.region) //async
            }
        });
        const permmember = await message.channel.permissionsFor(client.user);
        if (user.tag === client.user.tag) {
            console.log(message.content);
        };
        try {
            if (user != client.user && permmember.has("SEND_MESSAGES")) {
                messageParts = message.content.split(' ');
                input = messageParts[0].toLowerCase();
                parameters = messageParts.splice(1, messageParts.length);
                prefix = await sql.getprefix(message.guild.id);
                gotroleid = await sql.getvalue(message.guild.id, "PermRole");
                if (playlist[message.guild.id] == undefined) {
                    playlist[message.guild.id] = new Array();
                    skiplist[message.guild.id] = new Array();
                    votes[message.guild.id] = 0;
                    skipsong[message.guild.id] = false;
                    console.log("Created a new queue for " + message.guild.id)
                }
                if (input === prefix + "ping") {
                    message.reply('My ping to discord is ' + client.ping + ' ms.');
                }
                else if (input === prefix + "you") {
                    message.reply({
                        embed: {
                            color: 3447003,
                            author: {
                                name: "Bot information for " + client.user.tag,
                                icon_url: client.user.avatarURL
                            },
                            fields: [{
                                name: "Generic",
                                value:
                                "Uptime: " + Math.floor(((client.uptime / 1000.0) / 60 / 60), 1) + " hour(s)\n"
                                + "Running on: " + client.guilds.size + " servers\n"
                                + "Running for: " + client.users.size + " online users\n"
                            },
                            {
                                name: "Version " + botver,
                                value: versioninfo
                            },
                            {
                                name: "Back-end info",
                                value:
                                "Current server: " + OS.hostname() + "\n"
                                + "RAM: " + Math.floor((OS.freemem() / 1073741824) * 10) / 10 + "/" + Math.floor((OS.totalmem() / 1073741824) * 10) / 10 + " GB \n"
                                + "CPU: " + OS.cpus().length + " cores \n"
                            }
                            ],
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: discordbotlink
                            }
                        }
                    });
                }
                else if (input === prefix + "prefix") {
                    if (await PermCheck(message, message.author, gotroleid) == true) {
                        if (parameters.length != 0) {
                            //prefixset[message.guild.id] = parameters[0];
                            sql.setprefix(message.guild.id, parameters[0])
                            message.reply("Changed the prefix from " + prefix + " to " + parameters[0] + ".");
                        }
                    }
                    else {
                        notallowed("prefix", message.guild.id)
                    }
                }
                else if (input === prefix + "serverinfo") {
                    // console.log(message.guild.roles);
                    roleoutput = "";
                    message.guild.roles.forEach(function (element) {
                        roleoutput = roleoutput + ", " + element.name;
                    });
                    roleoutput = roleoutput.substr(3, roleoutput.length);
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
                                "**Prefix:** "+prefix + "\n"
                            },
                            ],
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: discordbotlink
                            }
                        }
                    });
                }
                else if (input === prefix + "help") {
                    helparray = "";
                    var list = 0
                    for (i = 0; i < commands.length / 2; i++) {
                        helparray = helparray+  "**" +prefix+ commands[list] + "** - " + commands[list + 1] + "\n";
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
                                text: discordbotlink
                            }
                        }
                    };
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
                    message.reply(messagearray);
                }
                else if (input === prefix + "play") {
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
                }
                else if (input === prefix + "stop") {
                    if (await PermCheck(message, message.author, gotroleid) == true) {
                        playlist[message.guild.id] = new Array();
                        killsong(message.guild.id);
                        message.reply("Stopped and cleared the playlist.")
                    }
                    else {
                        message.reply(notallowed("stop", message.guild.id));
                    }
                }
                else if (input === prefix + "skip") {
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
                }
                else if (input === prefix + "queue") {
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
                }
                else if (input === prefix + "avatar") {
                    message.reply(message.author.avatarURL);
                }
                else if (input === prefix + "imdb") {
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
                else if (input === prefix + "giphy") {
                    bigpara = "";
                    for (var i = 0; i < parameters.length; i++) {
                        bigpara = bigpara + " " + parameters[i]

                    }
                    giphy.search(bigpara).then(function (res) {
                        message.reply(`Here's your random gif: ${res.data.url}`)
                    });
                }
                else if (input === prefix + "playtime") {
                    //message.reply("Playtime for this server is: " + await sql.getplaytime(message.guild.id)); maxyoutubevideotime
                    if (await PermCheck(message, message.author, gotroleid) == true) {
                        if (parameters[0] != ("" || undefined)) {
                            var c = TryParseInt(parameters[0], null);
                            if (c != null) {
                                if (c <= maxyoutubevideotime) {
                                    sql.setplaytime(message.guild.id, c);
                                    message.reply("Set maximal video playtime to " + c + " seconds");
                                }
                                else {
                                    message.reply("Sorry, you aren't allowed to set a higher playtime than " + maxyoutubevideotime + " seconds.");
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
                }
                else if (input === prefix + "debug") {
                    message.reply(message.author.id);
                }
                else if (input === prefix + "botcontrol") {
                    if (message.member.hasPermission("ADMINISTRATOR")) {
                        if (parameters[0] != ("" || undefined)) {
                            bigpara = "";
                            for (var i = 0; i < parameters.length; i++) {
                                bigpara = bigpara + " " + parameters[i]
                            }
                            bigpara = bigpara.substr(1, bigpara.length);
                            var found = false;
                            var roleid = 0;
                            var rolename = "";
                            message.guild.roles.forEach(function (element) {
                                if (element.name == bigpara) {
                                    found = true;
                                    roleid = element.id;
                                    rolename = element.name;
                                }
                            });
                            if (found == true) {
                                sql.updatevalue(message.guild.id, "PermRole", roleid)
                                message.reply("I have set the role " + rolename + " to control me.");
                            }
                            else {
                                message.reply("I couldn't find that role");
                            }
                        }
                        else {
                            roleid = 0;
                            rolename = "";
                            message.guild.roles.forEach(function (element) {
                                if (element.id == gotroleid) {
                                    found = true;
                                    roleid = element.id;
                                    rolename = element.name;
                                }
                            });
                            if (roleid != 0) {
                                message.reply("The role that can control me is " + rolename+".");
                            }
                            else {
                                message.reply("No role has been set to control me.");
                            }
                        }
                    }
                    else {
                        message.reply("Sorry, you need the Administrator permission to change this.");
                    }
                }
                else if (input === prefix + "userinfo") {
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
                                        "\n" + "**Joined discord on**: " + gotuser.createdAt 
                                    },
                                    {
                                        name: "Guild specific info",
                                        value: "**Nickname**: " + (gotmember.nickname || "None")  + "\n" +
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
                                    text: discordbotlink
                                }
                            }
                        };
                        message.reply(messagearray);
                    }
                    catch (err) {
                        message.reply("Couldn't make an embedded post for you. Sorry!");
                    }
                }
            }
            else {
                console.log("Not allowed to chat here.");
            }
        }
        catch (erro) {
            console.log(erro);
        }
    }
    }
);

function resetsong(guildid) {
    votes[guildid] = 0;
    skiplist[guildid] = new Array();
}

async function killsong(guildid) {
    playlist[guildid].splice(0, 1);
    if (playlist[guildid][0] === undefined) {
        mess = undefined;
        link = undefined;
        voice = undefined;
        sort = 0;
    }
    else {
        mess = playlist[guildid][0].messa;
        link = playlist[guildid][0].link;
        voice = playlist[guildid][0].voice;
        sort = 2;
    }
    resetsong(guildid);
    callplaylist(sort, mess, guildid, voice, link);
}

function alreadyvoted(name, guildid) {
    for (var i = 0; i < skiplist[guildid].length; i++) {
        if (skiplist[guildid][i] === name) {
            return true
        }
    }
    skiplist[guildid].push(name);
    return false;
}

function notallowed(command, id) {
    return "You are not allowed to use the " + prefix + command + " command."
}

function getskipstatus(guildid) {
    var stupid = skipsong[guildid];
    return stupid;
}

async function play(message, para, voiceChannel, guildid) {
    var numb = await sql.getvalue(message.guild.id, "played");
    numb++;
    sql.updatevalue(message.guild.id, "played", numb);

    voiceChannel.join()
        .then(connnection => {
            var watch = para;
            youTube.getById(youtube_parser(watch), function (error, result) {
                if (error) {
                    message.reply("An error occured in retrieving the title");
                }
                else {
                    // data=JSON.stringify(result, null, 2);
                    // message.reply("Now playing: " + result.items[0].snippet.localized.title + "\n URL: " + watch);
                    messagearray = {
                        embed: {
                            color: 3066993,
                            author: {
                                name: "Currently playing for " + message.guild.name,
                                icon_url: message.guild.iconURL
                            },
                            fields: [
                                {
                                    name: result.items[0].snippet.localized.title,
                                    value: "Added by: " + playlist[message.guild.id][0].author + "\n" +
                                    "Channel: " + playlist[message.guild.id][0].channel + "\n" +
                                    "Length: " + playlist[message.guild.id][0].time + "\n" +
                                    "Link: " + playlist[message.guild.id][0].link + "\n"+
                                    "In queue after this: " + (playlist[guildid].length - 1)
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
                });
                const stream = ytdl(watch, { filter: 'audioonly', quality: 'lowest'  });
                const dispatcher = connnection.playStream(stream);
                dispatcher.on('end', async function (error, result) {
                    console.log("Ended song! Skip status: " + getskipstatus(guildid));
                    if (getskipstatus(guildid) === false) {
                        killsong(guildid);
                        skipsong[guildid] = false;
                    }
                    else {
                        console.log("Skipping song");
                        var numb = await sql.getvalue(message.guild.id, "skipped");
                        numb++;
                        sql.updatevalue(message.guild.id, "skipped", numb);
                        skipsong[guildid] = false;
                    }

                });
            });
    
}

function YTDurationToSeconds(duration) {
    var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    match = match.slice(1).map(function (x) {
        if (x != null) {
            return x.replace(/\D/, '');
        }
    });

    var hours = (parseInt(match[0]) || 0);
    var minutes = (parseInt(match[1]) || 0);
    var seconds = (parseInt(match[2]) || 0);

    return hours * 3600 + minutes * 60 + seconds;
}

async function callplaylist(sort, message, guildid, voiceChannel, link,videotime) {//message,guidid,voiceChannel,parameters[0]
    try {
        console.log("Entered function " + sort + " - " + guildid +  link);
        var skip = false;
        var yesthisskip = false;
        if (sort === 0) {
            if (client.voiceConnections.get(guildid) != undefined) {
                client.voiceConnections.get(guildid).disconnect();
                playing[guildid] = false;
                votes[guildid] = 0;
                skiplist[guildid] = new Array();
                skip = true;
                console.log("Left");
            }
        };
        if (skip == false) {
            if (sort === 1) {
                author = message.author.tag;
                vidname = "[youtube title]";
                voice = voiceChannel;
                messa = message;
                videotime=await sql.getplaytime(guildid);
                youTube.getById(youtube_parser(link), function (error, result) {
                    if (error || result.items.length == 0) {
                        message.reply("Sorry, I can't play a song right now. It seems that there is something wrong with youtube right now or your link is invalid.")
                    }
                    else {
                        // data=JSON.stringify(result, null, 2);
                        vidname = result.items[0].snippet.localized.title;
                        time = YTDurationToSeconds(result.items[0].contentDetails.duration)
                        channel = result.items[0].snippet.channelTitle;
                        console.log("Song is " + time + " seconds. Livestream status: " + result.items[0].snippet.liveBroadcastContent + ".")
                        if (time <= videotime && result.items[0].snippet.liveBroadcastContent === "none") {
                            time = result.items[0].contentDetails.duration.replace("PT", "").toLowerCase();
                            playlist[guildid].push({ link, author, voice, vidname, messa, guildid, time, channel });
                            if ((playing[guildid] === undefined || playing[guildid] === false)) {
                                console.log("Nothing playing for " + guildid);
                                playing[guildid] = true;
                                play(message, link, voiceChannel, guildid);
                            }
                            else {
                                message.reply("Added '" + vidname + "' to the queue.");
                            }
                        }
                        else if (time > videotime) {
                            time = result.items[0].contentDetails.duration;
                            message.reply("Song is not allowed to be longer then " + videotime / 60 + " minutes! Yours is: " + time.replace("PT", "").toLowerCase());
                        }
                        else if (result.items[0].snippet.liveBroadcastContent != "none") {
                            message.reply("Song is not allowed to be a livestream!")
                        }
                    }
                });
            };
            if (sort === 2 || sort === 3) {
                playing[guildid] = true;
                play(message, link, voiceChannel, guildid);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

console.log("Bot has started");

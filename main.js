function timeout(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, delay);
    });
}

const config = require("./config.json");
const sql = require("./sql.js");

const configcommands = require("./Commands/configuration.js");
const infocommands = require("./Commands/info.js");
const imdbcommands = require("./Commands/IMDB.js");

const Discord = require('discord.js');
const client = new Discord.Client();
const token = config.discordtoken;

const ytdl = require('ytdl-core');
const OS = require('os');
var fs = require('fs');

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
imdbcommands.init(config);

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
                    infocommands.ping(client, message);
                }
                else if (input === prefix + "you" || input === prefix + "botinfo") {
                    infocommands.botinfo(client, message);
                }
                else if (input === prefix + "prefix") {
                    configcommands.setprefix(client, message, parameters);
                }
                else if (input === prefix + "serverinfo") {
                    // console.log(message.guild.roles);
                    infocommands.serverinfo(client, message);
                }
                else if (input === prefix + "help") {
                    infocommands.helpinfo(client, message, helpinfo);
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
                else if (input === prefix + "imdb") {
                    imdbcommands.search(client,message,parameters);
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
                                if (c <= maxyoutubevideotime && c>=0) {
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
                }
                else if (input === prefix + "debug") {
                    message.reply(message.author.id);
                }
                else if (input === prefix + "botcontrol") {
                    configcommands.setbotcontrol(message)
                }
                else if ((input === prefix + "userinfo") || (input === prefix + "me")) {
                    infocommands.userinfo(client, message);
                }
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

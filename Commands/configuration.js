var repo;
var config;

module.exports = {
    init: function (s, c) {
        repo = s;
        config = c;
    },

    setprefix: async function (client, prefix, message, parameters) {
        if (repo != null) {
            if (parameters.length !== 0) {
                //prefixset[message.guild.id] = parameters[0];
                if (repo != null) {
                    var futureprefix = parameters[0].charAt(0);
                    var result = await repo.SetPrefix(message.guild.id, futureprefix);
                    if (result != null && result == true) {
                        message.reply(`Changed the prefix from ${prefix} to ${futureprefix}`);
                    }
                    else {
                        message.reply("I wasn't able to set the prefix. No changes were made.");
                    }
                }
                else {
                    message.reply("I wasn't able to set the prefix. No database connection is available. No changes were made.");
                }
            }
            else {
                message.reply("You need to define what prefix you want.");
            }
        }
    },

    setbotcontrol: async function (message, parameters) {
        if (parameters[0] != ("" || undefined)) {
            if (repo != null) {
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
                    if (await repo.UpdateControl(message.guild.id, roleid)) {
                        message.reply("I have set the role " + rolename + " to control me.");
                    }
                    else {
                        message.reply("An error occured while setting this role. Try again later.");
                    }
                }
                else {
                    message.reply("I couldn't find that role ;(");
                }
            }
            else {
                message.reply("I wasn't able to make any changes, the database isn't set.")
            }
        }
        else {
            message.reply("You need the define a role. Recommended parameter: @<role> ");
        }
    }
}
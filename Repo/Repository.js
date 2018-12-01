const config = require("../Settings/config.json");
const db = require("../Context/" + config.sql.type + ".js");


module.exports = {
    CreateServer: async function (id, servername, members, prefix, owner, region) {
        return await db.CreateServer(id, servername, members, prefix, owner, region);
    },

    UpdateServer: async function (serverid, servername, members, owner, region) {
        return await db.UpdateServer(serverid, servername, members, owner, region);
    },

    GetValue: async function (id, valuetocheck) {
        return await db.GetValue(id, valuetocheck);
    },
    UpdateValue: async function (serverid, valuetoupdate, newvalue) {
        return await db.UpdateValue(serverid, valuetoupdate, newvalue);
    },

    GetPrefix: async function (serverid) {
        return await db.GetPrefix(serverid);
    },

    SetPrefix: async function (serverid, prefix) {
        return await db.UpdateValue(serverid, "prefix", prefix);
    }
}
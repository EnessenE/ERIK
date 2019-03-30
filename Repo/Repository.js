const config = require("../Settings/config.json");
const db = require("../Context/" + config.sql.type + ".js");


module.exports = {
    GetServer: async function (serverid) {
        return await db.getServer(serverid);
    },

    CreateServer: async function (id, servername, members, prefix, owner, ownerid, region, control) {
        return await db.createServer(id, servername, members, prefix, owner, ownerid, region, control);
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

    GetControl: async function (serverid) {
        return await db.getControl(serverid);
    },

    UpdateControl: async function (serverid, newvalue) {
        return await db.updateControl(serverid, newvalue);
    },

    GetPrefix: async function (serverid) {
        return await db.getPrefix(serverid);
    },

    SetPrefix: async function (serverid, prefix) {
        return await db.setPrefix(serverid, prefix);
    }
}
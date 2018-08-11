var mssql = require('mssql');
var mysql = require('mysql');
const config = require("../config.json");

const connection = new mssql.ConnectionPool({
    user: config.SQLUsername,
    password: config.SQLPassword,
    server: config.SQLHost,
    database: config.SQLDatabase
})

connection.connect(err => {
    if (!err) {
        console.log("Database is connected");
    } else {
        console.log("MSSQL Error connecting database: " + err);
    }
})

mssql.on('error', err => {
    console.log("ERROR OCCURED: " + err);
})

async function checkexist(id, fn) {
    console.log("Checking for " + id);
    var returned;
    return new Promise(function (resolve, reject) {
        const request = new mssql.Request(connection)
        request.input('id', mssql.NChar(999), id);
        request.query("SELECT * FROM servers WHERE servers.serverid = @id", async function ExistCheck(err, result, fields) {
            returned = false;
            if (result.recordset[0] != undefined) {
               returned = true;
            }
            resolve(returned);
        });
    });
}

async function createserver(id, servername, members, prefix, owner, region) {
    var returned;
    return new Promise(function (resolve, reject) {
        const request = new mssql.Request(connection)
        request.input('id', mssql.NChar(999), id);
        request.input('servername', mssql.NChar(999), servername);
        request.input('members', mssql.BigInt, members);
        request.input('prefix', mssql.NChar(999), prefix);
        request.input('region', mssql.NChar(999), region);
        request.input('owner', mssql.NChar(999), owner);

        request.query("INSERT INTO servers ([serverid], [servername], [members], [prefix], [owner], [region]) VALUES (@id, @servername, @members, @prefix, @owner, @region);", async function ExistCheck(err, result) {
            if (err) {
                console.log(err);
                resolve("Couldn't create record!");
            }
            resolve("Successfully added");
        });
    });
}


//UPDATE `database`.`servers` SET `servername`='34', `members`='60', `prefix`='34', `owner`='34', `region`='34' WHERE `serverid`='250621419325489153';

function updateall(id, servername, members, owner, region) {
    var returned;
    return new Promise(function (resolve, reject) {
        const request = new mssql.Request(connection)
        request.query("UPDATE servers SET [servername]=" + mysql.escape(servername) + ", [members]=" + mysql.escape(members.toString()) + ", [owner]=" + mysql.escape(owner) + ", [region]=" + mysql.escape(region) + " WHERE [serverid]=" + mysql.escape(id) + ";", async function ExistCheck(err, result) {
            if (err) {
                console.log(err);
                resolve("Couldn't create record!");
            }
            resolve("Successfully added");
        });
    });
}

function update(id, toset, newval) {
    var returned;
    return new Promise(function (resolve, reject) {
        try {
            const request = new mssql.Request(connection)
            request.query("UPDATE [servers] SET  " + toset + "=" + mysql.escape(newval) + " WHERE `serverid`=" + mysql.escape(id) + ";", async function ExistCheck(err, result) {
                if (err) {
                    console.log(err);
                    resolve("Couldn't create record!");
                }
                resolve(true);
            });
        }
        catch (err) {
            resolve(false);
        }
    });
}


function checkprefix(id) {
    var returned;
    return new Promise(function (resolve, reject) {
        const request = new mssql.Request(connection)
        request.input('id', mssql.NChar(999), id);
        request.query("SELECT prefix FROM servers WHERE servers.serverid = @id", async function ExistCheck(err, result, fields) {
            returned = "";
            if (result.recordset[0].prefix != undefined) {
                returned = result.recordset[0].prefix;
            }
            resolve(returned);
        });
    });
}


function checkplaytime(id) {
    var returned;
    return new Promise(function (resolve, reject) {
        const request = new mssql.Request(connection)
        request.input('id', mssql.NChar(999), id);
        request.query("SELECT maxplaytime FROM servers WHERE servers.serverid = @id", async function ExistCheck(err, result, fields) {
            returned = "";
            //console.log("Checking for " + id);
            if (result != undefined) {
                returned = result.recordset[0];
            }
            resolve(returned);
        });
    });
}


function checkvalue(id, valuetocheck) {
    return new Promise(function (resolve, reject) {
        var returned;
        const request = new mssql.Request(connection)

        request.input('id', mssql.NChar(999), id);
        request.input('valuetocheck', mssql.NChar(999), valuetocheck);
        console.log(id);
        request.query("SELECT @valuetocheck FROM servers WHERE servers.serverid = @id", async function ExistCheck(err, result, fields) {
            returned = "";
            //console.log("Checking for " + id);
            console.log(valuetocheck);
            console.log(result.recordset[0].PermRole);
            if (result.recordset[0][valuetocheck] != undefined) {
                returned = result.recordset[0][valuetocheck];
            }
            resolve(returned);
        });
    });
}


module.exports = {

    getserver: async function (id) {
        var boola = await checkexist(id);
        return boola;
    },

    create: async function (id, servername, members, prefix, owner, region) {
        var boola = await createserver(id, servername, members, prefix, owner, region);
        return boola;
    },

    update: function (serverid, servername, members, owner, region) {
        updateall(serverid, servername, members, owner, region);
    },

    getprefix: async function (serverid) {
        boola = await checkprefix(serverid);
        return boola;
    },

    setprefix: async function (serverid, newprefix) {
        boola = await update(serverid, "prefix", newprefix);
        console.log("set prefix: " + boola);
        return boola;
    },

    getplaytime: async function (serverid) {
        boola = await checkplaytime(serverid);
        return boola;
    },

    setplaytime: async function (serverid, newprefix) {
        boola = await update(serverid, "maxplaytime", newprefix);
        console.log("set playtime: " + newprefix);
        return boola;
    },

    updatevalue: async function (serverid, valuetoupdate, newvalue) {
        boola = await update(serverid, valuetoupdate, newvalue);
        console.log("set newvalue: " + newvalue);
        return boola;
    },

    getvalue: async function (serverid, valuetotcheck) {
        boola = await checkvalue(serverid, valuetotcheck);
        return boola;
    },

};
var mysql = require('mysql');
const config = require("../config.json");


var connection = mysql.createConnection({
    host: config.SQLHost,
    user: config.SQLUsername,
    password: config.SQLPassword,
    database: config.SQLDatabase
});

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected");
    } else {
        console.log("MYSQL Error connecting database: "+err);
    }
});

async function checkexist(id, fn) {
    var returned;
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM servers WHERE servers.serverid = " + mysql.escape(id) + "", async function ExistCheck(err, result, fields) {
            returned = false;
            //console.log("Checking for " + id);
            result.forEach(function (e, err) {
                returned = true;
            });
            resolve(returned);
        });
    });
}

async function createserver(id, servername, members, prefix, owner, region) {
    var returned;
    return new Promise(function (resolve, reject) {
        connection.query("INSERT INTO servers (`serverid`, `servername`, `members`, `prefix`, `owner`, `region`) VALUES (" + mysql.escape(id) + ", " + mysql.escape(connection.escape(servername)) + ", " + mysql.escape(members.toString()) + ", " + mysql.escape(prefix) + ", " + mysql.escape(owner) + ", " + mysql.escape(region) + ");", async function ExistCheck(err, result) {
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
        connection.query("UPDATE `servers` SET `servername`=" + mysql.escape(servername) + ", `members`=" + mysql.escape(members.toString()) + ", `owner`=" + mysql.escape(owner) + ", `region`=" + mysql.escape(region) + " WHERE `serverid`=" + mysql.escape(id) + ";", async function ExistCheck(err, result) {
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
            connection.query("UPDATE `servers` SET " + toset + "=" + mysql.escape(newval) + " WHERE `serverid`=" + mysql.escape(id) + ";", async function ExistCheck(err, result) {
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
        connection.query("SELECT * FROM servers WHERE servers.serverid = " + mysql.escape(id) + "", async function ExistCheck(err, result, fields) {
            returned = "";
            //console.log("Checking for " + id);
            result.forEach(function (e, err) {
                returned = e.prefix;
            });
            resolve(returned);
        });
    });
}


function checkplaytime(id) {
    var returned;
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM servers WHERE servers.serverid = " + mysql.escape(id) + "", async function ExistCheck(err, result, fields) {
            returned = "";
            //console.log("Checking for " + id);
            result.forEach(function (e, err) {
                returned = e.maxplaytime;
            });
            resolve(returned);
        });
    });
}


function checkvalue(id, valuetocheck) {
    var returned;
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM servers WHERE servers.serverid = " + mysql.escape(id) + "", async function ExistCheck(err, result, fields) {
            returned = "";
            //console.log("Checking for " + id);
            result.forEach(function (e, err) {
                returned = e[valuetocheck];
            });
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
        var boola = await createserver(id, servername, members, prefix, owner,region);
        return boola;
    },

    update: function (serverid, servername, members, owner, region) {
        updateall(serverid, servername, members, owner, region);
    },

    getprefix: async function (serverid) {
        boola = await checkprefix(serverid);
        return boola;
    },

    setprefix: async function (serverid,newprefix) {
        boola = await update(serverid,"prefix",newprefix);
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

    updatevalue: async function (serverid,valuetoupdate, newvalue) {
        boola = await update(serverid, valuetoupdate, newvalue);
        console.log("set newvalue: " + newvalue);
        return boola;
    },

    getvalue: async function (serverid, valuetotcheck) {
        boola = await checkvalue(serverid, valuetotcheck);
        return boola;
    },

};
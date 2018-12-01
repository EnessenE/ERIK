var mysql = require('mysql');

const config = require("../settings/config.json");

var connection = mysql.createConnection({
    host: config.sql.host,
    user: config.sql.username,
    password: config.sql.password,
    database: config.sql.database
});

function print(message, override) {
    if (config.costum.debugging || override) {
        console.log(`MYSQL.JS: ${message}`);
    }
}

connection.connect(function (err) {
    if (!err) {
        print("Database is connected", true);
    } else {
        print("Error connecting database: " + err, true);
    }
});



function GetServerByID(id, client) {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM servers where serverid = " + mysql.escape(id) + ";", async function ExistCheck(err, result) {
            if (err) {
                print(err);
                resolve(undefined);
            }
            var server;
            for (var i = 0; i < result.length; i++) {
                var item = result[i];
                server = new Server(item.serverid, item.servername, item.owner);
                if (client !== undefined) {
                    server.owner = await client.fetchUser(item.owner);
                }
            };
            resolve(server);
        });
    });
}

module.exports = {
    CreateServer: async function (id, servername, members, prefix, owner, region) {
        var returned;
        return new Promise(function (resolve, reject) {
            connection.query("INSERT INTO servers (`serverid`, `servername`, `members`, `prefix`, `owner`, `region`) VALUES (" + mysql.escape(id) + ", " + mysql.escape(servername) + ", " + mysql.escape(members.toString()) + ", " + mysql.escape(prefix) + ", " + mysql.escape(owner) + ", " + mysql.escape(region) + ");", async function ExistCheck(err, result) {
                if (err) {
                    print(err);
                    resolve("Couldn't create record!");
                }
                resolve("Successfully added");
            });
        });
    },

    UpdateServer: async function (id, servername, members, owner, region) {
        var returned;
        return new Promise(function (resolve, reject) {
            connection.query("UPDATE `servers` SET `servername`=" + mysql.escape(servername) + ", `members`=" + mysql.escape(members.toString()) + ", `owner`=" + mysql.escape(owner) + ", `region`=" + mysql.escape(region) + " WHERE `serverid`=" + mysql.escape(id) + ";", async function ExistCheck(err, result) {
                if (err) {
                    print(err);
                    resolve("Couldn't create record!");
                }
                resolve("Successfully added");
            });
        });
    },

    UpdateValue: async function (id, toset, newval) {
        return new Promise(function (resolve, reject) {
            try {
                connection.query("UPDATE `servers` SET " + toset + "=" + mysql.escape(newval) + " WHERE `serverid`=" + mysql.escape(id) + ";", async function ExistCheck(err, result) {
                    if (err) {
                        print(err);
                        resolve("Couldn't create record!");
                    }
                    resolve(true);
                });
            }
            catch (err) {
                resolve(false);
            }
        });
    },

    GetValue: async function (id, valuetocheck) {
        return new Promise(function (resolve, reject) {
            connection.query("SELECT * FROM servers WHERE servers.serverid = " + mysql.escape(id) + "", async function ExistCheck(err, result, fields) {
                returned = "";
                //print("Checking for " + id);
                result.forEach(function (e, err) {
                    returned = e[valuetocheck];
                });
                resolve(returned);
            });
        });
    },

    GetPrefix: async function (id) {
        var returned;
        return new Promise(function (resolve, reject) {
            connection.query("SELECT * FROM servers WHERE servers.serverid = " + mysql.escape(id) + "", async function ExistCheck(err, result, fields) {
                returned = "";
                //print("Checking for " + id);
                result.forEach(function (e, err) {
                    returned = e.prefix;
                });
                resolve(returned);
            });
        });
    }
}
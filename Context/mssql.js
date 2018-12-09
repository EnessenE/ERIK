var sql = require('mssql');
const config = require("../settings/config.json");

const pool = new sql.ConnectionPool({
    user: config.sql.username,
    password: config.sql.password,
    server: config.sql.host, // You can use 'localhost\\instance' to connect to named instance
    database: config.sql.database
});

pool.connect(err => {
    if (!err) {
        console.log("Database is connected");
    } else {
        console.log("MSSQL Error connecting database: " + err);
    }
});

sql.on('error', err => {
    console.log("ERROR OCCURED: " + err);
});

function print(message, override) {
    if (config.costum.debugging || override) {
        console.log(`MSSQL.JS: ${message}`);
    }
}


async function getServer(serverid) {
    var result = null;
    try {
        const request = new sql.Request(pool);
        request.input('id', sql.NVarChar(sql.MAX), serverid);
        request.execute('getServer', (err, result) => {
            if (err) {
                print("Error while getting server: " + err, true);
            }

            if (result != undefined) {
                if (result.recordset != undefined) {
                    print(result.recordsets.length) // count of recordsets returned by the procedure
                    print(result.recordsets[0].length) // count of rows contained in first recordset
                    print(result.recordset) // first recordset from result.recordsets
                }
                print(result.returnValue) // procedure return value
                print(result.output) // key/value collection of output values
                print(result.rowsAffected) // array of numbers, each number represents the number of rows affected by executed statemens
                result = result.recordsets[0];
            }
            else {
                print("Didn't recieve a result");
            }
        });
    }
    catch (error) {
        print("failed at getting prefix");
        print(error);
    }
    return result;
}

async function createServer(id, servername, members, prefix, owner, ownerid, region) {
    return new Promise(function (resolve, reject) {
        print("Creating server for " + servername);
        print(id + servername + members + prefix + owner + ownerid + region);
        try {
            const request = new sql.Request(pool);

            request.input('id', sql.NVarChar(sql.MAX), id);
            request.input('name', sql.NVarChar(sql.MAX), servername);
            request.input('members', sql.NVarChar(sql.MAX), members);
            request.input('prefix', sql.NVarChar(5), prefix);
            request.input('ownerid', sql.NVarChar(sql.MAX), ownerid);
            request.input('owner', sql.NVarChar(sql.MAX), owner);
            request.input('region', sql.NVarChar(sql.MAX), region);

            request.execute('createServer', (err, result) => {
                if (err) {
                    print("Error while creating record: " + err, true);
                }

                if (result != undefined) {
                    resolve(true)
                }
                else {
                    print("Didn't recieve a result");
                };
            });
        }
        catch (error) {
            print("failed at create server for " + servername);
            print(error);
            resolve(false);
        }
    });
}

async function updateServer() {

}

async function setPrefix() {

}

async function getPrefix(serverid) {
    return new Promise(function (resolve, reject) {
        try {
            const request = new sql.Request(pool);
            request.input('id', sql.NVarChar(sql.MAX), serverid);
            request.execute('getPrefix', (err, result) => {
                if (err) {
                    print("Error while getting prefix: " + err, true);
                }

                if (result != undefined) {
                    if (result.recordset != undefined) {
                        var answer = result.recordset[0].prefix;
                        print("I think: " + answer);
                        resolve(answer);
                    }
                }
                else {
                    print("Didn't recieve a result");
                    resolve(null);
                }
            });
        }
        catch (error) {
            print("failed at getting prefix");
            print(error);
            resolve(null);
        }
    });
}

module.exports = {
    getPrefix: async function (serverid) {
        return await getPrefix(serverid);
    },

    getServer: async function (serverid) {
        return await getServer(serverid);
    },

    createServer: async function (id, servername, members, prefix, owner, ownerid, region) {
        return await createServer(id, servername, members, prefix, owner, ownerid, region);
    },
}
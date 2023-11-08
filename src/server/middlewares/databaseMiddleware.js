const mysql = require('mysql2/promise');
const sql = require('mssql');

let mysqlPools = {};
let mssqlPools = {};

const databaseMiddleware = {
    createDatabaseUser: async (req, res, next) => {
        try {
            const { username, password } = req.body;

            const mysqlConnection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'Mysql@123',
            });

            await mysqlConnection.execute(`CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}'`);
            await mysqlConnection.execute(`GRANT ALL PRIVILEGES ON *.* TO '${username}'@'%' WITH GRANT OPTION`);
            await mysqlConnection.execute('FLUSH PRIVILEGES');
            await mysqlConnection.end();

            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

            const mssqlConfig = {
                user: 'root',
                password: 'Mssql@123',
                server: 'localhost',
                // database: 'master',
                options: {
                    trustServerCertificate: true,
                },
            };

            const mssqlPool = await new sql.ConnectionPool(mssqlConfig).connect();
            let request = new sql.Request(mssqlPool);
            await request.query(`CREATE LOGIN [${username}] WITH PASSWORD = N'${password}'`);
            await request.query(`USE master; CREATE USER [${username}] FOR LOGIN [${username}]`);
            await request.query(`USE master; EXEC sp_addsrvrolemember @loginame = N'${username}', @rolename = N'sysadmin'`);

            mssqlPool.close();

            next();
        } catch (error) {
            console.error('Failed to create database user:', error);
            res.status(500).send('User creation failed.');
        }
    },

    establishConnection: async (req, res, next) => {
        try {
            const { username, password, databaseType } = req.body;

            if (databaseType === 'mysql') {
                const mysqlPool = mysql.createPool({
                    host: 'localhost',
                    user: username,
                    password: password,
                    connectionLimit: 10,
                });

                mysqlPools[username] = mysqlPool;
            } else if (databaseType === 'mssql') {
                process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
                const mssqlConfig = {
                    user: username,
                    password: password,
                    server: 'localhost',
                    options: {
                        trustServerCertificate: true,
                    },
                };

                const mssqlPool = new sql.ConnectionPool(mssqlConfig);
                await mssqlPool.connect();

                mssqlPools[username] = mssqlPool;
            }

            next();
        } catch (error) {
            console.error('Failed to establish connection:', error);
            res.status(500).send('Connection establishment failed.');
        }
    },

    getPool: (username, databaseType) => {
        if (databaseType === 'mysql') {
            return mysqlPools[username];
        } else if (databaseType === 'mssql') {
            return mssqlPools[username];
        }
    },
};

module.exports = databaseMiddleware;

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';
const bcrypt = require('bcrypt');
const databaseMiddleware = require('../middlewares/databaseMiddleware');
const logger = require('../config/logger');

const userController = {
    login: async (req, res) => {
        const { username, password, databaseType } = req.body;

        if (!username || !password) {
            return res.status(401).send('Please provide a username and password.');
        }

        try {
            User.getByUsername(username, (err, user) => {
                if (err) {
                    return res.status(500).send('Login failed.');
                }
                if (!user) {
                    return res.status(401).send('User does not exist.');
                }

                const match = bcrypt.compareSync(password, user.password);
                if (!match) {
                    return res.status(401).send('Password is incorrect.');
                }

                const token = jwt.sign({ id: user.id, username: username, databaseType: databaseType }, jwtSecret);

                databaseMiddleware.establishConnection(req, res, (err) => {
                    if (err) {
                        return res.status(500).send('Database connection failed.');
                    }

                    const pool = databaseMiddleware.getPool(username, databaseType);

                    if (databaseType === 'mysql') {
                        pool.query('SELECT 1')
                            .then(mysqlResult => {
                                logger.info(username + ' logged in to MySQL.');
                                console.log(username + ' logged in to MySQL.');

                                return res
                                    .status(200)
                                    .cookie('token', token, { httpOnly: true })
                                    .header('Sql-Redirect', '/sql')
                                    .send('Login successful to MySQL.');
                            })
                            .catch(mysqlErr => {
                                return res.status(500).send('MySQL query failed.');
                            });
                    } else if (databaseType === 'mssql') {
                        pool.query('SELECT 1')
                            .then(mssqlResult => {
                                logger.info(username + ' logged in to MSSQL.');
                                console.log(username + ' logged in to MSSQL.');

                                return res
                                    .status(200)
                                    .cookie('token', token, { httpOnly: true })
                                    .header('Sql-Redirect', '/sql')
                                    .send('Login successful to MSSQL.');
                            })
                            .catch(mssqlErr => {
                                return res.status(500).send('MSSQL query failed.');
                            });
                    }
                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error.');
        }
    },
    register: (req, res) => {
        const { username, password, databaseType } = req.body;

        User.getByUsername(username, (err, user) => {
            if (err) {
                return res.status(500).send('Registration failed.');
            }
            if (user) {
                return res.status(500).send('User already exists.');
            }

            User.create(username, password, (err) => {
                if (err) {
                    return res.status(500).send('Registration failed.');
                }

                databaseMiddleware.createDatabaseUser(req, res, (err) => {
                    if (err) {
                        return res.status(500).send('Database user creation failed.');
                    }

                    logger.info(username + ' registered.');
                    console.log(username + ' registered.');

                    return res
                        .status(200)
                        .header('Index-Redirect', '/')
                        .send('Registration successful.');
                });
            });
        });
    },
};

module.exports = userController;

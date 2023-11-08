const databaseMiddleware = require('../middlewares/databaseMiddleware');
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';
const logger = require('../config/logger');

const sqlController = {
    executeSQL: async (req, res) => {
        try {
            const { query } = req.body;
            const token = req.cookies.token;

            if (!token) {
                return res
                    .status(401)
                    .header('Sql-Redirect', '/')
                    .send('Unauthorized.');
            }
            const { username, databaseType } = jwt.verify(token, jwtSecret);

            if (databaseType === 'mysql') {
                const pool = databaseMiddleware.getPool(username, databaseType);
                const connection = await pool.getConnection();

                connection.query(query)
                    .then(results => {
                        connection.release();
                        logger.info(username + " executed MySQL query: " + query);
                        return res.status(200).json(results[0]);
                    })
                    .catch(error => {
                        logger.error(username + " failed to execute MySQL query: " + query);
                        connection.release();
                        return res.status(200).json({ sqlMessage: error.sqlMessage });
                    });
            } else if (databaseType === 'mssql') {
                const pool = databaseMiddleware.getPool(username, databaseType);
                const request = pool.request();
                request.query(query)
                    .then(results => {
                        logger.info(username + " executed MSSQL query: " + query);
                        if (results.recordset === undefined) {
                            return res.status(200).json({ info: results });
                        }
                        return res.status(200).json(results.recordset);
                    })
                    .catch(error => {
                        logger.error(username + " failed to execute MSSQL query: " + query);
                        return res.status(200).json({ sqlMessage: error.message });
                    });
            }
        } catch (error) {
            logger.error("Failed to execute SQL query: " + error);
            return res.status(200).json({ error: error.message });
        }
    },
};

module.exports = sqlController;

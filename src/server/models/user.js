const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    create: (username, password, callback) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    },

    getByUsername: (username, callback) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, row);
        });
    }
};

module.exports = User;

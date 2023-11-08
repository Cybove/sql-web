const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('src/server/db/users.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
});

module.exports = db;

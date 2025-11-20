const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, 'blog.db'),  // correct
      driver: sqlite3.Database
    });
  }
  return db;
}

async function query(sql, params = []) {
  const database = await getDb();

  if (sql.trim().toLowerCase().startsWith("select")) {
    const rows = await database.all(sql, params);
    return [rows];
  } else {
    const result = await database.run(sql, params);
    return [result];
  }
}

module.exports = { query };

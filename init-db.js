const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function init() {
  const db = await open({
    filename: path.join(__dirname, 'database', 'blog.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS author (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      body TEXT,
      author_id INTEGER,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES author(id)
    );
  `);

  const row = await db.get("SELECT COUNT(*) AS count FROM author");
  if (row.count === 0) {
    await db.run(
      "INSERT INTO author (name, email) VALUES (?, ?)",
      ["Admin User", "admin@example.com"]
    );
  }

  console.log("SQLite DB Ready at:", path.join(__dirname, "database", "blog.db"));
}

init();

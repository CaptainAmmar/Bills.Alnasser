const Database = require('better-sqlite3');
const db = new Database('maritime.db');
const tables = ['bills', 'customs_data', 'operations'];
tables.forEach(table => {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
    console.log(`Table: ${table}`);
    console.log(info.map(c => c.name));
});
db.close();

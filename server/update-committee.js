const pool = require('./src/config/db');
require('dotenv').config();

async function updateDB() {
    try {
        const res = await pool.query("UPDATE committees SET name = 'Entrepreneurship Development Cell'");
        console.log(`Updated ${res.rowCount} committees.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
updateDB();

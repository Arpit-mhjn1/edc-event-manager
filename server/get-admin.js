const pool = require('./src/config/db');
require('dotenv').config();

pool.query("SELECT email, role FROM users WHERE role = 'SUPER_ADMIN' OR role = 'COMMITTEE_HEAD'")
    .then(res => {
        console.log(res.rows);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

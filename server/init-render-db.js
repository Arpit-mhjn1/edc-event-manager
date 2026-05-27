const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function initRenderDB() {
    if (!process.env.DATABASE_URL) {
        console.error("❌ ERROR: Please add your Render 'External Database URL' to your .env file as DATABASE_URL=...");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("⏳ Connecting to Render Database...");
        
        // 1. Run init.sql
        console.log("⏳ Running initial schema (init.sql)...");
        const sql = fs.readFileSync(path.join(__dirname, 'src', 'models', 'init.sql')).toString();
        await pool.query(sql);
        console.log("✅ Initial schema created!");

        // 2. Run migrate-users logic
        console.log("⏳ Adding extra user fields...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS department VARCHAR(100),
            ADD COLUMN IF NOT EXISTS course VARCHAR(100),
            ADD COLUMN IF NOT EXISTS branch VARCHAR(100),
            ADD COLUMN IF NOT EXISTS semester VARCHAR(20)
        `);
        console.log("✅ User fields added!");

        // 3. Run migrate-payments logic
        console.log("⏳ Adding payment fields...");
        await pool.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS bank_details TEXT;
            
            ALTER TABLE registrations 
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
        `);
        console.log("✅ Payment fields added!");
        
        console.log("🎉 ALL DONE! Your Render Database is fully setup and ready to go!");

    } catch (err) {
        console.error("❌ Failed to setup database:", err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

initRenderDB();

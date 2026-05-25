const pool = require('./src/config/db');

async function migrateUsers() {
    try {
        console.log("Adding academic fields to users table...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS department VARCHAR(100),
            ADD COLUMN IF NOT EXISTS course VARCHAR(100),
            ADD COLUMN IF NOT EXISTS branch VARCHAR(100),
            ADD COLUMN IF NOT EXISTS semester VARCHAR(20)
        `);
        
        console.log("✅ Database schema updated successfully to track student academic details!");
    } catch (e) {
        console.error("❌ Migration failed:", e.message);
    } finally {
        process.exit();
    }
}

migrateUsers();

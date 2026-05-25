const pool = require('./src/config/db');

async function migrate() {
    try {
        console.log("Adding bank_details to events...");
        await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS bank_details TEXT;");
        
        console.log("Adding transaction_id to registrations...");
        await pool.query("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);");
        
        console.log("✅ Database schema updated successfully for Payment Gateway Option 1!");
    } catch (e) {
        console.error("❌ Migration failed:", e.message);
    } finally {
        process.exit();
    }
}

migrate();

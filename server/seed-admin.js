const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
} : {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'campus_events',
    password: process.env.DB_PASSWORD || process.argv[2],
    port: process.env.DB_PORT || 5432,
};

const pool = new Pool(poolConfig);

async function seedAdmin() {
    try {
        console.log("🔒 Hashing password...");
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        console.log("💾 Inserting Super Admin into database...");
        const result = await pool.query(`
            INSERT INTO users (name, email, password_hash, role) 
            VALUES ('Super Admin', 'admin@campus.com', $1, 'SUPER_ADMIN')
            ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN', password_hash = $1
            RETURNING *;
        `, [hashedPassword]);

        if (result.rows.length > 0) {
            console.log('\n✅ Admin account successfully created!');
            console.log('---------------------------------');
            console.log('📧 Email:    admin@campus.com');
            console.log('🔑 Password: admin123');
            console.log('---------------------------------\n');
        } else {
            console.log('⚠️ Failed to create admin.');
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        process.exit();
    }
}

seedAdmin();

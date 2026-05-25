const app = require('./src/app');
const pool = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection before starting the server
        const client = await pool.connect();
        console.log('📦 Connected to PostgreSQL database successfully.');
        client.release();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to connect to the database:', error.message);
        process.exit(1);
    }
};

startServer();

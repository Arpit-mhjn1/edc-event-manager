const pool = require('./src/config/db');
require('dotenv').config();

async function seedCommittee() {
    try {
        console.log("Seeding committee...");
        const committeeResult = await pool.query(
            "INSERT INTO committees (name, description) VALUES ('Entrepreneurship Development Cell', 'EDC Committee') RETURNING id"
        );
        const committeeId = committeeResult.rows[0].id;

        const adminResult = await pool.query("SELECT id FROM users WHERE email = 'admin@campus.com'");
        if (adminResult.rows.length > 0) {
            const adminId = adminResult.rows[0].id;
            await pool.query(
                "INSERT INTO committee_members (user_id, committee_id, position) VALUES ($1, $2, 'Committee Head') ON CONFLICT DO NOTHING",
                [adminId, committeeId]
            );
            console.log("Successfully seeded committee and linked to admin!");
        } else {
            console.log("Committee seeded, but admin user not found.");
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
seedCommittee();

const pool = require('../config/db');

// @route   POST /api/registrations
// @desc    Register for an event
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
    try {
        const { event_id, transaction_id } = req.body;
        const user_id = req.user.id;

        // Check if event is paid
        const eventRes = await pool.query('SELECT capacity, is_paid FROM events WHERE id = $1', [event_id]);
        if (eventRes.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }
        const event = eventRes.rows[0];

        // Ensure transaction ID is provided if event is paid
        if (event.is_paid && !transaction_id) {
             return res.status(400).json({ status: 'error', message: 'Payment transaction ID is required for paid events.' });
        }

        // Check if capacity is full
        const regCountRes = await pool.query('SELECT COUNT(*) FROM registrations WHERE event_id = $1', [event_id]);
        const currentCount = parseInt(regCountRes.rows[0].count);

        let status = 'APPROVED';
        let payment_status = event.is_paid ? 'PENDING_VERIFICATION' : 'NOT_APPLICABLE';

        if (currentCount >= event.capacity) {
            status = 'WAITLISTED'; 
        }

        // 3. Register user
        const newReg = await pool.query(
            `INSERT INTO registrations (user_id, event_id, status, transaction_id, payment_status) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, event_id, status, transaction_id || null, payment_status]
        );

        res.status(201).json({
            status: 'success',
            message: status === 'WAITLISTED' ? 'Added to waitlist' : 'Registered successfully',
            data: { registration: newReg.rows[0] }
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ status: 'error', message: 'You are already registered for this event' });
        }
        next(error);
    }
};

module.exports = { registerForEvent };

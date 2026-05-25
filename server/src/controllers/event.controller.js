const pool = require('../config/db');

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (Committee Head, Super Admin)
const createEvent = async (req, res, next) => {
    try {
        const { title, description, banner_url, event_type, start_time, end_time, venue, capacity, status, is_paid, fee_amount, bank_details, committee_id } = req.body;

        const newEvent = await pool.query(
            `INSERT INTO events 
            (title, description, banner_url, event_type, start_time, end_time, venue, capacity, status, is_paid, fee_amount, bank_details, committee_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [title, description, banner_url, event_type, start_time, end_time, venue, capacity, status || 'DRAFT', is_paid || false, fee_amount || 0.00, bank_details || null, committee_id]
        );

        res.status(201).json({
            status: 'success',
            message: 'Event created successfully',
            data: { event: newEvent.rows[0] }
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/events
// @desc    Get all events (Optional filters)
// @access  Public
const getEvents = async (req, res, next) => {
    try {
        // Here you would typically add query builders for filtering by status, committee, dates, etc.
        const events = await pool.query(`
            SELECT e.*, c.name as committee_name, COUNT(r.id)::int as registrations_count
            FROM events e 
            LEFT JOIN committees c ON e.committee_id = c.id 
            LEFT JOIN registrations r ON e.id = r.event_id
            GROUP BY e.id, c.name
            ORDER BY e.start_time ASC
        `);

        res.status(200).json({
            status: 'success',
            results: events.rows.length,
            data: { events: events.rows }
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await pool.query(`
            SELECT e.*, c.name as committee_name 
            FROM events e 
            LEFT JOIN committees c ON e.committee_id = c.id 
            WHERE e.id = $1
        `, [id]);

        if (event.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }

        res.status(200).json({
            status: 'success',
            data: { event: event.rows[0] }
        });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }
        
        res.status(200).json({ status: 'success', message: 'Event deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const ExcelJS = require('exceljs');

// @route   GET /api/events/:id/export
// @desc    Export event registrations to Excel
// @access  Private (Admin)
const exportEventRegistrations = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch event details
        const eventRes = await pool.query('SELECT title FROM events WHERE id = $1', [id]);
        if (eventRes.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        const eventTitle = eventRes.rows[0].title;

        // Fetch registrations with user details
        const registrations = await pool.query(`
            SELECT u.name, u.email, u.phone, u.college_id, u.department, u.course, u.branch, u.semester, r.status, r.transaction_id, r.registered_at 
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.event_id = $1
            ORDER BY r.registered_at ASC
        `, [id]);

        // Create Excel Workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Registrations');

        worksheet.columns = [
            { header: 'Full Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'College ID', key: 'college_id', width: 20 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Course', key: 'course', width: 15 },
            { header: 'Branch', key: 'branch', width: 20 },
            { header: 'Semester', key: 'semester', width: 10 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Transaction ID', key: 'transaction_id', width: 25 },
            { header: 'Registered At', key: 'registered_at', width: 25 }
        ];

        // Add Data
        registrations.rows.forEach(row => {
            worksheet.addRow({
                ...row,
                registered_at: new Date(row.registered_at).toLocaleString()
            });
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${eventTitle.replace(/[^a-z0-9]/gi, '_')}_Registrations.xlsx"`);

        // Send Excel file
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/events/:id
// @desc    Update an existing event
// @access  Private (Admin)
const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, venue, capacity, start_time, end_time, status, is_paid, fee_amount, bank_details } = req.body;

        const updatedEvent = await pool.query(
            `UPDATE events 
             SET title = $1, description = $2, venue = $3, capacity = $4, start_time = $5, end_time = $6, status = $7, is_paid = $8, fee_amount = $9, bank_details = $10, updated_at = CURRENT_TIMESTAMP
             WHERE id = $11 RETURNING *`,
            [title, description, venue, capacity, start_time, end_time, status, is_paid || false, fee_amount || 0, bank_details || null, id]
        );

        if (updatedEvent.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }

        res.status(200).json({ status: 'success', message: 'Event updated successfully', data: { event: updatedEvent.rows[0] } });
    } catch (error) {
        next(error);
    }
};

const { generateCertificatePDF } = require('../services/certificate.service');

// @route   POST /api/events/:id/certificates/generate
// @desc    Generate certificates for all APPROVED registrations of an event
// @access  Private (Admin)
const generateCertificatesForEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch event data
        const eventRes = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (eventRes.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        const event = eventRes.rows[0];

        // Fetch APPROVED registrations that don't have a certificate yet
        const regsRes = await pool.query(`
            SELECT r.id as registration_id, u.* 
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN certificates c ON r.id = c.registration_id
            WHERE r.event_id = $1 AND r.status = 'APPROVED' AND c.id IS NULL
        `, [id]);

        const registrations = regsRes.rows;
        if (registrations.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No new approved registrations to generate certificates for.' });
        }

        // Generate certificates
        let count = 0;
        for (let student of registrations) {
            await generateCertificatePDF(student, event, student.registration_id);
            count++;
        }

        res.status(200).json({ status: 'success', message: `Successfully generated ${count} certificates!` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    deleteEvent,
    exportEventRegistrations,
    updateEvent,
    generateCertificatesForEvent
};

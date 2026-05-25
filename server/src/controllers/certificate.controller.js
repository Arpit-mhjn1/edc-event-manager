const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// @route   GET /api/certificates/me
// @desc    Get all certificates for the logged-in student
// @access  Private (Student)
const getMyCertificates = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const certs = await pool.query(`
            SELECT c.id, c.certificate_code, c.issued_at, e.title as event_title, e.banner_url as event_banner
            FROM certificates c
            JOIN registrations r ON c.registration_id = r.id
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = $1
            ORDER BY c.issued_at DESC
        `, [userId]);

        res.status(200).json({
            status: 'success',
            data: { certificates: certs.rows }
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/certificates/:id/download
// @desc    Download the actual PDF certificate
// @access  Private
const downloadCertificate = async (req, res, next) => {
    try {
        const certId = req.params.id;
        const userId = req.user.id;

        // Verify ownership (Admin can bypass this in a real app, but this is simple MVP logic)
        const certRes = await pool.query(`
            SELECT c.certificate_url, e.title 
            FROM certificates c
            JOIN registrations r ON c.registration_id = r.id
            JOIN events e ON r.event_id = e.id
            WHERE c.id = $1 AND (r.user_id = $2 OR $3 = 'SUPER_ADMIN')
        `, [certId, userId, req.user.role]);

        if (certRes.rows.length === 0) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized or Certificate not found' });
        }

        const cert = certRes.rows[0];
        
        // Convert stored DB path to absolute file system path
        // Remove leading slash to prevent path.join from treating it as an absolute root path on Windows
        const relativeUrl = cert.certificate_url.replace(/^\//, '');
        const absolutePath = path.join(__dirname, '..', '..', relativeUrl);
        
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ status: 'error', message: `PDF file not found on server at path: ${absolutePath}` });
        }

        const fileName = `${cert.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`;
        
        // Manually stream the file to bypass any Express res.download bugs
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        const fileStream = fs.createReadStream(absolutePath);
        fileStream.pipe(res);
        
        fileStream.on('error', (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) {
                res.status(500).json({ status: 'error', message: 'Error streaming the file' });
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyCertificates,
    downloadCertificate
};

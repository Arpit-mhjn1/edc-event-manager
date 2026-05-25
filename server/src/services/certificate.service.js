const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../config/db');

// Ensure certificates directory exists
const certDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
}

/**
 * Generates a beautiful PDF certificate for a single registration
 * @param {Object} studentData 
 * @param {Object} eventData 
 * @returns {String} certificate_code
 */
const generateCertificatePDF = async (studentData, eventData, registrationId) => {
    return new Promise((resolve, reject) => {
        try {
            const certCode = crypto.randomBytes(8).toString('hex').toUpperCase();
            const fileName = `CERT_${certCode}.pdf`;
            const filePath = path.join(certDir, fileName);

            // Create a document (Landscape)
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margin: 0
            });

            // Pipe its output to a file
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Add Background / Border
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1e3a8a');
            doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#3b82f6');

            // --- Add Logos ---
            const logo1Path = path.join(__dirname, '..', 'assets', 'logo1.jpeg'); // AGC Logo
            const logo2Path = path.join(__dirname, '..', 'assets', 'logo2.jpeg'); // IIC Logo
            const logo3Path = path.join(__dirname, '..', 'assets', 'logo3.jpeg'); // EDC Logo

            if (fs.existsSync(logo1Path)) doc.image(logo1Path, 50, 40, { height: 55 }); // AGC logo (wide)
            if (fs.existsSync(logo2Path)) doc.image(logo2Path, doc.page.width / 2 - 50, 35, { height: 65 }); // IIC logo
            if (fs.existsSync(logo3Path)) doc.image(logo3Path, doc.page.width - 120, 35, { height: 65 }); // EDC logo

            // --- Certificate Header ---
            // Move cursor down further to avoid overlapping with logos
            doc.y = 130; 
            
            doc.font('Helvetica-Bold')
               .fontSize(30)
               .fillColor('#1e3a8a')
               .text('CERTIFICATE OF PARTICIPATION', { align: 'center' });

            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(14)
               .fillColor('#4b5563')
               .text('This is to certify that', { align: 'center' });

            // --- Student Name ---
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold')
               .fontSize(28)
               .fillColor('#111827')
               .text(studentData.name.toUpperCase(), { align: 'center' });

            // --- Academic Details ---
            doc.moveDown(0.5);
            doc.font('Helvetica')
               .fontSize(12)
               .fillColor('#4b5563')
               .text(`Roll Number: ${studentData.college_id} | Semester: ${studentData.semester || 'N/A'}`, { align: 'center' });
            
            doc.moveDown(0.2);
            doc.text(`Course & Branch: ${studentData.course || ''} - ${studentData.branch || ''} | Dept: ${studentData.department || ''}`, { align: 'center' });

            // --- Event Details ---
            doc.moveDown(1.5);
            doc.fontSize(14)
               .text('has successfully participated in the event', { align: 'center' });
            
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold')
               .fontSize(22)
               .fillColor('#1e3a8a')
               .text(eventData.title.toUpperCase(), { align: 'center' });

            doc.moveDown(0.5);
            const eventDate = new Date(eventData.start_time).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            doc.font('Helvetica')
               .fontSize(14)
               .fillColor('#4b5563')
               .text(`held at Amritsar Group of Colleges on ${eventDate}.`, { align: 'center' });

            // --- Footer / Signatures ---
            doc.moveDown(4);
            const signatureY = doc.y;

            // Signature 1 (Incharge, EDC)
            const sign1Path = path.join(__dirname, '..', 'assets', 'sign_edc.jpeg');
            if (fs.existsSync(sign1Path)) doc.image(sign1Path, 100, signatureY - 40, { height: 50 });
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827');
            doc.text('Incharge, EDC', 100, signatureY + 20);

            // Signature 2 (Principal, AGC)
            const sign2Path = path.join(__dirname, '..', 'assets', 'sign_principal.jpeg');
            if (fs.existsSync(sign2Path)) doc.image(sign2Path, doc.page.width - 250, signatureY - 40, { height: 50 });
            doc.text('Principal, AGC', doc.page.width - 250, signatureY + 20);

            // Certificate Code Verification
            doc.fontSize(8).fillColor('#9ca3af');
            doc.text(`Verify at: AGC-Events | ID: ${certCode}`, 50, doc.page.height - 40);

            // Finalize PDF
            doc.end();

            stream.on('finish', async () => {
                // Save to DB
                await pool.query(
                    `INSERT INTO certificates (registration_id, certificate_url, certificate_code) 
                     VALUES ($1, $2, $3)`,
                    [registrationId, `/uploads/certificates/${fileName}`, certCode]
                );
                resolve(certCode);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateCertificatePDF
};

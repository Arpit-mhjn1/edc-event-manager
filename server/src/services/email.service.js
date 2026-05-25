const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send transactional email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML formatted email body
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const info = await transporter.sendMail({
            from: `"Entrepreneurship Development Cell" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        });
        console.log('📧 Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
};

const sendRegistrationConfirmation = async (userEmail, userName, eventTitle) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #2563eb;">Registration Confirmed! 🎉</h2>
            <p>Hi ${userName},</p>
            <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
            <p>We look forward to seeing you there!</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Entrepreneurship Development Cell Team</strong></p>
        </div>
    `;
    return sendEmail(userEmail, `Confirmed: ${eventTitle}`, html);
};

module.exports = {
    sendEmail,
    sendRegistrationConfirmation
};

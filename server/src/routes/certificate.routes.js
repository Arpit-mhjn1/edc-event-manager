const express = require('express');
const router = express.Router();
const { getMyCertificates, downloadCertificate } = require('../controllers/certificate.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/me', authenticate, getMyCertificates);
router.get('/:id/download', authenticate, downloadCertificate);

module.exports = router;

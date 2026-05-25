const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, deleteEvent, exportEventRegistrations, updateEvent, generateCertificatesForEvent } = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post('/', authenticate, authorize('SUPER_ADMIN', 'COMMITTEE_HEAD'), createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/export', authenticate, authorize('SUPER_ADMIN', 'COMMITTEE_HEAD'), exportEventRegistrations);
router.post('/:id/certificates/generate', authenticate, authorize('SUPER_ADMIN', 'COMMITTEE_HEAD'), generateCertificatesForEvent);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'COMMITTEE_HEAD'), updateEvent);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'COMMITTEE_HEAD'), deleteEvent);

module.exports = router;

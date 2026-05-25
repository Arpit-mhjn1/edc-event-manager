const express = require('express');
const router = express.Router();
const { registerForEvent } = require('../controllers/registration.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, registerForEvent);

module.exports = router;

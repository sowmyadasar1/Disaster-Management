const express = require('express');
const router = express.Router();
const { getMessages, postMessage } = require('../controllers/messageController');

// POST /api/messages
router.post('/send-message', postMessage);

// GET /api/messages
router.get('/messages', getMessages);

module.exports = router;

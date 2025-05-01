const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all messages
router.get('/', (req, res) => {
    res.json(db.messages);
});

// Get messages for a specific user
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    const messages = db.messages.filter(m => m.userId === userId);
    res.json(messages);
});

// Mark message as read
router.put('/:id/read', (req, res) => {
    const message = db.messages.find(m => m.id === parseInt(req.params.id));
    if (message) {
        message.status = 'read';
        res.json(message);
    } else {
        res.status(404).json({ error: "Message not found" });
    }
});

module.exports = router;
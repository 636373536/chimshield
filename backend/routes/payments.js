const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all payments
router.get('/', (req, res) => {
    res.json(db.payments);
});

// Create payment record
router.post('/', (req, res) => {
    const { bookingId, amount, method, status } = req.body;
    
    const payment = {
        id: db.payments.length + 1,
        bookingId,
        amount,
        method,
        status,
        date: new Date().toISOString()
    };
    
    db.payments.push(payment);
    
    // Update booking payment status
    const booking = db.bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.paymentStatus = status;
    }
    
    res.json(payment);
});

module.exports = router;
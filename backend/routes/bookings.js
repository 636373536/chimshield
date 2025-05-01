const express = require('express');
const router = express.Router();
const db = require('../database');
const nodemailer = require('nodemailer');

// Book a team
router.post('/', (req, res) => {
    const { teamId, userId, eventType, date, userEmail } = req.body;
    const team = db.teams.find(t => t.id === teamId);
    const user = db.users.find(u => u.id === userId);

    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }

    const booking = {
        id: db.bookings.length + 1,
        teamId,
        userId,
        eventType,
        date,
        status: "pending",
        paymentStatus: "unpaid",
        amount: team.price,
        createdAt: new Date().toISOString()
    };

    db.bookings.push(booking);

    // Send confirmation email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: userEmail,
        subject: 'Booking Confirmation',
        html: `
            <h2>Your Booking Details</h2>
            <p>Booking ID: ${booking.id}</p>
            <p>Team: ${team.name}</p>
            <p>Date: ${date}</p>
            <p>Amount: K${team.price}</p>
            <p>Status: ${booking.status}</p>
            <p>Please complete payment to confirm your booking.</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        }
    });

    res.json({ 
        message: "Booking created successfully!", 
        booking,
        paymentUrl: `/payments?bookingId=${booking.id}&amount=${team.price}`
    });
});

// Get user bookings
router.get('/user/:userId', (req, res) => {
    const bookings = db.bookings
        .filter(b => b.userId === parseInt(req.params.userId))
        .map(b => {
            const team = db.teams.find(t => t.id === b.teamId);
            return { ...b, teamName: team?.name || 'Unknown' };
        });
    res.json(bookings);
});

module.exports = router;
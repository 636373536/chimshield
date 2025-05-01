const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
        },
        redirect: user.role === "admin" ? "/admin" : "/report"
    });
});

// Signup
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const userExists = db.users.some(u => u.email === email);

    if (userExists) {
        return res.status(400).json({ error: "User already exists" });
    }

    const newUser = {
        id: db.users.length + 1,
        name,
        email,
        password,
        role: "user",
        phone: ""
    };

    db.users.push(newUser);
    res.json({ message: "Account created successfully!" });
});

module.exports = router;
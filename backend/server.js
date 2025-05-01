const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const nodemailer = require('nodemailer');
const db = require('./database');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);

// WebSocket Server Setup
const wss = new WebSocket.Server({ server });

// Store connections
const adminConnections = new Set();
const userConnections = new Map(); // userId -> connection

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

wss.on('connection', (ws, req) => {
    const isAdmin = req.url.includes('/admin');
    
    if (isAdmin) {
        adminConnections.add(ws);
        console.log('New admin connected');
        
        // Send initial data to admin
        ws.send(JSON.stringify({
            type: 'init-data',
            users: db.users.filter(u => u.role === 'user').length,
            activeUsers: userConnections.size,
            bookings: db.bookings.length,
            messages: db.messages.length,
            revenue: db.payments.reduce((sum, p) => sum + p.amount, 0)
        }));
    } else {
        const userId = req.url.split('=')[1] || generateUserId();
        userConnections.set(userId, ws);
        console.log(`New user connected: ${userId}`);
        
        ws.send(JSON.stringify({
            type: 'connection',
            userId: userId
        }));
        
        notifyAdmins('user-connected', { userId, count: userConnections.size });
    }
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(data, ws, isAdmin);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        if (isAdmin) {
            adminConnections.delete(ws);
            console.log('Admin disconnected');
        } else {
            for (let [userId, connection] of userConnections) {
                if (connection === ws) {
                    userConnections.delete(userId);
                    console.log(`User disconnected: ${userId}`);
                    notifyAdmins('user-disconnected', { userId, count: userConnections.size });
                    break;
                }
            }
        }
    });
});

// WebSocket Message Handlers
function handleMessage(data, ws, isAdmin) {
    switch (data.type) {
        case 'message':
            handleMessageType(data, ws, isAdmin);
            break;
        case 'call':
            handleCallType(data, ws, isAdmin);
            break;
        case 'call-response':
            handleCallResponse(data, ws, isAdmin);
            break;
        case 'ice-candidate':
            handleIceCandidate(data, ws, isAdmin);
            break;
        case 'offer':
            handleOffer(data, ws, isAdmin);
            break;
        case 'answer':
            handleAnswer(data, ws, isAdmin);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function handleMessageType(data, ws, isAdmin) {
    const message = {
        id: db.messages.length + 1,
        type: 'message',
        content: data.content,
        timestamp: new Date().toISOString(),
        sender: isAdmin ? 'admin' : 'user',
        userId: data.userId,
        status: 'delivered'
    };
    
    db.messages.push(message);
    
    if (isAdmin) {
        // Admin sending to user
        const userWs = userConnections.get(data.userId);
        if (userWs) {
            userWs.send(JSON.stringify(message));
        }
    } else {
        // User sending to admin
        // THIS IS CRITICAL: send as 'new-message' to all admins
        notifyAdmins('new-message', message);
    }
}

// Other WebSocket handlers (call, ice-candidate, offer, answer) remain similar...

// Helper functions
function notifyAdmins(type, data) {
    const message = JSON.stringify({ type, ...data });
    adminConnections.forEach(adminWs => {
        adminWs.send(message);
    });
}

function generateUserId() {
    return Math.random().toString(36).substring(2, 15);
}

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/trial.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/report', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Report.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
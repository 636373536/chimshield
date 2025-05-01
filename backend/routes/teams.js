const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all teams
router.get('/', (req, res) => {
    res.json(db.teams);
});

// Get team by ID
router.get('/:id', (req, res) => {
    const team = db.teams.find(t => t.id === parseInt(req.params.id));
    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
});

// Add a new team (Admin only)
router.post('/', (req, res) => {
    const { name, type, location, price, leader, members, description } = req.body;
    
    const newTeam = {
        id: db.teams.length + 1,
        name,
        type,
        location,
        price,
        rating: 0,
        leader,
        members: members || [],
        description
    };

    db.teams.push(newTeam);
    res.json({ message: "Team added successfully!", team: newTeam });
});

// Update team
router.put('/:id', (req, res) => {
    const team = db.teams.find(t => t.id === parseInt(req.params.id));
    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }

    Object.assign(team, req.body);
    res.json({ message: "Team updated successfully!", team });
});

module.exports = router;
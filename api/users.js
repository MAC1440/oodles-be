const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const filePath = path.join(__dirname, '../data/users.json');
const SECRET = process.env.AUTH_SECRET || 'super-secret';

// Read users from JSON file
function readUsers() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Write users to JSON file
function writeUsers(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// POST /users?action=signup or ?action=login
router.post('/', (req, res) => {
  const { name, email, password, role } = req.body;
  const action = req.query.action;

  const users = readUsers();
  const existingUser = users.find((u) => u.email === email);

  if (action === 'signup') {
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In real apps: hash this!
      role: role || 'Employee',
    };

    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET, { expiresIn: '1h' });

    return res.json({
      token,
      user: { name, email, role: newUser.role },
    });
  }

  if (action === 'login') {
    if (!existingUser || existingUser.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: existingUser.id, role: existingUser.role }, SECRET, { expiresIn: '1h' });

    return res.json({
      token,
      user: { name: existingUser.name, email, role: existingUser.role },
    });
  }

  return res.status(400).json({ error: 'Invalid action' });
});

module.exports = router;

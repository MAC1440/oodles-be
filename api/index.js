// api/index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
//routes
const deviceRoutes = require('./devices');
const userRoutes = require('./users');
const employeesRoutes = require('./employees');

const app = express();

// Middleware
app.use(express.json());
//cors
app.use(cors());

// Routes
app.use('/devices', deviceRoutes);
app.use('/users', userRoutes);
app.use('/employees', employeesRoutes);

// Fallback
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Export for Vercel
module.exports = app;

// ✅ If run directly (not by Vercel), start on port 5000
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

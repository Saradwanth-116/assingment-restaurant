const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const app = express();

// Middleware
// In production, we allow all origins, or we could just allow the specific frontend URL if hosted separately.
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/reservations', require('./routes/reservations'));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// DB Connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connected successfully');
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal Error: Could not connect to MongoDB Atlas in production.', err);
      process.exit(1);
    }
    console.log('Local MongoDB not running. Starting in-memory MongoDB for local dev fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`In-memory MongoDB connected successfully at ${mongoUri}`);
    
    // Auto-seed for convenience since it's in-memory
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash('password123', salt);
    await User.create([
      { name: 'Admin', email: 'admin@demo.com', password: pwd, role: 'admin' },
      { name: 'Demo User', email: 'user@demo.com', password: pwd, role: 'user' }
    ]);
    console.log('Seeded in-memory DB with demo accounts');
  }

  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

connectDB();

module.exports = app;

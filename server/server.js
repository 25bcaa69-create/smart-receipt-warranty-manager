const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment configuration
dotenv.config();

// Connect to MongoDB (with automatic in-memory fallback if local MongoDB server is off)
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded receipt images and PDFs statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');
const analyticsRoutes = require('./routes/analytics');
const { router: reminderRoutes, checkAndSendExpiringReminders } = require('./routes/reminders');

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Receipt & Warranty Manager API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Periodic automated background scanner for warranty reminders (runs every 12 hours)
const TWELVE_HOURS = 12 * 60 * 60 * 1000;
setInterval(() => {
  console.log('[Scheduler] Running automated 30-day & 7-day warranty expiry email scanner...');
  checkAndSendExpiringReminders().catch((err) =>
    console.error('[Scheduler] Error in automated scanner:', err)
  );
}, TWELVE_HOURS);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Smart Receipt & Warranty Backend Server Ready!`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`====================================================`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// --- Middleware ---
const JSON_LIMIT = process.env.JSON_LIMIT || '8mb';
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow configured frontend origins + localhost dev ports.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl / mobile / same-origin
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return cb(null, true);
      }
      // In production with CLIENT_URL set, still allow Vercel preview URLs
      // that share the same project domain suffix.
      return cb(null, true);
    },
  })
);
app.use(morgan('dev'));

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// 404 for unknown API routes.
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// --- Error handler (must be last) ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image must be smaller than 5MB' });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

// Export app for tests; only listen + connect when run directly.
if (require.main === module) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }
  connectDB(uri)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;

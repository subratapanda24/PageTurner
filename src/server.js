const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');
const seedData = require('./utils/seedData');
const setupSwagger = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend and uploaded images
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Register Swagger API Documentation
setupSwagger(app);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PageTurner Online Bookstore API',
    uptime: process.uptime()
  });
});

// Firebase Web Config Endpoint (safe to expose - these are public client keys)
app.get('/api/firebase-config', (req, res) => {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!apiKey || apiKey === 'YOUR_WEB_API_KEY_HERE' || !projectId) {
    return res.json({ configured: false });
  }
  res.json({
    configured: true,
    apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
  });
});

// Download Postman Collection route
app.get('/api/postman-collection', (req, res) => {
  const file = path.join(__dirname, '../postman_collection.json');
  res.download(file);
});

// Single Page Application (SPA) Routing Fallback for Frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

let PORT = parseInt(process.env.PORT, 10) || 5050;

const startServer = async () => {
  await connectDB();
  await seedData();

  const listen = (portToTry) => {
    const server = app.listen(portToTry, '0.0.0.0', () => {
      const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${portToTry}`;
      console.log(`\n======================================================`);
      console.log(`PageTurner Server running on: ${baseUrl}`);
      console.log(`Swagger API Docs: ${baseUrl}/api-docs`);
      console.log(`Postman Collection: ${baseUrl}/api/postman-collection`);
      console.log(`======================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (process.env.PORT) {
          console.error(`Port ${portToTry} is already in use in production environment. Exiting.`);
          process.exit(1);
        }
        console.warn(`Port ${portToTry} is already in use. Retrying on port ${portToTry + 1}...`);
        listen(portToTry + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  listen(PORT);
};

startServer();

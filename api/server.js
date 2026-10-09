const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { initializeSubscriptionAutomation } = require('./services/subscriptionService');
const { initializeContractAutomation } = require('./services/contractService');
const { initializeSocketIO, setSocketIO } = require('./services/socketService');
const { initRedis } = require('./utils/redisClient');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const messageRoutes = require('./routes/messageRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const contractRoutes = require('./routes/contractRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const savedFarmerRoutes = require('./routes/savedFarmerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const isNetlify = process.env.NETLIFY === 'true' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const normalizeOrigin = (origin) => origin?.replace(/\/+$/, '');
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].map(normalizeOrigin).filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const requestOrigin = normalizeOrigin(origin);
    const isVercelDeployment = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(requestOrigin || '');

    if (!requestOrigin || allowedOrigins.includes(requestOrigin) || isVercelDeployment) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection function with fallback to Memory Server
const connectDatabase = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kisanmithra';
  try {
    // Attempt standard connection first with a brief 3s timeout to fail fast if no local db
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ MongoDB connected successfully to primary database');
  } catch (err) {
    if (!isNetlify && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
      console.warn('⚠️ Primary MongoDB connection failed. Starting fallback in-memory database for project demonstration...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB Memory Server successfully!');
    } else {
      console.error('❌ MongoDB connection error:', err);
      throw err;
    }
  }

  // Netlify Functions are short-lived request handlers; cron jobs and
  // persistent Socket.IO connections need a long-running server instead.
  if (!isNetlify) {
    initializeSubscriptionAutomation();
    initializeContractAutomation();
    const io = initializeSocketIO(server);
    setSocketIO(io);
  }
};

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'KisanMithra API is running',
    version: '1.0.0',
    status: 'active'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes with role-based authorization
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/farmers', savedFarmerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

if (!isNetlify) {
  connectDatabase().catch((err) => console.error('❌ Database initialization error:', err));

  // Start the traditional long-running server for local development/hosting.
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KisanMithra API Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/test`);
    console.log(`🔌 Socket.io: Ready for real-time connections`);
  });
}

module.exports = { app, connectDatabase };

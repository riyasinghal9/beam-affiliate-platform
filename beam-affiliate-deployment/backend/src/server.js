const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const { runSeeders } = require('./utils/seeder');
const realtimeService = require('./services/realtimeService');
const cacheService = require('./services/cacheService');
const monitoringService = require('./services/monitoringService');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payments');
const trackingRoutes = require('./routes/tracking');
const commissionRoutes = require('./routes/commissions');
const gamificationRoutes = require('./routes/gamification');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhooks');
const marketingRoutes = require('./routes/marketing');
const marketingAutomationRoutes = require('./routes/marketingAutomation');
const adminRoutes = require('./routes/admin');
const advancedFeaturesRoutes = require('./routes/advancedFeatures');
const resellerRoutes = require('./routes/reseller');
const trainingRoutes = require('./routes/training');
const productRoutes = require('./routes/products');
const storeWebhookRoutes = require('./routes/storeWebhooks');

const app = express();

// Connect to database and run seeders
connectDB().then(() => {
  runSeeders();
}).catch(err => {
  console.error('Failed to connect to database:', err);
});

// Performance and security middleware
app.use(compression()); // Enable gzip compression
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - Disabled for development
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // API-specific rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too many API requests from this IP, please try again later.'
    }
  });
  app.use('/api/', apiLimiter);
}

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://10.0.0.17:3000',
    'https://hip-squids-train.loca.lt',
    'https://brown-turkeys-juggle.loca.lt'
  ],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Monitoring middleware
app.use(monitoringService.trackRequest.bind(monitoringService));

// Cache middleware for static data
app.use('/api/dashboard', cacheService.cacheMiddleware(300, (req) => `dashboard:${req.user?.id}`));
app.use('/api/analytics', cacheService.cacheMiddleware(600, (req) => `analytics:${req.user?.id}:${req.query.period || '30d'}`));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/marketing-automation', marketingAutomationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/advanced', advancedFeaturesRoutes);
app.use('/api/reseller', resellerRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/store-webhooks', storeWebhookRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Beam Affiliate API Documentation'
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Monitoring endpoints
app.get('/api/monitoring/health', async (req, res) => {
  const health = await monitoringService.healthCheck();
  res.json(health);
});

app.get('/api/monitoring/metrics', (req, res) => {
  const metrics = monitoringService.exportMetrics();
  res.json(metrics);
});

app.get('/api/monitoring/dashboard', (req, res) => {
  const dashboard = monitoringService.getDashboardData();
  res.json(dashboard);
});

// Cache endpoints
app.get('/api/cache/stats', async (req, res) => {
  const stats = await cacheService.getStats();
  res.json(stats);
});

app.post('/api/cache/clear', async (req, res) => {
  const result = await cacheService.clear();
  res.json(result);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Log error for monitoring
  monitoringService.recordError({
    type: 'express_error',
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date()
  });
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// Initialize services
realtimeService.initialize(server);
monitoringService.startMonitoring();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  
  // Stop monitoring
  monitoringService.stopMonitoring();
  
  // Close cache connections
  await cacheService.close();
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  
  // Stop monitoring
  monitoringService.stopMonitoring();
  
  // Close cache connections
  await cacheService.close();
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 
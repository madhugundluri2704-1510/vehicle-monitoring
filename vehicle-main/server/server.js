require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { connectDB } = require('./config/db');
const { initializeSocket } = require('./socket/socketHandler');
const { seedDatabase } = require('./seed/seedData');

// Import routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const routeRoutes = require('./routes/routeRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const driverRoutes = require('./routes/driverRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'KMC SwachthTrack', timestamp: new Date(), uptime: process.uptime() });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Seed database on first run
    const Vehicle = require('./models/Vehicle');
    const count = await Vehicle.countDocuments();
    if (count === 0) {
      await seedDatabase();
    }

    // Initialize Socket.IO
    initializeSocket(io);

    server.listen(PORT, () => {
      console.log(`\n🏛️  KMC SwachthTrack Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready for real-time tracking`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

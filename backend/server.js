// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis, getRedisClient } = require('./config/redisClient');

// --- Начало кода для Prometheus метрик ---
const client = require('prom-client'); // Убедитесь, что вы сделали npm install prom-client в папке backend
const collectDefaultMetrics = client.collectDefaultMetrics;
// Собирает стандартные метрики Node.js процесса (CPU, память, GC, event loop и т.д.)
// Префикс 'nodejs_' будет добавлен ко всем стандартным метрикам
collectDefaultMetrics({ prefix: 'nodejs_' });
// --- Конец кода для Prometheus метрик ---

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

// Connect to Database
connectDB();

// Connect to Redis
connectRedis();

const app = express();

// Body parser
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'YOUR_PROD_FRONTEND_URL',
    credentials: true
}));

// --- Маршрут для метрик Prometheus ---
// Должен быть определен до ваших основных API маршрутов, если вы хотите избежать
// логирования запросов к /metrics вашими стандартными логгерами API (если они есть).
// Но обычно это не проблема.
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    console.error("Error serving metrics:", ex);
    res.status(500).end(ex.toString());
  }
});
// --- Конец маршрута для метрик ---


// --- Route Imports ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const policyRoutes = require('./routes/policies');
const incidentRoutes = require('./routes/incidents');

// --- Mount Routers ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/incidents', incidentRoutes);

// Health check route
app.get('/api/health', (req, res) => res.status(200).json({ status: 'UP', service: 'DLP Backend' }));

// --- Error Handling Middleware (should be last) ---
const { errorHandler } = require('./middleware/error');
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
const server = app.listen(
    PORT,
    console.log(`Backend server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // server.close(() => process.exit(1));
});
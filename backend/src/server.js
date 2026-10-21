require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const db = require('./config/db');
const { register } = require('./metrics/metrics');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.get('/health', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT 1 AS status');
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'hotel-backend',
      database: dbRes.rows.length > 0 ? 'CONNECTED' : 'DISCONNECTED'
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      service: 'hotel-backend',
      database: 'ERROR',
      error: err.message
    });
  }
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.use('/api', apiRoutes);

app.use(errorHandler);

const server = app.listen(port, () => {
  logger.info(`Hotel Backend Service running on port ${port}`, {
    port,
    nodeEnv: process.env.NODE_ENV || 'production'
  });
});

const handleGracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await db.pool.end();
      logger.info('Database pool closed cleanly. Process terminating.');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing database pool', { error: err.message });
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

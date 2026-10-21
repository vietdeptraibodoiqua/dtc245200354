const { Pool } = require('pg');
const logger = require('./logger');

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};

if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('sslmode=require') || process.env.DB_SSL === 'true')) {
  connectionConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(connectionConfig);

pool.on('error', (err) => {
  logger.error('Unexpected database client error', { error: err.message, stack: err.stack });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};

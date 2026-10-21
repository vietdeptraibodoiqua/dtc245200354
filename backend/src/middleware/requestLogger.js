const logger = require('../config/logger');
const { httpRequestsTotal, httpRequestDurationSeconds } = require('../metrics/metrics');

const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    const durationMs = Math.round(durationSeconds * 1000);

    const route = req.baseUrl + (req.route ? req.route.path : req.path);
    const statusCode = res.statusCode;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode
    });

    httpRequestDurationSeconds.observe({
      method: req.method,
      route,
      status_code: statusCode
    }, durationSeconds);

    const logPayload = {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      durationMs,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.get('user-agent')
    };

    if (statusCode >= 500) {
      logger.error('HTTP Request Internal Server Error', logPayload);
    } else if (statusCode >= 400) {
      logger.warn('HTTP Request Client Error', logPayload);
    } else {
      logger.info('HTTP Request Completed', logPayload);
    }
  });

  next();
};

module.exports = requestLogger;

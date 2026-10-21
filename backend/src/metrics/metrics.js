const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'hotel_'
});

const httpRequestsTotal = new client.Counter({
  name: 'hotel_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'hotel_http_request_duration_seconds',
  help: 'Histogram of HTTP request durations in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

const activeBookingsGauge = new client.Gauge({
  name: 'hotel_active_bookings_total',
  help: 'Current total number of active hotel bookings',
  registers: [register]
});

const roomOccupancyGauge = new client.Gauge({
  name: 'hotel_occupancy_ratio',
  help: 'Current room occupancy ratio from 0.0 to 1.0',
  registers: [register]
});

const totalRevenueGauge = new client.Gauge({
  name: 'hotel_revenue_total_vnd',
  help: 'Accumulated total hotel revenue in VND',
  registers: [register]
});

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  activeBookingsGauge,
  roomOccupancyGauge,
  totalRevenueGauge
};

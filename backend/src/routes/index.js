const express = require('express');
const router = express.Router();

const roomRoutes = require('./roomRoutes');
const bookingRoutes = require('./bookingRoutes');
const customerRoutes = require('./customerRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;

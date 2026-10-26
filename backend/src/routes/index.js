const express = require('express');
const router = express.Router();

const roomRoutes = require('./roomRoutes');
const bookingRoutes = require('./bookingRoutes');
const customerRoutes = require('./customerRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authRoutes = require('./authRoutes');
const paymentRoutes = require('./paymentRoutes');
const roomController = require('../controllers/roomController');

router.get('/room-types', roomController.getRoomTypes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;

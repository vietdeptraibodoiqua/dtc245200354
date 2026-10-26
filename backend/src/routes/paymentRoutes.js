const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/checkout', paymentController.createCheckout);
router.post('/sepay-ipn', paymentController.handleSepayIpn);
router.post('/sepay-webhook', paymentController.handleSepayWebhook);
router.get('/check/:bookingCode', paymentController.checkStatus);
router.post('/simulate-mbbank-transfer', paymentController.simulateTransfer);
router.post('/simulate-gateway-payment', paymentController.simulateGateway);
router.get('/qr', paymentController.getQrCode);

module.exports = router;

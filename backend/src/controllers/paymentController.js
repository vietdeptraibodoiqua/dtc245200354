const paymentService = require('../services/paymentService');
const logger = require('../config/logger');

const createCheckout = async (req, res, next) => {
  try {
    const { bookingCode, amount, paymentMethod, customerId } = req.body;
    if (!bookingCode || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp bookingCode và amount'
      });
    }

    const checkoutData = await paymentService.createPaymentCheckout({
      bookingCode,
      amount,
      paymentMethod,
      customerId
    });

    return res.json({
      success: true,
      data: checkoutData
    });
  } catch (err) {
    next(err);
  }
};

const handleSepayIpn = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload) {
      return res.status(400).json({ success: false, message: 'Invalid IPN payload' });
    }

    const result = await paymentService.processSepayIpn(payload);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const handleSepayWebhook = async (req, res, next) => {
  try {
    const configuredApiKey = process.env.SEPAY_API_KEY;
    const authHeader = req.headers.authorization;

    if (configuredApiKey && configuredApiKey !== 'sepay_secret_key_2026') {
      const incomingKey = authHeader ? authHeader.replace(/^Apikey\s+/i, '').replace(/^Bearer\s+/i, '') : '';
      if (incomingKey !== configuredApiKey) {
        logger.warn('Unauthorized SePay webhook attempt', { ip: req.ip });
        return res.status(401).json({ success: false, message: 'Invalid API Key' });
      }
    }

    const payload = req.body;
    if (!payload || !payload.id) {
      return res.status(400).json({ success: false, message: 'Invalid payload: missing transaction id' });
    }

    const result = await paymentService.processSepayWebhook(payload);
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const checkStatus = async (req, res, next) => {
  try {
    const { bookingCode } = req.params;
    const status = await paymentService.checkPaymentStatus(bookingCode);
    return res.json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
};

const simulateTransfer = async (req, res, next) => {
  try {
    const { bookingCode, amount } = req.body;
    if (!bookingCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp bookingCode' });
    }
    const result = await paymentService.simulateMbBankTransfer(bookingCode, amount);
    return res.json({
      success: true,
      data: result,
      message: 'Mô phỏng chuyển khoản MB Bank thành công'
    });
  } catch (err) {
    next(err);
  }
};

const simulateGateway = async (req, res, next) => {
  try {
    const { bookingCode, paymentMethod } = req.body;
    if (!bookingCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp bookingCode' });
    }
    const result = await paymentService.simulateSepayGatewayPayment(bookingCode, paymentMethod || 'CARD');
    return res.json({
      success: true,
      data: result,
      message: `Mô phỏng thanh toán Cổng SePay (${paymentMethod || 'CARD'}) thành công`
    });
  } catch (err) {
    next(err);
  }
};

const getQrCode = async (req, res, next) => {
  try {
    const { bookingCode, amount } = req.query;
    const qrUrl = paymentService.generateVietQrUrl(bookingCode, amount);
    return res.json({
      success: true,
      data: {
        qrUrl,
        bankName: 'MB Bank',
        accountNumber: process.env.MB_BANK_ACCOUNT_NUMBER || '0987654321',
        accountName: process.env.MB_BANK_ACCOUNT_NAME || 'SUN HOTEL RESORT'
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCheckout,
  handleSepayIpn,
  handleSepayWebhook,
  checkStatus,
  simulateTransfer,
  simulateGateway,
  getQrCode
};

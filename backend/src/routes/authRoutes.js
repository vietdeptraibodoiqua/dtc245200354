const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdminAuth } = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');

router.post('/login', authController.login);
router.get('/me', requireAdminAuth, authController.getMe);
router.post('/smtp-test', requireAdminAuth, async (req, res) => {
  const status = await emailService.verifyConnection();
  res.json({
    success: status.connected,
    data: status
  });
});

module.exports = router;

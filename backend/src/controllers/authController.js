const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
    });
  }

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';

  if (username !== expectedUsername || password !== expectedPassword) {
    logger.warn('Failed admin login attempt', { username, ip: req.ip });
    return res.status(401).json({
      success: false,
      message: 'Tài khoản hoặc mật khẩu quản trị không chính xác'
    });
  }

  const secret = process.env.JWT_SECRET || 'sun_hotel_luxury_jwt_secret_key_super_secure_2026_at_least_32_chars!';
  const expiresIn = process.env.JWT_EXPIRES_IN || '12h';

  const token = jwt.sign(
    {
      username: expectedUsername,
      role: 'admin',
      fullName: 'Quản Trị Viên Hệ Thống'
    },
    secret,
    { expiresIn }
  );

  logger.info('Admin logged in successfully', { username: expectedUsername, ip: req.ip });

  return res.json({
    success: true,
    data: {
      token,
      user: {
        username: expectedUsername,
        fullName: 'Quản Trị Viên Hệ Thống',
        role: 'admin'
      }
    },
    message: 'Đăng nhập trang quản trị thành công'
  });
};

const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: req.admin
    }
  });
};

module.exports = {
  login,
  getMe
};

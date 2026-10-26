const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const logger = require('../config/logger');

const createBooking = async (req, res, next) => {
  try {
    const {
      customer,
      roomId,
      checkInDate,
      checkOutDate,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail,
      customerIdNumber,
      notes
    } = req.body;

    let customerData = customer;
    if (!customerData) {
      customerData = {
        fullName: customerName || req.body.fullName,
        phone: customerPhone || req.body.phoneNumber || req.body.phone,
        email: customerEmail || req.body.email || 'khachhang@sunhotel.vn',
        idCard: customerIdNumber || req.body.idCard || 'CCCD' + Math.floor(100000000 + Math.random() * 900000000),
        address: req.body.customerAddress || req.body.address || 'Việt Nam'
      };
    }

    if (!customerData.fullName || !customerData.phone) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin khách hàng không đầy đủ: Họ tên và Số điện thoại là bắt buộc'
      });
    }

    if (!customerData.idCard) {
      customerData.idCard = 'CCCD' + Math.floor(100000000 + Math.random() * 900000000);
    }

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin phòng hoặc ngày nhận/trả phòng'
      });
    }

    const booking = await bookingService.createBooking({
      customer: customerData,
      roomId: parseInt(roomId, 10),
      checkInDate,
      checkOutDate,
      specialRequests: specialRequests || notes || ''
    });

    const vietQrUrl = paymentService.generateVietQrUrl(
      booking.booking_code,
      booking.total_price_vnd
    );

    emailService.sendBookingConfirmation({
      booking,
      customer: customerData,
      room: booking.room,
      vietQrUrl
    }).catch((err) => {
      logger.error('Failed to dispatch booking confirmation email', { error: err.message });
    });

    const responseData = {
      ...booking,
      vietQrUrl,
      vietqr_url: vietQrUrl
    };

    res.status(201).json({
      success: true,
      data: responseData,
      booking: responseData,
      message: 'Đặt phòng thành công'
    });
  } catch (err) {
    next(err);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const bookings = await bookingService.getBookings({ status, search });
    res.json({
      success: true,
      data: bookings,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

const getBookingByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const booking = await bookingService.getBookingByCode(code);
    const vietQrUrl = paymentService.generateVietQrUrl(
      booking.booking_code,
      booking.total_price_vnd
    );

    const responseData = {
      ...booking,
      vietQrUrl,
      vietqr_url: vietQrUrl
    };

    res.json({
      success: true,
      data: responseData,
      booking: responseData
    });
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu trường status cần cập nhật'
      });
    }

    const updated = await bookingService.updateBookingStatus(id, status);
    res.json({
      success: true,
      data: updated,
      booking: updated,
      message: 'Cập nhật trạng thái đơn đặt phòng thành công'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingByCode,
  updateBookingStatus
};

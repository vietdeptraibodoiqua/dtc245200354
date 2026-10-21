const bookingService = require('../services/bookingService');

const createBooking = async (req, res, next) => {
  try {
    const { customer, roomId, checkInDate, checkOutDate, specialRequests } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.idCard) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin khách hàng không đầy đủ (fullName, phone, idCard là bắt buộc)'
      });
    }

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin phòng hoặc ngày nhận/trả phòng'
      });
    }

    const booking = await bookingService.createBooking({
      customer,
      roomId,
      checkInDate,
      checkOutDate,
      specialRequests
    });

    res.status(201).json({
      success: true,
      data: booking,
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
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

const getBookingByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const booking = await bookingService.getBookingByCode(code);
    res.json({
      success: true,
      data: booking
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

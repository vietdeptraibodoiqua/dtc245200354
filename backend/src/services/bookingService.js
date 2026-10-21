const db = require('../config/db');
const logger = require('../config/logger');
const { findOrCreateCustomer } = require('./customerService');
const crypto = require('crypto');

const generateBookingCode = () => {
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `NVH-${dateStr}-${randomSuffix}`;
};

const createBooking = async (bookingData) => {
  const {
    customer,
    roomId,
    checkInDate,
    checkOutDate,
    specialRequests
  } = bookingData;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const roomCheckRes = await client.query(
      `SELECT r.*, rt.base_price_vnd
       FROM rooms r
       JOIN room_types rt ON r.room_type_id = rt.id
       WHERE r.id = $1
       FOR UPDATE`,
      [roomId]
    );

    if (roomCheckRes.rows.length === 0) {
      const err = new Error('Phòng yêu cầu không tồn tại trong hệ thống');
      err.statusCode = 404;
      throw err;
    }

    const room = roomCheckRes.rows[0];

    if (room.status === 'MAINTENANCE') {
      const err = new Error('Phòng đang trong trạng thái bảo dưỡng, không thể đặt');
      err.statusCode = 400;
      throw err;
    }

    const conflictRes = await client.query(
      `SELECT b.id, b.booking_code, b.check_in_date, b.check_out_date
       FROM booking_rooms br
       JOIN bookings b ON br.booking_id = b.id
       WHERE br.room_id = $1
         AND b.status IN ('CONFIRMED', 'CHECKED_IN')
         AND NOT (b.check_out_date <= $2 OR b.check_in_date >= $3)
       FOR UPDATE`,
      [roomId, checkInDate, checkOutDate]
    );

    if (conflictRes.rows.length > 0) {
      const err = new Error('Xung đột lịch đặt: Phòng đã có khách đặt trong khoảng thời gian này');
      err.statusCode = 409;
      throw err;
    }

    const customerRecord = await findOrCreateCustomer(client, customer);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalPriceVnd = Number(room.base_price_vnd) * diffNights;

    const bookingCode = generateBookingCode();

    const bookingInsertRes = await client.query(
      `INSERT INTO bookings (booking_code, customer_id, check_in_date, check_out_date, total_price_vnd, status, special_requests)
       VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', $6)
       RETURNING *`,
      [bookingCode, customerRecord.id, checkInDate, checkOutDate, totalPriceVnd, specialRequests]
    );

    const newBooking = bookingInsertRes.rows[0];

    await client.query(
      `INSERT INTO booking_rooms (booking_id, room_id, price_per_night)
       VALUES ($1, $2, $3)`,
      [newBooking.id, roomId, room.base_price_vnd]
    );

    await client.query('COMMIT');

    logger.info('[BOOKING_AUDIT] Booking Created Successfully', {
      bookingCode,
      roomId,
      roomNumber: room.room_number,
      customerId: customerRecord.id,
      customerName: customerRecord.full_name,
      totalPriceVnd,
      diffNights
    });

    return {
      ...newBooking,
      customer: customerRecord,
      room: {
        id: room.id,
        roomNumber: room.room_number,
        floor: room.floor,
        pricePerNight: room.base_price_vnd
      },
      nights: diffNights
    };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('[BOOKING_AUDIT] Booking Transaction Failed', {
      roomId,
      checkInDate,
      checkOutDate,
      error: err.message
    });
    throw err;
  } finally {
    client.release();
  }
};

const getBookings = async (filters = {}) => {
  let queryText = `
    SELECT b.*, c.full_name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
           r.id AS room_id, r.room_number, r.floor, rt.name AS room_type_name
    FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    JOIN booking_rooms br ON b.id = br.booking_id
    JOIN rooms r ON br.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    queryText += ` AND b.status = $${params.length}`;
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    queryText += ` AND (b.booking_code ILIKE $${params.length} OR c.full_name ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
  }

  queryText += ' ORDER BY b.created_at DESC';

  const result = await db.query(queryText, params);
  return result.rows;
};

const getBookingByCode = async (bookingCode) => {
  const result = await db.query(
    `SELECT b.*, c.full_name AS customer_name, c.phone AS customer_phone, c.email AS customer_email, c.id_card AS customer_id_card,
            r.id AS room_id, r.room_number, r.floor, rt.name AS room_type_name, rt.base_price_vnd, rt.amenities
     FROM bookings b
     JOIN customers c ON b.customer_id = c.id
     JOIN booking_rooms br ON b.id = br.booking_id
     JOIN rooms r ON br.room_id = r.id
     JOIN room_types rt ON r.room_type_id = rt.id
     WHERE b.booking_code = $1`,
    [bookingCode]
  );

  if (result.rows.length === 0) {
    const err = new Error('Không tìm thấy thông tin đơn đặt phòng với mã đã cung cấp');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

const updateBookingStatus = async (bookingId, status) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const updateRes = await client.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, bookingId]
    );

    if (updateRes.rows.length === 0) {
      const err = new Error('Không tìm thấy đơn đặt phòng');
      err.statusCode = 404;
      throw err;
    }

    const booking = updateRes.rows[0];

    const roomRes = await client.query(
      `SELECT room_id FROM booking_rooms WHERE booking_id = $1`,
      [bookingId]
    );

    if (roomRes.rows.length > 0) {
      const roomId = roomRes.rows[0].room_id;
      let newRoomStatus = null;

      if (status === 'CHECKED_IN') {
        newRoomStatus = 'OCCUPIED';
      } else if (status === 'CHECKED_OUT') {
        newRoomStatus = 'AVAILABLE';
      }

      if (newRoomStatus) {
        await client.query(
          `UPDATE rooms SET status = $1 WHERE id = $2`,
          [newRoomStatus, roomId]
        );
      }
    }

    await client.query('COMMIT');

    logger.info('[BOOKING_AUDIT] Booking Status Updated', {
      bookingId,
      status
    });

    return booking;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingByCode,
  updateBookingStatus
};

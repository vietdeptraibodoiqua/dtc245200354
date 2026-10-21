const db = require('../config/db');

const getRoomTypes = async () => {
  const result = await db.query(
    'SELECT * FROM room_types ORDER BY base_price_vnd ASC'
  );
  return result.rows;
};

const getAllRooms = async (filters = {}) => {
  let queryText = `
    SELECT r.*, rt.name AS room_type_name, rt.code AS room_type_code, rt.base_price_vnd,
           rt.capacity_adults, rt.capacity_children, rt.amenities, rt.image_url
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.floor) {
    params.push(filters.floor);
    queryText += ` AND r.floor = $${params.length}`;
  }

  if (filters.status) {
    params.push(filters.status);
    queryText += ` AND r.status = $${params.length}`;
  }

  if (filters.roomTypeId) {
    params.push(filters.roomTypeId);
    queryText += ` AND r.room_type_id = $${params.length}`;
  }

  queryText += ' ORDER BY r.floor ASC, r.room_number ASC';

  const result = await db.query(queryText, params);
  return result.rows;
};

const getAvailableRoomsByDate = async (checkInDate, checkOutDate, filters = {}) => {
  let queryText = `
    SELECT r.*, rt.name AS room_type_name, rt.code AS room_type_code, rt.base_price_vnd,
           rt.capacity_adults, rt.capacity_children, rt.amenities, rt.image_url
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.status != 'MAINTENANCE'
      AND r.id NOT IN (
        SELECT br.room_id
        FROM booking_rooms br
        JOIN bookings b ON br.booking_id = b.id
        WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
          AND NOT (b.check_out_date <= $1 OR b.check_in_date >= $2)
      )
  `;
  const params = [checkInDate, checkOutDate];

  if (filters.capacityAdults) {
    params.push(filters.capacityAdults);
    queryText += ` AND rt.capacity_adults >= $${params.length}`;
  }

  if (filters.roomTypeId) {
    params.push(filters.roomTypeId);
    queryText += ` AND rt.id = $${params.length}`;
  }

  if (filters.maxPrice) {
    params.push(filters.maxPrice);
    queryText += ` AND rt.base_price_vnd <= $${params.length}`;
  }

  queryText += ' ORDER BY rt.base_price_vnd ASC, r.room_number ASC';

  const result = await db.query(queryText, params);
  return result.rows;
};

const updateRoomStatus = async (roomId, status, notes) => {
  const result = await db.query(
    `UPDATE rooms
     SET status = $1, notes = COALESCE($2, notes)
     WHERE id = $3
     RETURNING *`,
    [status, notes, roomId]
  );
  return result.rows[0];
};

module.exports = {
  getRoomTypes,
  getAllRooms,
  getAvailableRoomsByDate,
  updateRoomStatus
};

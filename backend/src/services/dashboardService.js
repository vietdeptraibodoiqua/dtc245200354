const db = require('../config/db');
const { roomOccupancyGauge, totalRevenueGauge, activeBookingsGauge } = require('../metrics/metrics');

const getDashboardStats = async () => {
  const roomsStatsRes = await db.query(`
    SELECT
      COUNT(*)::int AS total_rooms,
      COUNT(CASE WHEN status = 'OCCUPIED' THEN 1 END)::int AS occupied_rooms,
      COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END)::int AS available_rooms,
      COUNT(CASE WHEN status = 'MAINTENANCE' THEN 1 END)::int AS maintenance_rooms,
      COUNT(CASE WHEN status = 'CLEANING' THEN 1 END)::int AS cleaning_rooms
    FROM rooms
  `);

  const bookingsStatsRes = await db.query(`
    SELECT
      COUNT(CASE WHEN status = 'CHECKED_IN' THEN 1 END)::int AS active_stays,
      COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END)::int AS upcoming_bookings,
      COALESCE(SUM(CASE WHEN status IN ('CHECKED_IN', 'CHECKED_OUT') THEN total_price_vnd ELSE 0 END), 0)::numeric AS total_revenue_vnd
    FROM bookings
  `);

  const rooms = roomsStatsRes.rows[0];
  const bookings = bookingsStatsRes.rows[0];

  const occupancyRatio = rooms.total_rooms > 0
    ? Number((rooms.occupied_rooms / rooms.total_rooms).toFixed(4))
    : 0;

  roomOccupancyGauge.set(occupancyRatio);
  totalRevenueGauge.set(Number(bookings.total_revenue_vnd));
  activeBookingsGauge.set(bookings.active_stays + bookings.upcoming_bookings);

  const floorMatrixRes = await db.query(`
    SELECT r.id, r.room_number, r.floor, r.status, rt.name AS room_type_name, rt.code AS room_type_code,
           rt.base_price_vnd,
           b.booking_code, c.full_name AS guest_name
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    LEFT JOIN booking_rooms br ON r.id = br.room_id
    LEFT JOIN bookings b ON br.booking_id = b.id AND b.status = 'CHECKED_IN'
    LEFT JOIN customers c ON b.customer_id = c.id
    ORDER BY r.floor ASC, r.room_number ASC
  `);

  const floors = {};
  for (const row of floorMatrixRes.rows) {
    if (!floors[row.floor]) {
      floors[row.floor] = [];
    }
    floors[row.floor].push(row);
  }

  return {
    kpi: {
      totalRooms: rooms.total_rooms,
      occupiedRooms: rooms.occupied_rooms,
      availableRooms: rooms.available_rooms,
      maintenanceRooms: rooms.maintenance_rooms,
      cleaningRooms: rooms.cleaning_rooms,
      occupancyPercentage: Number((occupancyRatio * 100).toFixed(1)),
      activeStays: bookings.active_stays,
      upcomingBookings: bookings.upcoming_bookings,
      totalRevenueVnd: Number(bookings.total_revenue_vnd)
    },
    floorMatrix: floors
  };
};

module.exports = {
  getDashboardStats
};

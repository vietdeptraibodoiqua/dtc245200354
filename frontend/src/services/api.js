const BASE_URL = '/api';

export const fetchRoomTypes = async () => {
  const res = await fetch(`${BASE_URL}/rooms/types`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi tải danh mục hạng phòng');
  return data.data;
};

export const searchRooms = async (searchParams) => {
  const query = new URLSearchParams(searchParams).toString();
  const res = await fetch(`${BASE_URL}/rooms/search?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi tìm kiếm phòng');
  return data.data;
};

export const fetchAllRooms = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/rooms?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách phòng');
  return data.data;
};

export const updateRoomStatus = async (roomId, status, notes) => {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật trạng thái phòng');
  return data.data;
};

export const createBooking = async (payload) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi tạo đơn đặt phòng');
  return data.data;
};

export const fetchBookings = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/bookings?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách đặt phòng');
  return data.data;
};

export const fetchBookingByCode = async (code) => {
  const res = await fetch(`${BASE_URL}/bookings/code/${encodeURIComponent(code)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không tìm thấy đơn đặt phòng');
  return data.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật đơn đặt');
  return data.data;
};

export const fetchDashboardStats = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi tải dữ liệu bảng điều khiển');
  return data.data;
};

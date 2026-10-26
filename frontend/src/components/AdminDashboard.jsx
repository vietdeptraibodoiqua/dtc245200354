import React, { useState, useEffect } from 'react';
import { 
  Building, Calendar, CheckCircle2, Clock, XCircle, RefreshCw, 
  Layers, ExternalLink, Activity, ShieldCheck, UserCheck, Phone, Check, Ban,
  Mail, Send, CheckCircle, AlertTriangle, LogOut, Loader2, Sparkles
} from 'lucide-react';
import RoomMatrix from './RoomMatrix';

export default function AdminDashboard({ onSwitchToGuest, onLogout }) {
  const [activeTab, setActiveTab] = useState('matrix');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [smtpTesting, setSmtpTesting] = useState(false);

  const token = localStorage.getItem('sun_hotel_admin_token') || '';
  const storedUser = localStorage.getItem('sun_hotel_admin_user');
  const adminUser = storedUser ? JSON.parse(storedUser) : { username: 'admin', fullName: 'Quản Trị Viên' };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/bookings')
      ]);

      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();

      setRooms(roomsData.data || roomsData.rooms || []);
      setBookings(bookingsData.data || bookingsData.bookings || []);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu PMS: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Không thể cập nhật trạng thái');
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRoomStatus = async (roomId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Không thể cập nhật trạng thái buồng phòng');
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpStatus(null);
    try {
      const res = await fetch('/api/auth/smtp-test', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setSmtpStatus(data.data || { connected: false, message: 'Lỗi không xác định' });
    } catch (err) {
      setSmtpStatus({ connected: false, message: err.message });
    } finally {
      setSmtpTesting(false);
    }
  };

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED' || r.status === 'BOOKED').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      <aside className="w-full lg:w-64 bg-[#0B192C] text-white flex-shrink-0 flex flex-col justify-between border-r border-white/10">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold block leading-none text-white">Sun Hotel</span>
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">PMS Console</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'matrix' 
                  ? 'gold-gradient text-slate-950 shadow-md font-bold' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Sơ đồ Ma trận Phòng</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bookings' 
                  ? 'gold-gradient text-slate-950 shadow-md font-bold' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Quản lý Đặt phòng</span>
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] bg-white/10">
                {bookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'system' 
                  ? 'gold-gradient text-slate-950 shadow-md font-bold' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>SMTP & Cổng MB Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('monitoring')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'monitoring' 
                  ? 'gold-gradient text-slate-950 shadow-md font-bold' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Giám sát Prometheus/Grafana</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center text-slate-950 font-bold text-xs">
              {adminUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-white truncate leading-none">
                {adminUser.fullName}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                @{adminUser.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToGuest}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Về Cổng Khách</span>
            </button>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20">
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
              {activeTab === 'matrix' && 'Ma Trận & Tình Trạng Buồng Phòng'}
              {activeTab === 'bookings' && 'Danh Sách Hồ Sơ Đặt Phòng'}
              {activeTab === 'system' && 'Cấu Hình SMTP Mail & Cổng MB Bank'}
              {activeTab === 'monitoring' && 'Hệ Thống Quan Sát Prometheus & Grafana'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu đồng bộ trực tiếp từ cơ sở dữ liệu PostgreSQL · Sun Hotel 5-Star Luxury
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Tổng số phòng</span>
              <span className="font-serif text-2xl font-bold text-slate-900 mt-1 block">{totalRooms}</span>
              <span className="text-[11px] text-slate-400 mt-1 block">4 tầng buồng phòng</span>
            </div>

            <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm bg-emerald-50/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Phòng sẵn sàng</span>
              <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">{availableRooms}</span>
              <span className="text-[11px] text-emerald-600 mt-1 block">Sẵn sàng nhận khách</span>
            </div>

            <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm bg-blue-50/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">Đang lưu trú</span>
              <span className="font-serif text-2xl font-bold text-blue-700 mt-1 block">{occupiedRooms}</span>
              <span className="text-[11px] text-blue-600 mt-1 block">Công suất {occupancyRate}%</span>
            </div>

            <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm bg-amber-50/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">Bảo dưỡng</span>
              <span className="font-serif text-2xl font-bold text-amber-800 mt-1 block">{maintenanceRooms}</span>
              <span className="text-[11px] text-amber-700 mt-1 block">Kỹ thuật kiểm tra</span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {activeTab === 'matrix' && (
            <RoomMatrix 
              rooms={rooms}
              onToggleStatus={handleToggleRoomStatus}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Danh sách đặt phòng ({bookings.length} hồ sơ)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Mã đơn</th>
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4">Số phòng</th>
                      <th className="py-3 px-4">Lưu trú</th>
                      <th className="py-3 px-4">Tổng tiền (VNĐ)</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-800">
                          {b.booking_code}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{b.customer_name}</span>
                          <span className="text-[11px] text-slate-400 block">{b.customer_phone}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {b.room_number || 'P.' + b.room_id}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600">
                          {new Date(b.check_in_date).toLocaleDateString('vi-VN')} ➔ {new Date(b.check_out_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {Number(b.total_price_vnd).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'CHECKED_IN'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : b.status === 'CHECKED_OUT'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {b.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_IN')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] cursor-pointer"
                              >
                                Check-in
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600 font-semibold text-[11px] cursor-pointer"
                              >
                                Hủy
                              </button>
                            </>
                          )}
                          {b.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_OUT')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer"
                            >
                              Check-out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">
                          Chưa có đơn đặt phòng nào trong hệ thống.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900">SMTP Mail Server Kiểm Tra</h3>
                    <p className="text-xs text-slate-500">Gửi email xác nhận đặt phòng và hóa đơn tự động</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Máy chủ SMTP:</span>
                    <span className="text-slate-900 font-semibold">smtp.gmail.com:587</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa chỉ gửi:</span>
                    <span className="text-slate-900 font-semibold">viet.nguyen@noveratech.digital</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã hóa:</span>
                    <span className="text-slate-900 font-semibold">STARTTLS (Port 587)</span>
                  </div>
                </div>

                <button
                  onClick={handleTestSmtp}
                  disabled={smtpTesting}
                  className="w-full py-2.5 px-4 rounded-xl gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {smtpTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Kiểm Tra Kết Nối SMTP Ngay</span>
                </button>

                {smtpStatus && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                    smtpStatus.connected 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {smtpStatus.connected ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{smtpStatus.message}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900">Cổng MB Bank & SePay Webhook</h3>
                    <p className="text-xs text-slate-500">Nhận biến động số dư và kích hoạt đơn tức thì</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="text-slate-900 font-semibold">MB Bank (BIN: 970422)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <span className="text-slate-900 font-semibold">0987654321</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="text-slate-900 font-semibold">SUN HOTEL RESORT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Webhook URL:</span>
                    <span className="text-slate-900 font-semibold truncate">/api/payments/sepay-webhook</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                  Trạng thái: <strong>Đang hoạt động</strong> · Tự động dedup qua bảng `payment_transactions`.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Grafana Hotel Dashboard</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Trực quan hóa chỉ số RED metrics (Rate, Errors, Duration), kết nối Loki LogQL truy vấn log đặt phòng kiểm toán `[BOOKING_AUDIT]`.
                </p>
                <a
                  href="/grafana/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <span>Mở Dashboard Grafana</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Prometheus Server TSDB</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Lưu trữ metrics thời gian thực: `hotel_booking_requests_total`, `hotel_http_request_duration_seconds`, giám sát node và container.
                </p>
                <a
                  href="/prometheus/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <span>Mở Prometheus TSDB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

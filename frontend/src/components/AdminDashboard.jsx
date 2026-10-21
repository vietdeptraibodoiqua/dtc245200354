import React, { useState, useEffect } from 'react';
import { Percent, DollarSign, Bed, CalendarCheck, Users, Search, RefreshCw, CheckCircle, LogOut, Ban } from 'lucide-react';
import { fetchDashboardStats, fetchBookings, updateBookingStatus, updateRoomStatus } from '../services/api';
import RoomMatrix from './RoomMatrix';

export default function AdminDashboard({ onShowToast }) {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('matrix');
  const [loading, setLoading] = useState(true);
  const [searchBooking, setSearchBooking] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData] = await Promise.all([
        fetchDashboardStats(),
        fetchBookings({ search: searchBooking, status: statusFilter })
      ]);
      setStats(statsData);
      setBookings(bookingsData);
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchBookings = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      if (onShowToast) onShowToast(`Cập nhật trạng thái booking thành ${status}`, 'success');
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error');
    }
  };

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
      if (onShowToast) onShowToast('Cập nhật trạng thái phòng thành công', 'success');
      loadData();
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error');
    }
  };

  const formatVnd = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const kpi = stats?.kpi || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bảng điều hành Khách sạn</h1>
          <p className="text-xs text-slate-500 font-medium">Theo dõi thời gian thực KPI, buồng phòng và giao dịch đặt chỗ</p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tỷ lệ lấp đầy</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpi.occupancyPercentage || 0}%</div>
          <div className="text-xs text-slate-500 mt-1">
            Đang ở: <strong>{kpi.occupiedRooms || 0}</strong> / {kpi.totalRooms || 0} phòng
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Doanh thu lũy kế</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatVnd(kpi.totalRevenueVnd)}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Đã quyết toán & đang lưu trú</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Khách đang lưu trú</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpi.activeStays || 0} phòng</div>
          <div className="text-xs text-slate-500 mt-1">
            Sắp tới: <strong>{kpi.upcomingBookings || 0}</strong> đơn đã xác nhận
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tình trạng buồng phòng</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpi.availableRooms || 0} phòng trống</div>
          <div className="text-xs text-slate-500 mt-1">
            Bảo dưỡng: {kpi.maintenanceRooms || 0} | Đang dọn: {kpi.cleaningRooms || 0}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveAdminTab('matrix')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeAdminTab === 'matrix'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Sơ đồ buồng phòng (Room Matrix)
        </button>

        <button
          onClick={() => setActiveAdminTab('bookings')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeAdminTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Danh sách Đặt phòng
        </button>
      </div>

      {activeAdminTab === 'matrix' && (
        <RoomMatrix
          floorMatrix={stats?.floorMatrix || {}}
          onUpdateRoomStatus={handleRoomStatusChange}
        />
      )}

      {activeAdminTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50">
            <form onSubmit={handleSearchBookings} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchBooking}
                onChange={(e) => setSearchBooking(e.target.value)}
                placeholder="Tìm mã đơn, tên khách, số điện thoại..."
                className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:w-80"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
              >
                Tìm
              </button>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 self-stretch sm:self-auto"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CHECKED_IN">Đang ở (Checked In)</option>
              <option value="CHECKED_OUT">Đã trả phòng (Checked Out)</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100/75 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Thời gian lưu trú</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-xs">
                      Không tìm thấy đơn đặt phòng nào phù hợp
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{b.booking_code}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{b.customer_name}</div>
                        <div className="text-xs text-slate-500">{b.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">Phòng {b.room_number}</span>
                        <span className="text-xs text-slate-500 block">{b.room_type_name}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div>{b.check_in_date.split('T')[0]}</div>
                        <div className="text-slate-400">đến {b.check_out_date.split('T')[0]}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatVnd(b.total_price_vnd)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          b.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'CONFIRMED' ? 'bg-sky-100 text-sky-800' :
                          b.status === 'CHECKED_OUT' ? 'bg-slate-200 text-slate-700' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CHECKED_IN')}
                            title="Check-in nhận phòng"
                            className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {b.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CHECKED_OUT')}
                            title="Check-out trả phòng"
                            className="p-1.5 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            title="Hủy đơn"
                            className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

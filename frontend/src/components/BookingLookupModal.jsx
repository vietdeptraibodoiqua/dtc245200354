import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, Calendar, Bed, User, Phone } from 'lucide-react';
import { fetchBookingByCode } from '../services/api';

export default function BookingLookupModal({ onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const formatVnd = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const data = await fetchBookingByCode(code.trim());
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tra cứu đơn đặt phòng</h2>
            <p className="text-xs text-slate-500">Nhập mã đặt phòng (NVH-XXXX) để kiểm tra</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: NVH-2026-001"
              required
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Đang tra...' : 'Tra cứu'}</span>
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 mb-4">
              {error}
            </div>
          )}

          {booking && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">Mã đơn đặt</span>
                  <span className="text-base font-mono font-bold text-slate-900">{booking.booking_code}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' :
                  booking.status === 'CONFIRMED' ? 'bg-sky-100 text-sky-800' :
                  booking.status === 'CHECKED_OUT' ? 'bg-slate-200 text-slate-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Khách hàng: <strong>{booking.customer_name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Điện thoại: <strong>{booking.customer_phone}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-slate-400" />
                  <span>Phòng: <strong>Phòng {booking.room_number}</strong> ({booking.room_type_name} - Tầng {booking.floor})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Thời gian: <strong>{booking.check_in_date.split('T')[0]}</strong> đến <strong>{booking.check_out_date.split('T')[0]}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">Tổng tiền</span>
                <span className="text-base font-bold text-slate-900">{formatVnd(booking.total_price_vnd)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

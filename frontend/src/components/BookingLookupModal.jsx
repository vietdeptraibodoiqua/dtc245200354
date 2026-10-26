import React, { useState } from 'react';
import { X, Search, Calendar, Phone, CheckCircle, Clock, Ban, User, Building } from 'lucide-react';

export default function BookingLookupModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/lookup?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Không tìm thấy thông tin đơn đặt phòng khớp với từ khóa.');
      }

      setBooking(data.booking || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Đã xác nhận giữ phòng
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Building className="w-3.5 h-3.5" />
            Đang lưu trú tại khách sạn
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Đã trả phòng hoàn tất
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3.5 h-3.5" />
            Đơn đã bị hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Đang chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        <div className="p-6 bg-[#0B192C] text-white flex items-center justify-between">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block">
              Cổng Dịch Vụ Khách Hàng
            </span>
            <h2 className="font-serif text-2xl font-bold mt-1">
              Tra Cứu Đơn Đặt Phòng
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleLookup} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nhập mã đặt phòng hoặc số điện thoại đăng ký:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ví dụ: BK-1729... hoặc 0912345678"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-950 gold-gradient hover:brightness-105 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Đang tra...' : 'Tra cứu'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              {error}
            </div>
          )}

          {booking && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Mã đơn đặt</span>
                  <span className="font-mono text-base font-bold text-slate-900">{booking.booking_code}</span>
                </div>
                <div>{getStatusBadge(booking.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Khách hàng:</span>
                  <span className="font-bold text-slate-800 text-sm">{booking.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số điện thoại:</span>
                  <span className="font-medium text-slate-800 text-sm">{booking.customer_phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phòng nghỉ:</span>
                  <span className="font-bold text-amber-700 text-sm">
                    Phòng {booking.room_number} ({booking.room_type_name || 'Hạng phòng cao cấp'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tầng:</span>
                  <span className="font-semibold text-slate-800 text-sm">Tầng {booking.floor}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Ngày nhận phòng:</span>
                  <span className="font-semibold text-slate-900">{booking.check_in_date}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ngày trả phòng:</span>
                  <span className="font-semibold text-slate-900">{booking.check_out_date}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-1.5">
                  <span className="font-bold text-slate-800">Tổng thanh toán:</span>
                  <span className="font-bold text-amber-700 text-sm">
                    {Number(booking.total_price).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

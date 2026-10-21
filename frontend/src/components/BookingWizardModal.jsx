import React, { useState } from 'react';
import { X, CheckCircle2, Bed, Calendar, Users, ArrowRight, ShieldCheck, Copy } from 'lucide-react';
import { createBooking } from '../services/api';

export default function BookingWizardModal({ room, searchParams, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [copied, setCopied] = useState(false);

  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    idCard: '',
    email: '',
    address: '',
    specialRequests: ''
  });

  const checkIn = new Date(searchParams.checkInDate);
  const checkOut = new Date(searchParams.checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalPrice = Number(room.base_price_vnd) * nights;

  const formatVnd = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createBooking({
        customer: {
          fullName: customer.fullName,
          phone: customer.phone,
          idCard: customer.idCard,
          email: customer.email,
          address: customer.address
        },
        roomId: room.id,
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        specialRequests: customer.specialRequests
      });

      setConfirmedBooking(result);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (confirmedBooking?.booking_code) {
      navigator.clipboard.writeText(confirmedBooking.booking_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden animate-scale-up">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {step === 3 ? 'Đặt phòng Thành công!' : `Đặt phòng ${room.room_number}`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {step === 1 && 'Bước 1: Xác nhận thông tin phòng & thời gian lưu trú'}
              {step === 2 && 'Bước 2: Nhập thông tin người nhận phòng'}
              {step === 3 && 'Bước 3: Lưu lại mã xác nhận voucher đặt phòng'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Phòng {room.room_number}</span>
                  <span className="text-xs text-slate-500">{room.room_type_name} - Tầng {room.floor}</span>
                </div>
                <span className="text-base font-bold text-slate-900">{formatVnd(room.base_price_vnd)}/đêm</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Nhận phòng: <strong>{searchParams.checkInDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Trả phòng: <strong>{searchParams.checkOutDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Thời gian lưu trú: <strong>{nights} đêm</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Bảo vệ chống trùng lịch 100%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-xs text-slate-500 block">Tổng tiền tạm tính ({nights} đêm)</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">{formatVnd(totalPrice)}</span>
              </div>

              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-sm"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={customer.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="0912345678"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số CCCD / Hộ chiếu *
                </label>
                <input
                  type="text"
                  name="idCard"
                  value={customer.idCard}
                  onChange={handleInputChange}
                  required
                  placeholder="00120100xxxx"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleInputChange}
                  required
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ thường trú
                </label>
                <input
                  type="text"
                  name="address"
                  value={customer.address}
                  onChange={handleInputChange}
                  placeholder="Thành phố / Tỉnh"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yêu cầu đặc biệt (tùy chọn)
                </label>
                <textarea
                  name="specialRequests"
                  value={customer.specialRequests}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Ví dụ: Cần phòng tầng cao, giường không mùi..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Quay lại
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>{loading ? 'Đang xác thực...' : 'Xác nhận đặt phòng'}</span>
              </button>
            </div>
          </form>
        )}

        {step === 3 && confirmedBooking && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Đặt phòng thành công!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Đơn đặt phòng của bạn đã được xác nhận vào hệ thống.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block text-left w-full max-w-md mx-auto space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Mã đặt phòng (Voucher Code)</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                {confirmedBooking.booking_code}
              </div>
              <div className="text-xs text-slate-600 pt-1">
                Phòng: <strong>{room.room_number}</strong> | Tổng tiền: <strong>{formatVnd(confirmedBooking.total_price_vnd)}</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

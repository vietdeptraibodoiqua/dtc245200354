import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, User, Phone, Mail, FileText, CheckCircle2, QrCode, Copy, 
  Printer, ChevronRight, ChevronLeft, ShieldCheck, Check, Sparkles, Loader2,
  CreditCard, Landmark, ExternalLink, ArrowRight, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingWizardModal({ 
  room, 
  initialCheckIn, 
  initialCheckOut, 
  onClose, 
  onBookingSuccess 
}) {
  const [step, setStep] = useState(1);
  const [checkInDate, setCheckInDate] = useState(
    initialCheckIn || new Date().toISOString().split('T')[0]
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialCheckOut || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [customer, setCustomer] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    idNumber: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('SEPAY_GATEWAY');
  const [gatewaySubMethod, setGatewaySubMethod] = useState('CARD');
  const [redirecting, setRedirecting] = useState(false);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const roomPrice = Number(room.base_price_vnd || room.base_price || 0);
  const totalPrice = nights * roomPrice;

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      setError('Vui lòng chọn ngày nhận và trả phòng hợp lệ.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!customer.fullName || !customer.phoneNumber) {
      setError('Vui lòng điền họ tên và số điện thoại của bạn.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        roomId: room.id,
        checkInDate,
        checkOutDate,
        customerName: customer.fullName,
        customerPhone: customer.phoneNumber,
        customerEmail: customer.email || 'khachhang@sunhotel.vn',
        customerIdNumber: customer.idNumber || '',
        notes: customer.notes || ''
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Không thể tạo đơn đặt phòng lúc này.');
      }

      const bookingInfo = resData.data || resData.booking;
      setConfirmedBooking(bookingInfo);
      setIsPaid(bookingInfo.status === 'CONFIRMED' || bookingInfo.status === 'CHECKED_IN');
      setStep(3);
      if (onBookingSuccess) onBookingSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cleanBookingCode = confirmedBooking
    ? (confirmedBooking.booking_code || confirmedBooking.bookingCode || '').replace(/[^a-zA-Z0-9]/g, '')
    : '';

  const handleCopyCode = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVietQrUrl = (code, amount) => {
    const clean = code ? code.replace(/[^a-zA-Z0-9]/g, '') : 'SUNHOTEL';
    return `https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(clean)}&accountName=SUN%20HOTEL%20RESORT`;
  };

  useEffect(() => {
    if (step !== 3 || !confirmedBooking || isPaid) return;

    const bookingCode = confirmedBooking.booking_code || confirmedBooking.bookingCode;
    if (!bookingCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/check/${bookingCode}`);
        const data = await res.json();
        if (data.success && data.data && data.data.paid) {
          setIsPaid(true);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          clearInterval(interval);
        }
      } catch (err) {
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, confirmedBooking, isPaid]);

  const handleRedirectToSepay = async (target = '_self') => {
    const bookingCode = confirmedBooking.booking_code || confirmedBooking.bookingCode;
    if (!bookingCode) return;

    setRedirecting(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode,
          amount: totalPrice,
          paymentMethod: gatewaySubMethod
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Không thể khởi tạo cổng SePay');
      }

      const { checkoutUrl, formFields } = resData.data;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkoutUrl;
      form.target = target;

      Object.entries(formFields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      if (target === '_blank') {
        document.body.removeChild(form);
      }
    } catch (err) {
      alert('Lỗi mở Cổng SePay: ' + err.message);
    } finally {
      setRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        <div className="p-5 bg-[#0B192C] text-white flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block">
              Đặt Phòng Trực Tuyến 5 Sao
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
              Phòng {room.room_number} · {room.room_type_name || room.type_name || 'Deluxe Room'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
              step >= 1 ? 'gold-gradient text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'
            }`}>1</span>
            <span className={step >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}>Thời gian lưu trú</span>
          </div>
          <div className="w-8 h-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
              step >= 2 ? 'gold-gradient text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'
            }`}>2</span>
            <span className={step >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}>Thông tin khách hàng</span>
          </div>
          <div className="w-8 h-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
              step >= 3 ? 'gold-gradient text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'
            }`}>3</span>
            <span className={step >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}>Trang thanh toán</span>
          </div>
        </div>

        <div className="p-6 flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Ngày nhận phòng *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Ngày trả phòng *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Đơn giá niêm yết:</span>
                  <span className="font-semibold text-slate-800">{roomPrice.toLocaleString('vi-VN')} VNĐ / đêm</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Số đêm lưu trú:</span>
                  <span className="font-semibold text-slate-800">{nights} đêm</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Tổng chi phí:</span>
                  <span className="text-amber-700 font-bold">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-950 gold-gradient hover:brightness-105 shadow-md shadow-amber-500/20"
                >
                  <span>Tiếp tục: Thông tin khách</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Họ và tên khách đại diện *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span>Số điện thoại *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={customer.phoneNumber}
                    onChange={(e) => setCustomer({ ...customer, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span>Email nhận xác nhận *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="khachhang@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Số CCCD / Hộ chiếu</span>
                </label>
                <input
                  type="text"
                  placeholder="Dùng để check-in nhanh tại quầy lễ tân"
                  value={customer.idNumber}
                  onChange={(e) => setCustomer({ ...customer, idNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Yêu cầu đặc biệt
                </label>
                <textarea
                  rows="2"
                  placeholder="Tầng cao, phòng yên tĩnh, giường thêm..."
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-950 gold-gradient hover:brightness-105 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo đơn đặt phòng...
                    </span>
                  ) : (
                    <>
                      <span>Tiếp tục: Đến trang thanh toán</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && confirmedBooking && (
            <div className="space-y-5 animate-pop-in">
              {isPaid ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto scale-110 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 block">
                      Giao dịch hoàn tất
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#0B192C] mt-1">
                      Thanh Toán Thành Công!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Hệ thống đã nhận được tiền và xác nhận đặt phòng của Quý khách.
                    </p>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                      <span className="text-slate-600">Mã đặt phòng:</span>
                      <span className="font-mono text-sm font-bold text-emerald-900">
                        {cleanBookingCode}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Phòng đã đặt:</span>
                      <span className="font-semibold text-slate-900">Phòng {room.room_number}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Số tiền đã thanh toán:</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        {totalPrice.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Trạng thái đơn:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        ĐÃ XÁC NHẬN (CONFIRMED)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>In phiếu đặt phòng</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 gold-gradient hover:brightness-105 shadow-md shadow-amber-500/20"
                    >
                      Hoàn tất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Mã đặt phòng:</span>
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          {cleanBookingCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(cleanBookingCode)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors"
                          title="Sao chép mã đơn"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Phòng {room.room_number} · {nights} đêm ({checkInDate} ➔ {checkOutDate})
                      </p>
                    </div>

                    <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">Số tiền cần thanh toán</span>
                      <span className="text-xl font-extrabold text-amber-700 block">
                        {totalPrice.toLocaleString('vi-VN')} VNĐ
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                        <Clock className="w-3 h-3 animate-spin" />
                        Đang chờ thanh toán
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Chọn hình thức thanh toán:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div
                        onClick={() => setSelectedMethod('SEPAY_GATEWAY')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedMethod === 'SEPAY_GATEWAY'
                            ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                            Khuyên dùng
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Cổng Thanh Toán SePay</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Thẻ quốc tế Visa/Mastercard/JCB & Cổng NAPAS (VietQRPay)
                        </p>
                      </div>

                      <div
                        onClick={() => setSelectedMethod('VIETQR_DIRECT')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedMethod === 'VIETQR_DIRECT'
                            ? 'border-amber-600 bg-amber-50/40 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                            Trực tiếp
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">VietQR MB Bank</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Quét mã chuyển tiền nhanh 24/7 trực tiếp qua App ngân hàng
                        </p>
                      </div>
                    </div>

                    {selectedMethod === 'SEPAY_GATEWAY' && (
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-700 block">
                            Phương thức xử lý qua Cổng SePay:
                          </span>
                          <div className="space-y-1.5">
                            <label 
                              onClick={() => setGatewaySubMethod('CARD')}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                gatewaySubMethod === 'CARD'
                                  ? 'border-blue-600 bg-blue-50/50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="gatewaySubMethod" 
                                checked={gatewaySubMethod === 'CARD'} 
                                onChange={() => setGatewaySubMethod('CARD')}
                                className="text-blue-600"
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  Thẻ quốc tế Visa, Mastercard, JCB
                                </span>
                                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">3D Secure</span>
                              </div>
                            </label>

                            <label 
                              onClick={() => setGatewaySubMethod('NAPAS_BANK_TRANSFER')}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                gatewaySubMethod === 'NAPAS_BANK_TRANSFER'
                                  ? 'border-blue-600 bg-blue-50/50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="gatewaySubMethod" 
                                checked={gatewaySubMethod === 'NAPAS_BANK_TRANSFER'} 
                                onChange={() => setGatewaySubMethod('NAPAS_BANK_TRANSFER')}
                                className="text-blue-600"
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <Landmark className="w-4 h-4 text-emerald-600" />
                                  Cổng NAPAS QR (VietQRPay)
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">NAPAS 247</span>
                              </div>
                            </label>

                            <label 
                              onClick={() => setGatewaySubMethod('BANK_TRANSFER')}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                gatewaySubMethod === 'BANK_TRANSFER'
                                  ? 'border-blue-600 bg-blue-50/50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="gatewaySubMethod" 
                                checked={gatewaySubMethod === 'BANK_TRANSFER'} 
                                onChange={() => setGatewaySubMethod('BANK_TRANSFER')}
                                className="text-blue-600"
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <QrCode className="w-4 h-4 text-amber-600" />
                                  VietQR SePay Checkout
                                </span>
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Chuyển khoản</span>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRedirectToSepay('_self')}
                            disabled={redirecting}
                            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {redirecting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                            <span>Chuyển Đến Cổng Thanh Toán SePay ➔</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRedirectToSepay('_blank')}
                            disabled={redirecting}
                            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Mở tab mới</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'VIETQR_DIRECT' && (
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-3">
                        <div className="relative p-2 bg-white rounded-xl border border-slate-200 inline-block overflow-hidden shadow-inner">
                          <img
                            src={getVietQrUrl(cleanBookingCode, totalPrice)}
                            alt="VietQR Sun Hotel"
                            className="w-48 h-auto mx-auto rounded-lg"
                          />
                          <div className="animate-scanline" />
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="font-bold text-slate-800">Ngân hàng Quân Đội (MB Bank)</p>
                          <p className="font-mono text-slate-900 font-semibold">Số tài khoản: 0987654321</p>
                          <p className="text-slate-500 text-[11px]">Chủ tài khoản: SUN HOTEL RESORT</p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-sm mx-auto">
                          <span className="text-[11px] text-amber-900 font-bold block mb-1">
                            NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC):
                          </span>
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono font-extrabold text-base text-amber-950 bg-white px-3 py-1 rounded-lg border border-amber-300 tracking-wider">
                              {cleanBookingCode}
                            </span>
                            <button
                              onClick={() => handleCopyCode(cleanBookingCode)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg bg-amber-200/60 hover:bg-amber-200 transition-colors"
                              title="Sao chép nội dung chuyển khoản"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-amber-800/80 mt-1.5 leading-relaxed">
                            Nội dung chỉ gồm chữ và số, không có ký tự đặc biệt, chuẩn App MB Bank.
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 pt-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span>Đang lắng nghe giao dịch chuyển khoản thời gian thực...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Giao dịch bảo mật qua SePay & MB Bank
                    </span>
                    <button
                      onClick={onClose}
                      className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

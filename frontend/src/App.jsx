import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import RoomSearchBar from './components/RoomSearchBar';
import RoomCard from './components/RoomCard';
import AmenitiesSection from './components/AmenitiesSection';
import ServicesSection from './components/ServicesSection';
import BookingWizardModal from './components/BookingWizardModal';
import BookingLookupModal from './components/BookingLookupModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import Footer from './components/Footer';
import SkeletonLoader from './components/SkeletonLoader';
import Toast from './components/Toast';
import { BedDouble, Sparkles, Filter, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentView, setCurrentView] = useState('guest');
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('sun_hotel_admin_user');
    const token = localStorage.getItem('sun_hotel_admin_token');
    return saved && token ? JSON.parse(saved) : null;
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [searchParams, setSearchParams] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    roomTypeId: '',
    capacity: ''
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/rooms';
      const params = new URLSearchParams();
      if (searchParams.roomTypeId) params.append('roomTypeId', searchParams.roomTypeId);
      if (searchParams.capacity) params.append('capacity', searchParams.capacity);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setRooms(data.data || data.rooms || []);
    } catch (err) {
      setError('Không thể kết nối đến máy chủ API: ' + err.message);
      showToast('Lỗi khi tải danh sách phòng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await fetch('/api/room-types');
      const data = await res.json();
      setRoomTypes(data.data || data.roomTypes || []);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'admin') {
      const token = localStorage.getItem('sun_hotel_admin_token');
      if (token) {
        setCurrentView('admin');
      } else {
        setIsAdminLoginOpen(true);
      }
    }

    const paymentStatus = urlParams.get('payment');
    const paymentCode = urlParams.get('code');
    if (paymentStatus === 'success' && paymentCode) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      showToast(`Thanh toán đơn ${paymentCode} qua Cổng SePay thành công! Phòng đã được xác nhận.`, 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      showToast('Giao dịch thanh toán SePay đã huỷ theo yêu cầu.', 'info');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'error') {
      showToast('Giao dịch thanh toán qua Cổng SePay thất bại.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSearchChange = (field, value) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = () => {
    fetchRooms();
    const target = document.getElementById('rooms-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetSearch = () => {
    setSearchParams({
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      roomTypeId: '',
      capacity: ''
    });
    setTimeout(() => {
      fetch('/api/rooms')
        .then((res) => res.json())
        .then((data) => setRooms(data.data || data.rooms || []));
    }, 50);
  };

  const handleScrollToRooms = () => {
    const el = document.getElementById('rooms-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = (user, token) => {
    setAdminUser(user);
    setCurrentView('admin');
    showToast(`Chào mừng ${user.fullName} trở lại hệ thống PMS!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('sun_hotel_admin_token');
    localStorage.removeItem('sun_hotel_admin_user');
    setAdminUser(null);
    setCurrentView('guest');
    showToast('Đã đăng xuất khỏi phiên quản trị PMS.', 'info');
  };

  const handleOpenAdmin = () => {
    if (adminUser) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  if (currentView === 'admin' && adminUser) {
    return (
      <AdminDashboard 
        onSwitchToGuest={() => setCurrentView('guest')} 
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenAdminLogin={handleOpenAdmin}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <HeroSection onExploreRooms={handleScrollToRooms} />

        <RoomSearchBar
          roomTypes={roomTypes}
          searchParams={searchParams}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onReset={handleResetSearch}
        />

        <section id="rooms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Tuyển Tập Không Gian Nghỉ Dưỡng</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C] tracking-tight">
                Danh Sách Buồng Phòng & Suites
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
                Lựa chọn từ các hạng phòng hiện đại đến Suite Tổng Thống với tiện ích cao cấp, ban công thoáng đãng ngắm trọn cảnh quan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tìm thấy <strong>{rooms.length}</strong> phòng
              </span>
              <button
                onClick={fetchRooms}
                disabled={loading}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Làm mới danh sách phòng"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={6} />
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800 max-w-lg mx-auto">
              <p className="font-bold text-base">{error}</p>
              <button
                onClick={fetchRooms}
                className="mt-4 px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <BedDouble className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Không tìm thấy phòng phù hợp</h3>
              <p className="text-xs text-slate-500">
                Hãy thử điều chỉnh lại bộ lọc số lượng khách hoặc hạng phòng để xem các lựa chọn khác.
              </p>
              <button
                onClick={handleResetSearch}
                className="px-6 py-2.5 rounded-xl text-xs font-bold gold-gradient text-slate-950 shadow-md cursor-pointer"
              >
                Xem tất cả các phòng
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBook={(rm) => setSelectedRoom(rm)}
                />
              ))}
            </div>
          )}
        </section>

        <AmenitiesSection />
        <ServicesSection />
      </main>

      <Footer />

      {selectedRoom && (
        <BookingWizardModal
          room={selectedRoom}
          initialCheckIn={searchParams.checkInDate}
          initialCheckOut={searchParams.checkOutDate}
          onClose={() => setSelectedRoom(null)}
          onBookingSuccess={() => {
            fetchRooms();
            showToast('Đặt phòng thành công! Vui lòng quét mã VietQR để thanh toán.', 'success');
          }}
        />
      )}

      {isLookupOpen && (
        <BookingLookupModal onClose={() => setIsLookupOpen(false)} />
      )}

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

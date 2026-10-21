import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RoomSearchBar from './components/RoomSearchBar';
import RoomCard from './components/RoomCard';
import BookingWizardModal from './components/BookingWizardModal';
import BookingLookupModal from './components/BookingLookupModal';
import AdminDashboard from './components/AdminDashboard';
import SkeletonLoader from './components/SkeletonLoader';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import { fetchRoomTypes, searchRooms } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('guest');
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [searchParams, setSearchParams] = useState({
    checkInDate: today,
    checkOutDate: tomorrow,
    capacityAdults: '2',
    roomTypeId: ''
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const loadRoomTypes = async () => {
    try {
      const data = await fetchRoomTypes();
      setRoomTypes(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSearchRooms = async () => {
    setLoading(true);
    try {
      const data = await searchRooms(searchParams);
      setRooms(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
    handleSearchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-900 selection:text-white">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'guest' && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tìm kiếm & Đặt phòng Khách sạn</h1>
              <p className="text-sm text-slate-600 mt-1">
                Lựa chọn không gian nghỉ dưỡng chuẩn 5 sao với giá ưu đãi tốt nhất
              </p>
            </div>

            <RoomSearchBar
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              roomTypes={roomTypes}
              onSearch={handleSearchRooms}
              loading={loading}
            />

            {loading ? (
              <SkeletonLoader count={6} />
            ) : rooms.length === 0 ? (
              <EmptyState
                title="Không tìm thấy phòng phù hợp"
                description="Tất cả các phòng trong khoảng ngày này đã kín chỗ hoặc đang được bảo dưỡng. Vui lòng chọn khoảng ngày khác."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelectRoom={(r) => setSelectedRoom(r)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'admin' && (
          <AdminDashboard onShowToast={showToast} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-800">
            Hệ thống Đặt phòng Khách sạn (Hotel Booking System) - Đề tài 6
          </p>
          <p className="mt-1">
            Sinh viên thực hiện: <span className="font-medium text-slate-900">Lường Minh Hiếu</span> | MSSV: <span className="font-medium text-slate-900">DTC245200853</span> | ICTU
          </p>
        </div>
      </footer>

      {selectedRoom && (
        <BookingWizardModal
          room={selectedRoom}
          searchParams={searchParams}
          onClose={() => setSelectedRoom(null)}
          onSuccess={() => {
            showToast('Đặt phòng thành công! Voucher đã được ghi nhận', 'success');
            handleSearchRooms();
          }}
        />
      )}

      {isLookupOpen && (
        <BookingLookupModal onClose={() => setIsLookupOpen(false)} />
      )}

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

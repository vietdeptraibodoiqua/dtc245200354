import React from 'react';
import { Calendar, Users, Filter, Search } from 'lucide-react';

export default function RoomSearchBar({
  searchParams,
  setSearchParams,
  roomTypes,
  onSearch,
  loading
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Ngày nhận phòng</span>
          </label>
          <input
            type="date"
            name="checkInDate"
            value={searchParams.checkInDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Ngày trả phòng</span>
          </label>
          <input
            type="date"
            name="checkOutDate"
            value={searchParams.checkOutDate}
            onChange={handleChange}
            min={searchParams.checkInDate || new Date().toISOString().split('T')[0]}
            required
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Số khách</span>
          </label>
          <select
            name="capacityAdults"
            value={searchParams.capacityAdults}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="1">1 Người lớn</option>
            <option value="2">2 Người lớn</option>
            <option value="3">3 Người lớn</option>
            <option value="4">4+ Người lớn</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Hạng phòng</span>
          </label>
          <select
            name="roomTypeId"
            value={searchParams.roomTypeId}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">Tất cả hạng phòng</option>
            {roomTypes.map(rt => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Đang tìm...' : 'Tìm phòng'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

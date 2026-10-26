import React from 'react';
import { Calendar, Users, Filter, Search, RotateCcw } from 'lucide-react';

export default function RoomSearchBar({ 
  roomTypes = [], 
  searchParams, 
  onSearchChange, 
  onSearchSubmit, 
  onReset 
}) {
  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-10 sm:-mt-14 mb-16">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 p-4 sm:p-6 backdrop-blur-md">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Ngày nhận phòng</span>
            </label>
            <input 
              type="date"
              value={searchParams.checkInDate || ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => onSearchChange('checkInDate', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Ngày trả phòng</span>
            </label>
            <input 
              type="date"
              value={searchParams.checkOutDate || ''}
              min={searchParams.checkInDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => onSearchChange('checkOutDate', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Hạng phòng</span>
            </label>
            <select
              value={searchParams.roomTypeId || ''}
              onChange={(e) => onSearchChange('roomTypeId', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="">Tất cả hạng phòng</option>
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} (Tối đa {type.capacity} người)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Số lượng khách</span>
            </label>
            <select
              value={searchParams.capacity || ''}
              onChange={(e) => onSearchChange('capacity', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="">Bất kỳ số khách</option>
              <option value="1">1 Khách (Phòng Đơn)</option>
              <option value="2">2 Khách (Phòng Đôi)</option>
              <option value="3">3 Khách (Suite / Gia đình)</option>
              <option value="4">4+ Khách (Gia đình lớn)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 gold-gradient hover:brightness-105 shadow-md shadow-amber-500/20 transition-all h-[42px]"
            >
              <Search className="w-4 h-4" />
              <span>Tìm phòng</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              title="Đặt lại bộ lọc"
              className="w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

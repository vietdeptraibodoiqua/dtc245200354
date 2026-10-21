import React from 'react';
import { Users, Bed, Check, Sparkles } from 'lucide-react';

export default function RoomCard({ room, onSelectRoom }) {
  const formatVnd = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const amenities = Array.isArray(room.amenities) ? room.amenities : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col group">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {room.room_type_name}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 z-20 text-white">
          <span className="text-xl font-bold tracking-tight">Phòng {room.room_number}</span>
          <span className="text-xs text-slate-200 block">Tầng {room.floor}</span>
        </div>
        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
          <Bed className="w-16 h-16 text-slate-700 group-hover:scale-105 transition-transform duration-300" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 mb-3">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Tối đa {room.capacity_adults} người lớn, {room.capacity_children} trẻ em
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities.slice(0, 4).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                {amenity}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="px-1.5 py-0.5 text-xs text-slate-500">
                +{amenities.length - 4} tiện ích
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Giá mỗi đêm</span>
            <span className="text-lg font-bold text-slate-900">
              {formatVnd(room.base_price_vnd)}
            </span>
          </div>

          <button
            onClick={() => onSelectRoom(room)}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            Đặt phòng
          </button>
        </div>
      </div>
    </div>
  );
}

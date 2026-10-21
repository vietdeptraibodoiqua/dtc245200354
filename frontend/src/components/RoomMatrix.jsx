import React from 'react';
import { Bed, User, Wrench } from 'lucide-react';

export default function RoomMatrix({ floorMatrix, onUpdateRoomStatus }) {
  const statusStyles = {
    AVAILABLE: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    OCCUPIED: 'bg-rose-50 border-rose-200 text-rose-900',
    MAINTENANCE: 'bg-amber-50 border-amber-200 text-amber-900',
    CLEANING: 'bg-sky-50 border-sky-200 text-sky-900'
  };

  const statusLabels = {
    AVAILABLE: 'Trống',
    OCCUPIED: 'Đang ở',
    MAINTENANCE: 'Bảo dưỡng',
    CLEANING: 'Đang dọn'
  };

  const floors = Object.keys(floorMatrix || {}).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-6">
      {floors.map(floor => (
        <div key={floor} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              Tầng {floor}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {(floorMatrix[floor] || []).length} phòng
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(floorMatrix[floor] || []).map(room => (
              <div
                key={room.id}
                className={`p-3.5 rounded-lg border transition-all ${statusStyles[room.status] || 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">{room.room_number}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/80 shadow-xs">
                    {statusLabels[room.status] || room.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 mb-3">
                  <div className="font-medium text-slate-600 truncate">{room.room_type_name}</div>
                  {room.guest_name && (
                    <div className="flex items-center gap-1 font-semibold text-rose-800 truncate">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{room.guest_name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                  <select
                    value={room.status}
                    onChange={(e) => onUpdateRoomStatus(room.id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang ở</option>
                    <option value="MAINTENANCE">Bảo dưỡng</option>
                    <option value="CLEANING">Đang dọn</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

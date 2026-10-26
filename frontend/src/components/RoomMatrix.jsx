import React from 'react';
import { Bed, Sparkles, Check, AlertTriangle, Layers } from 'lucide-react';

export default function RoomMatrix({ rooms = [], onSelectRoom, onToggleStatus }) {
  const floors = [4, 3, 2, 1];

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20';
      case 'BOOKED':
      case 'OCCUPIED':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700 hover:bg-blue-500/20';
      case 'MAINTENANCE':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/20';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500';
      case 'BOOKED':
      case 'OCCUPIED':
        return 'bg-blue-500';
      case 'MAINTENANCE':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
            Hệ Thống Phân Phối Buồng Phòng
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#0B192C]">
            Sơ Đồ Ma Trận Phòng (Room Matrix)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-700">Trống sẵn sàng</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-700">Đang có khách</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-700">Bảo trì / Dọn dẹp</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {floors.map((floorNum) => {
          const floorRooms = rooms.filter((r) => Number(r.floor) === floorNum);
          if (floorRooms.length === 0) return null;

          return (
            <div key={floorNum} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Tầng {floorNum} ({floorRooms.length} phòng)</span>
                <div className="flex-1 h-px bg-slate-100 ml-2" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {floorRooms.map((room) => {
                  const colorClass = getStatusColor(room.status);
                  const dotColor = getStatusDot(room.status);
                  const isAvailable = room.status === 'AVAILABLE';

                  return (
                    <div
                      key={room.id}
                      onClick={() => onSelectRoom && onSelectRoom(room)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${colorClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold text-slate-900">
                          {room.room_number}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-700 block truncate">
                          {room.type_name}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {Number(room.base_price).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] font-medium text-slate-600">
                          {isAvailable ? 'Sẵn sàng' : room.status === 'MAINTENANCE' ? 'Đang dọn' : 'Có khách'}
                        </span>
                        {onToggleStatus && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(room.id, isAvailable ? 'MAINTENANCE' : 'AVAILABLE');
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                            title="Đổi trạng thái dọn phòng"
                          >
                            Đổi
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

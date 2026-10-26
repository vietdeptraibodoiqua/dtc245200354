import React from 'react';
import { Users, Maximize, Wifi, Tv, Coffee, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RoomCard({ room, onBook }) {
  const getRoomImage = (typeId, code) => {
    const id = Number(typeId);
    if (id === 5 || code === 'PRS') return '/images/rooms/prs.jpg';
    if (id === 4 || code === 'SUT') return '/images/rooms/sut.jpg';
    if (id === 3 || code === 'DLX') return '/images/rooms/dlx.jpg';
    if (id === 2 || code === 'SUP') return '/images/rooms/sup.jpg';
    return '/images/rooms/std.jpg';
  };

  const isAvailable = room.status === 'AVAILABLE';
  const price = Number(room.base_price_vnd || room.base_price || 850000);
  const typeName = room.room_type_name || room.type_name || 'Phòng Cao Cấp';
  const description = room.description || room.type_description || 'Không gian nghỉ dưỡng sang trọng, tiện nghi cao cấp tiêu chuẩn 5 sao quốc tế.';
  const capacity = room.capacity_adults || room.capacity || 2;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md card-hover-lift flex flex-col group">
      <div className="relative h-60 overflow-hidden bg-slate-900">
        <img 
          src={room.image_url || getRoomImage(room.room_type_id, room.room_type_code)}
          alt={`Phòng ${room.room_number}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B192C]/90 text-amber-300 backdrop-blur-md border border-amber-500/30">
            Tầng {room.floor} · Phòng {room.room_number}
          </span>
          {(Number(room.room_type_id) >= 4 || room.room_type_code === 'SUT' || room.room_type_code === 'PRS') && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold gold-gradient text-slate-950 flex items-center gap-1 shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Suite</span>
            </span>
          )}
        </div>

        <div className="absolute top-3.5 right-3.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 ${
            isAvailable 
              ? 'bg-emerald-600/90 text-white' 
              : 'bg-rose-600/90 text-white'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-300 animate-pulse' : 'bg-rose-300'}`} />
            <span>{isAvailable ? 'Sẵn sàng đón khách' : 'Đang phục vụ'}</span>
          </span>
        </div>

        <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold block">
              {typeName}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
              Phòng {room.room_number}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-300 block font-light uppercase tracking-wider">Giá mỗi đêm</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-amber-400">
              {price.toLocaleString('vi-VN')}
              <span className="text-xs font-sans text-slate-300 ml-1">VNĐ</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Sức chứa: <strong>{capacity} khách</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Diện tích: <strong>{capacity > 2 ? '65' : '42'} m²</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Wifi 6 Siêu Tốc</span>
            </div>
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Smart TV 4K</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200/60">
              <Coffee className="w-3 h-3 text-amber-600" />
              Buffet sáng 5 sao
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Hồ bơi vô cực
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Bồn tắm thư giãn
            </span>
          </div>
        </div>

        <button
          onClick={() => onBook(room)}
          disabled={!isAvailable}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isAvailable
              ? 'gold-gradient text-slate-950 hover:brightness-105 shadow-md shadow-amber-500/20 active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{isAvailable ? 'Đặt Phòng Ngay' : 'Phòng Đang Phục Vụ'}</span>
          {isAvailable && <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

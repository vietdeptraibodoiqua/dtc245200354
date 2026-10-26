import React from 'react';
import { Sun, MapPin, Phone, Mail, Award, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#091524] text-white border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-slate-950 font-bold">
                <Sun className="w-6 h-6" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                Sun Hotel <span className="text-amber-400 font-sans text-xs uppercase tracking-widest font-semibold ml-1">& Resort</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Khu nghỉ dưỡng 5 sao tiêu chuẩn quốc tế với dịch vụ quản gia cao cấp, ẩm thực Michelin và hồ bơi vô cực ngắm hoàng hôn.
            </p>
            <div className="pt-2">
              <img 
                src="/images/hotel-assets/about/lobby.png" 
                alt="Sun Hotel Luxury Lobby" 
                className="w-full max-w-[260px] h-32 object-cover rounded-2xl border border-white/10 opacity-90 shadow-md"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-amber-400">Liên Hệ Đặt Phòng</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Số 123 Đại lộ Hoàng Gia, Bãi Dài, Vịnh Hạ Long, Quảng Ninh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Hotline: (+84) 280 3846 999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Email: contact@sunhotel.noveratech.digital</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-amber-400">Tiện Ích & Dịch Vụ</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>• Bể bơi vô cực ngắm hoàng hôn</li>
              <li>• Zen Spa & Thảo dược phục hồi</li>
              <li>• Nhà hàng hải sản Fine Dining</li>
              <li>• Phòng VIP Tổng Thống Panorama</li>
              <li>• Đưa đón Limousine sân bay</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-amber-400">Thông Tin Học Phần</h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
              <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wider">
                Đề tài số 06 · Hệ thống Khách sạn
              </span>
              <p>Học phần: Triển khai & Quản trị Hệ thống Phần mềm</p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-slate-400 block text-[10px]">Sinh viên thực hiện:</span>
                <span className="font-bold text-white text-sm block">Nguyễn Hoàng Việt</span>
                <span className="text-amber-400 font-mono text-[11px]">Mã SV: DTC245200384</span>
                <span className="text-slate-400 block text-[10px]">Trường ĐH Công nghệ Thông tin & Truyền thông (ICTU)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Sun Hotel & Luxury Resort. Bản quyền thuộc về Nguyễn Hoàng Việt (DTC245200384).</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>PostgreSQL ACID 3NF</span>
            <span>•</span>
            <span>Prometheus RED Metrics</span>
            <span>•</span>
            <span>Loki LogQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

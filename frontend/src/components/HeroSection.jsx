import React from 'react';
import { Star, Shield, Award, Clock, ArrowRight } from 'lucide-react';

export default function HeroSection({ onExploreRooms }) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/custom/hero_sunset.jpg" 
          alt="Sun Hotel & Luxury Resort"
          className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
          onError={(e) => {
            e.target.src = '/images/hotel-assets/hero/luxury-resort-hero.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#091524]/95 via-[#0F2540]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091524] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              <span className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </span>
              <span>Khu Nghỉ Dưỡng 5 Sao Quốc Tế</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15]">
              Trải Nghiệm Kỳ Nghỉ <br />
              <span className="gold-text-gradient">Đẳng Cấp Thượng Lưu</span> Tại Sun Hotel
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl font-light leading-relaxed">
              Tận hưởng không gian nghỉ dưỡng biệt lập với bãi biển cát trắng riêng biệt, hồ bơi vô cực ngắm hoàng hôn triệu đô, ẩm thực chuẩn sao Michelin và dịch vụ quản gia 24/7 chu đáo.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={onExploreRooms}
                className="flex items-center gap-3 px-7 py-3.5 rounded-xl font-bold text-slate-950 gold-gradient hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-1"
              >
                <span>Khám phá phòng nghỉ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#amenities-section"
                className="px-6 py-3.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all transform hover:-translate-y-1"
              >
                Xem tiện ích resort
              </a>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center gap-8 text-slate-300 text-xs">
              <div>
                <span className="font-serif text-2xl font-bold text-white block">100%</span>
                <span>View biển & Sân vườn</span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div>
                <span className="font-serif text-2xl font-bold text-amber-400 block">4.9/5</span>
                <span>Hơn 1.200 đánh giá</span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div>
                <span className="font-serif text-2xl font-bold text-white block">24/7</span>
                <span>Hỗ trợ nhận phòng</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-panel p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-amber-400 text-xs uppercase tracking-widest font-semibold block">Đặc Quyền Nghỉ Dưỡng</span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">Dịch Vụ Tiêu Chuẩn 5 Sao</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Quản gia & Phục vụ 24/7</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Hỗ trợ nhận phòng tức thì, dọn phòng linh hoạt theo yêu cầu của khách.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Ẩm Thực Đỉnh Cao Michelin</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Thưởng thức hải sản tươi sống và set menu Á-Âu thượng hạng.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Bảo Đảm Giữ Phòng Tuyệt Đối</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Khóa giao dịch cơ sở dữ liệu thời gian thực, chống overbooking 100%.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

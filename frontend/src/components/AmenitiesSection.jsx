import React from 'react';
import { Waves, Sparkles, Dumbbell, Users } from 'lucide-react';

export default function AmenitiesSection() {
  const amenities = [
    {
      title: 'Hồ Bơi Vô Cực Trên Cao',
      desc: 'Ngắm nhìn toàn cảnh vịnh biển trong làn nước xanh mát, phục vụ cocktail và mocktail giải nhiệt cả ngày.',
      image: '/images/hotel-assets/amenities/pool.png',
      icon: Waves,
      tag: 'Điểm nhấn'
    },
    {
      title: 'Zen Spa & Trị Liệu Thảo Dược',
      desc: 'Phục hồi năng lượng với các liệu trình massage truyền thống, xông hơi đá muối Himalaya và bồn ngâm thảo mộc.',
      image: '/images/hotel-assets/amenities/spa.png',
      icon: Sparkles,
      tag: 'Thư giãn'
    },
    {
      title: 'Trung Tâm Thể Hình Hiện Đại',
      desc: 'Trang thiết bị tập luyện chuẩn quốc tế Technogym, mở cửa 24/7 cùng huấn luyện viên cá nhân theo yêu cầu.',
      image: '/images/hotel-assets/amenities/gym.png',
      icon: Dumbbell,
      tag: 'Sức khỏe'
    },
    {
      title: 'Trung Tâm Hội Nghị & Tiệc Cưới',
      desc: 'Không gian tổ chức sự kiện trang trọng với sức chứa lên tới 500 khách cùng hệ thống âm thanh, ánh sáng hiện đại.',
      image: '/images/hotel-assets/amenities/conference-room.png',
      icon: Users,
      tag: 'Sự kiện'
    }
  ];

  return (
    <section id="amenities-section" className="py-24 bg-[#091524] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block">
            Tiện Nghi Nghỉ Dưỡng Thượng Hạng
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Khoảnh Khắc Thư Thái Tuyệt Đối
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Mỗi góc của Sun Hotel & Resort đều được kiến tạo tỉ mỉ để mang đến trải nghiệm nghỉ dưỡng hoàn hảo và tiện nghi trọn vẹn nhất cho bạn và gia đình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {amenities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="group rounded-3xl overflow-hidden glass-panel hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0B192C]/80 text-amber-300 border border-white/10 backdrop-blur-md">
                    {item.tag}
                  </div>
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl gold-gradient text-slate-950 flex items-center justify-center shadow-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-2">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

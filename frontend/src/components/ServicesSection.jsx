import React from 'react';
import { Utensils, Coffee, Car, Shirt } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      title: 'Nhà Hàng Fine Dining Michelin',
      desc: 'Trải nghiệm phong cách ẩm thực đỉnh cao với hải sản tươi ngon, bò Wagyu hảo hạng và danh mục rượu vang thượng hạng bên ánh hoàng hôn.',
      image: '/images/custom/luxury_dining.jpg',
      icon: Utensils,
      badge: 'Ẩm thực cao cấp'
    },
    {
      title: 'Buffet Sáng Quốc Tế Đa Vị',
      desc: 'Hơn 80 món ăn Á - Âu phong phú, các loại bánh ngọt nướng tươi mỗi sáng và quầy cafe pha chế trực tiếp phục vụ miễn phí cho khách lưu trú.',
      image: '/images/hotel-assets/services/breakfast-buffet.png',
      icon: Coffee,
      badge: 'Miễn phí mỗi sáng'
    },
    {
      title: 'Xe Đưa Đón Sân Bay Riêng Biệt',
      desc: 'Đội xe Mercedes-Benz & Limousine đưa đón tận nơi từ sân bay với tài xế chuyên nghiệp, chu đáo và lịch thiệp.',
      image: '/images/hotel-assets/services/airport-shuttle.png',
      icon: Car,
      badge: 'Dịch vụ VIP'
    },
    {
      title: 'Giặt Là & Chăm Sóc Trang Phục',
      desc: 'Dịch vụ giặt khô, là hơi cao cấp đảm bảo giữ gìn tối đa chất liệu trang phục quý khách, giao nhận tận phòng trong vòng 3 giờ.',
      image: '/images/hotel-assets/services/laundry.png',
      icon: Shirt,
      badge: 'Tận phòng 24/7'
    }
  ];

  return (
    <section id="services-section" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-amber-600 text-xs font-bold uppercase tracking-widest block">
            Dịch Vụ & Ẩm Thực Tinh Hoa
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C] tracking-tight">
            Nâng Tầm Trải Nghiệm Khách Hàng
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Chúng tôi chăm chút từng chi tiết nhỏ nhất trong suốt hành trình lưu trú của bạn, từ hương vị món ăn đến phương tiện di chuyển sang trọng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img 
                    src={svc.image} 
                    alt={svc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/images/hotel-assets/services/restaurant.png';
                    }}
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0B192C]/90 text-amber-300 backdrop-blur-md">
                    {svc.badge}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                      {svc.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

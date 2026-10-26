import React from 'react';
import { Sun, Search, ShieldCheck, Compass, LogOut, UserCheck } from 'lucide-react';

export default function Header({ 
  currentView, 
  setCurrentView, 
  onOpenLookup, 
  onOpenAdminLogin,
  adminUser,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B192C]/95 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            onClick={() => setCurrentView('guest')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              <Sun className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white block leading-none">
                Sun Hotel <span className="text-amber-400 font-sans text-xs uppercase tracking-widest font-semibold ml-1">& Resort</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                5-Star Luxury Hospitality · Nguyễn Hoàng Việt
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            <button 
              onClick={() => {
                setCurrentView('guest');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${currentView === 'guest' ? 'text-amber-400' : 'text-slate-300 hover:text-white'}`}
            >
              Trang chủ
            </button>
            <a 
              href="#rooms-section"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-amber-400 transition-colors"
            >
              Phòng nghỉ
            </a>
            <a 
              href="#amenities-section"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-amber-400 transition-colors"
            >
              Tiện nghi
            </a>
            <a 
              href="#services-section"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-amber-400 transition-colors"
            >
              Dịch vụ & Ẩm thực
            </a>
            <button
              onClick={onOpenLookup}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              Tra cứu đơn
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {adminUser ? (
              <div className="flex items-center gap-2">
                {currentView === 'guest' ? (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 gold-gradient hover:brightness-105 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Quản Trị PMS</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView('guest')}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Xem Cổng Khách</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  title="Đăng xuất quản trị"
                  className="w-8 h-8 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 gold-gradient hover:brightness-105 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản Trị PMS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

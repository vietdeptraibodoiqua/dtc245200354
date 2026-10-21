import React from 'react';
import { Hotel, Search, LayoutDashboard } from 'lucide-react';

export default function Header({ currentTab, setCurrentTab, onOpenLookup }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('guest')}>
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Hotel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">NOVERA LUXURY</span>
              <span className="text-xs text-slate-500 block font-medium -mt-1">Hệ thống Đặt phòng Khách sạn</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setCurrentTab('guest')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  currentTab === 'guest'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Đặt phòng</span>
              </button>
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  currentTab === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Quản trị viên</span>
              </button>
            </nav>

            <button
              onClick={onOpenLookup}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Tra cứu đơn</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

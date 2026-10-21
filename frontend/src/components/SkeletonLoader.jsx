import React from 'react';

export default function SkeletonLoader({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
          <div className="h-48 bg-slate-200" />
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-1/4" />
            </div>
            <div className="h-5 bg-slate-200 rounded w-2/3" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-4/5" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-slate-100 rounded-full w-16" />
              <div className="h-6 bg-slate-100 rounded-full w-20" />
              <div className="h-6 bg-slate-100 rounded-full w-14" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-9 bg-slate-200 rounded-lg w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

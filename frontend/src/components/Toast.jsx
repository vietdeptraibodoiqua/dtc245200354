import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    error: 'bg-rose-50 text-rose-900 border-rose-200',
    info: 'bg-sky-50 text-sky-900 border-sky-200'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgStyles[type] || bgStyles.info}`}>
        {icons[type] || icons.info}
        <span className="text-sm font-medium pr-2">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black/5 transition-colors ml-auto focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>
    </div>
  );
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
    warning: (message: string) => addToast('warning', message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let icon = <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />;
          let borderAccent = 'border-l-4 border-l-[#10B981]';
          if (t.type === 'error') {
            icon = <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />;
            borderAccent = 'border-l-4 border-l-[#EF4444]';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />;
            borderAccent = 'border-l-4 border-l-[#F59E0B]';
          } else if (t.type === 'info') {
            icon = <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />;
            borderAccent = 'border-l-4 border-l-[#3B82F6]';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-white border border-[#D9D9D9] ${borderAccent} p-3.5 shadow-lg flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-200`}
            >
              <div className="mt-0.5">{icon}</div>
              <p className="text-xs font-medium text-[#0A0A0A] flex-1 leading-relaxed">
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-neutral-400 hover:text-black p-0.5"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

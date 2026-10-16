import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
  isAIPanel?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
  isAIPanel = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthMap = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`relative w-full ${widthMap[width]} bg-white border-l border-neutral-200 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200`}
      >
        {/* Header */}
        <div className={`p-6 border-b border-[#E5E5E5] flex items-center justify-between ${isAIPanel ? 'bg-[#FFF1EB]' : 'bg-white'}`}>
          <div className="flex items-center gap-2.5">
            {isAIPanel && (
              <div className="w-8 h-8 rounded-full bg-[#FF5A1F] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#0A0A0A]">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#4A4A4A] mt-0.5 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors text-neutral-500 hover:text-black hover:bg-neutral-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

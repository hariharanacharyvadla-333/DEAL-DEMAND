import React from 'react';

interface StatusDotProps {
  status?: 'active' | 'pending' | 'urgent' | 'idle' | 'success' | 'warning';
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'active',
  pulse = true,
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const colorMap = {
    active: 'bg-[#10B981] led-glow-green',
    success: 'bg-[#10B981] led-glow-green',
    pending: 'bg-[#FF5A1F] led-glow-orange',
    warning: 'bg-[#FF5A1F] led-glow-orange',
    urgent: 'bg-[#E1251B] led-glow-red',
    idle: 'bg-neutral-400',
  };

  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
            colorMap[status].split(' ')[0]
          }`}
        />
      )}
      <span className={`relative inline-full rounded-full rounded-full ${sizeMap[size]} ${colorMap[status]}`} />
    </span>
  );
};

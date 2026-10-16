import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const variantStyles = {
    rect: 'rounded-nothing-sm',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      className={`animate-pulse bg-neutral-200/70 border border-neutral-300/40 ${variantStyles[variant]} ${className}`}
    />
  );
};

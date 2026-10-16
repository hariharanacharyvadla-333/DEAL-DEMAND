import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'outline' | 'interactive';
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  glow = false,
  className = '',
  ...props
}) => {
  const baseStyles = "rounded-nothing border transition-all duration-200 overflow-hidden";
  
  const variantStyles = {
    default: "bg-white border-[#D9D9D9] text-[#0A0A0A] shadow-xs",
    surface: "bg-white border-[#E5E5E5] text-[#0A0A0A] shadow-sm",
    outline: "bg-transparent border-[#E5E5E5] text-[#0A0A0A]",
    interactive: "bg-white border-[#D9D9D9] hover:border-[#0A0A0A] hover:shadow-nothing-hover cursor-pointer",
  };

  const glowStyle = glow ? "border-[#FF5A1F] shadow-glyph" : "";

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${glowStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

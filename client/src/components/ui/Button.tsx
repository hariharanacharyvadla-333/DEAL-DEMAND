import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'orange' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const sizeStyles = {
    sm: "px-4 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3 text-base gap-2.5",
  };

  const variantStyles = {
    primary: "bg-[#0A0A0A] text-[#FFFFFF] hover:bg-neutral-800 focus:ring-neutral-900 border border-[#0A0A0A]",
    secondary: "bg-white text-[#0A0A0A] hover:bg-neutral-50 border border-[#D9D9D9] shadow-2xs focus:ring-neutral-400",
    outline: "bg-transparent text-[#0A0A0A] border border-[#D9D9D9] hover:border-[#0A0A0A] hover:bg-neutral-50 focus:ring-neutral-400",
    orange: "bg-[#FF5A1F] text-[#FFFFFF] hover:bg-[#E04810] focus:ring-[#FF5A1F] shadow-sm",
    danger: "bg-[#E1251B] text-[#FFFFFF] hover:bg-[#C51A11] focus:ring-[#E1251B]",
    ghost: "bg-transparent text-[#0A0A0A] hover:bg-neutral-100",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase font-mono tracking-wider">Processing...</span>
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

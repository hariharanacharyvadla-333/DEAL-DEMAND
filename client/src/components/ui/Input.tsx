import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, prefixIcon, suffix, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">
            {label}
            {props.required && <span className="text-[#E1251B] ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#4A4A4A]">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-white border ${
              error ? 'border-[#E1251B] focus:ring-[#E1251B]' : 'border-[#D9D9D9] focus:border-[#0A0A0A]'
            } rounded-nothing-sm py-2.5 ${
              prefixIcon ? 'pl-10' : 'pl-3.5'
            } ${suffix ? 'pr-12' : 'pr-3.5'} text-sm text-[#0A0A0A] placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-black transition-all ${className}`}
            {...props}
          />
          {suffix && <div className="absolute right-3.5 flex items-center text-xs font-mono text-[#4A4A4A]">{suffix}</div>}
        </div>
        {error && <p className="mt-1.5 text-xs text-[#E1251B] font-semibold">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-xs text-[#4A4A4A]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

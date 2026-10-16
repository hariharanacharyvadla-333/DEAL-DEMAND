import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
            {label}
            {props.required && <span className="text-alert ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-white border ${
            error ? 'border-alert' : 'border-neutral-200 focus:border-[#0A0A0A]'
          } rounded-nothing-sm py-2.5 px-3.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-alert font-mono">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

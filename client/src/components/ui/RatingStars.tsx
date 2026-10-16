import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number; // 0 to 5
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = true,
  size = 'md',
  showNumber = false,
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(value);
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              className={`p-0.5 focus:outline-none transition-transform ${
                readOnly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'
              }`}
            >
              <Star
                className={`${sizeMap[size]} ${
                  isFilled
                    ? 'text-[#FF5A1F] fill-[#FF5A1F]'
                    : 'text-neutral-300 fill-neutral-100'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="font-mono text-xs font-semibold text-neutral-800 ml-0.5">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

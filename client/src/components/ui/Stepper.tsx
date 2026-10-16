import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
  onStepClick?: (stepIndex: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-200 z-0" />
        
        {/* Active track line */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-[#0A0A0A] transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={label}
              className="relative z-10 flex flex-col items-center cursor-pointer group"
              onClick={() => onStepClick && isDone && onStepClick(stepNum)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 border-2 ${
                  isDone
                    ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                    : isCurrent
                    ? 'bg-white border-[#FF5A1F] text-[#FF5A1F] shadow-sm ring-4 ring-[#FFF1EB]'
                    : 'bg-white border-neutral-300 text-[#6B6B6B] group-hover:border-neutral-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : `0${stepNum}`}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCurrent ? 'text-[#0A0A0A]' : isDone ? 'text-[#2A2A2A]' : 'text-[#6B6B6B]'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

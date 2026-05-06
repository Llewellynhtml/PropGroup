import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted px-1">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      
      <div className="relative h-1.5 w-full bg-brand-border rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="absolute inset-0 bg-brand-teal rounded-full"
        />
      </div>

      <div className="flex items-center justify-between w-full relative px-1">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 z-10",
                  isCompleted ? "bg-brand-teal border-brand-teal text-white" : 
                  isActive ? "bg-white border-brand-teal text-brand-teal shadow-lg shadow-brand-teal/10" : 
                  "bg-white border-brand-border text-brand-muted"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : stepNumber}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { cn } from '../../lib/utils';

interface PasswordStrengthMeterProps {
  password?: string;
}

export default function PasswordStrengthMeter({ password = '' }: PasswordStrengthMeterProps) {
  const getStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  
  const colors = [
    'bg-gray-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-brand-teal',
    'bg-brand-accent'
  ];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              i <= strength ? colors[strength] : colors[0]
            )}
          />
        ))}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {strength === 0 && 'Enter password'}
        {strength === 1 && 'Weak'}
        {strength === 2 && 'Fair'}
        {strength === 3 && 'Strong'}
        {strength === 4 && 'Very Strong'}
      </p>
    </div>
  );
}

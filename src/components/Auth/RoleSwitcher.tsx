import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface RoleSwitcherProps {
  activeRole: 'agent' | 'agency';
  onRoleChange: (role: 'agent' | 'agency') => void;
}

export default function RoleSwitcher({ activeRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="bg-gray-100 p-1 rounded-2xl flex items-center relative w-full max-w-[300px] mb-8">
      <motion.div
        className="absolute h-[calc(100%-8px)] bg-brand-teal rounded-xl shadow-lg shadow-brand-teal/20"
        initial={false}
        animate={{
          left: activeRole === 'agent' ? '4px' : 'calc(50% + 0px)',
          width: 'calc(50% - 4px)',
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      
      <button
        onClick={() => onRoleChange('agent')}
        className={cn(
          "flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-200",
          activeRole === 'agent' ? "text-white" : "text-gray-500 hover:text-gray-700"
        )}
      >
        Agent
      </button>
      
      <button
        onClick={() => onRoleChange('agency')}
        className={cn(
          "flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-200",
          activeRole === 'agency' ? "text-white" : "text-gray-500 hover:text-gray-700"
        )}
      >
        Agency
      </button>
    </div>
  );
}

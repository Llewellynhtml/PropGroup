import React from 'react';
import { User, Building2 } from 'lucide-react';

interface AuthTabsProps {
  activeTab: 'agent' | 'agency';
  onTabChange: (tab: 'agent' | 'agency') => void;
}

export default function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
      <button
        onClick={() => onTabChange('agent')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
          activeTab === 'agent'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <User className="w-4 h-4" />
        Agent
      </button>
      <button
        onClick={() => onTabChange('agency')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
          activeTab === 'agency'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Building2 className="w-4 h-4" />
        Agency
      </button>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-brand-teal/10 rounded-xl text-brand-teal">{icon}</div>}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
        </div>
        <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">{subtitle}</p>
      </motion.div>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0"
        >
          {action}
        </motion.div>
      )}
    </div>
  );
};

export default PageHeader;

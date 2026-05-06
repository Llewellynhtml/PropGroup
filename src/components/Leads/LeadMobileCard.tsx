import React from 'react';
import { 
  Mail, 
  Phone, 
  Archive, 
  UserCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Lead } from '../../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeadMobileCardProps {
  lead: Lead;
  onClick: () => void;
  onArchive: () => void;
  onQualify: () => void;
}

const LeadMobileCard: React.FC<LeadMobileCardProps> = ({ lead, onClick, onArchive, onQualify }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);
  const archiveScale = useTransform(x, [-100, -50], [1.2, 1]);
  const qualifyScale = useTransform(x, [50, 100], [1, 1.2]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -100) {
      onArchive();
    } else if (info.offset.x > 100) {
      onQualify();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gray-100 mb-3">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <motion.div style={{ scale: qualifyScale }} className="text-emerald-600 flex flex-col items-center">
          <UserCheck className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase mt-1">Qualify</span>
        </motion.div>
        <motion.div style={{ scale: archiveScale }} className="text-rose-600 flex flex-col items-center">
          <Archive className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase mt-1">Archive</span>
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, opacity }}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        className="relative bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
          {lead.contactName.split(' ').map(n => n[0]).join('')}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 truncate">{lead.contactName}</h3>
            <span className="text-[10px] text-gray-400 font-bold">{new Date(lead.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.propertyTitle || 'General Inquiry'}</p>
          
          <div className="flex items-center gap-3 mt-3">
            <StatusBadge status={lead.status} />
            <div className="flex items-center gap-1 text-gray-400">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px] font-bold">{lead.notes?.length || 0}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300" />
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'New': 'bg-blue-50 text-blue-600',
    'Contacted': 'bg-amber-50 text-amber-600',
    'Qualified': 'bg-emerald-50 text-emerald-600',
    'Closed': 'bg-gray-50 text-gray-500',
    'Archived': 'bg-rose-50 text-rose-600',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
      styles[status] || styles['New']
    )}>
      {status}
    </span>
  );
}

export default LeadMobileCard;

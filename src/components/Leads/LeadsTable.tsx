import React, { useState, useMemo, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  ChevronUp, 
  ChevronDown, 
  Archive, 
  Layout,
  Search,
  Filter
} from 'lucide-react';
import { Lead, Agent, Property } from '../../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LeadMobileCard from './LeadMobileCard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeadsTableProps {
  leads: Lead[];
  agents: Agent[];
  properties: Property[];
  onLeadClick: (lead: Lead) => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

type SortConfig = {
  key: keyof Lead | 'propertyTitle' | 'agentName';
  direction: 'asc' | 'desc';
} | null;

export default function LeadsTable({ 
  leads, 
  agents, 
  properties, 
  onLeadClick, 
  onUpdateLead
}: LeadsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    name: 200,
    property: 180,
    contact: 220,
    source: 120,
    status: 120,
    agent: 150,
    date: 150,
    actions: 100
  });

  // Handle responsiveness
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved layout
  useEffect(() => {
    const savedLayout = localStorage.getItem('leads_table_layout');
    if (savedLayout) {
      try {
        const { widths } = JSON.parse(savedLayout);
        if (widths) setColumnWidths(widths);
      } catch (e) {
        console.error('Error loading table layout:', e);
      }
    }
  }, []);

  const saveLayout = () => {
    localStorage.setItem('leads_table_layout', JSON.stringify({
      widths: columnWidths
    }));
    alert('Table layout saved!');
  };

  const handleSort = (key: keyof Lead | 'propertyTitle' | 'agentName') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeads = useMemo(() => {
    if (!sortConfig) return leads;

    return [...leads].sort((a, b) => {
      const aValue = (a[sortConfig.key as keyof Lead] || '').toString().toLowerCase();
      const bValue = (b[sortConfig.key as keyof Lead] || '').toString().toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortConfig]);

  const handleResize = (column: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [column]: Math.max(width, 80) }));
  };

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {leads.length} Leads Found
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {sortedLeads.map(lead => (
            <LeadMobileCard 
              key={lead.id} 
              lead={lead} 
              onClick={() => onLeadClick(lead)}
              onArchive={() => onUpdateLead(lead.id, { status: 'Archived' })}
              onQualify={() => onUpdateLead(lead.id, { status: 'Qualified' })}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-4">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {leads.length} Leads Found
          </span>
        </div>
        <button 
          onClick={saveLayout}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-600 uppercase tracking-widest hover:shadow-md transition-all"
        >
          <Layout className="w-3.5 h-3.5" />
          Save Layout
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50/50 border-bottom border-gray-100">
              <HeaderCell 
                label="Lead Name" 
                width={columnWidths.name} 
                onResize={(w) => handleResize('name', w)}
                onSort={() => handleSort('contactName')}
                sortDirection={sortConfig?.key === 'contactName' ? sortConfig.direction : undefined}
              />
              <HeaderCell 
                label="Property" 
                width={columnWidths.property} 
                onResize={(w) => handleResize('property', w)}
                onSort={() => handleSort('propertyTitle')}
                sortDirection={sortConfig?.key === 'propertyTitle' ? sortConfig.direction : undefined}
              />
              <HeaderCell 
                label="Contact Info" 
                width={columnWidths.contact} 
                onResize={(w) => handleResize('contact', w)}
              />
              <HeaderCell 
                label="Source" 
                width={columnWidths.source} 
                onResize={(w) => handleResize('source', w)}
                onSort={() => handleSort('source')}
                sortDirection={sortConfig?.key === 'source' ? sortConfig.direction : undefined}
              />
              <HeaderCell 
                label="Status" 
                width={columnWidths.status} 
                onResize={(w) => handleResize('status', w)}
                onSort={() => handleSort('status')}
                sortDirection={sortConfig?.key === 'status' ? sortConfig.direction : undefined}
              />
              <HeaderCell 
                label="Assigned Agent" 
                width={columnWidths.agent} 
                onResize={(w) => handleResize('agent', w)}
                onSort={() => handleSort('agentName')}
                sortDirection={sortConfig?.key === 'agentName' ? sortConfig.direction : undefined}
              />
              <HeaderCell 
                label="Date Created" 
                width={columnWidths.date} 
                onResize={(w) => handleResize('date', w)}
                onSort={() => handleSort('createdAt')}
                sortDirection={sortConfig?.key === 'createdAt' ? sortConfig.direction : undefined}
              />
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right" style={{ width: columnWidths.actions }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedLeads.map((lead) => (
              <tr 
                key={lead.id} 
                className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                onClick={() => onLeadClick(lead)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {lead.contactName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {lead.contactName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="truncate max-w-[150px]">{lead.propertyTitle || 'General Inquiry'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3 h-3" strokeWidth={1.5} />
                      {lead.contactEmail || 'No email'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="w-3 h-3" strokeWidth={1.5} />
                      {lead.contactPhone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {lead.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select 
                      className="text-xs bg-transparent border-none focus:ring-0 font-medium text-gray-600 cursor-pointer"
                      value={lead.agentId || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateLead(lead.id, { agentId: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* Email logic */ }}
                      className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Email Lead"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateLead(lead.id, { status: 'Archived' }); }}
                      className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Archive Lead"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeaderCell({ label, width, onResize, onSort, sortDirection }: { 
  label: string; 
  width: number; 
  onResize: (w: number) => void;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc';
}) {
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.pageX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <th 
      className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest relative group"
      style={{ width }}
    >
      <div 
        className={cn(
          "flex items-center gap-1 cursor-pointer select-none",
          onSort && "hover:text-indigo-600 transition-colors"
        )}
        onClick={onSort}
      >
        {label}
        {sortDirection === 'asc' && <ChevronUp className="w-3 h-3" />}
        {sortDirection === 'desc' && <ChevronDown className="w-3 h-3" />}
      </div>
      <div 
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-400 transition-colors",
          isResizing && "bg-indigo-600 w-0.5"
        )}
        onMouseDown={handleMouseDown}
      />
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'New': 'bg-blue-50 text-blue-600 border-blue-100',
    'Contacted': 'bg-amber-50 text-amber-600 border-amber-100',
    'Qualified': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Closed': 'bg-gray-50 text-gray-500 border-gray-100',
    'Archived': 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
      styles[status] || styles['New']
    )}>
      {status}
    </span>
  );
}

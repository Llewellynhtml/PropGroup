import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Home,
  User,
  History,
  StickyNote,
  CheckSquare,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, LeadNote, LeadTask, Agent, Property } from '../../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeadDetailPaneProps {
  lead: Lead;
  agents: Agent[];
  properties: Property[];
  onClose: () => void;
  onUpdateStatus: (status: Lead['status']) => void;
  onAddNote: (content: string) => void;
  onAddTask: (task: Partial<LeadTask>) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export default function LeadDetailPane({ 
  lead, 
  agents, 
  properties, 
  onClose, 
  onUpdateStatus, 
  onAddNote, 
  onAddTask, 
  onToggleTask 
}: LeadDetailPaneProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes' | 'tasks'>('details');
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const property = properties.find(p => p.id === lead.propertyId);
  const agent = agents.find(a => a.id === lead.agentId);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(newNote);
    setNewNote('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle,
      dueDate: newTaskDueDate || new Date().toISOString(),
      completed: false
    });
    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            {lead.contactName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">{lead.contactName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={lead.status} />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                ID: {lead.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-gray-600 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-50 px-6">
        {[
          { id: 'details', label: 'Details', icon: User },
          { id: 'history', label: 'History', icon: History },
          { id: 'notes', label: 'Notes', icon: StickyNote },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all relative",
              activeTab === tab.id 
                ? "text-indigo-600" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Contact Info */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Information</h3>
                <div className="grid grid-cols-1 gap-3">
                  <ContactCard icon={Mail} label="Email Address" value={lead.contactEmail || 'Not provided'} />
                  <ContactCard icon={Phone} label="Phone Number" value={lead.contactPhone} />
                  <ContactCard icon={Tag} label="Lead Source" value={lead.source} />
                </div>
              </section>

              {/* Property of Interest */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Property of Interest</h3>
                {property ? (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 group cursor-pointer hover:border-indigo-200 transition-all">
                    <img 
                      src={property.image || `https://picsum.photos/seed/prop${property.id}/400/300`} 
                      className="w-20 h-20 rounded-xl object-cover shadow-sm" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{property.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{property.location_city}, {property.location_area}</p>
                      <p className="text-sm font-black text-indigo-600 mt-2">R {property.price.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-400 font-medium">No specific property linked</p>
                  </div>
                )}
              </section>

              {/* Assignment */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assigned Agent</h3>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    {agent?.profile_photo_url ? (
                      <img src={agent.profile_photo_url} className="w-full h-full rounded-xl object-cover" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{agent?.full_name || 'Unassigned'}</p>
                    <p className="text-xs text-gray-500">{agent?.role_optional || 'Real Estate Agent'}</p>
                  </div>
                </div>
              </section>

              {/* Message */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Initial Message</h3>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 italic text-sm text-gray-600 leading-relaxed">
                  "{lead.message || 'No message provided'}"
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an internal note..."
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all min-h-[100px] resize-none"
                />
                <button 
                  type="submit"
                  disabled={!newNote.trim()}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Save Note
                </button>
              </form>

              <div className="space-y-4">
                {lead.notes?.map(note => (
                  <div key={note.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{note.agentName}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                  </div>
                ))}
                {(!lead.notes || lead.notes.length === 0) && (
                  <div className="text-center py-12">
                    <StickyNote className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No internal notes yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <form onSubmit={handleAddTask} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">New Follow-up Task</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title (e.g. Follow up call)"
                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:border-indigo-600 outline-none transition-all"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                {lead.tasks?.map(task => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center gap-4",
                      task.completed 
                        ? "bg-gray-50 border-gray-100 opacity-60" 
                        : "bg-white border-gray-100 shadow-sm hover:border-indigo-200"
                    )}
                  >
                    <button 
                      onClick={() => onToggleTask(task.id, !task.completed)}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        task.completed 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-gray-200 hover:border-indigo-600"
                      )}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-bold truncate",
                        task.completed ? "text-gray-400 line-through" : "text-gray-900"
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!lead.tasks || lead.tasks.length === 0) && (
                  <div className="text-center py-12">
                    <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No tasks assigned</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                {[
                  { type: 'Lead Created', desc: `Captured from ${lead.source}`, time: lead.createdAt, icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { type: 'Status Changed', desc: `Moved to ${lead.status}`, time: lead.updatedAt, icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  // Mock history items
                  { type: 'Email Sent', desc: 'Property brochure sent to lead', time: new Date(Date.now() - 86400000).toISOString(), icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { type: 'Note Added', desc: 'Agent left an internal comment', time: new Date(Date.now() - 172800000).toISOString(), icon: StickyNote, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 relative">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center z-10 shadow-sm border-2 border-white",
                      item.bg, item.color
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                        {new Date(item.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex gap-3">
        <button 
          onClick={() => onUpdateStatus('Qualified')}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Qualify Lead
        </button>
        <button className="px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
          Archive
        </button>
      </div>
    </motion.div>
  );
}

function ContactCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
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
      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
      styles[status] || styles['New']
    )}>
      {status}
    </span>
  );
}

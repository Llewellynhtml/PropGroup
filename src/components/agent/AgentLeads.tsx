import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MessageSquare, 
  MoreVertical, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Calendar,
  ExternalLink,
  X,
  Save,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Lead } from '../../types';
import { toast } from 'sonner';

export default function AgentLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [newNote, setNewNote] = useState('');

  const fetchLeads = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
      fetchLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNote.trim()) return;
    setIsNoteSaving(true);
    try {
      // In a real app, notes might be a separate table or a JSONB field
      // For this implementation, we'll assume a 'notes' field in the leads table
      const updatedNotes = [...(selectedLead.notes || []), {
        id: Math.random().toString(36).substr(2, 9),
        content: newNote,
        createdAt: new Date().toISOString(),
        agentId: user?.id || '',
        agentName: user?.name || 'Agent'
      }];

      const { error } = await supabase
        .from('leads')
        .update({ notes: updatedNotes })
        .eq('id', selectedLead.id);

      if (error) throw error;
      toast.success('Note added');
      setNewNote('');
      fetchLeads();
      setSelectedLead(prev => prev ? { ...prev, notes: updatedNotes as any } : null);
    } catch (error: any) {
      toast.error(error.message || 'Error adding note');
    } finally {
      setIsNoteSaving(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-brand-teal/10 text-brand-teal';
      case 'Contacted': return 'bg-indigo-50 text-indigo-600';
      case 'Qualified': return 'bg-emerald-50 text-emerald-600';
      case 'Closed': return 'bg-purple-50 text-purple-600';
      case 'Lost': return 'bg-rose-50 text-rose-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Leads</h1>
        <p className="text-sm text-gray-500 font-medium">Track and manage potential clients interested in your listings.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search leads by name, email or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-teal mx-auto" />
                  </td>
                </tr>
              ) : filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black text-xs">
                        {lead.contactName.charAt(0)}
                      </div>
                      <p className="text-sm font-bold text-gray-900">{lead.contactName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-600 truncate max-w-[200px]">{lead.propertyTitle || 'General Inquiry'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Phone size={12} /> {lead.contactPhone}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                        <Mail size={12} /> {lead.contactEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Calendar size={12} />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-400 font-medium">No leads found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-xl font-black text-gray-900">Lead Details</h2>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                {/* Profile Header */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black text-2xl mx-auto shadow-inner">
                    {selectedLead.contactName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{selectedLead.contactName}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Lead ID: {selectedLead.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <a href={`tel:${selectedLead.contactPhone}`} className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-brand-teal hover:text-white transition-all shadow-sm">
                      <Phone size={20} />
                    </a>
                    <a href={`mailto:${selectedLead.contactEmail}`} className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-brand-teal hover:text-white transition-all shadow-sm">
                      <Mail size={20} />
                    </a>
                    <button className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-brand-teal hover:text-white transition-all shadow-sm">
                      <MessageSquare size={20} />
                    </button>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lead Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['New', 'Contacted', 'Qualified', 'Closed', 'Lost'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedLead.id, status)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedLead.status === status 
                            ? getStatusColor(status) + ' ring-2 ring-current ring-offset-2'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Info */}
                <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquired Property</h4>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-300 shadow-sm">
                      <Home size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedLead.propertyTitle || 'General Inquiry'}</p>
                      <p className="text-xs text-gray-500 font-medium">Source: {selectedLead.source}</p>
                      <button className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mt-2 flex items-center gap-1 hover:underline">
                        View Property <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Notes</h4>
                    <span className="text-[10px] font-bold text-gray-400">{selectedLead.notes?.length || 0} Notes</span>
                  </div>
                  
                  <form onSubmit={handleAddNote} className="relative">
                    <textarea 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this lead..."
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all resize-none pr-12"
                      rows={2}
                    />
                    <button 
                      type="submit"
                      disabled={isNoteSaving || !newNote.trim()}
                      className="absolute right-3 bottom-3 p-2 bg-brand-charcoal text-white rounded-xl hover:bg-black transition-all disabled:opacity-50"
                    >
                      {isNoteSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                  </form>

                  <div className="space-y-4">
                    {selectedLead.notes?.slice().reverse().map((note: any) => (
                      <div key={note.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{note.agentName}</span>
                          <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

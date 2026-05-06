import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Phone, 
  MessageSquare,
  Home,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function AgencyLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [agents, setAgents] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [assigningAgentId, setAssigningAgentId] = useState('');

  const fetchData = async () => {
    if (!user?.agency_id) return;
    try {
      const [leadsRes, agentsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('*, properties(title), agents(full_name)')
          .eq('agency_id', user.agency_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('agents')
          .select('id, full_name')
          .eq('agency_id', user.agency_id)
      ]);

      if (leadsRes.error) throw leadsRes.error;
      setLeads(leadsRes.data || []);
      setAgents(agentsRes.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch leads');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAssignLead = async () => {
    if (!selectedLead || !assigningAgentId) return;
    try {
      const { error } = await supabase
        .from('leads')
        .update({ agent_id: assigningAgentId, status: 'assigned' })
        .eq('id', selectedLead.id);

      if (error) throw error;
      toast.success('Lead assigned successfully');
      setIsAssignModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign lead');
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      toast.success(`Lead status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = filterAgent === 'all' || lead.agent_id === filterAgent;
    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Agency Leads</h2>
          <p className="text-sm text-gray-500 font-medium">Manage and assign leads generated across all agency properties.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-charcoal text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all group">
            <Download size={18} />
            Export Leads
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <select 
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-teal outline-none"
            >
              <option value="all">All Agents</option>
              <option value="unassigned">Unassigned</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Agent</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Target size={48} strokeWidth={1} />
                      <p className="font-medium">No leads found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center font-bold text-brand-teal">
                          {lead.contact_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{lead.contact_name}</p>
                          <p className="text-xs text-gray-500">{lead.contact_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Home size={14} className="text-gray-400" />
                        <span className="truncate max-w-[150px]">{lead.properties?.title || 'General Inquiry'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.agents ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                            {lead.agents.full_name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{lead.agents.full_name}</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsAssignModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-teal hover:text-brand-teal-deep transition-colors"
                        >
                          <UserPlus size={14} />
                          Assign Agent
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        lead.status === 'new' ? "bg-indigo-50 text-indigo-600" :
                        lead.status === 'assigned' ? "bg-amber-50 text-amber-600" :
                        lead.status === 'contacted' ? "bg-blue-50 text-blue-600" :
                        lead.status === 'closed' ? "bg-emerald-50 text-emerald-600" :
                        "bg-gray-50 text-gray-600"
                      )}>
                        {lead.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100">
                          <Mail size={16} />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100">
                          <Phone size={16} />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100">
                          <MessageSquare size={16} />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-6">
                  <UserPlus className="text-brand-teal w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Assign Lead</h3>
                <p className="text-sm text-gray-500 mb-8">Assign <span className="font-bold text-gray-900">{selectedLead?.contact_name}</span> to an agent for follow-up.</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Agent</label>
                    <select 
                      value={assigningAgentId}
                      onChange={(e) => setAssigningAgentId(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all appearance-none"
                    >
                      <option value="">Choose an agent...</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsAssignModalOpen(false)}
                      className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAssignLead}
                      disabled={!assigningAgentId}
                      className="flex-1 py-4 bg-brand-charcoal text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      Assign Agent <CheckCircle2 size={18} />
                    </button>
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

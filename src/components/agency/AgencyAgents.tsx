import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserPlus,
  Filter,
  Download,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Agent } from '../../types';
import { cn } from '../../lib/utils';

export default function AgencyAgents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchAgents = async () => {
    if (!user?.agency_id) return;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch agents');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      // In a real app, this would send an email invitation
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Invitation sent to ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeactivate = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('agents')
        .update({ status: newStatus })
        .eq('id', agentId);

      if (error) throw error;
      toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchAgents();
    } catch (error) {
      toast.error('Failed to update agent status');
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Agents Management</h2>
          <p className="text-sm text-gray-500 font-medium">Manage and monitor your agency's team members.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-charcoal text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all group"
          >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
            Invite Agent
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search agents by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
              <Filter size={18} />
            </button>
            <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialization</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Listings</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
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
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Users size={48} strokeWidth={1} />
                      <p className="font-medium">No agents found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center font-bold text-brand-teal">
                          {agent.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{agent.full_name}</p>
                          <p className="text-xs text-gray-500">Joined {new Date(agent.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail size={12} className="text-gray-400" />
                          {agent.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone size={12} className="text-gray-400" />
                          {agent.cellphone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {agent.role_optional || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-gray-900">12</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {agent.status === 'inactive' ? (
                          <XCircle size={16} className="text-rose-500" />
                        ) : (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        )}
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          agent.status === 'inactive' ? "text-rose-600" : "text-emerald-600"
                        )}>
                          {agent.status || 'active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeactivate(agent.id, agent.status || 'active')}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100"
                          title={agent.status === 'inactive' ? 'Activate' : 'Deactivate'}
                        >
                          <Shield size={16} />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-rose-600 transition-colors shadow-sm border border-transparent hover:border-gray-100">
                          <Trash2 size={16} />
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

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
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
                <h3 className="text-2xl font-black text-gray-900 mb-2">Invite New Agent</h3>
                <p className="text-sm text-gray-500 mb-8">Send an invitation email to add a new agent to your agency team.</p>
                
                <form onSubmit={handleInvite} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                      <input 
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="agent@example.com"
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isInviting}
                      className="flex-1 py-4 bg-brand-charcoal text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Invite'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

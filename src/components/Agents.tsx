import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  X,
  CheckCircle2,
  Globe,
  Briefcase,
  Upload,
  Linkedin as LinkedinIcon,
  Instagram as InstagramIcon,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Agent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import PageHeader from './PageHeader';
import Skeleton from './Skeleton';

interface Props {
  agents: Agent[];
  onUpdate: () => void;
  loading?: boolean;
}

export default function Agents({ agents, onUpdate, loading }: Props) {
  const { session } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAdding, setIsAdding] = useState(() => {
    return localStorage.getItem('proppost_agent_is_adding') === 'true';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const [newAgent, setNewAgent] = useState<Partial<Agent>>(() => {
    const saved = localStorage.getItem('proppost_agent_draft');
    const defaults = {
      full_name: '',
      role_optional: '',
      profile_photo_url: 'https://picsum.photos/seed/agent/200/200',
      email: '',
      whatsapp_number: '',
      cellphone_number: '',
      office_number_optional: '',
      bio_optional: '',
      linkedin_url_optional: '',
      instagram_url_optional: ''
    };
    try {
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (e) {
      return defaults;
    }
  });

  // Persist draft and adding state
  useEffect(() => {
    localStorage.setItem('proppost_agent_draft', JSON.stringify(newAgent));
  }, [newAgent]);

  useEffect(() => {
    localStorage.setItem('proppost_agent_is_adding', isAdding.toString());
  }, [isAdding]);

  const filteredAgents = agents.filter(a => 
    (a.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (a.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `agent-photos/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('properties') // Using properties bucket as fallback, or create 'agents' bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      if (isEditing && selectedAgent) {
        setSelectedAgent({ ...selectedAgent, profile_photo_url: publicUrl });
      } else {
        setNewAgent(prev => ({ ...prev, profile_photo_url: publicUrl }));
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error.message?.includes('Bucket not found')) {
        alert('Storage bucket "properties" not found. Please create a public bucket named "properties" in your Supabase dashboard.');
      } else if (error.message?.includes('row-level security policy')) {
        alert('Permission denied: Row-level security (RLS) policy prevents this upload. Please ensure you have set up the correct RLS policies for the "properties" bucket in your Supabase dashboard.\n\nYou need to allow INSERT and SELECT for authenticated users.');
      } else {
        alert(`Error uploading image: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const agency_id = user?.id; // The logged-in user is the agency

      const { error } = await supabase
        .from('agents')
        .insert([{
          ...newAgent,
          agency_id: agency_id
        }]);

      if (error) throw error;

      setIsAdding(false);
      const resetAgent = {
        full_name: '',
        role_optional: '',
        profile_photo_url: 'https://picsum.photos/seed/agent/200/200',
        email: '',
        whatsapp_number: '',
        cellphone_number: '',
        office_number_optional: '',
        bio_optional: '',
        linkedin_url_optional: '',
        instagram_url_optional: ''
      };
      setNewAgent(resetAgent);
      localStorage.removeItem('proppost_agent_draft');
      onUpdate();
    } catch (error: any) {
      console.error('Error adding agent:', error);
      alert(`Error: ${error.message || 'An error occurred while adding the agent'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent || !session) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('agents')
        .update(selectedAgent)
        .eq('id', selectedAgent.id);

      if (error) throw error;

      onUpdate();
      alert('Agent updated successfully');
    } catch (error: any) {
      console.error('Error updating agent:', error);
      alert(`Error: ${error.message || 'An error occurred while updating the agent'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agentToDelete || !session) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentToDelete.id);

      if (error) throw error;

      setAgentToDelete(null);
      setSelectedAgent(null);
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      alert(`Error: ${error.message || 'An error occurred while deleting the agent'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full relative overflow-hidden">
      <PageHeader 
        title="Agents" 
        subtitle="Manage agent profiles, contact details, and social presence"
        action={
          <button 
            onClick={() => setIsAdding(true)}
            aria-label="Add new agent"
            className="bg-brand-teal text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em] hover:bg-brand-dark-teal transition-all shadow-xl shadow-brand-teal/20 active:scale-95 group/btn outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
          >
            <Plus size={16} className="group-hover/btn:rotate-90 transition-transform duration-300" aria-hidden="true" /> 
            <span>Add Agent</span>
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-280px)] relative overflow-hidden">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {agentToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6"
            >
              <div className="flex items-center gap-4 text-red-600">
                <div className="p-3 bg-red-50 rounded-full" aria-hidden="true">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 id="delete-modal-title" className="text-lg font-bold">Delete Agent?</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone. All associated data will be removed.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">Agent to delete</p>
                <p className="font-bold text-gray-900">{agentToDelete.full_name}</p>
                <p className="text-xs text-gray-500">{agentToDelete.email}</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setAgentToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={16} aria-hidden="true" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Agent'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Agent Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div>
                  <h2 id="add-modal-title" className="text-2xl font-serif italic">Add New Agent</h2>
                  <p className="text-sm text-gray-500">Create a new agent profile for your directory.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)} 
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
                  aria-label="Close modal"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <form onSubmit={handleAddAgent} className="space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-brand-teal/10 relative group">
                      <img src={newAgent.profile_photo_url} className="w-full h-full object-cover" alt="Agent preview" />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                        <Upload size={20} aria-hidden="true" />
                        <span className="text-[8px] font-mono uppercase mt-1">Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, false)} aria-label="Upload profile photo" />
                      </label>
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-mono uppercase text-gray-400">Profile Photo</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="full_name" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Full Name</label>
                      <input 
                        id="full_name"
                        required
                        type="text" 
                        value={newAgent.full_name}
                        onChange={e => setNewAgent({...newAgent, full_name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                        placeholder="e.g. Sarah Jenkins"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="role" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Role / Title</label>
                      <input 
                        id="role"
                        type="text" 
                        value={newAgent.role_optional}
                        onChange={e => setNewAgent({...newAgent, role_optional: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                        placeholder="e.g. Senior Property Consultant"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Email Address</label>
                    <input 
                      id="email"
                      required
                      type="email" 
                      value={newAgent.email}
                      onChange={e => setNewAgent({...newAgent, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                      placeholder="sarah@groupten.co.za"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="whatsapp" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">WhatsApp Number</label>
                      <input 
                        id="whatsapp"
                        required
                        type="text" 
                        value={newAgent.whatsapp_number}
                        onChange={e => setNewAgent({...newAgent, whatsapp_number: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                        placeholder="27821234567"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cellphone" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Cellphone Number</label>
                      <input 
                        id="cellphone"
                        required
                        type="text" 
                        value={newAgent.cellphone_number}
                        onChange={e => setNewAgent({...newAgent, cellphone_number: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                        placeholder="27821234567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="office" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Office Number (Optional)</label>
                    <input 
                      id="office"
                      type="text" 
                      value={newAgent.office_number_optional}
                      onChange={e => setNewAgent({...newAgent, office_number_optional: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                      placeholder="27111234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Biography (Optional)</label>
                    <textarea 
                      id="bio"
                      value={newAgent.bio_optional}
                      onChange={e => setNewAgent({...newAgent, bio_optional: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all min-h-[100px] resize-none"
                      placeholder="Tell us about the agent..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="linkedin" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">LinkedIn URL</label>
                      <input 
                        id="linkedin"
                        type="url" 
                        value={newAgent.linkedin_url_optional}
                        onChange={e => setNewAgent({...newAgent, linkedin_url_optional: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="instagram" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Instagram URL</label>
                      <input 
                        id="instagram"
                        type="url" 
                        value={newAgent.instagram_url_optional}
                        onChange={e => setNewAgent({...newAgent, instagram_url_optional: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-4 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 rounded-xl bg-brand-teal text-white text-sm font-bold hover:bg-brand-dark-teal transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-50 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      ) : <Plus size={16} aria-hidden="true" />}
                      {isSubmitting ? 'Creating...' : 'Create Agent'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Left Side: List */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search agents"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-teal outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand-teal" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-4" aria-hidden="true">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-[10px] font-mono uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 font-normal">Agent</th>
                  <th className="px-6 py-3 font-normal">Contact</th>
                  <th className="px-6 py-3 font-normal">Status</th>
                  <th className="px-6 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {filteredAgents.map((a) => (
                  <tr 
                    key={a.id} 
                    onClick={() => setSelectedAgent(a)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer outline-none focus-visible:bg-gray-50 ${selectedAgent?.id === a.id ? 'bg-brand-teal/5' : ''}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAgent(a);
                      }
                    }}
                    aria-selected={selectedAgent?.id === a.id}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border-2 border-white shadow-sm">
                          <img src={a.profile_photo_url} className="w-full h-full object-cover" alt={`${a.full_name}'s profile`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{a.full_name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">{a.role_optional || 'Agent'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail size={12} className="shrink-0" aria-hidden="true" /> {a.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone size={12} className="shrink-0" aria-hidden="true" /> {a.cellphone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-100 text-emerald-700">Active</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-gray-200" aria-label="More options"><MoreVertical size={16} aria-hidden="true" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Side: Details Panel */}
      <div className={`fixed lg:relative inset-0 lg:inset-auto z-[100] lg:z-0 lg:w-[420px] bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col transition-all duration-300 ${selectedAgent ? 'translate-x-0 opacity-100' : 'translate-x-full lg:translate-x-0 lg:opacity-0 lg:pointer-events-none'}`}>
        {selectedAgent && (
          <>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif italic text-lg">Agent Profile</h3>
              <button 
                onClick={() => setSelectedAgent(null)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
                aria-label="Close details"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-teal/10 shadow-inner relative group">
                  <img src={selectedAgent.profile_photo_url} className="w-full h-full object-cover" alt={`${selectedAgent.full_name}'s profile`} />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                    <Edit3 size={20} aria-hidden="true" />
                    <span className="sr-only">Change profile photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, true)} aria-label="Change profile photo" />
                  </label>
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="w-full space-y-2">
                  <input 
                    className="text-xl font-bold text-gray-900 w-full text-center bg-transparent border-b border-transparent focus:border-brand-teal outline-none focus-visible:border-brand-teal"
                    value={selectedAgent.full_name}
                    aria-label="Agent full name"
                    onChange={e => setSelectedAgent({...selectedAgent, full_name: e.target.value})}
                  />
                  <input 
                    className="text-xs text-brand-teal font-mono uppercase tracking-widest w-full text-center bg-transparent border-b border-transparent focus:border-brand-teal outline-none focus-visible:border-brand-teal"
                    value={selectedAgent.role_optional || ''}
                    placeholder="Role / Title"
                    aria-label="Agent role"
                    onChange={e => setSelectedAgent({...selectedAgent, role_optional: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Contact Information</h5>
                <div className="space-y-4">
                  <EditableContactItem 
                    id="edit-email"
                    icon={<Mail size={16} />} 
                    label="Email Address" 
                    value={selectedAgent.email} 
                    onChange={val => setSelectedAgent({...selectedAgent, email: val})}
                  />
                  <EditableContactItem 
                    id="edit-whatsapp"
                    icon={<MessageSquare size={16} />} 
                    label="WhatsApp Number" 
                    value={selectedAgent.whatsapp_number} 
                    onChange={val => setSelectedAgent({...selectedAgent, whatsapp_number: val})}
                  />
                  <EditableContactItem 
                    id="edit-cellphone"
                    icon={<Phone size={16} />} 
                    label="Cellphone Number" 
                    value={selectedAgent.cellphone_number || ''} 
                    onChange={val => setSelectedAgent({...selectedAgent, cellphone_number: val})}
                  />
                  <EditableContactItem 
                    id="edit-office"
                    icon={<Phone size={16} />} 
                    label="Office Number" 
                    value={selectedAgent.office_number_optional || ''} 
                    onChange={val => setSelectedAgent({...selectedAgent, office_number_optional: val})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Lead Generation</h5>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">WhatsApp Link</span>
                    <button 
                      onClick={() => {
                        const link = `https://wa.me/${selectedAgent.whatsapp_number?.replace(/\D/g, '')}`;
                        navigator.clipboard.writeText(link);
                        alert('WhatsApp link copied to clipboard!');
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:underline uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      Copy Link
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 truncate">
                    <code className="text-[10px] text-emerald-600 font-mono">
                      https://wa.me/{selectedAgent.whatsapp_number?.replace(/\D/g, '')}
                    </code>
                  </div>
                  <p className="text-[9px] text-emerald-600/70 italic">
                    Share this link in your social posts to generate direct WhatsApp leads.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h5 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Biography</h5>
                  {selectedAgent.bio_optional && selectedAgent.bio_optional.length > 100 && (
                    <button 
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="text-[10px] font-bold text-brand-teal hover:underline uppercase tracking-widest flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                    >
                      {isBioExpanded ? 'Show Less' : 'Read More'}
                      {isBioExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>
                <textarea 
                  className={`text-sm text-gray-600 leading-relaxed italic w-full bg-gray-50 p-3 rounded-xl border border-transparent focus:border-brand-teal outline-none transition-all resize-none focus-visible:border-brand-teal ${isBioExpanded ? 'h-[300px]' : 'h-[100px]'}`}
                  value={selectedAgent.bio_optional || ''}
                  placeholder="Add a short bio to help clients get to know the agent."
                  aria-label="Agent biography"
                  onChange={e => setSelectedAgent({...selectedAgent, bio_optional: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Social Presence</h5>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <LinkedinIcon size={16} className="text-gray-400" aria-hidden="true" />
                      <input 
                        className="text-xs text-gray-600 bg-transparent outline-none flex-1"
                        placeholder="LinkedIn URL"
                        aria-label="LinkedIn URL"
                        value={selectedAgent.linkedin_url_optional || ''}
                        onChange={e => setSelectedAgent({...selectedAgent, linkedin_url_optional: e.target.value})}
                      />
                    </div>
                    {selectedAgent.linkedin_url_optional && (
                      <a 
                        href={selectedAgent.linkedin_url_optional} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-brand-teal hover:underline font-bold uppercase tracking-widest flex items-center gap-1 px-2"
                      >
                        <Globe size={10} /> View LinkedIn Profile
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <InstagramIcon size={16} className="text-gray-400" aria-hidden="true" />
                      <input 
                        className="text-xs text-gray-600 bg-transparent outline-none flex-1"
                        placeholder="Instagram URL"
                        aria-label="Instagram URL"
                        value={selectedAgent.instagram_url_optional || ''}
                        onChange={e => setSelectedAgent({...selectedAgent, instagram_url_optional: e.target.value})}
                      />
                    </div>
                    {selectedAgent.instagram_url_optional && (
                      <a 
                        href={selectedAgent.instagram_url_optional} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-brand-teal hover:underline font-bold uppercase tracking-widest flex items-center gap-1 px-2"
                      >
                        <Globe size={10} /> View Instagram Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button 
                onClick={handleUpdateAgent}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-brand-teal text-white py-3 rounded-xl text-xs font-mono uppercase tracking-widest hover:bg-brand-dark-teal transition-all disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : <CheckCircle2 size={16} aria-hidden="true" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => setAgentToDelete(selectedAgent)}
                className="flex items-center justify-center gap-2 border border-red-100 text-red-500 py-3 rounded-xl text-xs font-mono uppercase tracking-widest hover:bg-red-50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-100"
              >
                <Trash2 size={16} aria-hidden="true" /> Delete Agent
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
}

function EditableContactItem({ id, icon, label, value, onChange }: { id: string, icon: React.ReactNode, label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex gap-3">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0" aria-hidden="true">{icon}</div>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{label}</label>
        <input 
          id={id}
          className="text-sm font-medium text-gray-900 w-full bg-transparent border-b border-transparent focus:border-brand-teal outline-none transition-all"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-3">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

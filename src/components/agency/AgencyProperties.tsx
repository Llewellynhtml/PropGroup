import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Star,
  MapPin,
  Tag,
  Users,
  Eye,
  Loader2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { propertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../lib/utils';

export default function AgencyProperties({ onAddProperty, refreshTrigger }: { onAddProperty?: () => void, refreshTrigger?: number }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [agents, setAgents] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      // For agency, we fetch by agency_id (which is same as user.id if role is agency)
      const data = await propertyService.getAgencyProperties(user.id);
      setProperties(data);
      
      // Fetch agents for filtering
      const { data: agentsData } = await supabase
        .from('agents')
        .select('id, full_name')
        .eq('agency_id', user.id);
      
      setAgents(agentsData || []);
    } catch (error: any) {
      toast.error('Failed to fetch properties');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, refreshTrigger]);

  const handleStatusUpdate = async (propId: string, newStatus: string) => {
    try {
      await propertyService.updateProperty(propId, { status: newStatus as any });
      toast.success(`Property marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update property status');
    }
  };

  const handleToggleFeatured = async (propId: string, currentFeatured: boolean) => {
    try {
      await propertyService.updateProperty(propId, { featured: !currentFeatured });
      toast.success(currentFeatured ? 'Removed from featured' : 'Marked as featured');
      fetchData();
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await propertyService.deleteProperty(id);
      toast.success('Property deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting property');
    }
  };

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prop.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgent = filterAgent === 'all' || prop.agent_id === filterAgent;
    const matchesStatus = filterStatus === 'all' || prop.status === filterStatus;
    return matchesSearch && matchesAgent && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Agency Properties</h2>
          <p className="text-sm text-gray-500 font-medium">Monitor and manage all listings across your agency.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onAddProperty}
            className="flex items-center gap-2 px-6 py-3 bg-brand-charcoal text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Add Property
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 text-gray-600 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by title or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <select 
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-teal outline-none"
              >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-teal outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
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
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Home size={48} strokeWidth={1} />
                      <p className="font-medium">No properties found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          <img 
                            src={prop.images?.[0] || `https://picsum.photos/seed/${prop.id}/400/300`} 
                            alt={prop.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{prop.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Added {new Date(prop.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {prop.created_by_role === 'agency' ? 'A' : (prop.agents?.full_name?.charAt(0) || 'U')}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {prop.created_by_role === 'agency' ? 'Agency Admin' : (prop.agents?.full_name || 'Unknown')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {prop.city}, {prop.area}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-brand-teal">
                        {formatCurrency(prop.price, 'ZAR', 'en-ZA')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        prop.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                        prop.status === 'sold' ? "bg-indigo-50 text-indigo-600" :
                        prop.status === 'rented' ? "bg-purple-50 text-purple-600" :
                        "bg-gray-50 text-gray-600"
                      )}>
                        {prop.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                          className={cn(
                            "p-2 rounded-lg transition-colors shadow-sm border border-transparent",
                            prop.featured ? "bg-amber-50 text-amber-500 border-amber-100" : "hover:bg-white text-gray-400 hover:text-amber-500 hover:border-gray-100"
                          )}
                          title="Feature Property"
                        >
                          <Star size={16} fill={prop.featured ? "currentColor" : "none"} />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(prop.id)}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-rose-600 transition-colors shadow-sm border border-transparent hover:border-gray-100"
                        >
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
    </div>
  );
}

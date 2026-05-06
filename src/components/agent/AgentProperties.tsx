import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar,
  Loader2,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { propertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { Property } from '../../types';
import { toast } from 'sonner';

export default function AgentProperties({ onAddProperty, refreshTrigger }: { onAddProperty?: () => void, refreshTrigger?: number }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProperties = async () => {
    if (!user?.id) return;
    try {
      const data = await propertyService.getAgentProperties(user.id);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await propertyService.deleteProperty(id);
      toast.success('Property deleted');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting property');
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Properties</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and monitor your property listings.</p>
        </div>
        <button 
          onClick={onAddProperty}
          className="px-6 py-3 bg-brand-charcoal text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center gap-2 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add New Property
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by title or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">City</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-teal mx-auto" />
                  </td>
                </tr>
              ) : filteredProperties.length > 0 ? filteredProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {prop.images?.[0] ? (
                          <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{prop.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prop.listing_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <MapPin size={12} className="text-gray-400" />
                      {prop.city || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-gray-900">${prop.price?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {prop.listing_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      prop.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                      prop.status === 'sold' ? 'bg-orange-50 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <Calendar size={12} />
                      {new Date(prop.created_at || '').toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-teal transition-colors shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prop.id)}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-rose-500 transition-colors shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-400 font-medium">No properties found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

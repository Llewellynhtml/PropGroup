import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  List, 
  Search, 
  Filter, 
  MoreHorizontal, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize,
  ChevronDown,
  Edit2,
  Archive,
  ExternalLink,
  Plus,
  X,
  Upload,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Car,
  Home,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, Agent, Amenity } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { propertyService } from '../services/propertyService';
import PageHeader from './PageHeader';
import Skeleton from './Skeleton';

const PropertySkeleton = () => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between py-4 border-y border-gray-50">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
    </div>
  </div>
);

const filters = [
  { id: 'all', label: 'All Properties' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'sold', label: 'Sold' },
  { id: 'villa', label: 'Villas' },
  { id: 'apartment', label: 'Apartments' },
];

const PropertyPreview: React.FC<{ property: Partial<Property>, agents: Agent[], amenities: Amenity[] }> = ({ property, agents, amenities }) => {
  const agent = agents.find(a => a.id === property.agent_id);
  const selectedAmenities = amenities.filter(a => property.amenities?.includes(a.id));

  return (
    <div className="bg-gray-50 p-6 md:p-8 flex flex-col h-full overflow-y-auto border-l border-gray-100">
      <div className="sticky top-0 z-10 mb-6 bg-gray-50/80 backdrop-blur-sm py-2">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Preview</h3>
        <div className="h-1 w-12 bg-indigo-600 rounded-full" />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex-1 flex flex-col">
        <div className="relative aspect-[16/9] bg-gray-100">
          {property.image_urls && property.image_urls.length > 0 ? (
            <img 
              src={property.image_urls[0]} 
              className="w-full h-full object-cover" 
              alt="Preview" 
              referrerPolicy="no-referrer"
            />
          ) : property.images && property.images.length > 0 ? (
            <img 
              src={(property.images[0] as any).url || (property.images[0] as any).image_url} 
              className="w-full h-full object-cover" 
              alt="Preview" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <Home size={48} className="mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No images uploaded</p>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <StatusBadge status={property.status || 'active'} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest">
              {property.listing_type || 'sale'}
            </div>
            <div className="px-4 py-2 bg-white rounded-xl text-indigo-600 text-lg font-black shadow-lg">
              ${(property.price || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 flex-1">
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-gray-900 leading-tight">
              {property.title || 'Property Title'}
            </h4>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <MapPin size={16} className="text-indigo-600" />
              <span className="text-sm">
                {property.area || property.location_area || 'Area'}, {property.city || property.location_city || 'City'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-50">
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <BedDouble size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-black text-gray-900">{property.beds ?? property.bedrooms ?? 0}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Beds</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Bath size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-black text-gray-900">{property.baths ?? property.bathrooms ?? 0}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Baths</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Maximize size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-black text-gray-900">{property.size ?? property.floor_size_m2 ?? 0}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">m²</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {property.description || property.short_description || 'No description provided yet. Start typing to see it here...'}
            </p>
          </div>

          {selectedAmenities.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map(a => (
                  <span key={a.id} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 mt-auto">
            <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                {agent?.profile_photo_url ? (
                  <img src={agent.profile_photo_url} className="w-full h-full object-cover" alt={agent.full_name} referrerPolicy="no-referrer" />
                ) : (
                  (agent?.full_name || 'U').split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Listing Agent</p>
                <p className="text-sm font-bold text-gray-900">{agent?.full_name || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Properties() {
  const { user, session } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('proppost_properties_cache');
    return saved ? JSON.parse(saved) : [];
  });
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('proppost_agents_cache');
    return saved ? JSON.parse(saved) : [];
  });
  const [amenities, setAmenities] = useState<Amenity[]>(() => {
    const saved = localStorage.getItem('proppost_amenities_cache');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(() => {
    return localStorage.getItem('proppost_property_is_adding') === 'true';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [newProperty, setNewProperty] = useState<any>(() => {
    const saved = localStorage.getItem('proppost_property_draft');
    const defaults = {
      title: '',
      price: 0,
      city: '',
      area: '',
      beds: 0,
      baths: 0,
      parking: 0,
      size: 0,
      description: '',
      listing_type: 'sale',
      status: 'active',
      agent_id: '',
      amenities: [],
      image_urls: []
    };
    try {
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (e) {
      return defaults;
    }
  });

  // Persist draft and adding state
  useEffect(() => {
    localStorage.setItem('proppost_property_draft', JSON.stringify(newProperty));
  }, [newProperty]);

  useEffect(() => {
    localStorage.setItem('proppost_property_is_adding', isAdding.toString());
  }, [isAdding]);

  const fetchProperties = async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await propertyService.getAgencyProperties(user?.agency_id || '');
      if (data) {
        setProperties(data);
        localStorage.setItem('proppost_properties_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*');

      if (error) throw error;
      if (data) {
        setAgents(data);
        localStorage.setItem('proppost_agents_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchAmenities = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*');

      if (error) throw error;
      if (data) {
        setAmenities(data);
        localStorage.setItem('proppost_amenities_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProperties();
      fetchAgents();
      fetchAmenities();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !session) return;

    setIsUploading(true);
    try {
      const uploadedUrls = await propertyService.uploadImages(Array.from(files));
      setNewProperty((prev: any) => ({
        ...prev,
        image_urls: [...(prev.image_urls || []), ...uploadedUrls]
      }));
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSubmitting(true);

    try {
      // Determine the created_by_role value — DB constraint accepts 'agent', 'agency', 'admin'
      const createdByRole = user?.role === 'agent' ? 'agent' : 'agency';
      
      // Get correct agency_id
      const agencyId = user?.role === 'agent' ? user.agency_id : user?.id;

      await propertyService.insertProperty({
        title: newProperty.title,
        price: Number(newProperty.price) || 0,
        city: newProperty.city,
        area: newProperty.area,
        beds: Number(newProperty.beds) || 0,
        baths: Number(newProperty.baths) || 0,
        parking: Number(newProperty.parking) || 0,
        size: Number(newProperty.size) || 0,
        description: newProperty.description,
        listing_type: newProperty.listing_type,
        images: newProperty.image_urls || [], // DB column is 'images'
        agent_id: newProperty.agent_id || null,
        status: newProperty.status || 'active',
        created_by_id: user?.id || session?.user?.id,
        created_by_role: createdByRole,
        agency_id: agencyId
      });

      setIsAdding(false);
      const resetProperty = {
        title: '',
        price: 0,
        city: '',
        area: '',
        beds: 0,
        baths: 0,
        parking: 0,
        size: 0,
        description: '',
        listing_type: 'sale',
        status: 'active',
        agent_id: '',
        amenities: [],
        image_urls: []
      };
      setNewProperty(resetProperty);
      localStorage.removeItem('proppost_property_draft');
      fetchProperties();
    } catch (error: any) {
      console.error('Error adding property:', error);
      alert(`Error: ${error.message || 'An error occurred while adding the property'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.location_city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.location_area || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
                         p.status === activeFilter || 
                         (p.type || '').toLowerCase() === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Properties" 
        subtitle="Manage your property listings, details, and marketing metrics"
        action={
          <button 
            onClick={() => setIsAdding(true)}
            aria-label="Add new property"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Property
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide"
          role="tablist"
          aria-label="Property filters"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              role="tab"
              aria-selected={activeFilter === filter.id}
              aria-controls="property-view"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${
                activeFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-600 hover:text-indigo-600'
              }`}
            >
              {filter.label}
              {activeFilter === filter.id && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                  {filteredProperties.length}
                </span>
              )}
            </button>
          ))}
          {activeFilter !== 'all' && (
            <button 
              onClick={() => setActiveFilter('all')}
              aria-label="Clear filters"
              className="p-2 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none rounded-lg"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search properties..."
              aria-label="Search properties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all w-full sm:w-64"
            />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex" role="tablist" aria-label="View mode">
              <button
                role="tab"
                aria-selected={viewMode === 'grid'}
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${viewMode === 'grid' ? 'bg-gray-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            <button
              role="tab"
              aria-selected={viewMode === 'table'}
              aria-label="Table view"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${viewMode === 'table' ? 'bg-gray-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      <AnimatePresence>
        {isAdding && (
          <div 
            className="fixed inset-0 z-[110] flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 overflow-hidden flex flex-col h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 bg-white sticky top-0 z-20">
                <div>
                  <h2 id="modal-title" className="text-2xl font-bold text-gray-900">Add New Property</h2>
                  <p className="text-sm text-gray-500">Enter the details of the property you want to list.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)} 
                  aria-label="Close modal"
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                  <form onSubmit={handleAddProperty} className="space-y-8">
                    {/* Images Section */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Property Images</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {newProperty.image_urls?.map((url: string, idx: number) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img src={url} className="w-full h-full object-cover" alt={`Property image ${idx + 1}`} referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              aria-label={`Remove image ${idx + 1}`}
                              onClick={() => setNewProperty((prev: any) => ({
                                ...prev,
                                image_urls: prev.image_urls?.filter((_: any, i: number) => i !== idx)
                              }))}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
                            >
                              <X size={12} aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-600 hover:text-indigo-600 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500 outline-none">
                          {isUploading ? (
                            <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" aria-hidden="true" />
                          ) : (
                            <>
                              <Upload size={24} aria-hidden="true" />
                              <span className="text-[10px] font-bold uppercase mt-2">Upload</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            className="sr-only" 
                            multiple 
                            accept="image/*" 
                            onChange={handleFileChange}
                            aria-label="Upload property images"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="prop-title" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Title</label>
                        <input 
                          id="prop-title"
                          required
                          type="text" 
                          value={newProperty.title}
                          onChange={e => setNewProperty({...newProperty, title: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                          placeholder="e.g. Modern Luxury Villa"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="prop-price" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
                          <input 
                            id="prop-price"
                            required
                            type="number" 
                            value={newProperty.price}
                            onChange={e => setNewProperty({...newProperty, price: Number(e.target.value)})}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="prop-city" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">City</label>
                        <input 
                          id="prop-city"
                          required
                          type="text" 
                          value={newProperty.city}
                          onChange={e => setNewProperty({...newProperty, city: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                          placeholder="e.g. Cape Town"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="prop-area" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Area / Suburb</label>
                        <input 
                          id="prop-area"
                          required
                          type="text" 
                          value={newProperty.area}
                          onChange={e => setNewProperty({...newProperty, area: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                          placeholder="e.g. Camps Bay"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="prop-beds" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Beds</label>
                        <input 
                          id="prop-beds"
                          type="number" 
                          value={newProperty.beds}
                          onChange={e => setNewProperty({...newProperty, beds: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="prop-baths" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Baths</label>
                        <input 
                          id="prop-baths"
                          type="number" 
                          value={newProperty.baths}
                          onChange={e => setNewProperty({...newProperty, baths: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="prop-parking" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Parking</label>
                        <input 
                          id="prop-parking"
                          type="number" 
                          value={newProperty.parking}
                          onChange={e => setNewProperty({...newProperty, parking: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="prop-size" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Size (m²)</label>
                        <input 
                          id="prop-size"
                          type="number" 
                          value={newProperty.size}
                          onChange={e => setNewProperty({...newProperty, size: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="prop-listing-type" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Listing Type</label>
                        <select 
                          id="prop-listing-type"
                          value={newProperty.listing_type}
                          onChange={e => setNewProperty({...newProperty, listing_type: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        >
                          <option value="sale">For Sale</option>
                          <option value="rent">To Rent</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="prop-agent" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Assigned Agent</label>
                        <select 
                          id="prop-agent"
                          required
                          value={newProperty.agent_id}
                          onChange={e => setNewProperty({...newProperty, agent_id: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        >
                          <option value="">Select Agent</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="prop-desc" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                      <textarea 
                        id="prop-desc"
                        value={newProperty.description}
                        onChange={e => setNewProperty({...newProperty, description: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all min-h-[100px] resize-none"
                        placeholder="Brief description of the property..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Amenities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {amenities.map(amenity => (
                          <label key={amenity.id} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-600 transition-all focus-within:ring-2 focus-within:ring-indigo-500">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-600 sr-only"
                              checked={newProperty.amenities?.includes(amenity.id)}
                              onChange={(e) => {
                                const current = newProperty.amenities || [];
                                if (e.target.checked) {
                                  setNewProperty({...newProperty, amenities: [...current, amenity.id]});
                                } else {
                                  setNewProperty({...newProperty, amenities: current.filter(id => id !== amenity.id)});
                                }
                              }}
                            />
                            <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${newProperty.amenities?.includes(amenity.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                              {newProperty.amenities?.includes(amenity.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{amenity.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="flex-1 py-4 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-all focus-visible:ring-2 focus-visible:ring-gray-500 outline-none"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-4 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        ) : <Plus size={16} aria-hidden="true" />}
                        {isSubmitting ? 'Creating...' : 'Create Property'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="hidden lg:block w-[450px] border-l border-gray-100">
                  <PropertyPreview property={newProperty} agents={agents} amenities={amenities} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="property-view">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
              {viewMode === 'grid' ? (
                Array.from({ length: 6 }).map((_, i) => <PropertySkeleton key={i} />)
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/6" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Home size={40} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search term.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto"
            >
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Property</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Agent</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProperties.map((property) => (
                    <tr 
                      key={property.id} 
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          // Handle row selection/details
                        }
                      }}
                      className="hover:bg-gray-50 transition-colors group focus:bg-gray-50 outline-none"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={property.image || (property.image_urls?.[0]) || (property.images?.[0] as any)?.image_url || 'https://picsum.photos/seed/prop/200/200'} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{property.title}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{property.type || property.listing_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                          {property.location || `${property.area || property.location_area}, ${property.city || property.location_city}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-900">${property.price.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={property.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600" aria-hidden="true">
                            {(property.agent || 'U').split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{property.agent || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <button 
                            aria-label={`Edit ${property.title}`}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-600 border border-transparent hover:border-gray-200 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                          >
                            <Edit2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button 
                            aria-label={`Archive ${property.title}`}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-rose-600 border border-transparent hover:border-gray-200 transition-all focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
                          >
                            <Archive className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.image || (property.image_urls?.[0]) || (property.images?.[0] as any)?.image_url || 'https://picsum.photos/seed/prop/800/600'} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <StatusBadge status={property.status} />
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            aria-label={`Edit ${property.title}`}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-900 hover:bg-white transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <Edit2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button 
            aria-label={`More options for ${property.title}`}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-900 hover:bg-white transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-bold">
            {property.type || property.listing_type}
          </div>
          <div className="px-3 py-1.5 bg-white rounded-lg text-indigo-600 text-sm font-black shadow-lg">
            ${property.price.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{property.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 font-medium">
            <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="truncate">{property.location || `${property.area || property.location_area}, ${property.city || property.location_city}`}</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-lg" aria-hidden="true">
              <BedDouble className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold text-gray-700">{property.beds ?? property.bedrooms ?? 0} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-lg" aria-hidden="true">
              <Bath className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-xs font-bold text-gray-700">{property.baths ?? property.bathrooms ?? 0} Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-lg" aria-hidden="true">
              <Maximize className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold text-gray-700">{property.size ?? property.floor_size_m2 ?? 0} m²</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600" aria-hidden="true">
              {(property.agent || 'U').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Agent</p>
              <p className="text-xs font-bold text-gray-900">{property.agent || 'Unassigned'}</p>
            </div>
          </div>
          <button 
            aria-label={`View details for ${property.title}`}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <ExternalLink className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const StatusBadge: React.FC<{ status: Property['status'] }> = ({ status }) => {
  const styles = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    sold: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    archived: 'bg-gray-50 text-gray-500 border-gray-100',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.active}`}>
      {status}
    </span>
  );
}

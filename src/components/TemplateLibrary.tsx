import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Layout, 
  Eye, 
  ChevronRight,
  Info,
  X,
  Sparkles,
  Heart,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Template, Property, Agent, Branding } from '../types';
import TemplatePreview from './TemplatePreview';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Skeleton from './Skeleton';
import { formatCurrency } from '../utils/format';

interface Props {
  onSelect: (template: Template) => void;
  selectedTemplateId?: string;
  property?: Property;
  agent?: Agent;
  branding: Branding;
}

export default function TemplateLibrary({ onSelect, selectedTemplateId, property, agent, branding }: Props) {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isPreviewWithSample, setIsPreviewWithSample] = useState(true);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*');
        
        if (error) throw error;
        setTemplates(data || []);
      } catch (err) {
        console.error("Error fetching templates:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = (t.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                         (t.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesTheme = themeFilter === 'all' || t.style_theme === themeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || t.listing_status === statusFilter;
    const matchesFavorites = !showFavoritesOnly || !!t.is_favorite;
    return matchesSearch && matchesTheme && matchesCategory && matchesStatus && matchesFavorites;
  });

  const toggleFavorite = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const newFavoriteStatus = !template.is_favorite;

      const { error } = await supabase
        .from('templates')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', templateId);

      if (error) throw error;
      
      setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, is_favorite: newFavoriteStatus } : t));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      const { error } = await supabase
        .from('templates')
        .update({
          name: editingTemplate.name,
          description: editingTemplate.description,
          category: editingTemplate.category,
          style_theme: editingTemplate.style_theme,
          tags: editingTemplate.tags,
          listing_status: editingTemplate.listing_status,
          version: editingTemplate.version
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      setEditingTemplate(null);
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  // Sample data for preview if real data isn't provided
  const sampleProperties: Property[] = [
    {
      id: "1",
      title: "Sample Luxury Villa",
      price: 5000000,
      location: "Beverly Hills, Los Angeles",
      status: 'active',
      image: "https://picsum.photos/seed/villa1/1920/1080",
      agent: "John Doe",
      type: "Villa",
      beds: 5,
      baths: 4,
      sqft: 4500,
      currency: "USD",
      listing_type: 'sale',
      location_city: "Los Angeles",
      location_area: "Beverly Hills",
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      floor_size_m2: 450,
      short_description: "A breathtaking modern masterpiece in the heart of Beverly Hills.",
      images: [
        { id: 1, property_id: 1, image_url: "https://picsum.photos/seed/villa1/1920/1080", sort_order: 0, is_hero: true },
        { id: 2, property_id: 1, image_url: "https://picsum.photos/seed/villa2/1920/1080", sort_order: 1, is_hero: false },
        { id: 3, property_id: 1, image_url: "https://picsum.photos/seed/villa3/1920/1080", sort_order: 2, is_hero: false },
      ],
      amenities: [{ id: 1, name: "Pool" }, { id: 2, name: "Gym" }]
    },
    {
      id: "2",
      title: "Modern Sky Penthouse",
      price: 2500000,
      currency: "USD",
      listing_type: 'sale',
      status: 'active',
      location_city: "New York",
      location_area: "Manhattan",
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      floor_size_m2: 120,
      short_description: "Chic urban living with floor-to-ceiling windows and city views.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        { id: 1, property_id: 0, image_url: "https://picsum.photos/seed/pent1/1920/1080", sort_order: 0, is_hero: true },
        { id: 2, property_id: 0, image_url: "https://picsum.photos/seed/pent2/1920/1080", sort_order: 1, is_hero: false },
        { id: 3, property_id: 0, image_url: "https://picsum.photos/seed/pent3/1920/1080", sort_order: 2, is_hero: false },
      ],
      amenities: [{ id: 1, name: "Concierge" }, { id: 2, name: "Rooftop" }]
    },
    {
      id: "3",
      title: "Executive Business Center",
      price: 15000,
      currency: "USD",
      listing_type: 'rent',
      status: 'active',
      location_city: "London",
      location_area: "Canary Wharf",
      bedrooms: 0,
      bathrooms: 2,
      parking: 10,
      floor_size_m2: 800,
      short_description: "Executive office space in a high-traffic financial district.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        { id: 1, property_id: 0, image_url: "https://picsum.photos/seed/office1/1920/1080", sort_order: 0, is_hero: true },
        { id: 2, property_id: 0, image_url: "https://picsum.photos/seed/office2/1920/1080", sort_order: 1, is_hero: false },
        { id: 3, property_id: 0, image_url: "https://picsum.photos/seed/office3/1920/1080", sort_order: 2, is_hero: false },
      ],
      amenities: [{ id: 1, name: "Fiber" }, { id: 2, name: "Meeting Rooms" }]
    }
  ];

  const getSampleProperty = (template?: Template | null) => {
    if (property) return property;
    if (!template) return sampleProperties[0];
    
    // Pick based on category
    if (template.category === 'just_sold') return sampleProperties[0];
    if (template.category === 'banner') return sampleProperties[1];
    if (template.category === 'feature_icons') return sampleProperties[2];
    
    return sampleProperties[parseInt(template.id) % sampleProperties.length];
  };

  const currentSampleProperty = getSampleProperty(selectedDetail);

  const sampleAgent: Agent = agent || {
    id: '0',
    full_name: "John Doe",
    role_optional: "Luxury Specialist",
    profile_photo_url: "https://picsum.photos/seed/agent/400/400",
    email: "john@example.com",
    whatsapp_number: "1234567890",
    cellphone_number: "1234567890",
    agency_id: 'agency-0'
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic text-gray-900">Template Library</h2>
          <p className="text-sm text-gray-500">Browse and select a professional layout for your post.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              aria-label="Search templates"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all" 
            />
          </div>
          <select 
            value={themeFilter}
            aria-label="Filter by theme"
            onChange={e => setThemeFilter(e.target.value)}
            className="px-4 py-2 bg-white text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
          >
            <option value="all">All Themes</option>
            <option value="luxury">Luxury</option>
            <option value="minimal">Minimal</option>
            <option value="bold">Bold</option>
            <option value="editorial">Editorial</option>
            <option value="modern">Modern</option>
          </select>
          <select 
            value={categoryFilter}
            aria-label="Filter by category"
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
          >
            <option value="all">All Categories</option>
            <option value="just_sold">Just Sold</option>
            <option value="for_sale">For Sale</option>
            <option value="banner">Banner</option>
            <option value="multilingual">Multilingual</option>
            <option value="feature_icons">Feature Icons</option>
          </select>
          <button 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            aria-pressed={showFavoritesOnly}
            aria-label="Show favorites only"
            className={`px-4 py-2 text-sm flex items-center gap-2 rounded-xl transition-all border ${showFavoritesOnly ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-gray-500 border-gray-200 hover:text-red-600 hover:border-red-100'}`}
          >
            <Heart size={16} fill={showFavoritesOnly ? "currentColor" : "none"} aria-hidden="true" />
            Favorites
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Template Grid">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))
        ) : filteredTemplates.length > 0 ? (
          filteredTemplates.map(t => (
            <motion.div 
              key={t.id}
              layoutId={`template-${t.id}`}
              role="listitem"
              className={`group relative bg-white rounded-2xl transition-all overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-[#1E97AB] ${selectedTemplateId === t.id ? 'ring-2 ring-[#1E97AB]' : ''}`}
              onClick={() => setSelectedDetail(t)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedDetail(t)}
            >
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img src={t.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={t.name} referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetail(t);
                    }}
                    aria-label={`View details for ${t.name}`}
                    className="p-2 bg-white rounded-full text-gray-900 hover:bg-[#1E97AB] hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Eye size={20} aria-hidden="true" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTemplate(t);
                    }}
                    aria-label={`Edit ${t.name}`}
                    className="p-2 bg-white rounded-full text-gray-900 hover:bg-amber-500 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Edit size={20} aria-hidden="true" />
                  </button>
                </div>
                
                <button 
                  onClick={(e) => toggleFavorite(e, t.id)}
                  aria-label={t.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  aria-pressed={t.is_favorite}
                  className={`absolute top-4 left-4 p-2 rounded-full backdrop-blur-md transition-all z-20 outline-none focus-visible:ring-2 focus-visible:ring-white ${t.is_favorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                >
                  <Heart size={16} fill={t.is_favorite ? "currentColor" : "none"} aria-hidden="true" />
                </button>

                {selectedTemplateId === t.id && (
                  <div className="absolute top-4 right-4 bg-[#1E97AB] text-white p-1.5 rounded-full shadow-lg" aria-label="Selected">
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 truncate pr-2">{t.name}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E97AB] bg-[#1E97AB]/5 px-2 py-0.5 rounded border border-[#1E97AB]/10">
                    {t.style_theme}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">{t.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.tags && typeof t.tags === 'string' && t.tags.split(',').map(tag => (
                    <span key={tag} className="text-[8px] font-mono text-[#1E97AB] bg-[#1E97AB]/5 px-1.5 py-0.5 rounded border border-[#1E97AB]/10">
                      {tag.trim()}
                    </span>
                  ))}
                  {t.supported_formats?.map(f => (
                    <span key={f} className="text-[8px] font-mono text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Layout className="text-gray-400" size={32} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-serif italic text-gray-900 mb-2">No templates found</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedDetail && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setSelectedDetail(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="template-detail-title"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[90vh] bg-white z-[70] flex flex-col overflow-hidden shadow-2xl rounded-3xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Layout className="text-[#1E97AB]" aria-hidden="true" />
                  <h3 id="template-detail-title" className="font-serif italic text-xl">{selectedDetail.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedDetail(null)} 
                  aria-label="Close details"
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1E97AB]"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Preview Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Live Preview</label>
                    <div className="flex items-center gap-4">
                       <button 
                        onClick={() => setIsPreviewWithSample(!isPreviewWithSample)}
                        className="text-[10px] font-mono text-[#1E97AB] flex items-center gap-2"
                      >
                        {isPreviewWithSample ? <Sparkles size={12} /> : <Layout size={12} />}
                        {isPreviewWithSample ? 'Using Sample Data' : 'Using Current Selection'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-12 flex items-center justify-center min-h-[600px] overflow-auto custom-scrollbar">
                    <div className="overflow-hidden">
                      <TemplatePreview 
                        config={{
                          brandingId: branding.id,
                          propertyId: isPreviewWithSample ? '0' : (property?.id || '0'),
                          agentId: isPreviewWithSample ? '0' : (agent?.id || '0'),
                          templateId: selectedDetail.id,
                          selectedAmenities: (isPreviewWithSample ? currentSampleProperty.amenities?.map(a => typeof a === 'string' ? a : a.name) : property?.amenities?.map(a => typeof a === 'string' ? a : a.name)) || [],
                          selectedFacts: ['price', 'beds', 'baths', 'parking', 'size', 'location'],
                          selectedImages: (isPreviewWithSample ? currentSampleProperty.images?.map(i => typeof i === 'string' ? i : i.image_url) : property?.images?.map(i => typeof i === 'string' ? i : i.image_url)) || [],
                          layoutStyle: (selectedDetail.style_theme?.charAt(0).toUpperCase() + (selectedDetail.style_theme?.slice(1) || '')) as any,
                          selectedPlatforms: selectedDetail.supported_formats || [],
                          activePreviewPlatform: selectedDetail.supported_formats?.[0] || '1:1',
                          contactToggles: { whatsapp: true, cell: true, email: true, photo: true }
                        }}
                        property={isPreviewWithSample ? currentSampleProperty : property!}
                        agent={isPreviewWithSample ? sampleAgent : agent!}
                        branding={branding}
                      />
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Description</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{selectedDetail.description}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Supported Formats</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDetail.supported_formats?.map(f => (
                        <span key={f} className="px-3 py-1 bg-gray-50 text-xs font-mono text-gray-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Style Profile</h4>
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-gray-50">
                      <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">Theme</div>
                      <div className="text-sm font-bold capitalize">{selectedDetail.style_theme}</div>
                    </div>
                    <div className="flex-1 p-4 bg-gray-50">
                      <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">Category</div>
                      <div className="text-sm font-bold capitalize">{(selectedDetail.category || 'general').replace('_', ' ')}</div>
                    </div>
                    <div className="flex-1 p-4 bg-gray-50">
                      <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">Version</div>
                      <div className="text-sm font-bold">v{selectedDetail.version}.0</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <button 
                  onClick={() => {
                    onSelect(selectedDetail);
                    setSelectedDetail(null);
                  }}
                  className="w-full bg-[#1E97AB] text-white py-4 rounded-xl font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#359288] transition-all"
                >
                  Use This Template <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
              onClick={() => setEditingTemplate(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-template-title"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white z-[90] rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Edit size={20} aria-hidden="true" />
                  </div>
                  <h3 id="edit-template-title" className="font-serif italic text-xl">Edit Template</h3>
                </div>
                <button 
                  onClick={() => setEditingTemplate(null)} 
                  aria-label="Close edit modal"
                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1E97AB]"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleUpdateTemplate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Template Name</label>
                  <input 
                    id="edit-name"
                    type="text" 
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-description" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Description</label>
                  <textarea 
                    id="edit-description"
                    value={editingTemplate.description || ''}
                    onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all h-24 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-tags" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Tags (comma separated)</label>
                  <input 
                    id="edit-tags"
                    type="text" 
                    value={editingTemplate.tags || ''}
                    onChange={e => setEditingTemplate({...editingTemplate, tags: e.target.value})}
                    placeholder="e.g. Modern, Dark Mode, Luxury"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-theme" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Theme</label>
                    <select 
                      id="edit-theme"
                      value={editingTemplate.style_theme}
                      onChange={e => setEditingTemplate({...editingTemplate, style_theme: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
                    >
                      <option value="luxury">Luxury</option>
                      <option value="minimal">Minimal</option>
                      <option value="bold">Bold</option>
                      <option value="editorial">Editorial</option>
                      <option value="modern">Modern</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-category" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Category</label>
                    <select 
                      id="edit-category"
                      value={editingTemplate.category}
                      onChange={e => setEditingTemplate({...editingTemplate, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
                    >
                      <option value="just_sold">Just Sold</option>
                      <option value="for_sale">For Sale</option>
                      <option value="banner">Banner</option>
                      <option value="multilingual">Multilingual</option>
                      <option value="feature_icons">Feature Icons</option>
                      <option value="new_listing">New Listing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-status" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Listing Status</label>
                    <select 
                      id="edit-status"
                      value={editingTemplate.listing_status || ''}
                      onChange={e => setEditingTemplate({...editingTemplate, listing_status: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
                    >
                      <option value="">None</option>
                      <option value="new_listing">New Listing</option>
                      <option value="for_sale">For Sale</option>
                      <option value="just_sold">Just Sold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-version" className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Version</label>
                    <input 
                      id="edit-version"
                      type="number" 
                      value={editingTemplate.version}
                      onChange={e => setEditingTemplate({...editingTemplate, version: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E97AB] outline-none transition-all"
                      min="1"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="flex-1 py-4 border border-gray-200 rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-gray-50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#1E97AB] text-white py-4 rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-[#359288] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1E97AB]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

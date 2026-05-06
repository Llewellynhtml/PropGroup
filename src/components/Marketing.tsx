import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusSquare, 
  Search, 
  Image as ImageIcon, 
  Type, 
  Calendar, 
  Send, 
  ChevronRight, 
  ChevronLeft,
  X,
  Check,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Music2,
  Sparkles,
  Upload,
  Layout,
  MessageSquare,
  Hash,
  RefreshCw,
  Palette,
  Settings2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabaseClient';
import { properties as mockProperties } from '../mockData';
import { Platform, PostType, Property, Agent, Branding } from '../types';
import Skeleton from './Skeleton';
import { formatCurrency } from '../utils/format';
import { 
  PLATFORMS, 
  DESIGNS, 
  TemplateRenderer, 
  getScaledDimensions,
  PlatformDef,
  TemplateFormat,
  TemplateDesign
} from './SocialMediaTemplates';

import { getEnv } from '../lib/env';

const tones = ['Luxury', 'Professional', 'Urgent', 'Friendly', 'Minimalist'];

export interface MarketingProps {
  initialPlatformId?: string;
  initialFormatId?: string;
  initialDesignId?: string;
}

export default function Marketing({ initialPlatformId, initialFormatId, initialDesignId }: MarketingProps = {}) {
  const { session } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformDef>(() => {
    if (initialPlatformId) {
      return PLATFORMS.find(p => p.id === initialPlatformId) || PLATFORMS[2];
    }
    return PLATFORMS[2];
  });
  
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat | null>(() => {
    if (initialFormatId) {
      const platformToSearch = initialPlatformId 
        ? PLATFORMS.find(p => p.id === initialPlatformId) 
        : PLATFORMS[2];
      
      if (platformToSearch) {
        return platformToSearch.formats.find(f => f.id === initialFormatId) || platformToSearch.formats[0];
      }
    }
    return PLATFORMS[2].formats[0];
  });

  const [selectedDesign, setSelectedDesign] = useState<TemplateDesign>(() => {
    if (initialDesignId) {
      return DESIGNS.find(d => d.id === initialDesignId) || DESIGNS[0];
    }
    return DESIGNS[0];
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [activeElement, setActiveElement] = useState<{ label: string; field: string; value: any; source: string } | null>(null);
  const [agentData, setAgentData] = useState<Agent | null>(null);
  const [brandingData, setBrandingData] = useState<Branding | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [caption, setCaption] = useState('');
  const [tone, setTone] = useState('Luxury');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('property');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [styleOverrides, setStyleOverrides] = useState<Record<string, React.CSSProperties>>({});

  const filteredProperties = (dbProperties.length > 0 ? dbProperties : mockProperties).filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.city || p.area || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSelect = (format: TemplateFormat) => {
    setSelectedFormat(format);
    // Remove artificial delay for a more 'instant' live preview feel
    setExpandedSection('property');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, brandRes, agentRes, agencyRes] = await Promise.all([
          supabase.from('properties').select('*').limit(20),
          supabase.from('branding').select('*').limit(1).maybeSingle(),
          supabase.from('agents').select('*').limit(1).maybeSingle(),
          supabase.from('agencies').select('*').limit(1).maybeSingle(),
        ]);
        
        if (propRes.data) setDbProperties(propRes.data as any);
        
        // If branding table is empty, try agencies table
        if (brandRes.data) {
          setBrandingData(brandRes.data as any);
        } else if (agencyRes.data) {
          const a = agencyRes.data;
          setBrandingData({
            id: a.id,
            agency_id: a.id,
            company_name: a.name,
            logo_url: a.logo_url,
            primary_color: a.primary_color,
            primary_color_hex: a.primary_color,
            secondary_color: a.secondary_color,
            secondary_color_hex: a.secondary_color,
          } as any);
        }
        
        if (agentRes.data) setAgentData(agentRes.data as any);
      } catch (err) {
        console.error('Error fetching marketing data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateCaption = useCallback(async () => {
    if (!selectedProperty) {
      setExpandedSection('property');
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 2000;

    const performGeneration = async (): Promise<string | null> => {
      const p = selectedProperty;
      if (!p) return null;
      
      const apiKey = getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_API_KEY');
      
      const prompt = [
        `Write a ${tone.toLowerCase()} social media caption for a real estate listing on ${selectedPlatform.id}.`,
        `Property: ${p.title}`,
        `Location: ${p.location || p.location_city || 'prime location'}`,
        `Type: ${p.type || p.listing_type || 'property'}`,
        `Price: ${p.currency || 'USD'} ${p.price?.toLocaleString()}`,
        `Beds: ${p.beds ?? p.bedrooms ?? 0}  Baths: ${p.baths ?? p.bathrooms ?? 0}${p.floor_size_m2 ? `  Size: ${p.floor_size_m2}m²` : ''}`,
        p.short_description ? `Description: ${p.short_description}` : '',
        `Tone: ${tone}. Platform: ${selectedPlatform.id}. Post type: ${selectedFormat?.type ?? 'post'}.`,
        `Include a compelling call-to-action and 5–8 relevant hashtags at the end.`,
        `Reply with ONLY the caption text — no commentary, no markdown, no labels.`,
      ].filter(Boolean).join('\n');

      while (retryCount <= maxRetries) {
        try {
          const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey ?? '' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          });

          if (res.status === 429) {
            if (retryCount === maxRetries) throw new Error('Gemini API rate limit exceeded. Please try again in 1 minute.');
            const jitter = Math.random() * 500;
            const delay = (baseDelay * Math.pow(2, retryCount)) + jitter;
            console.warn(`[generateCaption] 429 error, retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
            continue;
          }

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`Gemini API error (${res.status}): ${errData.error?.message || res.statusText}`);
          }
          
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (!text) throw new Error('Empty response from Gemini');
          return text.trim();
        } catch (err: any) {
          if (retryCount === maxRetries || !err.message.includes('429')) throw err;
          retryCount++;
          const jitter = Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, (baseDelay * Math.pow(2, retryCount)) + jitter));
        }
      }
      return null;
    };

    try {
      const result = await performGeneration();
      if (result) {
        setCaption(result);
        setExpandedSection('content');
      }
    } catch (err: any) {
      console.error('[generateCaption]', err);
      setGenerationError(err.message || 'Failed to generate AI caption');
      // Fallback to template string so the UI is never broken
      const p = selectedProperty;
      if (p) {
        setCaption(
          `✨ Discover ${tone.toLowerCase()} living at ${p.title}. Located in ${p.location || 'a prime location'}, this stunning ${(p.type || 'property').toLowerCase()} features ${p.beds ?? p.bedrooms ?? 0} beds and ${p.baths ?? p.bathrooms ?? 0} baths.\n\nDM us for a private viewing! 🗝️\n\n#${(p.location || '').replace(/ /g, '')} #RealEstate #${tone}Living #DreamHome #${selectedPlatform.id}Marketing`
        );
      }
      setExpandedSection('content');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProperty, tone, selectedPlatform.id, selectedFormat?.type]);

  const handleSchedule = useCallback(async () => {
    if (!selectedProperty || !selectedFormat || !scheduledDate || !scheduledTime || !caption || !session) return;
    setIsScheduling(true);
    setScheduleError(null);
    const user = session.user;

    try {
      const { error } = await supabase.from('schedules').insert({
        property_id: selectedProperty.id,
        agent_id: user?.id,
        property_title: selectedProperty.title,
        agent_name: user?.user_metadata?.full_name || user?.email,
        platforms: [selectedPlatform.id],
        caption,
        image_url: Array.isArray(selectedProperty.image_urls) ? selectedProperty.image_urls[0] : (selectedProperty.image || ''),
        scheduled_at: `${scheduledDate}T${scheduledTime}:00Z`,
        status: 'scheduled',
        template_format: selectedFormat.id,
        template_design: selectedDesign.id,
        style_overrides: styleOverrides
      });

      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } catch (err: any) {
      setScheduleError(err.message);
    } finally {
      setIsScheduling(false);
    }
  }, [selectedProperty, selectedFormat, selectedDesign, scheduledDate, scheduledTime, caption, selectedPlatform.id, session, styleOverrides]);

  const handlePostNow = useCallback(async () => {
    if (!selectedProperty || !selectedFormat || !caption || !session) return;
    setIsScheduling(true);
    setScheduleError(null);
    const user = session.user;

    try {
      const { error } = await supabase.from('schedules').insert({
        property_id: selectedProperty.id,
        agent_id: user?.id,
        property_title: selectedProperty.title,
        agent_name: user?.user_metadata?.full_name || user?.email,
        platforms: [selectedPlatform.id],
        caption,
        image_url: Array.isArray(selectedProperty.image_urls) ? selectedProperty.image_urls[0] : (selectedProperty.image || ''),
        scheduled_at: new Date().toISOString(),
        status: 'published',
        template_format: selectedFormat.id,
        template_design: selectedDesign.id,
        style_overrides: styleOverrides
      });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } catch (err: any) {
      setScheduleError(err.message);
    } finally {
      setIsScheduling(false);
    }
  }, [selectedProperty, selectedFormat, selectedDesign, caption, selectedPlatform.id, session, styleOverrides]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" role="status" aria-label="Loading Marketing Workspace">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-12 w-32 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" key="marketing-root">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Post Builder</h2>
        <p className="text-gray-500 font-medium">Create and schedule your social media presence.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Workspace */}
        <div className="xl:col-span-8 space-y-8">
          {/* Platform Selector */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">1. Select Platform</h3>
            <div className="flex flex-wrap gap-4">
              {PLATFORMS.map((platform) => {
                const isSelected = selectedPlatform.id === platform.id;
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatform(platform);
                      setSelectedFormat(platform.formats[0]);
                    }}
                    style={{
                      backgroundColor: isSelected ? platform.lightColor : '#f8f9fa',
                      borderColor: isSelected ? platform.brandColor : '#e9ecef',
                      color: isSelected ? platform.brandColor : '#495057',
                    }}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-full transition-all font-bold text-sm border-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:shadow-sm active:scale-95 group shadow-sm`}
                  >
                    <span className="flex items-center justify-center">
                      {platform.icon}
                    </span>
                    <span className="font-semibold tracking-tight">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Template Grid */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">2. Choose Template</h3>
              <span className="text-xs text-gray-400 font-medium">Optimized for {selectedPlatform.name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10" role="list" aria-label="Post Templates">
              {selectedPlatform.formats.map((format) => {
                const isSelected = selectedFormat?.id === format.id;
                const isVertical = format.height > format.width;
                
                return (
                  <div key={format.id} className="group flex flex-col items-center">
                    <button
                      role="listitem"
                      aria-label={`Select ${format.name} template`}
                      onClick={() => handleTemplateSelect(format)}
                      className={`relative w-full aspect-[4/5] rounded-[2.5rem] flex items-center justify-center transition-all outline-none border-2 p-4 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/10 ring-4 ring-indigo-500/10'
                          : 'border-gray-100 bg-gray-50/30 hover:bg-gray-100/50 hover:border-gray-200 shadow-sm'
                      }`}
                    >
                      {/* Blueprint Grid Background for Mockup Context */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                        style={{ 
                          backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                          backgroundSize: '20px 20px' 
                        }} 
                      />

                      {/* Mockup Frame (Smartphone or Canvas) */}
                      <div className={`relative bg-gray-900 rounded-[2rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden ${
                        isVertical ? 'w-[75%] aspect-[9/19]' : 'w-full aspect-square ring-4 ring-gray-800/10'
                      }`}>
                        {/* Device Glare */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />
                        
                        {/* Notch/Speaker for phone types */}
                        {isVertical && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-b-xl z-20 flex items-center justify-center">
                            <div className="w-8 h-1 bg-gray-700 rounded-full" />
                          </div>
                        )}
                        
                        <div className="w-full h-full bg-[#111] relative overflow-hidden">
                          {/* Scaled Template */}
                          <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            style={{
                              width: format.width,
                              height: format.height,
                              transform: `translate(-50%, -50%) scale(${isVertical ? 0.22 : 0.25})`,
                              transformOrigin: 'center center'
                            }}
                          >
                            <TemplateRenderer 
                              platform={selectedPlatform}
                              format={format}
                              design={selectedDesign}
                              property={mockProperties[0]}
                              agent={agentData || undefined}
                              branding={brandingData || undefined}
                              showMappingLabels={true}
                              isThumbnail={true}
                            />
                          </div>
                        </div>

                        {/* Blueprint overlay label */}
                        <div className="absolute bottom-2 left-0 right-0 text-center z-20">
                          <span className="bg-indigo-600/90 text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Blueprint Mode
                          </span>
                        </div>
                      </div>

                      {/* Selection Badge */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-6 right-6 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl z-30"
                          >
                            <Check className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                    
                    <div className="mt-4 text-center">
                      <p className={`text-sm font-black transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {format.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {format.width} × {format.height} px
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Design Style Selector */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">3. Select Design Style</h3>
              <span className="text-xs text-gray-400 font-medium">Visual Themes</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {DESIGNS.map((design) => {
                const isDesignSelected = selectedDesign.id === design.id;
                return (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={`group flex flex-col items-center gap-3 p-3 rounded-2xl transition-all border-2 ${
                      isDesignSelected 
                        ? 'border-indigo-600 bg-indigo-50/10' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    {/* Micro Design Preview */}
                    <div className="w-full aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                       <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          width: (selectedFormat || PLATFORMS[2].formats[0]).width,
                          height: (selectedFormat || PLATFORMS[2].formats[0]).height,
                          transform: `translate(-50%, -50%) scale(0.1)`,
                          transformOrigin: 'center center'
                        }}
                      >
                        <TemplateRenderer 
                          platform={selectedPlatform}
                          format={selectedFormat || PLATFORMS[2].formats[0]}
                          design={design}
                          property={mockProperties[0]}
                          agent={agentData || undefined}
                          branding={brandingData || undefined}
                          showMappingLabels={true}
                          isThumbnail={true}
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isDesignSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {design.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Editing Workspace (Only shown when template is selected) */}
          <AnimatePresence mode="wait">
            {selectedFormat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {isWorkspaceLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-10 h-10 rounded-xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* 4. Property Picker */}
                    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <button 
                        onClick={() => setExpandedSection(expandedSection === 'property' ? null : 'property')}
                        className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Search className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">4. Select Property</h3>
                            <p className="text-xs text-gray-500 font-medium">
                              {selectedProperty ? selectedProperty.title : 'Attach a property to your post'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'property' ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'property' && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 md:p-8 pt-0 space-y-6 border-t border-gray-50">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search properties by name or location..."
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredProperties.map((property) => (
                                  <button
                                    key={property.id}
                                    onClick={() => {
                                      setSelectedProperty(property);
                                      setExpandedSection('content');
                                    }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                                      selectedProperty?.id === property.id
                                        ? 'border-indigo-600 bg-indigo-50/30'
                                        : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                      <img src={property.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-900 truncate">{property.title}</p>
                                      <p className="text-[10px] text-gray-500 font-medium truncate">{property.location}</p>
                                      <p className="text-xs font-black text-indigo-600 mt-1">{formatCurrency(property.price)}</p>
                                    </div>
                                    {selectedProperty?.id === property.id && (
                                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <Check className="w-4 h-4" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>

                    {/* 5. Content Generator */}
                    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <button 
                        onClick={() => setExpandedSection(expandedSection === 'content' ? null : 'content')}
                        className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">5. Caption & Hashtags</h3>
                            <p className="text-xs text-gray-500 font-medium">Automated content generation</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'content' ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'content' && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 md:p-8 pt-0 space-y-6 border-t border-gray-50">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Tone</label>
                                <div className="flex flex-wrap gap-2">
                                  {tones.map((t) => (
                                    <button
                                      key={t}
                                      onClick={() => setTone(t)}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        tone === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                      }`}
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generated Copy</label>
                                  <button 
                                    onClick={generateCaption}
                                    disabled={isGenerating}
                                    className="text-xs text-indigo-600 font-bold flex items-center gap-2 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                  >
                                    {isGenerating ? 'Generating...' : 'Regenerate'}
                                    {!isGenerating && <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />}
                                  </button>
                                </div>
                                <div className="relative">
                                  {generationError && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                      <div className="mt-0.5 p-1 bg-amber-200 rounded-full text-amber-900">
                                        <RefreshCw size={10} className="animate-spin" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-[11px] font-bold text-amber-900">AI Limit Reached</p>
                                        <p className="text-[10px] text-amber-800/80 leading-relaxed">
                                          {generationError}. We've provided a standard placeholder caption for now.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Click regenerate to create a caption based on your property..."
                                    className="w-full h-40 p-5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                                  />
                                  <div className="absolute bottom-4 right-4 flex gap-2">
                                    <button className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm border border-gray-100 transition-all"><MessageSquare className="w-4 h-4" /></button>
                                    <button className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm border border-gray-100 transition-all"><Hash className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>

                    {/* 5. Media Assets */}
                    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <button 
                        onClick={() => setExpandedSection(expandedSection === 'media' ? null : 'media')}
                        className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">6. Media Assets</h3>
                            <p className="text-xs text-gray-500 font-medium">Manage property photos</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'media' ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'media' && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 md:p-8 pt-0 space-y-6 border-t border-gray-50">
                              <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">Drag and drop images or videos</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Optimized for {selectedPlatform.name} {selectedFormat?.name}
                                  </p>
                                </div>
                                <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">Browse Files</button>
                              </div>
                              
                              {selectedProperty && (
                                <div className="space-y-3">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Library Image</p>
                                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {(selectedProperty.image_urls && Array.isArray(selectedProperty.image_urls) ? selectedProperty.image_urls : [selectedProperty.image]).map((url, idx) => {
                                      if (!url) return null;
                                      const isSelected = selectedProperty.image === url;
                                      return (
                                        <button 
                                          key={idx} 
                                          onClick={() => setSelectedProperty({...selectedProperty, image: url})}
                                          className={`relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer border-2 transition-all ${
                                            isSelected ? 'border-indigo-600' : 'border-transparent hover:border-indigo-500'
                                          }`}
                                        >
                                          <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                                          <div className={`absolute inset-0 group-hover:bg-transparent transition-all ${isSelected ? 'bg-indigo-600/10' : 'bg-black/20'}`} />
                                          {isSelected && (
                                            <div className="absolute top-1 right-1">
                                              <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                                <Check className="w-3 h-3" />
                                              </div>
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>

                    {/* 6. Scheduling */}
                    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <button 
                        onClick={() => setExpandedSection(expandedSection === 'schedule' ? null : 'schedule')}
                        className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">6. Schedule & Publish</h3>
                            <p className="text-xs text-gray-500 font-medium">Choose when to go live</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'schedule' ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'schedule' && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 md:p-8 pt-0 space-y-6 border-t border-gray-50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                                  <input 
                                    type="date" 
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                                  <input 
                                    type="time" 
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                                  <RefreshCw className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-indigo-900">Cross-posting enabled</p>
                                  <p className="text-[10px] text-indigo-600 font-medium">This post will also be shared to Facebook and LinkedIn</p>
                                </div>
                                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit</button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Live Preview */}
        <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-28">
          <section className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Live Preview</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            </div>

            {/* Device Mockup */}
            <div className="relative mx-auto w-full max-w-[300px] aspect-[9/19] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden p-1">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20" />
              
              <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
                {/* Platform Header Mockup */}
                <div className="p-4 flex items-center gap-2 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
                  <div className="flex-1">
                    <div className="h-2 w-20 bg-gray-100 rounded-full mb-1" />
                    <div className="h-1.5 w-12 bg-gray-50 rounded-full" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                  </div>
                </div>

                {/* Content Area */}
                <div className="relative w-full overflow-hidden bg-gray-50 flex items-center justify-center p-2" style={{ aspectRatio: selectedFormat?.aspectRatio.replace(':', '/') || '1/1' }}>
                  {selectedFormat && (
                    (() => {
                      const scaled = getScaledDimensions(selectedFormat, 280);
                      // Use mockProperties[0] as demo property if none selected
                      const displayProperty = selectedProperty || mockProperties[0];
                      
                      return (
                        <div 
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            width: selectedFormat.width,
                            height: selectedFormat.height,
                            transform: `translate(-50%, -50%) scale(${scaled.scale})`,
                            transformOrigin: 'center center'
                          }}
                        >
                          {!selectedProperty && (
                            <div className="absolute top-6 left-6 z-50 bg-indigo-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/20 backdrop-blur-md animate-pulse">
                              <Sparkles size={12} />
                              BUILDER PREVIEW
                            </div>
                          )}
                          <TemplateRenderer 
                            platform={selectedPlatform}
                            format={selectedFormat}
                            design={selectedDesign}
                            property={displayProperty}
                            agent={agentData || undefined}
                            branding={brandingData || undefined}
                            onElementClick={setActiveElement}
                            activeElementField={activeElement?.field}
                            styleOverrides={styleOverrides}
                          />
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Interaction Bar */}
                <div className="p-4 space-y-3">
                  <AnimatePresence>
                    {activeElement && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 space-y-1 relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveElement(null); }}
                            className="absolute top-2 right-2 p-1 hover:bg-amber-100 rounded-md text-amber-600"
                          >
                            <X size={12} />
                          </button>
                          <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-amber-600" />
                            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Data Inspector</span>
                          </div>
                          <p className="text-[11px] font-bold text-gray-900">
                            {activeElement.label}: <span className="font-normal text-gray-600">{String(activeElement.value)}</span>
                          </p>
                          <p className="text-[9px] text-amber-700/60 font-medium">
                            Mapped from: <code className="bg-amber-100/50 px-1 rounded">{activeElement.source}.{activeElement.field}</code>
                          </p>

                          {/* Styling Controls */}
                          <div className="mt-4 pt-4 border-t border-amber-200/50 space-y-4 pb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Settings2 size={12} className="text-amber-700" />
                              <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Adjust Styling</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                                  <Type size={10} /> Font Size
                                </label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="range" 
                                    min="8" 
                                    max="120" 
                                    value={parseInt(String(styleOverrides[activeElement.field]?.fontSize || '16'))}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setStyleOverrides(prev => ({
                                        ...prev,
                                        [activeElement.field]: {
                                          ...prev[activeElement.field],
                                          fontSize: `${val}px`
                                        }
                                      }));
                                    }}
                                    className="flex-1 accent-amber-600"
                                  />
                                  <span className="text-[10px] font-mono w-6 text-gray-400">
                                    {parseInt(String(styleOverrides[activeElement.field]?.fontSize || '16'))}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                                  <Palette size={10} /> Color
                                </label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="color" 
                                    value={String(styleOverrides[activeElement.field]?.color || '#000000')}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setStyleOverrides(prev => ({
                                        ...prev,
                                        [activeElement.field]: {
                                          ...prev[activeElement.field],
                                          color: val
                                        }
                                      }));
                                    }}
                                    className="w-full h-8 rounded-lg bg-white p-1 border border-amber-200 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                                  <Layout size={10} /> Padding
                                </label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="80" 
                                    value={parseInt(String(styleOverrides[activeElement.field]?.padding || '0'))}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setStyleOverrides(prev => ({
                                        ...prev,
                                        [activeElement.field]: {
                                          ...prev[activeElement.field],
                                          padding: `${val}px`
                                        }
                                      }));
                                    }}
                                    className="flex-1 accent-amber-600"
                                  />
                                  <span className="text-[10px] font-mono w-6 text-gray-400">
                                    {parseInt(String(styleOverrides[activeElement.field]?.padding || '0'))}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                                  <AlignLeft size={10} /> Alignment
                                </label>
                                <div className="flex bg-white rounded-lg border border-amber-200 p-0.5">
                                  {(['left', 'center', 'right'] as const).map(align => (
                                    <button
                                      key={align}
                                      onClick={() => {
                                        setStyleOverrides(prev => ({
                                          ...prev,
                                          [activeElement.field]: {
                                            ...prev[activeElement.field],
                                            textAlign: align
                                          }
                                        }));
                                      }}
                                      className={`flex-1 flex justify-center py-1 rounded-md transition-colors ${
                                        (styleOverrides[activeElement.field]?.textAlign || 'left') === align 
                                          ? 'bg-amber-100 text-amber-700 shadow-sm' 
                                          : 'text-gray-400 hover:bg-gray-50'
                                      }`}
                                    >
                                      {align === 'left' && <AlignLeft size={12} />}
                                      {align === 'center' && <AlignCenter size={12} />}
                                      {align === 'right' && <AlignRight size={12} />}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                const next = { ...styleOverrides };
                                delete next[activeElement.field];
                                setStyleOverrides(next);
                              }}
                              className="w-full py-2 bg-white text-gray-400 hover:text-red-500 text-[10px] font-bold rounded-xl border border-dashed border-gray-200 hover:border-red-200 transition-all"
                            >
                              Reset to Design Default
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
                      <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
                      <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
                    </div>
                    <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                    <div className="h-2 w-3/4 bg-gray-100 rounded-full" />
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-4 leading-relaxed">
                    {caption || 'Your generated caption will appear here once you select a property and tone...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                disabled={!selectedFormat || !selectedProperty || !scheduledDate || !scheduledTime || !caption || isScheduling}
                onClick={handleSchedule}
                className="py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Calendar className="w-5 h-5" />
                {isScheduling ? 'Saving...' : 'Schedule'}
              </button>
              <button 
                disabled={!selectedFormat || !selectedProperty || !caption || isScheduling}
                onClick={handlePostNow}
                className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {isScheduling ? 'Publishing...' : 'Post Now'}
              </button>
            </div>
            {scheduleError && (
              <p className="text-xs text-red-500 font-medium text-center mt-2">{scheduleError}</p>
            )}

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-24 left-6 right-6 bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Post Published Successfully!</p>
                    <p className="text-[10px] opacity-90">Your content is now live on {selectedPlatform.name}.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedFormat && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-3 max-w-[240px]">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                    <Layout className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Select a template to start previewing</p>
                  <p className="text-xs text-gray-500">Choose from the grid on the left to unlock the workspace.</p>
                </div>
              </div>
            )}
          </section>

          {/* Progress Indicator */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workspace Progress</p>
              <p className="text-xs font-bold text-indigo-600">
                {Math.round(((selectedPlatform ? 1 : 0) + (selectedFormat ? 1 : 0) + (selectedProperty ? 1 : 0) + (caption ? 1 : 0)) / 4 * 100)}%
              </p>
            </div>
            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((selectedPlatform ? 1 : 0) + (selectedFormat ? 1 : 0) + (selectedProperty ? 1 : 0) + (caption ? 1 : 0)) / 4 * 100}%` }}
                className="h-full bg-indigo-600"
              />
            </div>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    step <= ((selectedPlatform ? 1 : 0) + (selectedFormat ? 1 : 0) + (selectedProperty ? 1 : 0) + (caption ? 1 : 0)) 
                      ? 'bg-indigo-600' 
                      : 'bg-gray-100'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
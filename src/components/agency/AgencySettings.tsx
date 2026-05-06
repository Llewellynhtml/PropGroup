import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Users, 
  Palette, 
  Upload, 
  Save, 
  Loader2,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function AgencySettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: '',
    businessEmail: '',
    officePhone: '',
    website: '',
    officeAddress: '',
    agentCount: '',
    brandColor: '#1E97AB',
    logoUrl: ''
  });

  useEffect(() => {
    const fetchAgencyData = async () => {
      if (!user?.agency_id) return;
      try {
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', user.agency_id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            agencyName: data.name || '',
            businessEmail: data.email || '',
            officePhone: data.office_number || '',
            website: data.website || '',
            officeAddress: data.address || '',
            agentCount: data.agent_count || '',
            brandColor: data.brand_color || '#1E97AB',
            logoUrl: data.logo_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching agency data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencyData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('agencies')
        .update({
          name: formData.agencyName,
          email: formData.businessEmail,
          office_number: formData.officePhone,
          website: formData.website,
          address: formData.officeAddress,
          agent_count: formData.agentCount,
          brand_color: formData.brandColor,
          logo_url: formData.logoUrl
        })
        .eq('id', user?.agency_id);

      if (error) throw error;
      toast.success('Agency settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Agency Settings</h2>
        <p className="text-sm text-gray-500 font-medium">Manage your agency profile, branding, and office details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agency Branding</h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <div className="w-32 h-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-brand-teal transition-colors">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-300" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 text-center mt-2 uppercase tracking-widest">Agency Logo</p>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand Primary Color</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl border border-gray-100 shadow-sm shrink-0" 
                    style={{ backgroundColor: formData.brandColor }}
                  />
                  <input 
                    id="brandColor"
                    type="text"
                    value={formData.brandColor}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                    placeholder="#1E97AB"
                  />
                  <input 
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agency Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Agency Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  id="agencyName"
                  type="text"
                  required
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  id="businessEmail"
                  type="email"
                  required
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Office Phone</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  id="officePhone"
                  type="tel"
                  required
                  value={formData.officePhone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Website</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Office Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  id="officeAddress"
                  type="text"
                  required
                  value={formData.officeAddress}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Number of Agents</label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <select 
                  id="agentCount"
                  value={formData.agentCount}
                  onChange={handleChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all appearance-none"
                >
                  <option value="1-10">1–10 Agents</option>
                  <option value="11-50">11–50 Agents</option>
                  <option value="51-100">51–100 Agents</option>
                  <option value="100+">100+ Agents</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-brand-charcoal text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center gap-2 group disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Save Agency Profile <Save size={18} className="group-hover:scale-110 transition-transform" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

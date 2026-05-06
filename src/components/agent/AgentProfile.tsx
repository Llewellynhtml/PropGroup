import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Building2, 
  Save, 
  Loader2,
  CheckCircle2,
  Lock,
  Globe,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function AgentProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cellphone: '',
    specialization: '',
    profile_photo_url: '',
    agency_id: '',
    agency_name: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*, agencies(name)')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: data.email || '',
            cellphone: data.cellphone || '',
            specialization: data.role_optional || '',
            profile_photo_url: data.profile_photo_url || '',
            agency_id: data.agency_id || '',
            agency_name: data.agencies?.name || 'Independent'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          full_name: formData.full_name,
          cellphone: formData.cellphone,
          role_optional: formData.specialization,
          profile_photo_url: formData.profile_photo_url
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 font-medium">Manage your personal information and professional details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-brand-teal transition-all shadow-inner">
              {formData.profile_photo_url ? (
                <img src={formData.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-300" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="text-white w-8 h-8" />
              </div>
            </div>
            <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-brand-teal text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-xl font-black text-gray-900">{formData.full_name || 'Your Name'}</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{formData.specialization || 'Real Estate Professional'}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 size={10} /> Verified Agent
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Building2 size={10} /> {formData.agency_name}
              </span>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Personal Information</h4>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group opacity-60">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  disabled
                  value={formData.email}
                  className="w-full pl-12 pr-6 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-sm font-medium cursor-not-allowed"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium ml-1">Email cannot be changed manually.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  value={formData.cellphone}
                  onChange={(e) => setFormData({...formData, cellphone: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Professional Details</h4>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialization</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                  placeholder="e.g. Luxury Residential"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Agency Connection</label>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-brand-teal shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{formData.agency_name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connected Agency</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Photo URL</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={18} />
                <input 
                  value={formData.profile_photo_url}
                  onChange={(e) => setFormData({...formData, profile_photo_url: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="px-10 py-4 bg-brand-charcoal text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center gap-2 group disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Save Changes <Save size={18} className="group-hover:scale-110 transition-transform" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

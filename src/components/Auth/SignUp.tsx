import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, Phone, Building2, MapPin, Image as ImageIcon } from 'lucide-react';
import AuthTabs from '../AuthTabs';
import { useNavigate } from 'react-router-dom';

interface SignUpProps {
  key?: string;
  onSuccess?: () => void;
  onToggleMode: () => void;
}

export default function SignUp({ onSuccess, onToggleMode }: SignUpProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'agency'>(() => {
    return (localStorage.getItem('proppost_auth_tab') as 'agent' | 'agency') || 'agent';
  });
  
  // Agent Form State
  const [agentData, setAgentData] = useState({
    fullName: '',
    email: '',
    password: '',
    cellphone: ''
  });

  // Agency Form State
  const [agencyData, setAgencyData] = useState({
    agencyName: '',
    email: '',
    password: '',
    officeNumber: '',
    city: '',
    logoUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('proppost_auth_tab', activeTab);
  }, [activeTab]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const currentData = activeTab === 'agent' ? agentData : agencyData;

    try {
      if (currentData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: currentData.email,
        password: currentData.password,
        options: {
          data: {
            full_name: activeTab === 'agent' ? agentData.fullName : agencyData.agencyName,
            role: activeTab
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        if (activeTab === 'agent') {
          const { error: agentError } = await supabase
            .from('agents')
            .insert([
              {
                id: data.user.id,
                full_name: agentData.fullName,
                email: agentData.email,
                cellphone: agentData.cellphone,
              },
            ]);
          if (agentError) throw agentError;
        } else {
          const { error: agencyError } = await supabase
            .from('agencies')
            .insert([
              {
                id: data.user.id,
                agency_name: agencyData.agencyName,
                email: agencyData.email,
                office_number: agencyData.officeNumber,
                city: agencyData.city,
                logo_url: agencyData.logoUrl,
              },
            ]);
          if (agencyError) throw agencyError;
        }
      }

      setSuccess(true);
      if (data.user && data.session === null) {
        setError('Email confirmation is required. Please check your inbox.');
      } else if (data.user) {
        setTimeout(() => {
          navigate(activeTab === 'agent' ? '/agent-dashboard' : '/agency-dashboard');
          if (onSuccess) onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 rounded-[2rem] shadow-xl border border-gray-100 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Success!</h2>
        <p className="text-gray-500 font-medium">Your {activeTab} account has been created.</p>
        <button
          onClick={onToggleMode}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          Go to Sign In
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-gray-500 font-medium">Join as an {activeTab}</p>
      </div>

      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <form onSubmit={handleSignUp} className="space-y-4">
        {activeTab === 'agent' ? (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={agentData.fullName}
                  onChange={(e) => setAgentData({ ...agentData, fullName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cellphone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={agentData.cellphone}
                  onChange={(e) => setAgentData({ ...agentData, cellphone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="+27 12 345 6789"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Agency Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={agencyData.agencyName}
                  onChange={(e) => setAgencyData({ ...agencyData, agencyName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Luxury Homes Agency"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Office Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={agencyData.officeNumber}
                    onChange={(e) => setAgencyData({ ...agencyData, officeNumber: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="011 123 4567"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={agencyData.city}
                    onChange={(e) => setAgencyData({ ...agencyData, city: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Cape Town"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={agencyData.logoUrl}
                  onChange={(e) => setAgencyData({ ...agencyData, logoUrl: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={activeTab === 'agent' ? agentData.email : agencyData.email}
              onChange={(e) => activeTab === 'agent' ? setAgentData({ ...agentData, email: e.target.value }) : setAgencyData({ ...agencyData, email: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              required
              minLength={6}
              value={activeTab === 'agent' ? agentData.password : agencyData.password}
              onChange={(e) => activeTab === 'agent' ? setAgentData({ ...agentData, password: e.target.value }) : setAgencyData({ ...agencyData, password: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Sign Up as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 font-medium">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-indigo-600 font-bold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
}

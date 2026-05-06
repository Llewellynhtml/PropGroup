import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import AuthTabs from '../AuthTabs';
import { useNavigate } from 'react-router-dom';

interface SignInProps {
  key?: string;
  onSuccess?: () => void;
  onToggleMode: () => void;
}

export default function SignIn({ onSuccess, onToggleMode }: SignInProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'agency'>(() => {
    return (localStorage.getItem('proppost_auth_tab') as 'agent' | 'agency') || 'agent';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('proppost_auth_tab', activeTab);
  }, [activeTab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check which table they belong to
        const { data: agent } = await supabase.from('agents').select('id').eq('id', data.user.id).single();
        if (agent) {
          navigate('/agent-dashboard');
          if (onSuccess) onSuccess();
          return;
        }

        const { data: agency } = await supabase.from('agencies').select('id').eq('id', data.user.id).single();
        if (agency) {
          navigate('/agency-dashboard');
          if (onSuccess) onSuccess();
          return;
        }

        // Fallback
        navigate('/');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 font-medium">Sign in to your {activeTab} account</p>
      </div>

      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Sign In as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 font-medium">
          Don't have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-indigo-600 font-bold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </motion.div>
  );
}

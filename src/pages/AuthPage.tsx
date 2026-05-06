import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import AuthHero from '../components/Auth/AuthHero';
import RoleSwitcher from '../components/Auth/RoleSwitcher';
import AgentSignIn from '../components/Auth/AgentSignIn';
import AgencySignIn from '../components/Auth/AgencySignIn';
import AgentSignUp from '../components/Auth/AgentSignUp';
import AgencySignUp from '../components/Auth/AgencySignUp';
import { Megaphone } from 'lucide-react';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(() => {
    return localStorage.getItem('proppost_auth_mode') !== 'signup';
  });
  const [activeRole, setActiveRole] = useState<'agent' | 'agency'>(() => {
    return (localStorage.getItem('proppost_auth_role') as 'agent' | 'agency') || 'agent';
  });
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  useEffect(() => {
    localStorage.setItem('proppost_auth_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('proppost_auth_mode', isSignIn ? 'signin' : 'signup');
  }, [isSignIn]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-brand-surface">
      {/* Left Panel - Hero */}
      <AuthHero />

      {/* Right Panel - Form */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        {/* Mobile Logo Bar */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
            <Megaphone className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tighter text-gray-900">PropPost</span>
        </div>

        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <RoleSwitcher activeRole={activeRole} onRoleChange={setActiveRole} />
            
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
              {isSignIn ? 'Welcome Back' : 'Join PropPost'}
            </h2>
            <p className="text-gray-500 font-medium text-center">
              {isSignIn 
                ? `Sign in to your ${activeRole} workspace` 
                : activeRole === 'agent' 
                  ? 'Join the elite network of SA real estate agents'
                  : 'Register your organisation and start scaling'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeRole}-${isSignIn}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isSignIn ? (
                activeRole === 'agent' ? (
                  <AgentSignIn onToggle={() => setIsSignIn(false)} />
                ) : (
                  <AgencySignIn onToggle={() => setIsSignIn(false)} />
                )
              ) : (
                activeRole === 'agent' ? (
                  <AgentSignUp onToggle={() => setIsSignIn(true)} />
                ) : (
                  <AgencySignUp onToggle={() => setIsSignIn(true)} />
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          &copy; 2026 PropPost Real Estate Network
        </p>
      </div>
    </div>
  );
}

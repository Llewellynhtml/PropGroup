import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, ArrowRight, CheckCircle2, Star, Users, Layout } from 'lucide-react';
import AgentSignIn from '../components/Auth/AgentSignIn';
import AgencySignIn from '../components/Auth/AgencySignIn';
import AgentSignUp from '../components/Auth/AgentSignUp';
import AgencySignUp from '../components/Auth/AgencySignUp';
import { cn } from '../lib/utils';

type AuthTab = 'signin' | 'signup';
type UserRole = 'agent' | 'agency';

const PremiumHouse = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M5 21V8l7-4 7 4v13" />
    <path d="M10 21v-7h4v7" />
    <rect x="7" y="11" width="2" height="2" />
    <rect x="15" y="11" width="2" height="2" />
    <path d="M11 7h2" />
    <path d="M17 5v2" />
  </svg>
);

export default function Login() {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [activeRole, setActiveRole] = useState<UserRole>('agent');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle initial tab/role from location state if needed
  useEffect(() => {
    const state = location.state as { tab?: AuthTab; role?: UserRole } | null;
    if (state?.tab) setActiveTab(state.tab);
    if (state?.role) setActiveRole(state.role);
  }, [location]);

  const renderForm = () => {
    if (activeTab === 'signin') {
      return activeRole === 'agent' ? (
        <AgentSignIn onToggle={() => setActiveTab('signup')} />
      ) : (
        <AgencySignIn onToggle={() => setActiveTab('signup')} />
      );
    } else {
      return activeRole === 'agent' ? (
        <AgentSignUp onToggle={() => setActiveTab('signin')} />
      ) : (
        <AgencySignUp onToggle={() => setActiveTab('signin')} />
      );
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface flex font-sans overflow-hidden">
      {/* Left Panel: Branded Content */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-charcoal relative overflow-hidden flex-col justify-between p-16">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-brand-teal/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-teal-deep/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal to-brand-teal-deep rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-brand-teal to-brand-teal-deep rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(30,151,171,0.3)] border border-white/10">
                <PremiumHouse className="text-white" size={28} />
              </div>
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-tight">PropPost</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-8">
              The future of <br />
              <span className="text-brand-teal italic">Real Estate</span> <br />
              marketing is here.
            </h1>
            <p className="text-brand-muted-light/60 text-lg max-w-md leading-relaxed font-medium">
              Automate your social presence, generate high-converting branded content, and manage your listings with precision.
            </p>
          </motion.div>

          <div className="mt-12 space-y-4">
            {[
              { icon: CheckCircle2, text: "AI-Powered Content Generation" },
              { icon: Layout, text: "Automated Social Media Scheduling" },
              { icon: Users, text: "Agency-Wide Brand Management" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3 text-white/80 font-medium"
              >
                <item.icon className="w-5 h-5 text-brand-teal" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] max-w-md">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-brand-teal text-brand-teal" />
              ))}
            </div>
            <p className="text-white/90 font-medium leading-relaxed mb-6 italic">
              "PropPost has completely transformed how our agency handles social media. Our brand consistency has never been better."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center font-bold text-brand-teal">
                SJ
              </div>
              <div>
                <p className="font-bold text-white">Sarah Jenkins</p>
                <p className="text-xs text-brand-muted-light uppercase tracking-widest font-bold">Top Producer @ GroupTen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-16 bg-brand-surface overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-teal to-brand-teal-deep rounded-3xl blur-xl opacity-20"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-brand-teal to-brand-teal-deep rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10">
                <PremiumHouse className="text-white" size={40} />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-brand-charcoal tracking-tight">PropPost</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-display font-bold text-brand-charcoal tracking-tight mb-3">
              {activeTab === 'signin' ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-brand-slate font-medium">
              {activeTab === 'signin' 
                ? 'Enter your credentials to access your dashboard' 
                : 'Create your account to start automating your marketing'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-brand-teal-light rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab('signin')}
              className={cn(
                "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200",
                activeTab === 'signin' 
                  ? "bg-white text-brand-teal shadow-sm" 
                  : "text-brand-slate hover:text-brand-teal"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={cn(
                "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200",
                activeTab === 'signup' 
                  ? "bg-white text-brand-teal shadow-sm" 
                  : "text-brand-slate hover:text-brand-teal"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">I am an:</span>
            <div className="flex p-1 bg-white border border-brand-border rounded-xl">
              <button
                onClick={() => setActiveRole('agent')}
                className={cn(
                  "px-6 py-2 text-xs font-bold rounded-lg transition-all",
                  activeRole === 'agent' 
                    ? "bg-brand-charcoal text-white shadow-md" 
                    : "text-brand-slate hover:bg-brand-teal-light"
                )}
              >
                Agent
              </button>
              <button
                onClick={() => setActiveRole('agency')}
                className={cn(
                  "px-6 py-2 text-xs font-bold rounded-lg transition-all",
                  activeRole === 'agency' 
                    ? "bg-brand-charcoal text-white shadow-md" 
                    : "text-brand-slate hover:bg-brand-teal-light"
                )}
              >
                Agency
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-brand-border p-8 lg:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeRole}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderForm()}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center mt-12 text-brand-muted text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; 2026 GroupTen Properties. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

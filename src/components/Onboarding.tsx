import React, { useState } from 'react';
import { 
  UserCircle, 
  Users, 
  Home, 
  Target, 
  ChevronRight, 
  Check,
  CheckCircle2,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

interface OnboardingProps {
  onComplete: (role: UserRole) => void;
}

const roles: { id: UserRole; label: string; desc: string; icon: any }[] = [
  { id: 'agent', label: 'Estate Agent', desc: 'Focus on property listings, lead management, and closing deals.', icon: UserCircle },
  { id: 'developer', label: 'Property Developer', desc: 'Manage large projects, track construction progress, and bulk marketing.', icon: Home },
  { id: 'marketer', label: 'Marketing Specialist', desc: 'Build campaigns, schedule social posts, and analyze performance.', icon: Target },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedRole) {
      setStep(2);
    } else if (step === 2) {
      onComplete(selectedRole!);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl shadow-indigo-100 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left: Visual */}
        <div className="md:w-2/5 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
              <Megaphone className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black leading-tight">Welcome to Prop-Post</h2>
            <p className="text-indigo-100 mt-4 font-medium leading-relaxed">Let's personalize your experience to help you achieve more.</p>
          </div>

          <div className="relative z-10 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-white text-indigo-600 border-white' : 'border-indigo-400 text-indigo-400'}`}>
                  {step > i ? <Check className="w-4 h-4" /> : i}
                </div>
                <span className={`text-sm font-bold uppercase tracking-widest ${step >= i ? 'text-white' : 'text-indigo-400'}`}>
                  {i === 1 ? 'Select Role' : 'Finalize'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:w-3/5 p-12 md:p-20 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h3 className="text-3xl font-black text-gray-900">What's your role?</h3>
                  <p className="text-gray-500 mt-2 font-medium">Choose the role that best describes what you do.</p>
                </div>

                <div className="space-y-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group ${
                        selectedRole === role.id
                          ? 'border-indigo-600 bg-indigo-50/30'
                          : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        selectedRole === role.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}>
                        <role.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-900">{role.label}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">{role.desc}</p>
                      </div>
                      {selectedRole === role.id && <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={!selectedRole}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10 text-center"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-emerald-50">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                
                <div>
                  <h3 className="text-3xl font-black text-gray-900">You're all set!</h3>
                  <p className="text-gray-500 mt-2 font-medium">We've tailored your dashboard and marketing templates for your role as a <span className="text-indigo-600 font-bold">{roles.find(r => r.id === selectedRole)?.label}</span>.</p>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl space-y-4 text-left">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Personalized features enabled:</p>
                  <ul className="space-y-3">
                    {[
                      'Custom KPI widgets for your role',
                      'Role-specific marketing templates',
                      'Automated lead routing rules',
                      'Advanced performance analytics'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Shield, 
  Globe, 
  Mail, 
  Smartphone, 
  Check, 
  ChevronRight,
  User,
  CreditCard,
  Key,
  Database,
  Cloud,
  Zap,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const sections = [
  { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your personal information and preferences' },
  { id: 'branding', label: 'Brand Identity', icon: Palette, desc: 'Customize your agency colors, logos, and fonts' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Configure how you receive alerts and updates' },
  { id: 'security', label: 'Security & Privacy', icon: Shield, desc: 'Manage passwords, 2FA, and data access' },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard, desc: 'Manage your subscription and payment methods' },
  { id: 'integrations', label: 'Integrations', icon: Zap, desc: 'Connect with third-party tools and platforms' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div 
          className="lg:col-span-4 space-y-4"
          role="tablist"
          aria-label="Settings sections"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              role="tab"
              aria-selected={activeSection === section.id}
              aria-controls={`settings-panel-${section.id}`}
              id={`settings-tab-${section.id}`}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl border transition-all text-left group outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                activeSection === section.id
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-xl shadow-indigo-50'
                  : 'border-gray-100 bg-white hover:border-indigo-200'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all ${
                activeSection === section.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
              }`}>
                <section.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{section.label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">{section.desc}</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-all ${activeSection === section.id ? 'text-indigo-600 translate-x-1' : 'text-gray-300'}`} aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              id={`settings-panel-${activeSection}`}
              role="tabpanel"
              aria-labelledby={`settings-tab-${activeSection}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 space-y-10 outline-none"
              tabIndex={0}
            >
              {activeSection === 'profile' && <ProfileSettings />}
              {activeSection === 'branding' && <BrandingSettings />}
              {activeSection === 'notifications' && <NotificationSettings />}
              {activeSection === 'security' && <SecuritySettings />}
              {activeSection === 'billing' && <BillingSettings />}
              {activeSection === 'integrations' && <IntegrationSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-indigo-100">
            JD
          </div>
          <button 
            aria-label="Change profile picture"
            className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 rounded-xl shadow-lg text-gray-600 hover:text-indigo-600 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
          >
            <SettingsIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-900">John Doe</h3>
          <p className="text-sm text-gray-500 font-medium">Senior Estate Agent · Beverly Hills Office</p>
          <div className="flex justify-center sm:justify-start gap-2 mt-3">
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Verified</span>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">Admin</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="full-name" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
          <input 
            id="full-name"
            type="text" 
            defaultValue="John Doe" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email-address" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
          <input 
            id="email-address"
            type="email" 
            defaultValue="john.doe@estatehub.com" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone-number" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
          <input 
            id="phone-number"
            type="tel" 
            defaultValue="+1 555-0101" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="job-title" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Title</label>
          <input 
            id="job-title"
            type="text" 
            defaultValue="Senior Estate Agent" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-end gap-4">
        <button className="px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all focus-visible:ring-2 focus-visible:ring-gray-300 outline-none">Cancel</button>
        <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none">Save Changes</button>
      </div>
    </div>
  );
}

function BrandingSettings() {
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900">Visual Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Logo</label>
            <div 
              role="button"
              tabIndex={0}
              aria-label="Upload primary logo"
              className="border-2 border-dashed border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-all">
                <Cloud className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold text-gray-900">Upload SVG or PNG</p>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Favicon</label>
            <div 
              role="button"
              tabIndex={0}
              aria-label="Upload favicon"
              className="border-2 border-dashed border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-all">
                <Globe className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold text-gray-900">Upload ICO or PNG</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900">Brand Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'primary-accent', label: 'Primary Accent', color: '#4f46e5' },
            { id: 'secondary-color', label: 'Secondary Color', color: '#10b981' },
            { id: 'success-color', label: 'Success Color', color: '#34d399' },
          ].map((c) => (
            <div key={c.id} className="space-y-2">
              <label htmlFor={c.id} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.label}</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-600 transition-all">
                <div 
                  className="w-10 h-10 rounded-xl shadow-sm cursor-pointer" 
                  style={{ backgroundColor: c.color }}
                  role="button"
                  aria-label={`Select ${c.label}`}
                ></div>
                <input 
                  id={c.id}
                  type="text" 
                  defaultValue={c.color} 
                  className="text-xs font-bold text-gray-900 uppercase tracking-widest bg-transparent border-none p-0 w-20 outline-none" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex justify-end gap-4">
        <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none">Apply Branding</button>
      </div>
    </div>
  );
}

function NotificationSettings() { return <div className="text-center py-20 text-gray-400 font-bold">Notification settings content...</div>; }
function SecuritySettings() { return <div className="text-center py-20 text-gray-400 font-bold">Security settings content...</div>; }
function BillingSettings() { return <div className="text-center py-20 text-gray-400 font-bold">Billing settings content...</div>; }
function IntegrationSettings() {
  const integrations = [
    { id: 'zapier', name: 'Zapier', desc: 'Automate workflows between Prop-Post and 5,000+ apps.', icon: Zap, status: 'Connected', color: 'bg-orange-50 text-orange-600' },
    { id: 'mailchimp', name: 'Mailchimp', desc: 'Sync leads and segments for email marketing campaigns.', icon: Mail, status: 'Disconnected', color: 'bg-yellow-50 text-yellow-600' },
    { id: 'google', name: 'Google Calendar', desc: 'Sync appointments and follow-ups with your calendar.', icon: Globe, status: 'Connected', color: 'bg-blue-50 text-blue-600' },
    { id: 'stripe', name: 'Stripe', desc: 'Process payments for template purchases and subscriptions.', icon: CreditCard, status: 'Connected', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'slack', name: 'Slack', desc: 'Get instant notifications for new leads and alerts.', icon: MessageSquare, status: 'Disconnected', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-900">App Integrations</h3>
          <p className="text-sm text-gray-500 font-medium">Connect your favorite tools to supercharge your workflow.</p>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all focus-visible:ring-2 focus-visible:ring-gray-900 outline-none">
          Browse Marketplace
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {integrations.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition-all group focus-within:ring-2 focus-within:ring-indigo-600 outline-none">
            <div className="flex items-center gap-6 mb-4 sm:mb-0">
              <div className={`p-4 rounded-2xl ${item.color} shadow-sm`}>
                <item.icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-black text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500 font-medium max-w-md">{item.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                item.status === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {item.status}
              </span>
              <button 
                aria-label={`${item.status === 'Connected' ? 'Disconnect' : 'Connect'} ${item.name}`}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all focus-visible:ring-2 outline-none ${
                item.status === 'Connected' 
                  ? 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 focus-visible:ring-rose-500' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600'
              }`}>
                {item.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-indigo-600 rounded-3xl text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h4 className="text-lg font-black">Need a custom integration?</h4>
          <p className="text-sm text-indigo-100 font-medium max-w-md">Our developer API allows you to build custom connectors for your specific business needs.</p>
          <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all focus-visible:ring-2 focus-visible:ring-white outline-none">
            View API Documentation
          </button>
        </div>
        <Database className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" aria-hidden="true" />
      </div>
    </div>
  );
}

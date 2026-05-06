import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Building2,
  Target,
  Plus,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Property, Lead } from '../../types';

export default function AgentDashboard({ onAddProperty, refreshTrigger }: { onAddProperty?: () => void, refreshTrigger?: number }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalLeads: 0,
    newLeads: 0
  });
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch Stats
      const [propertiesRes, leadsRes] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact' }).eq('agent_id', user.id),
        supabase.from('leads').select('*', { count: 'exact' }).eq('agent_id', user.id)
      ]);

      const totalListings = propertiesRes.count || 0;
      const activeListings = propertiesRes.data?.filter(p => p.status === 'active').length || 0;
      const totalLeads = leadsRes.count || 0;
      const newLeads = leadsRes.data?.filter(l => l.status === 'New').length || 0;

      setStats({
        totalListings,
        activeListings,
        totalLeads,
        newLeads
      });

      // Fetch Recent Properties
      const { data: recentProps } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentProperties(recentProps || []);

      // Fetch Recent Leads
      const { data: recentLds } = await supabase
        .from('leads')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentLeads(recentLds || []);

    } catch (error) {
      console.error('Error fetching agent dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, refreshTrigger]);

  const chartData = [
    { name: 'Mon', leads: 4 },
    { name: 'Tue', leads: 7 },
    { name: 'Wed', leads: 5 },
    { name: 'Thu', leads: 12 },
    { name: 'Fri', leads: 8 },
    { name: 'Sat', leads: 15 },
    { name: 'Sun', leads: 10 },
  ];

  const propertyTypeData = [
    { name: 'Residential', value: 65 },
    { name: 'Commercial', value: 20 },
    { name: 'Industrial', value: 15 },
  ];

  const COLORS = ['#1E97AB', '#111827', '#9CA3AF'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500 font-medium">Here's what's happening with your listings today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-all">
            Download Report
          </button>
          <button 
            onClick={onAddProperty}
            className="px-4 py-2 bg-brand-charcoal text-white rounded-xl text-xs font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Add Property
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Listings', value: stats.totalListings, icon: Home, color: 'bg-brand-teal', trend: '+2 this month' },
          { label: 'Active Listings', value: stats.activeListings, icon: Building2, color: 'bg-indigo-600', trend: 'Stable' },
          { label: 'My Leads', value: stats.totalLeads, icon: Target, color: 'bg-orange-500', trend: '+12% vs last week' },
          { label: 'New Leads', value: stats.newLeads, icon: TrendingUp, color: 'bg-emerald-500', trend: 'Action required' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads Over Time */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-gray-900">Leads Over Time</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Weekly performance</p>
            </div>
            <select className="bg-gray-50 border-none text-xs font-bold rounded-xl px-3 py-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E97AB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E97AB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#1E97AB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listings by Type */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-2">Listings by Type</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Portfolio distribution</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900">{stats.totalListings}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {propertyTypeData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs font-bold text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-black text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900">Recent Properties</h3>
            <button className="text-xs font-bold text-brand-teal hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProperties.length > 0 ? recentProperties.map((prop) => (
              <div key={prop.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {prop.image_urls?.[0] ? (
                    <img src={prop.image_urls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Home size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{prop.title}</h4>
                  <p className="text-xs text-gray-400 font-medium">{prop.city || 'Location N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">${prop.price?.toLocaleString()}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    prop.status === 'active' ? 'text-emerald-500' : 'text-orange-500'
                  }`}>
                    {prop.status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-teal transition-colors" />
              </div>
            )) : (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400 font-medium">No properties added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900">Recent Leads</h3>
            <button className="text-xs font-bold text-brand-teal hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length > 0 ? recentLeads.map((lead) => (
              <div key={lead.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black text-xs shrink-0">
                  {lead.contactName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{lead.contactName}</h4>
                  <p className="text-xs text-gray-400 font-medium truncate">Interested in {lead.propertyTitle || 'a property'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    lead.status === 'New' ? 'text-brand-teal' : 'text-gray-400'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-teal transition-colors" />
              </div>
            )) : (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400 font-medium">No leads received yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

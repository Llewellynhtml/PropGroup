import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Home, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Loader2,
  Calendar
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
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

export default function AgentAnalytics() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalLeads: 0,
    conversionRate: 0,
    topProperty: 'N/A'
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;
      try {
        const [propertiesRes, leadsRes] = await Promise.all([
          supabase.from('properties').select('*').eq('agent_id', user.id),
          supabase.from('leads').select('*').eq('agent_id', user.id)
        ]);

        const totalListings = propertiesRes.data?.length || 0;
        const activeListings = propertiesRes.data?.filter(p => p.status === 'active').length || 0;
        const totalLeads = leadsRes.data?.length || 0;
        const closedLeads = leadsRes.data?.filter(l => l.status === 'Closed').length || 0;
        const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

        // Find top property by lead count
        const propertyLeadCounts: Record<string, number> = {};
        leadsRes.data?.forEach(lead => {
          if (lead.propertyTitle) {
            propertyLeadCounts[lead.propertyTitle] = (propertyLeadCounts[lead.propertyTitle] || 0) + 1;
          }
        });
        const topProperty = Object.entries(propertyLeadCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
          totalListings,
          activeListings,
          totalLeads,
          conversionRate,
          topProperty
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const monthlyData = [
    { name: 'Jan', listings: 2, leads: 12 },
    { name: 'Feb', listings: 4, leads: 18 },
    { name: 'Mar', listings: 3, leads: 15 },
    { name: 'Apr', listings: 6, leads: 28 },
    { name: 'May', listings: 5, leads: 22 },
    { name: 'Jun', listings: 8, leads: 35 },
  ];

  const funnelData = [
    { value: 100, name: 'Total Leads', fill: '#1E97AB' },
    { value: 65, name: 'Contacted', fill: '#14B8A6' },
    { value: 35, name: 'Qualified', fill: '#10B981' },
    { value: 12, name: 'Closed', fill: '#059669' },
  ];

  const COLORS = ['#1E97AB', '#111827', '#9CA3AF', '#E5E7EB'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Personal Analytics</h1>
          <p className="text-sm text-gray-500 font-medium">Deep dive into your sales and listing performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {['7D', '30D', '90D', '1Y', 'ALL'].map((range) => (
            <button key={range} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              range === '30D' ? 'bg-brand-charcoal text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
            }`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Listings', value: stats.totalListings, icon: Home, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
          { label: 'Active Listings', value: stats.activeListings, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Leads', value: stats.totalLeads, icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
              <stat.icon size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-gray-900">Performance Trends</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Listings vs Leads</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-teal" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-900" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Listings</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
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
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="leads" stroke="#1E97AB" strokeWidth={4} dot={{ r: 4, fill: '#1E97AB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="listings" stroke="#111827" strokeWidth={4} dot={{ r: 4, fill: '#111827', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-2">Conversion Funnel</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Lead to close journey</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#9CA3AF" stroke="none" dataKey="name" fontSize={10} fontWeight={700} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Property Card */}
        <div className="bg-brand-charcoal p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal mb-4">Top Performing Property</p>
            <h3 className="text-2xl font-black leading-tight mb-2">{stats.topProperty}</h3>
            <p className="text-sm text-gray-400 font-medium">Generated the most leads this month.</p>
          </div>
          <div className="relative z-10 mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">12</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Leads this week</p>
            </div>
            <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>

        {/* Leads per Listing Bar Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-2">Leads per Listing</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Top 5 properties</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="leads" fill="#1E97AB" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

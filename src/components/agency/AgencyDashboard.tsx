import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Home, 
  Target, 
  TrendingUp, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Plus,
  Clock,
  Activity
} from 'lucide-react';
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
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatCompactNumber } from '../../utils/format';

const StatCard = ({ label, value, trend, icon: Icon, color, bg, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bg} rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} strokeWidth={1.5} />
      </div>
      <button className="p-1 hover:bg-gray-50 rounded-lg text-gray-400">
        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-3">
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default function AgencyDashboard({ onAddProperty, refreshTrigger }: { onAddProperty?: () => void, refreshTrigger?: number }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalProperties: 0,
    totalLeads: 0,
    activeListings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.agency_id) return;
      
      try {
        const [agentsRes, propsRes, leadsRes] = await Promise.all([
          supabase.from('agents').select('id', { count: 'exact' }).eq('agency_id', user.agency_id),
          supabase.from('properties').select('id', { count: 'exact' }).eq('agency_id', user.agency_id),
          supabase.from('leads').select('id', { count: 'exact' }).eq('agency_id', user.agency_id)
        ]);

        const activeProps = await supabase
          .from('properties')
          .select('id', { count: 'exact' })
          .eq('agency_id', user.agency_id)
          .eq('status', 'active');

        setStats({
          totalAgents: agentsRes.count || 0,
          totalProperties: propsRes.count || 0,
          totalLeads: leadsRes.count || 0,
          activeListings: activeProps.count || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, refreshTrigger]);

  const agentPerformanceData = [
    { name: 'Thabo N.', properties: 12, leads: 45 },
    { name: 'Sarah J.', properties: 8, leads: 38 },
    { name: 'Michael C.', properties: 15, leads: 32 },
    { name: 'Emma W.', properties: 10, leads: 28 },
    { name: 'David M.', properties: 6, leads: 22 },
  ];

  const growthData = [
    { name: 'Jan', listings: 45 },
    { name: 'Feb', listings: 52 },
    { name: 'Mar', listings: 68 },
    { name: 'Apr', listings: 85 },
    { name: 'May', listings: 110 },
    { name: 'Jun', listings: 142 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Agency Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium">Overview of your agency's performance and listings.</p>
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

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Agents" 
          value={stats.totalAgents} 
          trend="+2 this month" 
          icon={Users} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatCard 
          label="Total Properties" 
          value={stats.totalProperties} 
          trend="+12%" 
          icon={Home} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatCard 
          label="Total Leads" 
          value={stats.totalLeads} 
          trend="+18%" 
          icon={Target} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
        <StatCard 
          label="Active Listings" 
          value={stats.activeListings} 
          trend="Live Now" 
          icon={Activity} 
          color="text-rose-600" 
          bg="bg-rose-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Agent Performance</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-teal"></div>
                Properties
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                Leads
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="properties" fill="#1E97AB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Monthly Listing Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E97AB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E97AB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="listings" stroke="#1E97AB" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Plus size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-gray-900">New Property Added</p>
                  <span className="text-[10px] font-bold text-gray-400">2h ago</span>
                </div>
                <p className="text-xs text-gray-500">Modern Villa in Sandton added by Thabo Nkosi</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Target size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-gray-900">New Lead Generated</p>
                  <span className="text-[10px] font-bold text-gray-400">5h ago</span>
                </div>
                <p className="text-xs text-gray-500">Alice Johnson interested in Urban Apartment</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-gray-900">New Agent Onboarded</p>
                  <span className="text-[10px] font-bold text-gray-400">1d ago</span>
                </div>
                <p className="text-xs text-gray-500">David Miller joined the agency team</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold text-brand-teal hover:bg-brand-teal-light rounded-xl transition-colors flex items-center justify-center gap-2">
            View All Activity <ChevronRight size={14} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-brand-charcoal p-8 rounded-2xl text-white">
          <h3 className="text-lg font-bold mb-6">Agency Pulse</h3>
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Conversion Rate</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black">18.4%</h4>
                <span className="text-xs font-bold text-emerald-400">+2.1%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-brand-teal" style={{ width: '18.4%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Avg Response Time</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black">12m</h4>
                <span className="text-xs font-bold text-emerald-400">-4m</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-brand-teal" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Agent Activity</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black">92%</h4>
                <span className="text-xs font-bold text-emerald-400">Active</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-brand-teal" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

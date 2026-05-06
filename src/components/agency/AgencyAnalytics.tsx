import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Home, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Award,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatCompactNumber } from '../../utils/format';

const COLORS = ['#1E97AB', '#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const MetricCard = ({ label, value, trend, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 ${bg} rounded-xl`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend}
          {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        </div>
      )}
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-2xl font-black text-gray-900">{value}</h4>
  </div>
);

export default function AgencyAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');

  const agentPerformance = [
    { name: 'Thabo Nkosi', listings: 12, leads: 45, conversion: 15.5 },
    { name: 'Sarah Jenkins', listings: 8, leads: 38, conversion: 12.2 },
    { name: 'Michael Chen', listings: 15, leads: 32, conversion: 18.4 },
    { name: 'Emma Wilson', listings: 10, leads: 28, conversion: 14.1 },
    { name: 'David Miller', listings: 6, leads: 22, conversion: 10.5 },
  ];

  const conversionData = [
    { name: 'New Leads', value: 1200 },
    { name: 'Contacted', value: 800 },
    { name: 'Viewings', value: 400 },
    { name: 'Offers', value: 150 },
    { name: 'Closed', value: 85 },
  ];

  const trendData = [
    { date: '2026-04-01', leads: 45, listings: 12 },
    { date: '2026-04-05', leads: 52, listings: 15 },
    { date: '2026-04-10', leads: 38, listings: 10 },
    { date: '2026-04-15', leads: 65, listings: 22 },
    { date: '2026-04-20', leads: 48, listings: 18 },
    { date: '2026-04-25', leads: 72, listings: 25 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Agency Analytics</h2>
          <p className="text-sm text-gray-500 font-medium">Deep dive into your agency's performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            {['7d', '30d', '90d', '1y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeRange === range ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-2.5 bg-white border border-gray-100 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Revenue" 
          value={formatCurrency(12500000, 'ZAR', 'en-ZA')} 
          trend="+12.5%" 
          icon={TrendingUp} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <MetricCard 
          label="Avg. Conversion" 
          value="14.2%" 
          trend="+2.1%" 
          icon={Target} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <MetricCard 
          label="Active Agents" 
          value="24" 
          trend="+2" 
          icon={Users} 
          color="text-brand-teal" 
          bg="bg-brand-teal/10" 
        />
        <MetricCard 
          label="Listings Growth" 
          value="+42" 
          trend="+18%" 
          icon={Home} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Performance Table */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Agent Performance Leaderboard</h3>
            <button className="text-xs font-bold text-brand-teal hover:underline">View Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Listings</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Leads</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agentPerformance.map((agent, i) => (
                  <tr key={agent.name} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{agent.name}</span>
                        {i === 0 && <Award size={14} className="text-amber-500" />}
                      </div>
                    </td>
                    <td className="py-4 text-center text-sm font-medium text-gray-600">{agent.listings}</td>
                    <td className="py-4 text-center text-sm font-medium text-gray-600">{agent.leads}</td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-black text-brand-teal">{agent.conversion}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Lead Conversion Funnel</h3>
          <div className="space-y-6">
            {conversionData.map((item, i) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
                  <span className="text-sm font-black text-gray-900">{item.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / conversionData[0].value) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-brand-teal"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-teal uppercase tracking-widest">Overall Efficiency</span>
              <span className="text-lg font-black text-brand-teal">7.1%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings vs Leads Trend */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Listings vs Leads Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="leads" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
                <Line type="monotone" dataKey="listings" stroke="#1E97AB" strokeWidth={3} dot={{ r: 4, fill: '#1E97AB', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listings Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Listings Distribution by Agent</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agentPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="listings"
                >
                  {agentPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {agentPerformance.map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest truncate">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

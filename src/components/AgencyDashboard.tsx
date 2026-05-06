import React from 'react';
import { 
  Users, 
  Home, 
  Target, 
  TrendingUp, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  DollarSign,
  Activity,
  Clock,
  PieChart as PieChartIcon
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
  Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { formatCurrency, formatCompactNumber } from '../utils/format';

const COLORS = ['#1E97AB', '#0f7a8c', '#518E58', '#0e1c20', '#7a9198'];

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

export default function AgencyDashboard() {
  const weeklyData = [
    { name: 'Mon', leads: 45, sales: 12 },
    { name: 'Tue', leads: 52, sales: 15 },
    { name: 'Wed', leads: 38, sales: 8 },
    { name: 'Thu', leads: 65, sales: 22 },
    { name: 'Fri', leads: 48, sales: 18 },
    { name: 'Sat', leads: 32, sales: 10 },
    { name: 'Sun', leads: 28, sales: 5 },
  ];

  const sourceData = [
    { name: 'Website', value: 400 },
    { name: 'Referral', value: 300 },
    { name: 'Social', value: 300 },
    { name: 'Portals', value: 200 },
  ];

  const topAgents = [
    { name: 'Thabo Nkosi', leads: 45, sales: 12, avatar: 'TN' },
    { name: 'Sarah Jenkins', leads: 38, sales: 10, avatar: 'SJ' },
    { name: 'Michael Chen', leads: 32, sales: 8, avatar: 'MC' },
    { name: 'Emma Wilson', leads: 28, sales: 7, avatar: 'EW' },
  ];

  const activities = [
    { id: 1, type: 'sale', title: 'New Sale Closed', desc: 'Villa A by Thabo Nkosi', time: '2h ago' },
    { id: 2, type: 'agent', title: 'New Agent Joined', desc: 'David Miller joined the team', time: '5h ago' },
    { id: 3, type: 'listing', title: 'New Listing Active', desc: 'Modern Penthouse in Sandton', time: '1d ago' },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Agents" 
          value="24" 
          trend="+2" 
          icon={Users} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatCard 
          label="Active Listings" 
          value="142" 
          trend="+12%" 
          icon={Home} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatCard 
          label="Leads Pipeline" 
          value="384" 
          trend="+18%" 
          icon={Target} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
        <StatCard 
          label="Sold This Month" 
          value={formatCurrency(12500000, 'ZAR', 'en-ZA')} 
          trend="+8.4%" 
          icon={DollarSign} 
          color="text-rose-600" 
          bg="bg-rose-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Weekly Performance</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-teal"></div>
                Leads
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-teal-deep"></div>
                Sales
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="leads" fill="#1E97AB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="#0f7a8c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Lead Sources</h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900">1.2k</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Leads</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {sourceData.map((source, i) => (
              <div key={source.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-xs font-bold text-gray-600">{source.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Agents */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Agents</h3>
          <div className="space-y-4">
            {topAgents.map((agent, i) => (
              <div key={agent.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center font-bold text-brand-teal">
                    {agent.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.leads} leads this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-brand-teal">{agent.sales} Sales</p>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-brand-teal" style={{ width: `${(agent.sales / 15) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Agency Activity</h3>
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`mt-1 p-2 rounded-lg ${
                  activity.type === 'sale' ? 'bg-emerald-50 text-emerald-600' :
                  activity.type === 'agent' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {activity.type === 'sale' ? <DollarSign size={16} /> :
                   activity.type === 'agent' ? <Users size={16} /> :
                   <Home size={16} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                    <span className="text-[10px] font-bold text-gray-400">{activity.time}</span>
                  </div>
                  <p className="text-xs text-gray-500">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-bold text-brand-teal hover:bg-brand-teal-light rounded-xl transition-colors flex items-center justify-center gap-2">
            View All Activity <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-charcoal p-6 rounded-2xl text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Avg Days on Market</p>
            <h4 className="text-2xl font-black">42 Days</h4>
          </div>
          <Clock className="text-brand-teal w-8 h-8 opacity-50" />
        </div>
        <div className="bg-brand-charcoal p-6 rounded-2xl text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Sold/Listed Ratio</p>
            <h4 className="text-2xl font-black">0.84</h4>
          </div>
          <Activity className="text-brand-teal w-8 h-8 opacity-50" />
        </div>
        <div className="bg-brand-charcoal p-6 rounded-2xl text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Active Campaigns</p>
            <h4 className="text-2xl font-black">12 Live</h4>
          </div>
          <Target className="text-brand-teal w-8 h-8 opacity-50" />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Users, 
  Home, 
  Calendar, 
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ListTodo
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import { formatCurrency, formatDate } from '../utils/format';

const StatPill = ({ label, value, trend, icon: Icon, color, bg, delay = 0 }: any) => (
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

export default function AgentDashboard() {
  const performanceData = [
    { name: 'Week 1', leads: 12, viewings: 5 },
    { name: 'Week 2', leads: 18, viewings: 8 },
    { name: 'Week 3', leads: 15, viewings: 12 },
    { name: 'Week 4', leads: 22, viewings: 15 },
  ];

  const appointments = [
    { id: 1, title: 'Property Viewing - Villa A', date: '2026-04-15', time: '10:00 AM', client: 'Alice Johnson' },
    { id: 2, title: 'Contract Signing', date: '2026-04-15', time: '02:30 PM', client: 'Bob Smith' },
    { id: 3, title: 'Initial Consultation', date: '2026-04-16', time: '11:00 AM', client: 'Charlie Brown' },
  ];

  const myLeads = [
    { id: 1, name: 'David Miller', status: 'New', source: 'Website', time: '1h ago' },
    { id: 2, name: 'Emma Wilson', status: 'Contacted', source: 'Referral', time: '3h ago' },
    { id: 3, name: 'James Taylor', status: 'Viewing', source: 'Social', time: '5h ago' },
  ];

  const tasks = [
    { id: 1, title: 'Follow up with David Miller', priority: 'High', completed: false },
    { id: 2, title: 'Update listing photos for Villa B', priority: 'Medium', completed: true },
    { id: 3, title: 'Send contract to Alice Johnson', priority: 'High', completed: false },
  ];

  const listings = [
    { id: 1, title: 'Modern Villa A', price: 5500000, status: 'Active', image: 'https://picsum.photos/seed/villa/400/300' },
    { id: 2, title: 'Urban Apartment B', price: 2200000, status: 'Pending', image: 'https://picsum.photos/seed/apt/400/300' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Pills */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatPill 
          label="New Leads" 
          value="12" 
          trend="+3" 
          icon={Users} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatPill 
          label="Active Listings" 
          value="8" 
          trend="+1" 
          icon={Home} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatPill 
          label="Appointments" 
          value="5" 
          trend="Today" 
          icon={Calendar} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
        <StatPill 
          label="Closed This Month" 
          value="3" 
          trend="+50%" 
          icon={CheckCircle2} 
          color="text-rose-600" 
          bg="bg-rose-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Performance Overview</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-teal"></div>
                Leads
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-teal-deep"></div>
                Viewings
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E97AB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E97AB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViewings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f7a8c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f7a8c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="leads" stroke="#1E97AB" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="viewings" stroke="#0f7a8c" strokeWidth={3} fillOpacity={1} fill="url(#colorViewings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Upcoming Appointments</h3>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group cursor-pointer">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <span className="text-[10px] font-black text-brand-teal uppercase tracking-tighter">{apt.date.split('-')[2]}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Apr</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-brand-teal transition-colors">{apt.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{apt.time} • {apt.client}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-teal transition-colors" />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold text-brand-teal hover:bg-brand-teal-light rounded-xl transition-colors">
            View Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Leads */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">My Leads</h3>
          <div className="space-y-4">
            {myLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold text-xs">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{lead.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{lead.source}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                  lead.status === 'New' ? 'bg-indigo-100 text-indigo-600' :
                  lead.status === 'Contacted' ? 'bg-amber-100 text-amber-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold text-brand-teal hover:bg-brand-teal-light rounded-xl transition-colors">
            Manage All Leads
          </button>
        </div>

        {/* Tasks Checklist */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Tasks</h3>
            <ListTodo size={20} className="text-brand-teal" />
          </div>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-brand-teal border-brand-teal' : 'border-gray-200 group-hover:border-brand-teal'
                }`}>
                  {task.completed && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    task.priority === 'High' ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-brand-teal-light text-brand-teal text-xs font-bold rounded-xl hover:bg-brand-teal hover:text-white transition-all">
            Add New Task
          </button>
        </div>

        {/* My Listings */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">My Listings</h3>
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-20 h-16 rounded-xl overflow-hidden border border-gray-100">
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-brand-teal transition-colors">{listing.title}</p>
                  <p className="text-xs text-brand-teal font-black">{formatCurrency(listing.price, 'ZAR', 'en-ZA')}</p>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{listing.status}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-teal transition-colors" />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold text-brand-teal hover:bg-brand-teal-light rounded-xl transition-colors">
            View All Listings
          </button>
        </div>
      </div>
    </div>
  );
}

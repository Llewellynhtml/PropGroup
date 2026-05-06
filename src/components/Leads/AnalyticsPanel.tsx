import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalyticsPanelProps {
  leadsData: any;
  platformData: any[];
  agentLoadData: any[];
  funnelData: any[];
}

export default function AnalyticsPanel({ leadsData, platformData, agentLoadData, funnelData }: AnalyticsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Leads" 
          value={leadsData.totalLeads} 
          trend="+12.5%" 
          isUp={true} 
          icon={Users} 
          color="indigo" 
        />
        <StatCard 
          label="Conversion Rate" 
          value={`${leadsData.conversionRate}%`} 
          trend="+2.1%" 
          isUp={true} 
          icon={Target} 
          color="emerald" 
        />
        <StatCard 
          label="Avg. Response Time" 
          value="4.2h" 
          trend="-15%" 
          isUp={true} 
          icon={TrendingUp} 
          color="blue" 
        />
        <StatCard 
          label="New Leads (24h)" 
          value={leadsData.newLeadsCount} 
          trend="+5" 
          isUp={true} 
          icon={ArrowUpRight} 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Conversion Funnel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Lead Conversion Funnel</h3>
              <p className="text-xs text-gray-400 mt-1">Movement of prospects through stages</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Filter className="w-5 h-5" />
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#6366f1" stroke="none" dataKey="name" style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Platform */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Leads by Platform</h3>
              <p className="text-xs text-gray-400 mt-1">Source distribution</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agent Lead Load */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Agent Lead Load</h3>
            <p className="text-xs text-gray-400 mt-1">Distribution across team members</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentLoadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="leads" 
                fill="#6366f1" 
                radius={[8, 8, 0, 0]} 
                barSize={40}
              >
                {agentLoadData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.leads > 10 ? '#6366f1' : '#818cf8'} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({ label, value, trend, isUp, icon: Icon, color }: { 
  label: string, 
  value: string | number, 
  trend: string, 
  isUp: boolean, 
  icon: any,
  color: 'indigo' | 'emerald' | 'blue' | 'amber'
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
          isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

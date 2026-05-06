import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Clock, Target, Download, Calendar, Filter, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Smartphone, Globe, 
  Instagram, Facebook, Twitter, Linkedin, Search, X, ChevronRight,
  FileText, PieChart as PieChartIcon, BarChart2, Layout, User, Bell,
  Plus, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../lib/supabaseClient';
import Skeleton from './Skeleton';
import { formatCurrency, formatDate, formatCompactNumber } from '../utils/format';

// --- Types ---
interface OverviewStats {
  totalLeads: number;
  conversionRate: string;
  avgResponseTime: string;
  marketingRoi: string;
}

interface PlatformPerformance {
  platform: string;
  postsPublished: number;
  reach: number;
  engagement: number;
  clicks: number;
  leadsGenerated: number;
}

interface AgentPerformance {
  agentName: string;
  profilePhoto: string;
  propertiesManaged: number;
  leadsGenerated: number;
  conversionRate: number;
  avgResponseTime: number;
}

// --- Components ---
const StatCard = ({ label, value, icon: Icon, trend, loading }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    role="article"
    aria-labelledby={`stat-label-${(label || '').replace(/\s+/g, '-').toLowerCase()}`}
  >
    {loading ? (
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors" aria-hidden="true">
            <Icon className="w-6 h-6 text-gray-600 group-hover:text-indigo-600" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`} aria-label={`Trend: ${trend}`}>
              {trend}
              {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" aria-hidden="true" /> : <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
            </div>
          )}
        </div>
        <p id={`stat-label-${(label || '').replace(/\s+/g, '-').toLowerCase()}`} className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
      </>
    )}
  </motion.div>
);

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'agents' | 'reports' | 'alerts'>('overview');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState<{ platform?: string; agent?: string }>({});

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [platformData, setPlatformData] = useState<PlatformPerformance[]>([]);
  const [agentData, setAgentData] = useState<AgentPerformance[]>([]);
  const [reportPreview, setReportPreview] = useState<any[] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, agentsRes, propsRes] = await Promise.all([
        supabase.from('leads').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('properties').select('*')
      ]);

      const totalLeads = leadsRes.data?.length || 0;
      
      setOverviewStats({
        totalLeads,
        conversionRate: '15.5',
        avgResponseTime: '12',
        marketingRoi: '245'
      });

      setPlatformData([
        { platform: 'Instagram', postsPublished: 24, reach: 12500, engagement: 850, clicks: 420, leadsGenerated: 12 },
        { platform: 'Facebook', postsPublished: 18, reach: 8400, engagement: 620, clicks: 310, leadsGenerated: 8 },
        { platform: 'LinkedIn', postsPublished: 12, reach: 4200, engagement: 410, clicks: 180, leadsGenerated: 5 },
        { platform: 'WhatsApp', postsPublished: 45, reach: 2100, engagement: 1800, clicks: 1200, leadsGenerated: 32 }
      ]);

      if (agentsRes.data) {
        setAgentData(agentsRes.data.map((a: any) => ({
          agentName: a.full_name,
          profilePhoto: a.profile_photo_url,
          propertiesManaged: Math.floor(Math.random() * 10) + 1,
          leadsGenerated: Math.floor(Math.random() * 50) + 10,
          conversionRate: Math.random() * 20 + 5,
          avgResponseTime: Math.random() * 30 + 5
        })));
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); // 30s
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Analytics Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    if (activeTab === 'overview' && overviewStats) {
      (doc as any).autoTable({
        startY: 40,
        head: [['Metric', 'Value']],
        body: [
          ['Total Leads', overviewStats.totalLeads],
          ['Conversion Rate', `${overviewStats.conversionRate}%`],
          ['Avg Response Time', `${overviewStats.avgResponseTime}m`],
          ['Marketing ROI', `${overviewStats.marketingRoi}%`]
        ]
      });
    } else if (activeTab === 'platforms') {
      (doc as any).autoTable({
        startY: 40,
        head: [['Platform', 'Posts', 'Reach', 'Clicks', 'Leads']],
        body: platformData.map(p => [p.platform, p.postsPublished, p.reach, p.clicks, p.leadsGenerated])
      });
    } else if (activeTab === 'agents') {
      (doc as any).autoTable({
        startY: 40,
        head: [['Agent', 'Properties', 'Leads', 'Conversion', 'Avg Response']],
        body: agentData.map(a => [a.agentName, a.propertiesManaged, a.leadsGenerated, `${a.conversionRate}%`, `${a.avgResponseTime}m`])
      });
    }

    doc.save(`analytics-${activeTab}-${Date.now()}.pdf`);
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows: string[][] = [];

    if (activeTab === 'overview' && overviewStats) {
      rows = [['Metric', 'Value'], ['Total Leads', overviewStats.totalLeads.toString()], ['Conversion Rate', overviewStats.conversionRate], ['Avg Response Time', overviewStats.avgResponseTime], ['Marketing ROI', overviewStats.marketingRoi]];
    } else if (activeTab === 'platforms') {
      rows = [['Platform', 'Posts', 'Reach', 'Clicks', 'Leads'], ...platformData.map(p => [p.platform, p.postsPublished.toString(), p.reach.toString(), p.clicks.toString(), p.leadsGenerated.toString()])];
    } else if (activeTab === 'agents') {
      rows = [['Agent', 'Properties', 'Leads', 'Conversion', 'Avg Response'], ...agentData.map(a => [a.agentName, a.propertiesManaged.toString(), a.leadsGenerated.toString(), a.conversionRate.toString(), a.avgResponseTime.toString()])];
    }

    rows.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics-${activeTab}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    setReportPreview(platformData.map(p => ({
      Dimension: p.platform,
      Leads: p.leadsGenerated,
      Reach: p.reach,
      ROI: `${(Math.random() * 200).toFixed(1)}%`
    })));
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Analytics <span className="text-indigo-600">Hub</span>
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1 font-medium">Real-time performance insights across your agency.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              aria-pressed={autoRefresh}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${autoRefresh ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} aria-hidden="true" />
              {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
            </button>
            <div className="w-px h-4 bg-gray-100 mx-1" aria-hidden="true" />
            <span className="text-[10px] text-gray-400 font-mono px-2" aria-live="polite">
              Updated: {formatDate(lastUpdated, 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Export as PDF"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              PDF
            </button>
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Export as CSV"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl w-fit border border-gray-200/50" role="tablist" aria-label="Analytics Sections">
        {[
          { id: 'overview', label: 'Overview', icon: Layout },
          { id: 'platforms', label: 'Platforms', icon: Smartphone },
          { id: 'agents', label: 'Agents', icon: User },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'alerts', label: 'Alerts', icon: Bell }
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-xl text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Breadcrumbs */}
      {Object.keys(filters).length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Filters:</span>
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">
              <span className="capitalize">{key}:</span> {value}
              <button onClick={() => {
                const newFilters = { ...filters };
                delete (newFilters as any)[key];
                setFilters(newFilters);
              }}>
                <X className="w-3 h-3 hover:text-indigo-800" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setFilters({})}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Total Leads" 
                value={formatCompactNumber(overviewStats?.totalLeads || 0)} 
                icon={Users} 
                trend="+12.5%" 
                loading={loading}
              />
              <StatCard 
                label="Conversion Rate" 
                value={`${overviewStats?.conversionRate || 0}%`} 
                icon={Target} 
                trend="+2.1%" 
                loading={loading}
              />
              <StatCard 
                label="Avg Response Time" 
                value={`${overviewStats?.avgResponseTime || 0}m`} 
                icon={Clock} 
                trend="-4.5%" 
                loading={loading}
              />
              <StatCard 
                label="Marketing ROI" 
                value={`${overviewStats?.marketingRoi || 0}%`} 
                icon={TrendingUp} 
                trend="+8.4%" 
                loading={loading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-6">Lead Generation Trend</h3>
                <div className="h-80">
                  {loading ? <Skeleton className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={platformData}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="leadsGenerated" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-6">Leads by Source</h3>
                <div className="h-80">
                  {loading ? <Skeleton className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="leadsGenerated"
                          nameKey="platform"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'platforms' && (
          <motion.div 
            key="platforms"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6">Platform Comparison</h3>
              <div className="h-96">
                {loading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={platformData}
                      onClick={(data) => {
                        if (data && data.activeLabel) {
                          setFilters({ ...filters, platform: String(data.activeLabel) });
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="leadsGenerated" name="Leads" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                      <Bar dataKey="clicks" name="Clicks" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformData.map((p) => (
                <div key={p.platform} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      {p.platform === 'Instagram' && <Instagram className="w-5 h-5 text-indigo-600" />}
                      {p.platform === 'Facebook' && <Facebook className="w-5 h-5 text-indigo-600" />}
                      {p.platform === 'Twitter' && <Twitter className="w-5 h-5 text-indigo-600" />}
                      {p.platform === 'LinkedIn' && <Linkedin className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <h4 className="font-bold text-gray-900">{p.platform}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reach</span>
                      <span className="font-bold">{formatCompactNumber(p.reach)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Engagement</span>
                      <span className="font-bold">{(p.engagement / p.reach * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Leads</span>
                      <span className="font-bold text-indigo-600">{p.leadsGenerated}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'agents' && (
          <motion.div 
            key="agents"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? Array(6).fill(0).map((_, i) => <div key={i}><Skeleton className="h-64 w-full" /></div>) : (
              agentData.map((agent) => (
                <div key={agent.agentName} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={agent.profilePhoto || `https://ui-avatars.com/api/?name=${agent.agentName}&background=6366f1&color=fff`} 
                      alt={agent.agentName}
                      className="w-16 h-16 rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-lg font-black text-gray-900">{agent.agentName}</h4>
                      <p className="text-sm text-gray-500 font-medium">{agent.propertiesManaged} Properties Managed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Leads</p>
                      <p className="text-xl font-black text-gray-900">{agent.leadsGenerated}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Conv. Rate</p>
                      <p className="text-xl font-black text-indigo-600">{agent.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Avg Response Time</span>
                      <span className="font-bold text-gray-900">{agent.avgResponseTime.toFixed(0)}m</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full" 
                        style={{ width: `${Math.min(agent.conversionRate * 2, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Custom Report Builder</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Select Dimensions</label>
                    <div className="space-y-3">
                      {['Platform', 'Agent', 'Property', 'Date', 'Source'].map(dim => (
                        <label key={dim} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm font-bold text-gray-700">{dim}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Select Metrics</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Leads', 'Clicks', 'Reach', 'ROI', 'Conv. Rate', 'Spend'].map(metric => (
                        <label key={metric} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm font-bold text-gray-700">{metric}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={generateReport}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Generate Report
                  </button>
                </div>

                <div className="lg:col-span-2 bg-gray-50 rounded-3xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[400px]">
                  {!reportPreview ? (
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-white rounded-full w-fit mx-auto shadow-sm">
                        <BarChart2 className="w-12 h-12 text-gray-300" />
                      </div>
                      <h4 className="text-xl font-black text-gray-900">Report Preview</h4>
                      <p className="text-gray-500 max-w-xs mx-auto font-medium">Select dimensions and metrics to see a preview of your custom report.</p>
                    </div>
                  ) : (
                    <div className="w-full h-full overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {Object.keys(reportPreview[0]).map(key => (
                              <th key={key} className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportPreview.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 hover:bg-white transition-colors">
                              {Object.values(row).map((val: any, j) => (
                                <td key={j} className="py-4 px-4 text-sm font-bold text-gray-700">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'alerts' && (
          <motion.div 
            key="alerts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Automated Alerts</h3>
                  <p className="text-gray-500 font-medium">Set thresholds for key metrics and get notified instantly.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold">
                  <Plus className="w-5 h-5" />
                  Create Alert
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { id: 1, title: 'Lead Conversion Drop', metric: 'Conversion Rate', threshold: '< 5%', status: 'Active', lastTriggered: '2 days ago' },
                  { id: 2, title: 'High Response Time', metric: 'Avg Response Time', threshold: '> 30m', status: 'Active', lastTriggered: 'Never' },
                  { id: 3, title: 'Campaign ROI Alert', metric: 'Marketing ROI', threshold: '< 150%', status: 'Paused', lastTriggered: '1 week ago' },
                ].map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${alert.status === 'Active' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{alert.title}</h4>
                        <p className="text-xs text-gray-500 font-medium">Metric: <span className="text-indigo-600">{alert.metric}</span> • Threshold: <span className="text-rose-600">{alert.threshold}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Triggered</p>
                        <p className="text-xs font-bold text-gray-700">{alert.lastTriggered}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          alert.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {alert.status}
                        </span>
                        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

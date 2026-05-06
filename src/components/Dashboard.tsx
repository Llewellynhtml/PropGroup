import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import AgencyDashboard from './AgencyDashboard';
import AgentDashboard from './AgentDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const isAgencyAdmin = user?.role === 'agency' || user?.role === 'admin' || user?.role === 'manager';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-brand-teal">{user?.name}</span>
          </h1>
          <p className="text-sm lg:text-base text-gray-500 font-medium">
            Here's what's happening with your {isAgencyAdmin ? 'Agency' : 'Agent'} dashboard.
          </p>
        </div>
      </div>

      {isAgencyAdmin ? <AgencyDashboard /> : <AgentDashboard />}
    </motion.div>
  );
}

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Bell, 
  Plus, 
  User, 
  ChevronDown,
  PlusSquare,
  Home,
  Users,
  UserPlus,
  Menu,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  activePage: string;
  onAction: (action: string) => void;
  toggleSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard Overview',
  properties: 'Property Management',
  leads: 'Lead Management',
  analytics: 'Performance Analytics',
  'post-builder': 'Marketing Post Builder',
  'scheduled-posts': 'Scheduled Content',
  branding: 'Brand Identity',
  settings: 'System Settings',
};

const quickActions = [
  { id: 'add-property', label: 'Add Property', icon: Home, color: 'bg-indigo-600' },
  { id: 'create-post', label: 'Create Post', icon: PlusSquare, color: 'bg-emerald-600' },
  { id: 'add-lead', label: 'Add Lead', icon: Users, color: 'bg-amber-600' },
  { id: 'add-agent', label: 'Add Agent', icon: UserPlus, color: 'bg-rose-600', roles: ['agency'] },
];

export default function TopBar({ activePage, onAction, toggleSidebar }: TopBarProps) {
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const filteredQuickActions = quickActions.filter(action => {
    if (action.roles && !action.roles.includes(user?.role || 'agent')) return false;
    return true;
  });

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">
            {pageTitles[activePage] || 'Dashboard'}
          </h1>
          <p className="text-[10px] lg:text-xs text-gray-500 font-medium">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4 lg:mx-12 hidden md:block">
        <div className="relative group">
          <label htmlFor="top-search" className="sr-only">Search</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" aria-hidden="true" />
          <input
            id="top-search"
            type="text"
            placeholder="Search properties, leads, or campaigns..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 lg:flex hidden">
            <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[10px] font-bold">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[10px] font-bold">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-1 lg:gap-2 mr-2 lg:mr-4 hidden sm:flex">
          {filteredQuickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              aria-label={action.label}
              className="p-2 lg:p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-all group relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <action.icon className="w-4 h-4 lg:w-5 h-5" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                {action.label}
              </div>
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="true"
            className="p-2 lg:p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Bell className="w-4 h-4 lg:w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" aria-hidden="true"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 lg:w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50"
                role="dialog"
                aria-label="Notifications Menu"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <button className="text-xs text-indigo-600 font-semibold hover:underline outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">Mark all as read</button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" role="button" tabIndex={0}>
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">New Lead: Alice Johnson</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Interested in Modern Luxury Villa</p>
                        <p className="text-[10px] text-gray-400 mt-1">2 mins ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-1 lg:mx-2"></div>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User Profile Menu"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
            className="flex items-center gap-2 lg:gap-3 pl-2 pr-1 py-1 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="w-8 h-8 lg:w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-200" aria-hidden="true">
              {userInitials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user?.role || 'Agent'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50"
                role="menu"
              >
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <p className="text-xs font-bold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-gray-500">{user?.email || ''}</p>
                </div>
                <button role="menuitem" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  <User className="w-4 h-4" aria-hidden="true" />
                  Profile Settings
                </button>
                <button role="menuitem" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  Notification Preferences
                </button>
                <div className="h-px bg-gray-100 my-2 mx-2"></div>
                <button 
                  onClick={() => signOut()}
                  role="menuitem" 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

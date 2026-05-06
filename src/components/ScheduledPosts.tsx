import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Music2,
  X,
  Check,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scheduledPosts, properties } from '../mockData';
import { ScheduledPost, Platform } from '../types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const platformIcons: Record<Platform, any> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  pinterest: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 12.017 0z"/>
    </svg>
  ),
  x: X,
};

const platformColors: Record<Platform, string> = {
  facebook: 'text-[#1877F2] bg-[#1877F2]/10 border-[#1877F2]/20',
  instagram: 'text-[#E4405F] bg-[#E4405F]/10 border-[#E4405F]/20',
  linkedin: 'text-[#0A66C2] bg-[#0A66C2]/10 border-[#0A66C2]/20',
  youtube: 'text-[#FF0000] bg-[#FF0000]/10 border-[#FF0000]/20',
  pinterest: 'text-[#BD081C] bg-[#BD081C]/10 border-[#BD081C]/20',
  x: 'text-black bg-black/10 border-black/20',
};

export default function ScheduledPosts() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const toggleSelectPost = (id: string) => {
    setSelectedPosts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              List View
            </button>
          </div>

          {viewMode === 'calendar' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold text-gray-900 min-w-[140px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button onClick={() => setCurrentMonth(new Date())} className="text-xs font-bold text-indigo-600 hover:underline">Today</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selectedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100"
              >
                <span className="text-xs font-bold text-indigo-600">{selectedPosts.length} selected</span>
                <div className="w-px h-4 bg-indigo-200 mx-2"></div>
                <button className="p-1.5 hover:bg-white rounded-lg text-indigo-600 transition-all"><CalendarIcon className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded-lg text-indigo-600 transition-all"><Send className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded-lg text-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search posts..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="grid grid-cols-7 border-b border-gray-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {getCalendarDays(currentMonth).map((day, i) => (
                <CalendarDay 
                  key={i} 
                  day={day} 
                  currentMonth={currentMonth} 
                  posts={scheduledPosts.filter(p => isSameDay(new Date(p.scheduledAt), day))}
                  onPostClick={setSelectedPost}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {scheduledPosts.map((post) => (
              <PostListItem 
                key={post.id} 
                post={post} 
                isSelected={selectedPosts.includes(post.id)}
                onToggle={() => toggleSelectPost(post.id)}
                onEdit={() => setSelectedPost(post)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${platformColors[selectedPost.platform]}`}>
                      {React.createElement(platformIcons[selectedPost.platform], { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Edit Scheduled Post</h3>
                      <p className="text-sm text-gray-500 font-medium">Scheduled for {format(new Date(selectedPost.scheduledAt), 'MMM d, yyyy at h:mm a')}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Caption</label>
                      <textarea
                        defaultValue={selectedPost.caption}
                        className="w-full h-40 p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                        <input type="date" className="w-full p-3 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                        <input type="time" className="w-full p-3 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Preview</label>
                    <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 relative group">
                      <img src={selectedPost.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                  <button className="flex items-center gap-2 text-rose-600 font-bold text-sm hover:underline">
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedPost(null)} className="px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">Cancel</button>
                    <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Changes</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarDay({ day, currentMonth, posts, onPostClick }: { day: Date; currentMonth: Date; posts: ScheduledPost[]; onPostClick: (p: ScheduledPost) => void, key?: any }) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());

  return (
    <div className={`min-h-[140px] border-r border-b border-gray-100 p-2 transition-colors ${isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${
          isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
        }`}>
          {format(day, 'd')}
        </span>
      </div>
      <div className="space-y-1">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onPostClick(post)}
            className={`w-full p-1.5 rounded-lg border text-[10px] font-bold text-left truncate transition-all hover:scale-[1.02] active:scale-[0.98] ${platformColors[post.platform]}`}
          >
            <div className="flex items-center gap-1">
              {React.createElement(platformIcons[post.platform], { className: "w-3 h-3 shrink-0" })}
              <span className="truncate">{post.caption}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PostListItem({ post, isSelected, onToggle, onEdit }: { post: ScheduledPost; isSelected: boolean; onToggle: () => void; onEdit: () => void, key?: any }) {
  const property = properties.find(p => p.id === post.propertyId);

  return (
    <div className={`p-6 bg-white rounded-2xl border transition-all group flex items-center gap-6 ${isSelected ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
      <button 
        onClick={onToggle}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 group-hover:border-indigo-400'
        }`}
      >
        {isSelected && <Check className="w-4 h-4" />}
      </button>

      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100">
        <img src={post.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${platformColors[post.platform]}`}>
            {post.platform}
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(post.scheduledAt), 'MMM d, yyyy at h:mm a')}
          </span>
        </div>
        <h4 className="text-sm font-bold text-gray-900 truncate">{post.caption}</h4>
        <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {property?.title}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <PostStatusBadge status={post.status} />
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-rose-600 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PostStatusBadge({ status }: { status: ScheduledPost['status'] }) {
  const styles = {
    scheduled: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    draft: 'bg-gray-50 text-gray-500 border-gray-100',
    failed: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}

function getCalendarDays(date: Date) {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
}

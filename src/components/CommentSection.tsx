import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  MoreHorizontal, 
  Reply, 
  ThumbsUp,
  X,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Comment } from '../types';

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Jane Smith',
    content: 'The lighting in the second photo looks a bit off. Should we reshoot?',
    createdAt: '2026-03-19T10:30:00Z',
    avatar: 'JS',
  },
  {
    id: '2',
    author: 'John Doe',
    content: 'I agree. Let\'s schedule a reshoot for tomorrow morning.',
    createdAt: '2026-03-19T11:15:00Z',
    avatar: 'JD',
  },
  {
    id: '3',
    author: 'Alice Johnson',
    content: 'Approved! The caption looks great too.',
    createdAt: '2026-03-20T09:00:00Z',
    avatar: 'AJ',
  },
];

export default function CommentSection({ title = "Team Collaboration" }: { title?: string }) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'John Doe',
      content: newComment,
      createdAt: new Date().toISOString(),
      avatar: 'JD',
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
          {comments.length} Comments
        </span>
      </div>

      <div className="relative group">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a note or tag a colleague..."
          className="w-full h-32 p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button className="p-2 bg-white rounded-lg text-gray-400 hover:text-indigo-600 shadow-sm transition-all">
            <Tag className="w-4 h-4" />
          </button>
          <button 
            onClick={handleAddComment}
            className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                  {comment.avatar}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{comment.author}</h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl rounded-tl-none text-sm text-gray-700 leading-relaxed">
                    {comment.content}
                  </div>
                  <div className="flex items-center gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest">
                      <Reply className="w-3 h-3" />
                      Reply
                    </button>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest">
                      <ThumbsUp className="w-3 h-3" />
                      Like
                    </button>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

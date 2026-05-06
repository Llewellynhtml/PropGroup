import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Trash2,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from './PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Skeleton from './Skeleton';
import { formatDate } from '../utils/format';

interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: string;
  size: string;
  createdAt: string;
}

export default function MediaLibrary() {
  const { token } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from('properties')
          .list('media', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'desc' },
          });

        if (error) throw error;

        if (data) {
          const formattedAssets: MediaAsset[] = data.map(file => {
            const { data: { publicUrl } } = supabase.storage
              .from('properties')
              .getPublicUrl(`media/${file.name}`);

            return {
              id: file.id,
              url: publicUrl,
              name: file.name,
              type: file.metadata?.mimetype || 'image/jpeg',
              size: `${(file.metadata?.size / 1024 / 1024).toFixed(1)} MB`,
              createdAt: file.created_at
            };
          });
          setAssets(formattedAssets);
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [token]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      for (const file of Array.from(files) as File[]) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
      }
      // Refresh list
      window.location.reload();
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.message?.includes('Bucket not found')) {
        alert('Storage bucket "properties" not found. Please create a public bucket named "properties" in your Supabase dashboard.');
      } else if (error.message?.includes('row-level security policy')) {
        alert('Permission denied: Row-level security (RLS) policy prevents this upload. Please ensure you have set up the correct RLS policies for the "properties" bucket in your Supabase dashboard.\n\nYou need to allow INSERT and SELECT for authenticated users.');
      } else {
        alert(`Error uploading image: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm(`Are you sure you want to delete ${asset.name}?`)) return;
    try {
      const { error } = await supabase.storage
        .from('properties')
        .remove([`media/${asset.name}`]);

      if (error) throw error;
      setAssets(prev => prev.filter(a => a.id !== asset.id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  const MediaSkeleton = () => (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
      : "bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm"
    }>
      {viewMode === 'grid' ? (
        Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-2 w-1/4" />
                <Skeleton className="h-2 w-1/4" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <PageHeader 
        title="Media Library" 
        subtitle="Manage and organize your property marketing assets"
        action={
          <label 
            aria-label="Upload new media assets"
            className="flex items-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-brand-teal/20 hover:scale-105 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 outline-none cursor-pointer"
          >
            <Upload size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Upload Assets</span>
            <span className="sm:hidden">Upload</span>
            <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleUpload} />
          </label>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..." 
              aria-label="Search media assets"
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus-visible:text-brand-teal outline-none"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1"
              role="tablist"
              aria-label="View mode"
            >
              <button 
                onClick={() => setViewMode('grid')}
                role="tab"
                aria-selected={viewMode === 'grid'}
                aria-label="Grid view"
                className={`p-2 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${viewMode === 'grid' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid size={18} aria-hidden="true" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                role="tab"
                aria-selected={viewMode === 'list'}
                aria-label="List view"
                className={`p-2 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${viewMode === 'list' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={18} aria-hidden="true" />
              </button>
            </div>
            
            <button 
              aria-label="Filter assets"
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all focus-visible:ring-2 focus-visible:ring-brand-teal outline-none"
            >
              <Filter size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <MediaSkeleton />
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ImageIcon size={40} className="text-gray-200" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {searchQuery ? 'No matching assets' : 'No assets found'}
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              {searchQuery 
                ? `We couldn't find any assets matching "${searchQuery}"`
                : 'Upload your first property photos or videos to get started.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
            role="list"
            aria-label="Media assets grid"
          >
            <AnimatePresence mode="popLayout">
              {filteredAssets.map((asset) => (
                <motion.div 
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all focus-within:ring-2 focus-within:ring-brand-teal outline-none"
                  role="listitem"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button 
                        aria-label={`View ${asset.name}`}
                        className="p-2 bg-white rounded-xl text-gray-900 hover:bg-brand-teal hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-white outline-none"
                      >
                        <Eye size={16} aria-hidden="true" />
                      </button>
                      <button 
                        aria-label={`Download ${asset.name}`}
                        className="p-2 bg-white rounded-xl text-gray-900 hover:bg-brand-teal hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-white outline-none"
                      >
                        <Download size={16} aria-hidden="true" />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset)}
                        aria-label={`Delete ${asset.name}`}
                        className="p-2 bg-white rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-white outline-none"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold text-gray-900 truncate" title={asset.name}>{asset.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[9px] text-gray-400 font-mono uppercase">{asset.size}</p>
                      <p className="text-[9px] text-gray-400 font-mono uppercase">{asset.type.split('/')[1]}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th scope="col" className="text-left px-6 py-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Asset</th>
                  <th scope="col" className="text-left px-6 py-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Type</th>
                  <th scope="col" className="text-left px-6 py-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Size</th>
                  <th scope="col" className="text-left px-6 py-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Date Added</th>
                  <th scope="col" className="text-right px-6 py-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    className="hover:bg-gray-50/50 transition-colors group focus-within:bg-gray-50 outline-none"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <img src={asset.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]" title={asset.name}>
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono uppercase">{asset.type.split('/')[1]}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono uppercase">{asset.size}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono uppercase">
                      {formatDate(asset.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          aria-label={`View ${asset.name}`}
                          className="p-2 text-gray-400 hover:text-brand-teal transition-colors focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg outline-none"
                        >
                          <Eye size={18} aria-hidden="true" />
                        </button>
                        <button 
                          aria-label={`More actions for ${asset.name}`}
                          className="p-2 text-gray-400 hover:text-brand-teal transition-colors focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg outline-none"
                        >
                          <MoreVertical size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

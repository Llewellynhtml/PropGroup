import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Layout,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface Template {
  id: number;
  name: string;
  description: string;
  platform: string;
  thumbnail_url: string;
  price: number;
  rating: number;
  downloads: number;
  author: string;
}

export default function TemplateMarketplace() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('All');

  useEffect(() => {
    // Mock data for now
    setTemplates([
      { 
        id: 1, 
        name: 'Luxury Villa Showcase', 
        description: 'Perfect for high-end properties with multiple images.', 
        platform: 'Instagram', 
        thumbnail_url: 'https://picsum.photos/seed/villa/400/300', 
        price: 0, 
        rating: 4.8, 
        downloads: 1240,
        author: 'PropPost Studio'
      },
      { 
        id: 2, 
        name: 'Modern Apartment Listing', 
        description: 'Clean and minimalist design for urban listings.', 
        platform: 'Facebook', 
        thumbnail_url: 'https://picsum.photos/seed/apt/400/300', 
        price: 15, 
        rating: 4.5, 
        downloads: 850,
        author: 'Creative Agency'
      },
      { 
        id: 3, 
        name: 'Commercial Space Promo', 
        description: 'Professional layout for office and retail spaces.', 
        platform: 'LinkedIn', 
        thumbnail_url: 'https://picsum.photos/seed/office/400/300', 
        price: 25, 
        rating: 4.9, 
        downloads: 420,
        author: 'B2B Marketing'
      },
      { 
        id: 4, 
        name: 'Quick Property Tour', 
        description: 'Dynamic video template for short-form content.', 
        platform: 'TikTok', 
        thumbnail_url: 'https://picsum.photos/seed/tour/400/300', 
        price: 0, 
        rating: 4.7, 
        downloads: 2100,
        author: 'PropPost Studio'
      }
    ]);
    setIsLoading(false);
  }, []);

  const filteredTemplates = templates.filter(t => 
    activePlatform === 'All' || t.platform === activePlatform
  );

  const platforms = [
    { name: 'All', icon: Layout },
    { name: 'Instagram', icon: Instagram },
    { name: 'Facebook', icon: Facebook },
    { name: 'LinkedIn', icon: Linkedin },
    { name: 'TikTok', icon: Twitter }, // Using Twitter icon for TikTok placeholder
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Template Marketplace</h1>
          <p className="text-gray-500 font-medium">Browse and purchase professionally designed post templates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all font-bold">
            <Plus className="w-5 h-5" />
            Sell Template
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold">
            <ShoppingCart className="w-5 h-5" />
            My Purchases
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={() => setActivePlatform(p.name)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activePlatform === p.name 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
            }`}
          >
            <p.icon className="w-4 h-4" />
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img 
                src={template.thumbnail_url} 
                alt={template.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {template.platform}
                </span>
              </div>
              {template.price === 0 && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Free
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{template.author}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-gray-900">{template.rating}</span>
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">{template.description}</p>
              
              <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-1 text-gray-400">
                  <Download className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{template.downloads.toLocaleString()}</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                  {template.price > 0 ? `Buy R${template.price}` : 'Get Free'}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

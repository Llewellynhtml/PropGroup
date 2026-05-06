import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Home, 
  MapPin, 
  DollarSign, 
  Maximize, 
  Bed, 
  Bath, 
  Car,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAddProperty } from '../../hooks/useAddProperty';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
  const { addProperty, isSubmitting } = useAddProperty();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    city: '',
    area: '',
    beds: '',
    baths: '',
    parking: '',
    size: '',
    listing_type: 'sale' as 'sale' | 'rent',
    description: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProperty(formData, selectedFiles, () => {
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '', price: '', city: '', area: '', beds: '', baths: '', parking: '', size: '', listing_type: 'sale', description: ''
      });
      setSelectedFiles([]);
      setPreviews([]);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Add New Property</h2>
                <p className="text-sm text-gray-500 font-medium">Create a premium listing for your property.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-600 transition-all shadow-sm border border-transparent hover:border-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Property Media</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-teal hover:text-brand-teal hover:bg-brand-teal/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                      <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Photos</span>
                  </button>
                  
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-3xl overflow-hidden group border border-gray-100">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Title</label>
                  <div className="relative group">
                    <Home className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={20} />
                    <input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                      placeholder="e.g. Modern Minimalist Villa with Ocean View"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={20} />
                    <input 
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Listing Type</label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 border border-gray-100 rounded-3xl">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, listing_type: 'sale'})}
                      className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.listing_type === 'sale' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, listing_type: 'rent'})}
                      className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.listing_type === 'rent' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={20} />
                    <input 
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                      placeholder="e.g. Cape Town"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area / Suburb</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors" size={20} />
                    <input 
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all"
                      placeholder="e.g. Camps Bay"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Property Specifications</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Beds</label>
                    <div className="relative group">
                      <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="number"
                        value={formData.beds}
                        onChange={(e) => setFormData({...formData, beds: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Baths</label>
                    <div className="relative group">
                      <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="number"
                        value={formData.baths}
                        onChange={(e) => setFormData({...formData, baths: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Parking</label>
                    <div className="relative group">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="number"
                        value={formData.parking}
                        onChange={(e) => setFormData({...formData, parking: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Size (m²)</label>
                    <div className="relative group">
                      <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="number"
                        value={formData.size}
                        onChange={(e) => setFormData({...formData, size: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal outline-none transition-all resize-none"
                  placeholder="Tell potential buyers about the unique features of this property..."
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-brand-charcoal text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Property
                      <Plus size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

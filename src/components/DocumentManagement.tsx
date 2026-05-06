import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye,
  CheckCircle2,
  Clock,
  Lock,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: number;
  property_id: number;
  property_title: string;
  name: string;
  type: string;
  url: string;
  version: number;
  created_at: string;
  status: 'Draft' | 'Signed' | 'Pending';
}

export default function DocumentManagement() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock data for now
    setDocuments([
      { 
        id: 1, 
        property_id: 1, 
        property_title: 'Modern Villa in Camps Bay', 
        name: 'Sale Agreement.pdf', 
        type: 'Contract', 
        url: '#', 
        version: 2, 
        created_at: '2024-03-20T10:00:00Z',
        status: 'Signed'
      },
      { 
        id: 2, 
        property_id: 2, 
        property_title: 'Luxury Apartment in Waterfront', 
        name: 'Title Deed.pdf', 
        type: 'Legal', 
        url: '#', 
        version: 1, 
        created_at: '2024-03-18T14:30:00Z',
        status: 'Pending'
      },
      { 
        id: 3, 
        property_id: 1, 
        property_title: 'Modern Villa in Camps Bay', 
        name: 'Floor Plan.png', 
        type: 'Technical', 
        url: '#', 
        version: 1, 
        created_at: '2024-03-15T09:15:00Z',
        status: 'Draft'
      }
    ]);
    setIsLoading(false);
  }, []);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.property_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Document Repository</h1>
          <p className="text-gray-500 font-medium">Manage property contracts, deeds, and technical documents.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold">
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search documents or properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl border border-transparent hover:border-gray-200 transition-all font-bold text-xs">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl border border-transparent hover:border-gray-200 transition-all font-bold text-xs">
              <Download className="w-4 h-4" />
              Export List
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Version</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{doc.property_title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">v{doc.version}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {doc.status === 'Signed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {doc.status === 'Pending' && <Clock className="w-4 h-4 text-amber-500" />}
                      {doc.status === 'Draft' && <FileText className="w-4 h-4 text-gray-400" />}
                      <span className={`text-xs font-bold ${
                        doc.status === 'Signed' ? 'text-emerald-600' : 
                        doc.status === 'Pending' ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-indigo-600 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-emerald-600 transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-rose-600 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

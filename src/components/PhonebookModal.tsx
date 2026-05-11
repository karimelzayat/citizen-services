import React, { useState } from 'react';
import { searchPhonebook } from '../services/dataService';
import { Phone, Search, Building2, MapPin } from 'lucide-react';

export default function PhonebookModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [entity, setEntity] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!entity || !governorate) return;
    setLoading(true);
    const data = await searchPhonebook(entity, governorate);
    setResults(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container p-0 flex flex-col !h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <h2 className="font-black text-2xl text-slate-800 dark:text-white">دليل أرقام الهواتف</h2>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900">
          <div className="glass-card p-6 flex flex-wrap gap-6 bg-slate-50/50 dark:bg-slate-800/30">
             <div className="flex-1 min-w-[200px]">
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">1. اختر الجهة:</label>
               <select className="form-input" value={entity} onChange={e => setEntity(e.target.value)}>
                 <option value="">-- اختر جهة --</option>
                 <option value="المديريات">المديريات</option>
                 <option value="التأمين الصحي">التأمين الصحي</option>
                 <option value="الإدارة المركزية">الإدارة المركزية</option>
               </select>
             </div>
             <div className="flex-1 min-w-[200px]">
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">2. اختر المحافظة:</label>
               <select className="form-input" value={governorate} onChange={e => setGovernorate(e.target.value)}>
                 <option value="">-- اختر --</option>
                 <option value="القاهرة">القاهرة</option>
                 <option value="الجيزة">الجيزة</option>
                 <option value="الإسكندرية">الإسكندرية</option>
                 <option value="أسوان">أسوان</option>
                 <option value="أسيوط">أسيوط</option>
                 <option value="الأقصر">الأقصر</option>
               </select>
             </div>
             <div className="w-full sm:w-auto self-end">
               <button 
                onClick={handleSearch}
                disabled={loading}
                className="btn-primary w-full px-12"
               >
                 {loading ? 'جاري البحث...' : 'بحث'}
               </button>
             </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
           {results.length > 0 ? (
             results.map((res, i) => (
               <div key={i} className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                     <Building2 className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 dark:text-white">{res.name}</h4>
                     <p className="text-xs text-slate-400">{res.entity} - {res.governorate}</p>
                   </div>
                 </div>
                 <a href={`tel:${res.phone}`} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100">
                    <Phone className="w-4 h-4" />
                    {res.phone}
                 </a>
               </div>
             ))
           ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-50 py-20">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                 <Search className="w-8 h-8" />
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold">
                 {loading ? 'جاري جلب البيانات...' : 'الرجاء اختيار جهة ومحافظة لعرض البيانات.'}
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

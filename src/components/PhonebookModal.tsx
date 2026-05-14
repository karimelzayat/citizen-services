import React, { useState } from 'react';
import { searchPhonebook } from '../services/dataService';
import { Phone, Search, Building2, MapPin } from 'lucide-react';
import SearchableSelect from './ui/SearchableSelect';
import { GOVERNORATES_LIST } from '../constants';

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
      <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/50 dark:shadow-none rounded-[32px] border border-slate-100 dark:border-white/5 p-0 flex flex-col !h-[80vh] overflow-hidden !max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
               <Phone className="w-6 h-6" />
             </div>
             <div>
               <h2 className="font-black text-2xl text-slate-900 dark:text-white">دليل أرقام الهواتف</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">قاعدة بيانات التواصل مع المديريات والجهات</p>
             </div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all" onClick={onClose}>
             <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 flex flex-wrap gap-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
             <div className="flex-1 min-w-[200px]">
               <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">1. اختر الجهة:</label>
               <SearchableSelect
                 options={['المديريات', 'التأمين الصحي', 'الإدارة المركزية']}
                 value={entity}
                 onChange={setEntity}
                 placeholder="اختر جهة..."
               />
             </div>
             <div className="flex-1 min-w-[200px]">
               <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">2. اختر المحافظة:</label>
               <SearchableSelect
                 options={GOVERNORATES_LIST}
                 value={governorate}
                 onChange={setGovernorate}
                 placeholder="اختر محافظة..."
               />
             </div>
             <div className="w-full sm:w-auto self-end pb-1">
               <button 
                 onClick={handleSearch}
                 disabled={loading}
                 className="btn-primary w-full px-12 h-12 rounded-2xl flex items-center justify-center gap-2"
               >
                 <Search className="w-4 h-4" />
                 {loading ? 'جاري البحث...' : 'بحث الآن'}
               </button>
             </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
           {results.length > 0 ? (
             results.map((res, i) => (
               <div key={i} className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm group hover:border-blue-500/20 transition-all">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                     <Building2 className="w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{res.name}</h4>
                     <p className="text-xs text-slate-400 font-bold">{res.entity} - {res.governorate}</p>
                   </div>
                 </div>
                 <a href={`tel:${res.phone}`} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-black border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
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

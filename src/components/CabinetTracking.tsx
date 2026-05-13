import React, { useState, useEffect } from 'react';
import { listenToCabinetComplaints } from '../services/dataService';
import { Search } from 'lucide-react';
import { Complaint } from '../types';

export default function CabinetTracking() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = listenToCabinetComplaints((data) => {
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = complaints.filter(c => 
    c.cabinetNumber?.includes(search) || 
    c.callerName?.includes(search) ||
    c.phoneNumber?.includes(search)
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none rounded-[32px] flex flex-col mt-6 overflow-hidden relative transition-all duration-700">
      <div className="p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 flex items-center justify-between transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 shadow-sm">
            <i className="fas fa-landmark text-lg"></i>
          </div>
          <h3 className="m-0 text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">شكاوى مجلس الوزراء</h3>
        </div>
        <div className="flex items-center gap-3">
           <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500/50"></span>
           <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">مباشر</span>
        </div>
      </div>

      <div className="relative px-5 py-4 bg-white dark:bg-transparent">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="بحث سريع في بيانات المجلس..." 
            className="form-input pr-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-[350px] overflow-y-auto px-5 pb-5 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
             <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">جاري المزامنة مع المركز...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((c) => (
            <div key={c.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-orange-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all group cursor-pointer shadow-sm hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-xl border border-orange-100 dark:border-orange-900/40 uppercase tracking-wider">#{c.cabinetNumber || 'N/A'}</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{c.timestamp ? new Date((c.timestamp as any).toDate()).toLocaleDateString('ar-EG') : ''}</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-orange-600 transition-colors uppercase leading-none">{c.callerName}</h4>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-500 line-clamp-1 mt-2 tracking-tight">{c.subject}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
             <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-800 mb-2">
                <i className="fas fa-folder-open text-xl"></i>
             </div>
             <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">لا توجد شكاوى مسجلة</p>
          </div>
        )}
      </div>
    </div>
  );
}

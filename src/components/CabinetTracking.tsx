import React, { useState, useEffect } from 'react';
import { listenToCabinetComplaints } from '../services/dataService';
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
    <div className="glass-card flex flex-col mt-6 overflow-hidden relative transition-all duration-700">
      <div className="p-4 bg-slate-50/20 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5 flex items-center justify-between transition-colors duration-500">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
            <i className="fas fa-gavel text-sm"></i>
          </div>
          <h3 className="m-0 text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">شكاوى الوزراء</h3>
        </div>
        <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full">نشط</span>
      </div>

      <div className="relative p-3 bg-white/50 dark:bg-transparent">
        <i className="fas fa-search absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
        <input 
          type="text" 
          placeholder="بحث سريع..." 
          className="form-input pr-10 py-2.5 text-xs rounded-full border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {loading ? (
          <p className="text-center text-[10px] font-black text-slate-400 dark:text-slate-600 py-10 uppercase tracking-widest italic">جاري جلب البيانات من المركز...</p>
        ) : filtered.length > 0 ? (
          filtered.map((c) => (
            <div key={c.id} className="p-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5 hover:border-red-500/20 transition-all group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-red-600">رقم المجلس: {c.cabinetNumber || 'N/A'}</span>
                <span className="text-[9px] text-slate-400">{c.timestamp ? new Date((c.timestamp as any).toDate()).toLocaleDateString('ar-EG') : ''}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{c.callerName}</h4>
              <p className="text-[10px] text-slate-500 line-clamp-1">{c.subject}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-[10px] font-black text-slate-400 py-10 uppercase tracking-widest italic">لا توجد شكاوى مجلس وزراء مسجلة</p>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { searchComplaints } from '../services/dataService';
import { Complaint } from '../types';
import { Search, Calendar as CalendarIcon, Phone, User, MapPin, Database, Filter, Layers, ChevronRight, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function SearchComplaints() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'duplicates'>('all');

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchComplaints({ date, phoneNumber: phone });
      setResults(data);
    } catch (err: any) {
      alert('حدث خطأ أثناء البحث: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = filterType === 'duplicates' 
    ? results.filter((item, index) => results.findIndex(r => r.phoneNumber === item.phoneNumber) !== index)
    : results;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">البحث والمراجعة</h2>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">استرجاع البيانات المسجلة وتصفية المكالمات المكررة</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
           <div className="bg-blue-600/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold leading-none">{results.length} نتيجة</span>
           </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
               <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
               البحث بالتاريخ
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input h-10 text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
               <Phone className="w-3.5 h-3.5 text-blue-600" />
               رقم التليفون
            </label>
            <input type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input h-10 font-mono tracking-widest text-sm" />
          </div>

         <button 
            onClick={handleSearch} 
            disabled={loading}
            className="btn-primary h-10 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{phone || date ? 'بحث مخصص' : 'عرض الكل'}</span>
          </button>
          
          {(phone || date) && (
            <button 
              onClick={() => { setPhone(''); setDate(''); handleSearch(); }}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-white/5 transition-all duration-700">
               <button 
                 onClick={() => setFilterType('all')} 
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-500 ${filterType === 'all' ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
               >
                 <Layers className="w-3.5 h-3.5" />
                 الكل
               </button>
               <button 
                 onClick={() => setFilterType('duplicates')} 
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'duplicates' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-rose-500'}`}
               >
                 <Filter className="w-3.5 h-3.5" />
                 المكرر
               </button>
            </div>
        </div>
      )}

      {/* Results Area */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Database className="absolute inset-0 m-auto w-4 h-4 text-blue-600 animate-pulse" />
             </div>
             <p className="text-slate-400 text-sm font-bold">جاري استرجاع البيانات...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">التوقيت</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">المتصل</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">التليفون</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">المحافظة</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredResults.map((c, idx) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                              {c.timestamp && typeof (c.timestamp as any).toDate === 'function' 
                                ? (c.timestamp as any).toDate().toLocaleDateString('ar-EG') 
                                : new Date().toLocaleDateString('ar-EG')}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {c.timestamp && typeof (c.timestamp as any).toDate === 'function' 
                                ? (c.timestamp as any).toDate().toLocaleTimeString('ar-EG') 
                                : new Date().toLocaleTimeString('ar-EG')}
                            </span>
                         </div>
                      </td>
                      <td className="px-4 py-3.5">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-[9px]">
                               {c.callerName.charAt(0)}
                            </div>
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{c.callerName}</span>
                         </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono tracking-tight text-slate-500 dark:text-slate-400">{c.phoneNumber}</td>
                      <td className="px-4 py-3.5">
                         <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-bold">{c.governorate}</span>
                      </td>
                      <td className="px-4 py-3.5">
                         <span className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-colors duration-500 ${c.complaintStatus === 'تم الرد' ? 'bg-emerald-100/60 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100/60 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                           {c.complaintStatus}
                         </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                         <button className="p-1.5 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-slate-300 dark:text-slate-700">
                            <ChevronRight className="w-3.5 h-3.5" />
                         </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/30 rounded-[32px] border border-slate-100 dark:border-white/5"
          >
             <Database className="w-8 h-8 text-slate-200 dark:text-slate-700 mb-4" />
             <p className="text-slate-400 font-bold text-sm tracking-tight">لا توجد بيانات للعرض حالياً</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

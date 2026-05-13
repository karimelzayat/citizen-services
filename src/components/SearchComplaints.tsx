import React, { useState, useEffect } from 'react';
import { searchComplaints } from '../services/dataService';
import { Complaint } from '../types';
import { Search, Calendar as CalendarIcon, Phone, User, MapPin, Database, Filter, Layers, ChevronRight, Loader2, Info, X, Clock, FileText, Download, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchComplaints() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'duplicates'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (overrideDate?: string) => {
    setLoading(true);
    try {
      const searchDate = overrideDate !== undefined ? overrideDate : date;
      const data = await searchComplaints({ date: searchDate, phoneNumber: phone });
      setResults(data);
      if (overrideDate !== undefined) {
        setDate(overrideDate);
        setPhone('');
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء البحث: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = filterType === 'duplicates' 
    ? results.filter((item, index) => results.findIndex(r => r.phoneNumber === item.phoneNumber) !== index)
    : results;

  const viewAllForDate = (dateStr: string) => {
    handleSearch(dateStr);
    setSelectedComplaint(null);
  };

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
      <div className="glass-card bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 rounded-[32px] border border-slate-100 dark:border-white/5 transition-all duration-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
               <CalendarIcon className="w-4 h-4 text-blue-600" />
               البحث بالتاريخ
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input h-14 text-sm bg-slate-50 dark:bg-slate-800 border-transparent transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
               <Phone className="w-4 h-4 text-blue-600" />
               رقم التليفون
            </label>
            <input type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input h-14 font-mono tracking-widest text-sm bg-slate-50 dark:bg-slate-800 border-transparent transition-all" />
          </div>

         <button 
            onClick={() => handleSearch()} 
            disabled={loading}
            className="btn-primary h-14 flex items-center justify-center gap-3 text-lg shadow-xl shadow-blue-500/25 active:scale-95 transition-all col-span-1 md:col-span-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
            <span>{phone || date ? 'بدأ البحث المخصص' : 'تحديث القائمة'}</span>
          </button>
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
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all duration-700">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">التوقيت</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">المتصل</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">التليفون</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">المحافظة</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredResults.map((c, idx) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {c.timestamp && typeof (c.timestamp as any).toDate === 'function' 
                                ? (c.timestamp as any).toDate().toLocaleDateString('ar-EG') 
                                : new Date().toLocaleDateString('ar-EG')}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {c.timestamp && typeof (c.timestamp as any).toDate === 'function' 
                                ? (c.timestamp as any).toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
                                : new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs">
                               {c.callerName.charAt(0)}
                            </div>
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{c.callerName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono tracking-tight text-slate-500 dark:text-slate-400">{c.phoneNumber}</td>
                      <td className="px-6 py-4">
                         <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold border border-slate-100 dark:border-white/5">{c.governorate}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2.5 py-1 rounded-full text-[9px] font-black transition-colors duration-500 ${c.complaintStatus === 'تم الرد' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                           {c.complaintStatus}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all mx-auto">
                            <ChevronRight className="w-4 h-4" />
                         </div>
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
            className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] transition-all duration-700 shadow-sm"
          >
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-slate-200 dark:text-slate-700" />
             </div>
             <p className="text-slate-400 font-bold text-sm tracking-tight italic">لا توجد بيانات للعرض حالياً</p>
          </motion.div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">{selectedComplaint.callerName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">تفاصيل المكالمة والشكوى</p>
                  </div>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Status and Time badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100 dark:border-blue-900/30">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedComplaint.timestamp && typeof (selectedComplaint.timestamp as any).toDate === 'function' 
                      ? (selectedComplaint.timestamp as any).toDate().toLocaleString('ar-EG') 
                      : 'توقيت غير مسجل'}
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${selectedComplaint.complaintStatus === 'تم الرد' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    <Info className="w-3.5 h-3.5" />
                    {selectedComplaint.complaintStatus}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">بيانات المتصل</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold">رقم الهاتف</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedComplaint.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold">المحافظة</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedComplaint.governorate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complaint Header */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">تصنيف الشكوى</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold">الجهة الموجه إليها</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedComplaint.complaintEntity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold">موضوع الشكوى</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedComplaint.complaintSubject}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complaint Body */}
                <div className="space-y-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    تفاصيل الشكوى:
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedComplaint.subject || 'لا توجد تفاصيل إضافية مسجلة'}
                  </p>
                </div>

                {/* Employee Info */}
                <div className="flex items-center justify-between p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-50 dark:border-blue-900/20">
                   <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-[8px] text-slate-400 font-black uppercase">الموظف القائم بالتسجيل</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-blue-300">{selectedComplaint.employeeName}</p>
                      </div>
                   </div>
                   <div className="text-[9px] text-slate-400 italic">
                      ID: {selectedComplaint.employeeEmail?.split('@')[0]}
                   </div>
                </div>

                {/* Documents / Photos */}
                {selectedComplaint.photoUrl && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">المرفقات</h4>
                    <div className="relative group rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                      <img src={selectedComplaint.photoUrl} alt="Complaint Attachment" className="w-full h-auto max-h-60 object-cover transition-transform duration-700 group-hover:scale-105" />
                      <a 
                        href={selectedComplaint.photoUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                          <Download className="w-6 h-6" />
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3">
                <button 
                  onClick={() => {
                    const complaintDate = selectedComplaint.timestamp && typeof (selectedComplaint.timestamp as any).toDate === 'function' 
                      ? (selectedComplaint.timestamp as any).toDate().toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0];
                    viewAllForDate(complaintDate);
                  }}
                  className="flex-1 bg-blue-600 text-white rounded-2xl px-6 py-3 text-sm font-black shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <CalendarIcon className="w-4 h-4" />
                  عرض كل مكالمات اليوم
                </button>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="px-8 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-white/5 hover:bg-slate-50 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

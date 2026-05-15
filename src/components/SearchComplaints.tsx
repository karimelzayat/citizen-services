import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { searchComplaints } from '../services/dataService';
import { Complaint } from '../types';
import { Search, Calendar as CalendarIcon, Phone, User, MapPin, Database, Filter, Layers, ChevronRight, Loader2, Info, X, Clock, FileText, Download, UserCheck, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ComplaintDetailsModal from './ComplaintDetailsModal';

export default function SearchComplaints() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [phone, setPhone] = useState('');
  const [callerName, setCallerName] = useState('');
  const [results, setResults] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'duplicates'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Complaint>>({});

  const handleEditClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setEditFormData({ ...complaint });
    setIsEditing(true);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (overrideDate?: string) => {
    setLoading(true);
    try {
      const searchDate = overrideDate !== undefined ? overrideDate : date;
      const data = await searchComplaints({ 
        date: searchDate, 
        phoneNumber: phone,
        callerName: callerName 
      });
      setResults(data);
      if (overrideDate !== undefined) {
        setDate(overrideDate);
        setPhone('');
        setCallerName('');
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
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    if (!selectedComplaint?.id) return;
    setLoading(true);
    try {
      // In a real app we'd call updateComplaint service
      // For now we'll just update local state and alert
      setResults(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, ...editFormData } as Complaint : c));
      setSelectedComplaint(null);
      setIsEditing(false);
      alert('تم تعديل البيانات بنجاح');
    } catch (err: any) {
      alert('خطأ أثناء التعديل: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ComplaintDetailsModal 
        selectedComplaint={selectedComplaint}
        onClose={() => { setSelectedComplaint(null); setIsEditing(false); }}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleUpdate={handleUpdate}
        loading={loading}
        viewAllForDate={viewAllForDate}
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
           <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">البحث والمراجعة المتقدمة</h2>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">استرجع البيانات المسجلة بالدقة اللازمة</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
           <div className="bg-blue-600 text-white px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">
              <Database className="w-4 h-4" />
              <span className="text-[9px] font-black leading-none uppercase tracking-widest">{results.length} نتيجة بحث</span>
           </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="glass-card bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-none p-6 rounded-[32px] border border-slate-100 dark:border-white/5 transition-all duration-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest leading-none block mb-1">
               <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                البحث بالتاريخ
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest leading-none block mb-1">
               <Phone className="w-3.5 h-3.5 text-blue-600" />
               رقم التليفون
            </label>
            <input type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input font-mono" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest leading-none block mb-1">
               <User className="w-3.5 h-3.5 text-blue-600" />
               اسم المتصل
            </label>
            <input type="text" placeholder="اسم المتصل..." value={callerName} onChange={(e) => setCallerName(e.target.value)} className="form-input" />
          </div>

         <button 
            onClick={() => handleSearch()} 
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="font-black uppercase tracking-widest">{phone || date || callerName ? 'بدأ البحث المتقدم' : 'تحديث البيانات'}</span>
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
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
             <div className="relative">
                <div className="w-20 h-20 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Database className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
             </div>
             <p className="text-slate-400 text-lg font-black uppercase tracking-[0.3em] italic">مزامنة البيانات الحية...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-700">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">التوقيت</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">المتصل</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">التليفون</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">المحافظة</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredResults.map((c, idx) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white mb-1">
                              {c.timestamp && typeof (c.timestamp as any).toDate === 'function' 
                                ? (c.timestamp as any).toDate().toLocaleDateString('ar-EG') 
                                : new Date().toLocaleDateString('ar-EG')}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {c.timestamp && typeof (c.timestamp as any).toDate === 'function' 
                                ? (c.timestamp as any).toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
                                : new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs shadow-sm border border-blue-100 dark:border-white/5">
                               {c.callerName.charAt(0)}
                            </div>
                            <span className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{c.callerName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono tracking-widest text-slate-500 dark:text-slate-400">{c.phoneNumber}</td>
                      <td className="px-6 py-4">
                         <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black border border-slate-100 dark:border-white/5 uppercase tracking-widest">{c.governorate}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm ${c.complaintStatus === 'تم الرد' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'}`}>
                           {c.complaintStatus}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 shadow-sm transition-all mx-auto">
                            <ChevronRight className="w-5 h-5" />
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
            className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[48px] transition-all duration-700"
          >
             <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Database className="w-12 h-12 text-slate-200 dark:text-slate-700" />
             </div>
             <p className="text-slate-400 font-black text-lg tracking-[0.2em] uppercase italic">قاعدة البيانات خالية حالياً</p>
          </motion.div>
        )}
      </div>

    </div>
  );
}


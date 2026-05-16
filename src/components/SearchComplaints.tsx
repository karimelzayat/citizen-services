import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { searchComplaints, searchAdminComplaints } from '../services/dataService';
import { Complaint } from '../types';
import { Search, Calendar as CalendarIcon, Phone, User, MapPin, Database, Filter, Layers, ChevronRight, Loader2, Info, X, Clock, FileText, Download, UserCheck, AlertCircle, Save, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ComplaintDetailsModal from './ComplaintDetailsModal';
import { toast } from '../lib/toast';

import { UserPermissions } from '../types';

export default function SearchComplaints({ permissions, mode = 'hotline' }: { permissions: UserPermissions | null, mode?: 'hotline' | 'admin' }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [phone, setPhone] = useState('');
  const [callerName, setCallerName] = useState('');
  const [complaintNo, setComplaintNo] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'duplicates'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleEditClick = (complaint: any) => {
    setSelectedComplaint(complaint);
    setEditFormData({ ...complaint });
    setIsEditing(true);
  };

  useEffect(() => {
    handleSearch();
  }, [mode]);

  const handleSearch = async (overrideDate?: string) => {
    setLoading(true);
    try {
      const searchDate = overrideDate !== undefined ? overrideDate : date;
      let data;
      if (mode === 'admin') {
        data = await searchAdminComplaints({ date: searchDate, complaintNo: complaintNo });
        // Filter for 'الجاري' if requested by user implicitly
        data = data.filter((c: any) => c.workType === 'الجاري');
      } else {
        data = await searchComplaints({ 
          date: searchDate, 
          phoneNumber: phone,
          callerName: callerName 
        });
      }
      setResults(data);
      setCurrentPage(1);
      if (overrideDate !== undefined) {
        setDate(overrideDate);
        setPhone('');
        setCallerName('');
        setComplaintNo('');
      }
    } catch (err: any) {
      toast.error('حدث خطأ أثناء البحث: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = filterType === 'duplicates' 
    ? results.filter(item => results.filter(r => r.phoneNumber === item.phoneNumber).length > 1)
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
      toast.success('تم تعديل البيانات بنجاح');
    } catch (err: any) {
      toast.error('خطأ أثناء التعديل: ' + err.message);
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

          {mode === 'admin' && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest leading-none block mb-1">
                 <Hash className="w-3.5 h-3.5 text-blue-600" />
                 رقم الشكوى
              </label>
              <input type="text" placeholder="0000000" value={complaintNo} onChange={(e) => setComplaintNo(e.target.value)} className="form-input font-mono" />
            </div>
          )}

          {mode === 'hotline' && (
            <>
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
            </>
          )}

         <button 
            onClick={() => handleSearch()} 
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="font-black uppercase tracking-widest">
              {phone || date || callerName || complaintNo ? 'بدأ البحث المتقدم' : 'تحديث البيانات'}
            </span>
          </button>
        </div>
      </div>

      {results.length > 0 && (() => {
        const phoneCounts = results.reduce((acc, r) => {
          if (r.phoneNumber) acc[r.phoneNumber] = (acc[r.phoneNumber] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const uniqueDuplicatePhones = Object.keys(phoneCounts).filter(p => phoneCounts[p] > 1);
        const hasDuplicates = uniqueDuplicatePhones.length > 0;

        const getDuplicateColor = (phone: string) => {
          const index = uniqueDuplicatePhones.indexOf(phone);
          if (index === -1) return '';
          const colors = [
            'bg-rose-50/50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/40',
            'bg-amber-50/50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/40',
            'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/40',
            'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/40',
            'bg-violet-50/50 border-violet-100 dark:bg-violet-900/20 dark:border-violet-800/40',
            'bg-cyan-50/50 border-cyan-100 dark:bg-cyan-900/20 dark:border-cyan-800/40',
            'bg-fuchsia-50/50 border-fuchsia-100 dark:bg-fuchsia-900/20 dark:border-fuchsia-800/40',
            'bg-orange-50/50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/40',
          ];
          return colors[index % colors.length];
        };

        return (
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
                   onClick={() => hasDuplicates && setFilterType('duplicates')} 
                   disabled={!hasDuplicates}
                   className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                     filterType === 'duplicates' 
                       ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                       : hasDuplicates 
                         ? 'text-slate-400 hover:text-rose-500' 
                         : 'text-slate-300 cursor-not-allowed'
                   }`}
                 >
                   <Filter className="w-3.5 h-3.5" />
                   المكرر
                   {hasDuplicates && (
                     <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm animate-pulse"></span>
                   )}
                 </button>
              </div>
          </div>
        );
      })()}

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
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-700">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">التوقيت</th>
                    {mode === 'hotline' ? (
                      <>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">المتصل</th>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">التليفون</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">رقم الشكوى</th>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">نوع العمل</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">المحافظة</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {(() => {
                    const phoneCounts = results.reduce((acc, r) => {
                      if (r.phoneNumber) acc[r.phoneNumber] = (acc[r.phoneNumber] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const uniqueDuplicatePhones = Object.keys(phoneCounts).filter(p => phoneCounts[p] > 1);

                    const getDuplicateColor = (phone: string) => {
                      const index = uniqueDuplicatePhones.indexOf(phone);
                      if (index === -1) return '';
                      const colors = [
                        'bg-rose-50/50 dark:bg-rose-900/20 border-rose-100/50 dark:border-rose-800/30',
                        'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100/50 dark:border-blue-800/30',
                        'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100/50 dark:border-emerald-800/30',
                        'bg-amber-50/50 dark:bg-amber-900/20 border-amber-100/50 dark:border-amber-800/30',
                        'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100/50 dark:border-indigo-800/30',
                        'bg-violet-50/50 dark:bg-violet-900/20 border-violet-100/50 dark:border-violet-800/30',
                        'bg-cyan-50/50 dark:bg-cyan-900/20 border-cyan-100/50 dark:border-cyan-800/30',
                        'bg-fuchsia-50/50 dark:bg-fuchsia-900/20 border-fuchsia-100/50 dark:border-fuchsia-800/30',
                      ];
                      return colors[index % colors.length];
                    };

                    const indexOfLastItem = currentPage * itemsPerPage;
                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                    const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

                    return currentItems.map((c, idx) => {
                      const colorClass = filterType === 'duplicates' ? getDuplicateColor(c.phoneNumber) : '';
                      return (
                        <motion.tr 
                          key={c.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (idx % 20) * 0.01 }}
                          className={`group transition-all cursor-pointer border-l-4 ${colorClass || 'border-transparent hover:bg-blue-50/30 dark:hover:bg-blue-900/10'}`}
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
                          {mode === 'hotline' ? (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm border ${colorClass ? 'bg-white/50 dark:bg-slate-800/50 border-white/20' : 'bg-blue-50 dark:bg-slate-800 border-blue-100 dark:border-white/5 text-blue-600 dark:text-blue-400'}`}>
                                      {c.callerName ? c.callerName.charAt(0) : '?'}
                                    </div>
                                    <span className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{c.callerName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono tracking-widest text-slate-500 dark:text-slate-400">
                                <span className={colorClass ? 'font-black text-slate-900 dark:text-white' : ''}>{c.phoneNumber}</span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xs shadow-sm border border-amber-100 dark:border-white/5">
                                      <Hash className="w-4 h-4" />
                                    </div>
                                    <span className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">{c.complaintNo}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{c.workType}</span>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4">
                             <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black border border-slate-100 dark:border-white/5 uppercase tracking-widest">{c.governorate}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                               {c.employeeName}
                             </span>
                          </td>
                        </motion.tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredResults.length > itemsPerPage && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-xs font-black disabled:opacity-50"
              >
                السابق
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(filteredResults.length / itemsPerPage)) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {Math.ceil(filteredResults.length / itemsPerPage) > 5 && <span className="text-slate-300">...</span>}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredResults.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredResults.length / itemsPerPage)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-xs font-black disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
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


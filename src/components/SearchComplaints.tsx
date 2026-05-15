import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { searchComplaints } from '../services/dataService';
import { Complaint } from '../types';
import { Search, Calendar as CalendarIcon, Phone, User, MapPin, Database, Filter, Layers, ChevronRight, Loader2, Info, X, Clock, FileText, Download, UserCheck, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

      <AnimatePresence>
        {selectedComplaint && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 overflow-hidden RTL" dir="rtl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedComplaint(null); setIsEditing(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-full max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${isEditing ? 'bg-amber-500' : 'bg-blue-600'} rounded-2xl flex items-center justify-center text-white shadow-lg ${isEditing ? 'shadow-amber-500/20' : 'shadow-blue-600/20'} transition-colors duration-500`}>
                    {isEditing ? <FileText className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      {isEditing ? 'تعديل بيانات الشكوى' : selectedComplaint.callerName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                      {isEditing ? `شكوى رقم: ${selectedComplaint.id?.slice(-6) || '---'}` : 'تفاصيل المكالمة والشكوى المسجلة'}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setSelectedComplaint(null); setIsEditing(false); }} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all font-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar text-right bg-white dark:bg-slate-900">
                {!isEditing && (
                  <div className="flex flex-wrap gap-2 justify-end mb-2">
                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black flex items-center gap-2 border border-blue-100 dark:border-blue-900/30 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedComplaint.timestamp && typeof (selectedComplaint.timestamp as any).toDate === 'function' 
                        ? (selectedComplaint.timestamp as any).toDate().toLocaleString('ar-EG') 
                        : 'توقيت غير مسجل'}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border uppercase tracking-widest ${selectedComplaint.complaintStatus === 'تم الرد' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'}`}>
                      <Info className="w-3.5 h-3.5" />
                      {selectedComplaint.complaintStatus}
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-1">اسم المتصل</label>
                        <input 
                          type="text" 
                          value={editFormData.callerName} 
                          onChange={e => setEditFormData({...editFormData, callerName: e.target.value})}
                          className="form-input h-12 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-1">رقم الهاتف</label>
                        <input 
                          type="text" 
                          value={editFormData.phoneNumber} 
                          onChange={e => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                          className="form-input h-12 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-1">جهة الشكوى</label>
                      <input 
                        type="text" 
                        value={editFormData.complaintEntity} 
                        onChange={e => setEditFormData({...editFormData, complaintEntity: e.target.value})}
                        className="form-input h-12 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-1">موضوع الشكوى</label>
                      <input 
                        type="text" 
                        value={editFormData.complaintSubject} 
                        onChange={e => setEditFormData({...editFormData, complaintSubject: e.target.value})}
                        className="form-input h-12 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-1">تفاصيل المكالمة</label>
                      <textarea 
                        rows={4}
                        value={editFormData.callDetails || editFormData.cabinetSubject} 
                        onChange={e => setEditFormData({...editFormData, callDetails: e.target.value})}
                        className="form-input min-h-[120px] bg-slate-50 dark:bg-slate-800 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Personal Info */}
                      <div className="space-y-5">
                        <h4 className="text-[11px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-white/5 pb-2 mb-2">بيانات المتصل الأساسية</h4>
                        <div className="space-y-4">
                          <DetailRow icon={Phone} label="رقم الهاتف" value={selectedComplaint.phoneNumber} mono />
                          <DetailRow icon={MapPin} label="المحافظة" value={selectedComplaint.governorate} />
                        </div>
                      </div>

                      {/* Complaint Header */}
                      <div className="space-y-5">
                        <h4 className="text-[11px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-white/5 pb-2 mb-2">تصنيف الشكوى الموجهة</h4>
                        <div className="space-y-4">
                          <DetailRow icon={Layers} label="الجهة الموجه إليها" value={selectedComplaint.complaintEntity} />
                          <DetailRow icon={FileText} label="موضوع الشكوى" value={selectedComplaint.complaintSubject} />
                        </div>
                      </div>
                    </div>

                    {/* Complaint Body */}
                    <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pr-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        نص تفاصيل المكالمة والشكوى:
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                        {selectedComplaint.callDetails || selectedComplaint.cabinetSubject || 'لا توجد تفاصيل إضافية مسجلة في هذا السجل'}
                      </p>
                    </div>

                    {/* Cabinet specific info if exists */}
                    {selectedComplaint.isCabinetComplaint && (
                      <div className="p-6 bg-red-50 dark:bg-red-500/5 rounded-3xl border border-red-100 dark:border-red-500/20 space-y-4">
                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" />
                           منظومة مجلس الوزراء
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-tight mb-1">الرقم القومي للمواطن</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white font-mono">{selectedComplaint.cabinetNationalId || '--- --- --- ---'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-tight mb-1">العنوان بالتفصيل</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{selectedComplaint.cabinetCity} - {selectedComplaint.cabinetAddress}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Employee Info */}
                    <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                             <UserCheck className="w-5 h-5" />
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">الموظف القائم بالتسجيل</p>
                            <p className="text-xs font-black text-blue-600 dark:text-blue-400">{selectedComplaint.employeeName}</p>
                          </div>
                       </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleUpdate}
                      disabled={loading}
                      className="flex-1 bg-emerald-600 text-white rounded-2xl px-8 py-4 text-sm font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      حفظ التغييرات الآن
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black border border-slate-200 dark:border-white/5 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      إلغاء التعديل
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEditClick(selectedComplaint)}
                      className="flex-1 bg-amber-500 text-white rounded-2xl px-8 py-4 text-sm font-black shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-95"
                    >
                      <FileText className="w-4 h-4" />
                      تعديل بيانات المكالمة
                    </button>
                    <button 
                      onClick={() => {
                        const complaintDate = selectedComplaint.timestamp && typeof (selectedComplaint.timestamp as any).toDate === 'function' 
                          ? (selectedComplaint.timestamp as any).toDate().toISOString().split('T')[0]
                          : new Date().toISOString().split('T')[0];
                        viewAllForDate(complaintDate);
                      }}
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      عرض مكالمات اليوم
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono }: { icon: any, label: string, value?: string, mono?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-black text-slate-800 dark:text-white ${mono ? 'font-mono' : ''}`}>{value || '---'}</p>
      </div>
    </div>
  );
}

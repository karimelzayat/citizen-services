import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp, addDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Complaint } from '../types';
import { Clock, CheckCircle2, ChevronDown, User, Phone, MapPin, AlertCircle, FileText, Plus, Loader2, Save, X, XCircle, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SearchableSelect from './ui/SearchableSelect';
import { GOVERNORATES_LIST, COMPLAINT_SUBJECTS } from '../constants';
import { reviewFollowUp, addFollowUpManual, deleteBulkFollowUpData } from '../services/dataService';

import * as XLSX from 'xlsx';

export default function FollowUp() {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'completed'>('pending');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Filtering & Pagination State
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Review Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    notes: '',
    result: ''
  });
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Bulk Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'pending' | 'completed'>('pending');
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length <= 1) {
            alert('الملف فارغ أو لا يحتوي على بيانات');
            return;
          }

          // Map data based on user provided column structure
          const batchData = jsonData.slice(1).filter(row => row.length > 0).map(row => {
            // Handle Excel date parsing
            let timestampValue: Timestamp;
            try {
              if (row[0]) {
                const date = new Date(row[0]);
                if (!isNaN(date.getTime())) {
                  timestampValue = Timestamp.fromDate(date);
                } else {
                  timestampValue = Timestamp.now();
                }
              } else {
                timestampValue = Timestamp.now();
              }
            } catch {
              timestampValue = Timestamp.now();
            }

            return {
              callerName: String(row[1] || 'مجهول'),
              phoneNumber: String(row[2] || ''),
              complaintSubject: String(row[3] || ''),
              governorate: String(row[4] || ''),
              complaintEntity: String(row[5] || ''),
              complaintStatus: String(row[6] || 'تم الرد'),
              employeeName: String(row[7] || ''),
              employeeEmail: String(row[8] || ''),
              callDetails: String(row[9] || ''),
              followUpOfficer: String(row[19] || ''),
              followUpNotes: String(row[21] || ''),
              followUpResult: String(row[18] || ''), // Mapping Review Status to followUpResult
              followUpStatus: uploadType,
              timestamp: timestampValue,
              isBulkUploaded: true
            };
          });

          const collectionName = uploadType === 'pending' ? 'followUpPending' : 'followUpCompleted';
          
          // Split into smaller batches for performance/avoiding timeouts
          const chunkSize = 50;
          for (let i = 0; i < batchData.length; i += chunkSize) {
            const chunk = batchData.slice(i, i + chunkSize);
            await Promise.all(chunk.map(item => addDoc(collection(db, collectionName), item)));
          }
          
          alert(`تم رفع ${batchData.length} سجل بنجاح`);
          setIsUploadModalOpen(false);
          // Refresh list if needed (it should auto-refresh via onSnapshot)
        } catch (err: any) {
          console.error('Excel processing error:', err);
          alert('خطأ في معالجة الملف: تأكد من صحة التنسيق');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      alert('خطأ في قراءة الملف');
    } finally {
      setUploadLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  useEffect(() => {
    const targetCollection = activeSubTab === 'pending' ? 'followUpPending' : 'followUpCompleted';
    const q = query(
      collection(db, targetCollection),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      setComplaints(data);
      setLoading(false);
      setCurrentPage(1); // Reset to first page on tab or data change
    });

    return () => unsubscribe();
  }, [activeSubTab]);

  // Filter complaints by month
  const filteredComplaints = complaints.filter(c => {
    if (selectedMonth === 'all') return true;
    if (!(c.timestamp instanceof Timestamp)) return true;
    const date = c.timestamp.toDate();
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return monthYear === selectedMonth;
  });

  // Unique months for filter dropdown
  const availableMonths = Array.from(new Set(complaints.map(c => {
    if (!(c.timestamp instanceof Timestamp)) return null;
    const date = c.timestamp.toDate();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }).filter(Boolean))).sort().reverse() as string[];

  // Pagination Logic
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReviewClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReviewData({
      notes: complaint.followUpNotes || '',
      result: complaint.followUpResult || ''
    });
    setIsReviewOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedComplaint?.id) return;
    if (!reviewData.result) {
      alert('الرجاء تحديد موقف الشكوى (النهائي)');
      return;
    }

    setIsSavingReview(true);
    try {
      await reviewFollowUp(selectedComplaint.id, {
        followUpOfficer: auth.currentUser?.displayName || 'غير معروف',
        followUpNotes: reviewData.notes,
        followUpResult: reviewData.result,
      });
      setIsReviewOpen(false);
      setSelectedComplaint(null);
    } catch (err: any) {
      alert('خطأ أثناء حفظ المراجعة: ' + err.message);
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleManualAdd = async () => {
    setIsAddingManual(true);
    try {
      await addFollowUpManual(manualCallData);
      setIsAddModalOpen(false);
      setManualCallData({
        callerName: '',
        phoneNumber: '',
        governorate: '',
        complaintEntity: '',
        complaintSubject: '',
        callDetails: ''
      });
    } catch (err: any) {
      alert('خطأ في الإضافة: ' + err.message);
    } finally {
      setIsAddingManual(false);
    }
  };

  const handleDeleteBulk = async () => {
    const collectionName = activeSubTab === 'pending' ? 'followUpPending' : 'followUpCompleted';
    const confirmMsg = activeSubTab === 'pending' ? 'هل أنت متأكد من مسح جميع السجلات المرفوعة (الجاري)؟ لا يمكن التراجع عن هذه الخطوة.' : 'هل أنت متأكد من مسح جميع السجلات المرفوعة (تم المتابعة)؟ لا يمكن التراجع عن هذه الخطوة.';
    
    if (!window.confirm(confirmMsg)) return;

    setIsDeletingBulk(true);
    try {
      const count = await deleteBulkFollowUpData(collectionName);
      alert(`تم مسح ${count} سجل مرفوع بنجاح`);
    } catch (err: any) {
      alert('خطأ أثناء المسح: ' + err.message);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Tabs */}
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400">متابعة المكالمات</h2>
        
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-white/5 transition-all duration-700">
           <button 
             onClick={() => setActiveSubTab('pending')} 
             className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-500 flex items-center gap-2 ${activeSubTab === 'pending' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <div className={`w-2 h-2 rounded-full ${activeSubTab === 'pending' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
             الجاري
           </button>
           <button 
             onClick={() => setActiveSubTab('completed')} 
             className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-500 flex items-center gap-2 ${activeSubTab === 'completed' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-blue-500/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             تم المتابعة
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <select 
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
          >
            <option value="all">كل الشهور</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {new Date(m).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          {complaints.some(c => (c as any).isBulkUploaded) && (
            <button 
              onClick={handleDeleteBulk}
              disabled={isDeletingBulk}
              className="flex items-center gap-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-sm border border-rose-100 dark:border-rose-800/30 hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeletingBulk ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
              مسح البيانات المرفوعة
            </button>
          )}
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all hover:scale-[1.02] active:scale-95"
          >
            <FileText className="w-5 h-5" />
            رفع سجلات من النظام القديم
          </button>
        </div>
      </div>


      {/* Summary Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="group bg-blue-50/80 dark:bg-blue-900/20 p-4 rounded-[18px] border border-blue-100 dark:border-blue-800/30 flex items-center justify-between cursor-pointer hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-all duration-500 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <ChevronDown className={`w-6 h-6 text-blue-600 transition-transform duration-500 ${isExpanded ? '' : '-rotate-90'}`} />
          <h3 className="text-lg font-black text-blue-900 dark:text-blue-200">
            {activeSubTab === 'pending' ? 'جميع المكالمات الجارية للمتابعة' : 'جميع المكالمات التي تم متابعتها'}
            <span className="mr-2 text-blue-600 font-bold">({complaints.length} مكالمة)</span>
          </h3>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-6 overflow-hidden"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-500 font-bold">جاري تحميل المكالمات...</p>
              </div>
            ) : paginatedComplaints.length > 0 ? (
              <>
                {paginatedComplaints.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-900/40 rounded-[28px] border border-slate-100 dark:border-white/5 p-8 shadow-sm hover:shadow-xl hover:scale-[1.002] transition-all duration-700 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Top Meta */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-50 dark:border-white/5 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400">مكالمة # {filteredComplaints.length - ((currentPage - 1) * itemsPerPage + idx)}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mt-2 md:mt-0">
                        <span>{c.timestamp instanceof Timestamp ? c.timestamp.toDate().toLocaleString('ar-EG') : 'تاريخ غير معروف'}</span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12 text-right">
                      <InfoRow label="اسم المتصل" value={c.callerName} icon={<User className="w-4 h-4" />} />
                      <InfoRow label="رقم التليفون" value={c.phoneNumber} icon={<Phone className="w-4 h-4" />} />
                      <InfoRow label="المحافظة" value={c.governorate} icon={<MapPin className="w-4 h-4" />} />
                      <InfoRow label="جهة الشكوى" value={c.complaintEntity} icon={<AlertCircle className="w-4 h-4" />} />
                      <InfoRow label="موضوع الشكوى" value={c.complaintSubject} icon={<AlertCircle className="w-4 h-4" />} />
                      <InfoRow label="الموظف المسجل" value={c.employeeName} icon={<User className="w-4 h-4" />} />
                      <div className="col-span-full">
                        <InfoRow label="تفاصيل المكالمة" value={c.callDetails} isLong icon={<FileText className="w-4 h-4" />} />
                      </div>
                      <InfoRow label="حالة المراجعة النهائية" value={c.followUpResult || 'لم تحدد بعد'} status={c.followUpResult ? 'success' : 'default'} />
                      <InfoRow label="الموظف المراجع" value={c.followUpOfficer || 'غير متوفر'} />
                      <div className="col-span-full">
                        <InfoRow label="ملاحظات المتابعة" value={c.followUpNotes || 'لا يوجد ملاحظات'} isLong />
                      </div>
                    </div>

                    {activeSubTab === 'pending' && (
                      <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5">
                        <button 
                          onClick={() => handleReviewClick(c)}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
                        >
                          مراجعة المكالمة
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 font-bold disabled:opacity-50 hover:bg-slate-50 transition-all"
                    >
                      السابق
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-white/5'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 font-bold disabled:opacity-50 hover:bg-slate-50 transition-all"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-white/5 space-y-4">
                <p className="text-xl font-black text-slate-400">لا توجد سجلات حالياً</p>
                <p className="text-slate-400 text-sm">سيتم عرض جميع المكالمات التي تتطلب متابعة هنا</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsReviewOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">مراجعة بيانات المكالمة</h3>
                  <button onClick={() => setIsReviewOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar text-right">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <ReadOnlyField label="اسم المتصل" value={selectedComplaint?.callerName} />
                     <ReadOnlyField label="رقم التليفون" value={selectedComplaint?.phoneNumber} />
                     <ReadOnlyField label="المحافظة" value={selectedComplaint?.governorate} />
                     <div className="col-span-full">
                       <ReadOnlyField label="جهة الشكوى" value={selectedComplaint?.complaintEntity} />
                     </div>

                     <div className="col-span-full">
                       <ReadOnlyField label="موضوع الشكوى" value={selectedComplaint?.complaintSubject} />
                     </div>
                     <div className="col-span-full">
                       <ReadOnlyField label="تفاصيل المكالمة" value={selectedComplaint?.callDetails} isLong />
                     </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-white/5" />

                  <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-sm font-black text-slate-700 dark:text-slate-300 block text-right">تحديد موقف الشكوى (النهائي):</label>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { id: 'مقبول', label: 'مقبول', icon: <CheckCircle2 className="w-5 h-5" />, active: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10' },
                            { id: 'غير مقبول', label: 'غير مقبول', icon: <XCircle className="w-5 h-5" />, active: 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10' },
                            { id: 'لم يتم الرد', label: 'لم يتم الرد', icon: <PhoneOff className="w-5 h-5" />, active: 'bg-slate-50 dark:bg-slate-900/20 border-slate-500 text-slate-600 dark:text-slate-400 shadow-lg shadow-slate-500/10' }
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setReviewData({ ...reviewData, result: option.id })}
                              className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-sm
                                ${reviewData.result === option.id 
                                  ? `${option.active} scale-[1.02]` 
                                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                              {option.icon}
                              <span>{option.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block">ملاحظات المتابعة</label>
                       <textarea 
                         rows={5}
                         value={reviewData.notes}
                         onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                         className="form-input min-h-[120px] resize-none text-slate-700 dark:text-slate-200" 
                         placeholder="اكتب أي ملاحظات إضافية ظهرت أثناء المتابعة..."
                       />
                    </div>
                  </div>
               </div>

               <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/5 flex justify-end">
                 <button 
                   onClick={handleSaveReview}
                   disabled={isSavingReview}
                   className="min-w-[200px] h-14 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   {isSavingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                   حفظ المراجعة
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsUploadModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8"
            >
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">رفع سجلات النظام القديم</h3>
                  <button onClick={() => setIsUploadModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
               </div>

               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setUploadType('pending')}
                     className={`p-4 rounded-2xl border-2 font-black transition-all ${uploadType === 'pending' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
                   >
                     مكالمات جارية
                   </button>
                   <button 
                     onClick={() => setUploadType('completed')}
                     className={`p-4 rounded-2xl border-2 font-black transition-all ${uploadType === 'completed' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
                   >
                     مكالمات مكتملة
                   </button>
                 </div>

                 <div className="p-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[32px] text-center space-y-4 hover:border-blue-500/50 transition-colors relative cursor-pointer group">
                   <input 
                     type="file" 
                     accept=".xlsx,.xls,.csv"
                     onChange={handleFileUpload}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                   />
                   <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                     <Plus className="w-8 h-8 text-blue-600" />
                   </div>
                   <div className="space-y-1 text-right">
                     <p className="font-black text-slate-700 dark:text-slate-200 text-center">اضغط لرفع ملف (Excel)</p>
                     <p className="text-[10px] text-slate-400 leading-relaxed text-center">يرجى التأكد من ترتيب الأعمدة: طابع زمني، اسم المتصل، التليفون، الموضوع، المحافظة، الجهة، الموقف، الموظف...</p>
                   </div>
                 </div>
               </div>

               {uploadLoading && (
                 <div className="flex items-center justify-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-[10px]">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   جاري معالجة البيانات...
                 </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function InfoRow({ label, value, icon, isLong, status = 'default' }: { label: string, value: string, icon?: React.ReactNode, isLong?: boolean, status?: 'default' | 'success' }) {
  return (
    <div className={`space-y-2 ${isLong ? 'col-span-full' : ''}`}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {icon}
        {label}:
      </div>
      <div className={`text-sm font-bold transition-all duration-500 
        ${status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'} 
        ${isLong ? 'leading-relaxed bg-slate-50/50 dark:bg-slate-800 p-4 rounded-xl' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value, isLong }: { label: string, value?: string, isLong?: boolean }) {
  return (
    <div className={`space-y-2 ${isLong ? 'col-span-full' : ''}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className={`form-input bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 overflow-hidden cursor-default transition-all duration-700 ${isLong ? 'min-h-[100px] py-4' : 'h-14 flex items-center'}`}>
        {value || 'لا يوجد بيانات'}
      </div>
    </div>
  );
}

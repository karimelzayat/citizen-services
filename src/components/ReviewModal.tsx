import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X, CheckCircle2, XCircle, PhoneOff, Loader2, Save } from 'lucide-react';
import { Complaint } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComplaint: Complaint | null;
  reviewData: {
    notes: string;
    result: string;
  };
  setReviewData: (data: { notes: string; result: string }) => void;
  handleSaveReview: () => Promise<void>;
  isSavingReview: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  selectedComplaint,
  reviewData,
  setReviewData,
  handleSaveReview,
  isSavingReview
}: ReviewModalProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 overflow-hidden RTL" dir="rtl">
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
             initial={{ scale: 0.95, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             exit={{ scale: 0.95, opacity: 0, y: 20 }}
             className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-full max-h-[85vh]"
             onClick={e => e.stopPropagation()}
          >
             <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">مراجعة بيانات المكالمة</h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">ضمان جودة الخدمة المقدمة للمواطن</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-black">
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
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block text-right pr-1">تحديد موقف الشكوى (النهائي):</label>
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
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pr-1">ملاحظات المتابعة والمراجعة</label>
                     <textarea 
                       rows={5}
                       value={reviewData.notes}
                       onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                       className="form-input min-h-[120px] resize-none text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50" 
                       placeholder="اكتب أي ملاحظات إضافية ظهرت أثناء المتابعة..."
                     />
                  </div>
                </div>
             </div>

             <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <button 
                  onClick={handleSaveReview}
                  disabled={isSavingReview}
                  className="min-w-[240px] h-14 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {isSavingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ نتائج المراجعة
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
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

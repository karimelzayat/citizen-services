import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, User, X, Clock, Info, Phone, MapPin, Layers, AlertCircle, UserCheck, Save, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Complaint } from '../types';

interface ComplaintDetailsModalProps {
  selectedComplaint: Complaint | null;
  onClose: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editFormData: Partial<Complaint>;
  setEditFormData: (data: Partial<Complaint>) => void;
  handleUpdate: () => Promise<void>;
  loading: boolean;
  viewAllForDate: (date: string) => void;
}

export default function ComplaintDetailsModal({
  selectedComplaint,
  onClose,
  isEditing,
  setIsEditing,
  editFormData,
  setEditFormData,
  handleUpdate,
  loading,
  viewAllForDate
}: ComplaintDetailsModalProps) {
  if (!selectedComplaint) return null;

  return createPortal(
    <AnimatePresence>
      {selectedComplaint && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 overflow-hidden RTL" dir="rtl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all font-black">
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
                      value={editFormData.callDetails} 
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
                      {selectedComplaint.callDetails || (selectedComplaint as any).cabinetSubject || 'لا توجد تفاصيل إضافية مسجلة في هذا السجل'}
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
                    onClick={() => setIsEditing(true)}
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
        </div>
      )}
    </AnimatePresence>,
    document.body
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

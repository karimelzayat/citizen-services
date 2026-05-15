import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { GOVERNORATES_LIST, GOVERNORATES_ENTITIES, COMPLAINT_SUBJECTS, CABINET_CITIES_MAP } from '../constants';
import { addComplaint, checkAndAddFollowUp } from '../services/dataService';
import { User, MapPin, Phone, Building2, AlertCircle, PenTool, CheckCircle2, Timer, Save, Loader2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SearchableSelect from './ui/SearchableSelect';

export default function NewComplaintForm() {
  const [isCabinet, setIsCabinet] = useState(false);
  const [formData, setFormData] = useState<any>({
    callerName: '',
    phoneNumber: '',
    governorate: '',
    complaintEntity: '',
    complaintSubject: '',
    complaintStatus: 'تم الرد',
    callDetails: '',
    cabinetNationalId: '',
    cabinetCity: '',
    cabinetAddress: '',
    cabinetSubject: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const submissionData: any = {
        ...formData,
        isCabinetComplaint: isCabinet,
      };
      
      const docId = await addComplaint(submissionData);

      if (docId) {
        await checkAndAddFollowUp(docId, submissionData);
      }
      
      setShowSuccessModal(true);
      resetForm();
    } catch (err: any) {
      alert('خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      callerName: '',
      phoneNumber: '',
      governorate: '',
      complaintEntity: '',
      complaintSubject: '',
      complaintStatus: 'تم الرد',
      callDetails: '',
      cabinetNationalId: '',
      cabinetCity: '',
      cabinetAddress: '',
      cabinetSubject: '',
    });
    setIsCabinet(false);
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-black text-slate-800 dark:text-white">تسجيل مكالمة جديدة</h2>
           <p className="text-[10px] text-slate-500 font-medium">أكمل البيانات المطلوبة بدقة</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-400">
           <Info className="w-3.5 h-3.5" />
           <span className="text-[9px] font-bold uppercase tracking-wider">جميع الحقول مطلوبة لإتمام التسجيل</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-10 space-y-8 transition-all duration-700 border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 w-full max-w-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
          {/* Section: Basic Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400 font-black text-lg border-b border-slate-100 dark:border-white/5 pb-4">
               <User className="w-6 h-6" />
               <span>بيانات المتصل الأساسية</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-none block mb-1">الاسم بالكامل</label>
                <div className="relative">
                   <User className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                   <input type="text" name="callerName" required value={formData.callerName} onChange={handleInputChange} className="form-input pr-10 h-14" placeholder="أدخل اسم المتصل" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-none block mb-1">المحافظة</label>
                <SearchableSelect
                    options={GOVERNORATES_LIST}
                    value={formData.governorate}
                    onChange={(val) => setFormData(p => ({ ...p, governorate: val, cabinetCity: '' }))}
                    placeholder="اختر المحافظة..."
                    icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-none block mb-1">رقم الهاتف </label>
                <div className="relative">
                   <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                   <input type="tel" name="phoneNumber" required pattern="[0-9]{11}" placeholder="01xxxxxxxxx" value={formData.phoneNumber} onChange={handleInputChange} className="form-input pr-10 font-mono h-14" />
                </div>
              </div>
            </div>

            {/* Row 2: Entity and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700 dark:text-slate-300">جهة الشكوى</label>
                 <SearchableSelect
                    options={GOVERNORATES_ENTITIES}
                    value={formData.complaintEntity}
                    onChange={(val) => setFormData(p => ({ ...p, complaintEntity: val }))}
                    placeholder="اختر جهة الشكوى..."
                    icon={<Building2 className="w-4 h-4" />}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700 dark:text-slate-300">موضوع المكالمة</label>
                 <SearchableSelect
                    options={COMPLAINT_SUBJECTS}
                    value={formData.complaintSubject}
                    onChange={(val) => setFormData(p => ({ ...p, complaintSubject: val }))}
                    placeholder="اختر الموضوع..."
                    icon={<AlertCircle className="w-4 h-4" />}
                 />
              </div>
            </div>
          </div>

          {/* Section: Feature Toggles */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
                <button 
                  type="button" 
                  tabIndex={-1}
                  onClick={() => setIsCabinet(!isCabinet)}
                  className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-700 ${isCabinet ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-red-500/30'}`}
                >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg transition-all duration-500 ${isCabinet ? 'bg-white/20' : 'bg-red-500/10 text-red-500'}`}>
                      <PenTool className="w-5 h-5" />
                   </div>
                   <div className="text-right">
                      <div className={`font-black text-base ${isCabinet ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>منظومة شكاوى مجلس الوزراء</div>
                   </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500 ${isCabinet ? 'bg-white border-white' : 'border-slate-300 dark:border-slate-700'}`}>
                   {isCabinet && <div className="w-2 h-2 bg-red-600 rounded-full" />}
                </div>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isCabinet && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 bg-red-50 dark:bg-red-950/20 rounded-[32px] border-2 border-dashed border-red-200 dark:border-red-900/30 space-y-8">
                  <div className="flex items-center gap-3">
                     <PenTool className="w-6 h-6 text-red-600" />
                     <h3 className="text-xl font-black text-red-900 dark:text-red-200">بيانات منظومة الشكاوى الموحدة</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-red-900 dark:text-red-200">الرقم القومي</label>
                       <input type="text" name="cabinetNationalId" tabIndex={-1} maxLength={14} placeholder="14 رقم" value={formData.cabinetNationalId} onChange={handleInputChange} className="form-input border-red-100 dark:border-red-900/30 bg-white/80 dark:bg-slate-900/50 font-mono tracking-widest h-14" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-red-900 dark:text-red-200">المركز / المدينة</label>
                       <SearchableSelect
                          options={CABINET_CITIES_MAP[formData.governorate] || []}
                          value={formData.cabinetCity}
                          onChange={(val) => setFormData(p => ({ ...p, cabinetCity: val }))}
                          placeholder="اختر المركز..."
                          className="bg-white/80 dark:bg-slate-900/50 rounded-xl"
                          tabIndex={-1}
                       />
                    </div>
                    <div className="space-y-2 col-span-full">
                       <label className="text-sm font-bold text-red-900 dark:text-red-200">موضوع الشكوى (موجز)</label>
                       <input type="text" name="cabinetSubject" tabIndex={-1} value={formData.cabinetSubject} onChange={handleInputChange} className="form-input border-red-100 dark:border-red-900/30 bg-white/80 dark:bg-slate-900/50 h-14" placeholder="عنوان الشكوى في منظومة المجلس" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section: Status and Details */}
          <div className="space-y-8">
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 transition-colors duration-700">
              <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">حالة المكالمة الحالية</span>
              <div className="flex flex-wrap gap-4">
                <button 
                  type="button" 
                  tabIndex={-1}
                  onClick={() => setFormData({...formData, complaintStatus: 'تم الرد'})}
                  className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border-2 transition-all duration-500 shadow-sm ${formData.complaintStatus === 'تم الرد' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-black' : 'bg-white dark:bg-slate-900 border-transparent dark:border-white/5 text-slate-500'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-black text-sm">تم الرد</span>
                </button>
                <button 
                  type="button" 
                  tabIndex={-1}
                  onClick={() => setFormData({...formData, complaintStatus: 'جاري المتابعة'})}
                  className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border-2 transition-all duration-500 shadow-sm ${formData.complaintStatus === 'جاري المتابعة' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 font-black' : 'bg-white dark:bg-slate-900 border-transparent dark:border-white/5 text-slate-500'}`}
                >
                  <Timer className="w-4 h-4" />
                  <span className="font-black text-sm">جاري المتابعة</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                تفاصيل المكالمة
              </label>
              <textarea 
                name="callDetails" 
                rows={6} 
                required 
                value={formData.callDetails} 
                onChange={handleInputChange} 
                className="form-input min-h-[180px] resize-none p-6 text-lg leading-relaxed shadow-inner" 
                placeholder="اكتب هنا تفاصيل المكالمة بشكل واضح ومفصل..."
              ></textarea>
            </div>

            <div className="flex justify-center pt-2">
               <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary min-w-[320px] h-16 flex items-center justify-center gap-4 shadow-xl shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
               >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="font-black text-lg">جاري التسجيل...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      <span className="font-black text-lg">تسجيل المكالمة</span>
                    </>
                  )}
               </button>
            </div>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showSuccessModal && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] border border-slate-100 dark:border-white/5 p-12 max-w-sm w-full text-center space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">تم التسجيل بنجاح!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">تم حفظ بيانات المكالمة في سجلات المنظومة بنجاح.</p>
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95"
              >
                حسناً، استمرار
              </button>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}

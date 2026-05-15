import React, { useState } from 'react';
import { GOVERNORATES_LIST, GOVERNORATES_ENTITIES, COMPLAINT_SUBJECTS, CABINET_CITIES_MAP } from '../constants';
import { addComplaint, checkAndAddFollowUp } from '../services/dataService';
import { User, MapPin, Phone, Building2, AlertCircle, PenTool, CheckCircle2, Timer, Save, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SearchableSelect from './ui/SearchableSelect';

export default function NewComplaintForm() {
  const [isEmergency, setIsEmergency] = useState(false);
  const [isCabinet, setIsCabinet] = useState(false);
  const [hospitalType, setHospitalType] = useState('حكومي');
  const [formData, setFormData] = useState<any>({
    callerName: '',
    phoneNumber: '',
    governorate: '',
    complaintEntity: '',
    complaintSubject: '',
    complaintStatus: 'تم الرد',
    callDetails: '',
    // Cabinet fields
    cabinetNationalId: '',
    cabinetCity: '',
    cabinetAddress: '',
    cabinetSubject: '',
    // Emergency fields
    responsibleEntity: '',
    hospitalName: '',
    emergencyGovernorate: '',
    hospitalAddress: '',
    diagnosis: '',
    otherDiagnosis: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const submissionData: any = {
        ...formData,
        isEmergency,
        isCabinetComplaint: isCabinet,
      };
      
      if (isEmergency) {
        submissionData.hospitalType = hospitalType;
      }
      
      // Save to main complaints collection
      const docId = await addComplaint(submissionData);

      // Trigger automatic follow-up check (5% selection)
      if (docId) {
        await checkAndAddFollowUp(docId, submissionData);
      }
      
      setSuccess(true);
      // Auto-reset and scroll to top
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      responsibleEntity: '',
      hospitalName: '',
      emergencyGovernorate: '',
      hospitalAddress: '',
      diagnosis: '',
      otherDiagnosis: ''
    });
    setIsCabinet(false);
    setIsEmergency(false);
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
                    required={!isEmergency}
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
                    required={!isEmergency}
                    icon={<AlertCircle className="w-4 h-4" />}
                 />
              </div>
            </div>
          </div>

          {/* Section: Feature Toggles (Cabinet Only now) */}
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

            {/* Action Button moved right under details */}
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
    </div>
  );
}

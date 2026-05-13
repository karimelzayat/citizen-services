import React, { useState } from 'react';
import { GOVERNORATES_LIST, GOVERNORATES_ENTITIES, COMPLAINT_SUBJECTS, CABINET_CITIES_MAP } from '../constants';
import { addComplaint } from '../services/dataService';
import { User, MapPin, Phone, Building2, AlertCircle, PenTool, CheckCircle2, Timer, Save, Loader2, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [success, setSuccess] = useState(false);
  const [lastComplaintId, setLastComplaintId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const submissionData: any = {
        ...formData,
        isEmergency,
        isCabinetComplaint: isCabinet
      };
      
      if (isEmergency) {
        submissionData.hospitalType = hospitalType;
      }
      
      const id = await addComplaint(submissionData);
      setLastComplaintId(id || '');
      setSuccess(true);
      // Form values are kept until reset manually or by starting new
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
    setSuccess(false);
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center space-y-6"
      >
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">تم تسجيل المكالمة بنجاح!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">تم حفظ كافة البيانات في قاعدة بيانات المركز بنجاح.</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center pt-6">
          <button 
            onClick={resetForm}
            className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            تسجيل مكالمة جديدة
          </button>
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('switchTab', { detail: 'search' }));
            }}
            className="px-8 py-3 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 font-black border border-blue-100 dark:border-white/5 flex items-center gap-2 shadow-sm"
          >
            <Search className="w-4 h-4" />
            عرض مكالمات اليوم
          </button>
        </div>
      </motion.div>
    );
  }

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
        <div className="glass-card p-10 space-y-10 transition-all duration-700 border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 w-full max-w-4xl shadow-2xl shadow-slate-200/40 dark:shadow-none">
          {/* Section: Basic Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400 font-black text-base border-b border-slate-100 dark:border-white/5 pb-4">
               <User className="w-6 h-6" />
               <span>بيانات المتصل الأساسية</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">الاسم بالكامل</label>
                <div className="relative">
                   <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input type="text" name="callerName" required value={formData.callerName} onChange={handleInputChange} className="form-input h-16 pr-14 text-base shadow-sm focus:shadow-lg focus:shadow-blue-500/5 transition-all" placeholder="أدخل اسم المتصل" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">رقم الهاتف المميز</label>
                <div className="relative">
                   <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input type="tel" name="phoneNumber" required pattern="[0-9]{11}" placeholder="01xxxxxxxxx" value={formData.phoneNumber} onChange={handleInputChange} className="form-input h-16 pr-14 font-mono text-base shadow-sm focus:shadow-lg focus:shadow-blue-500/5 transition-all" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">المحافظة</label>
                <div className="relative">
                   <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                   <select name="governorate" required value={formData.governorate} onChange={handleInputChange} className="form-input h-16 pr-14 appearance-none text-base shadow-sm focus:shadow-lg focus:shadow-blue-500/5 transition-all">
                    <option value="">اختر المحافظة...</option>
                    {GOVERNORATES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Feature Toggles */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setIsEmergency(!isEmergency)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-700 ${isEmergency ? 'bg-orange-500 border-white text-white shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-orange-500/30'}`}
              >
                <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded-lg transition-all duration-500 ${isEmergency ? 'bg-white/20' : 'bg-orange-500/10 text-orange-500'}`}>
                      <AlertCircle className="w-4 h-4" />
                   </div>
                   <div className="text-right">
                      <div className={`font-black text-xs ${isEmergency ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>طوارئ 48 ساعة</div>
                   </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 ${isEmergency ? 'bg-white border-white' : 'border-slate-300 dark:border-slate-700'}`}>
                   {isEmergency && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
                </div>
              </button>

              <button 
                type="button" 
                onClick={() => setIsCabinet(!isCabinet)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-700 ${isCabinet ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-red-500/30'}`}
              >
                <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded-lg transition-all duration-500 ${isCabinet ? 'bg-white/20' : 'bg-red-500/10 text-red-500'}`}>
                      <PenTool className="w-4 h-4" />
                   </div>
                   <div className="text-right">
                      <div className={`font-black text-xs ${isCabinet ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>مجلس الوزراء</div>
                   </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 ${isCabinet ? 'bg-white border-white' : 'border-slate-300 dark:border-slate-700'}`}>
                   {isCabinet && <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />}
                </div>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isEmergency && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 bg-orange-50 dark:bg-orange-950/20 rounded-[32px] border-2 border-dashed border-orange-200 dark:border-orange-900/30 space-y-8">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="w-6 h-6 text-orange-600" />
                     <h3 className="text-xl font-black text-orange-900 dark:text-orange-200">تفاصيل حالة الطوارئ</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4 col-span-full bg-white/50 dark:bg-black/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">نوع المنشأة الصحية</span>
                      <div className="flex flex-wrap gap-4">
                        {['حكومي', 'خاص', 'استفسارات'].map(type => (
                          <label key={type} className={`flex-1 min-w-[120px] flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer ${hospitalType === type ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-white/5 text-slate-500'}`}>
                            <input type="radio" className="hidden" checked={hospitalType === type} onChange={() => setHospitalType(type)} />
                            <span className="font-bold">{type}</span>
                            {hospitalType === type && <CheckCircle2 className="w-4 h-4" />}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-orange-900 dark:text-orange-200">الجهة المسئولة</label>
                       <select name="responsibleEntity" value={formData.responsibleEntity} onChange={handleInputChange} className="form-input border-orange-100 dark:border-orange-900/30 bg-white/80 dark:bg-slate-900/50">
                          <option value="">-- اختر --</option>
                          <option>أمانة المراكز</option>
                          <option>التأمين الصحي</option>
                          <option>الجامعات</option>
                          <option>المؤسسة العلاجية</option>
                          <option>الهيئة العامة للمستشفيات والمعاهد</option>
                          <option>المديريات</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-orange-900 dark:text-orange-200">اسم المستشفى</label>
                       <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} className="form-input border-orange-100 dark:border-orange-900/30 bg-white/80 dark:bg-slate-900/50" placeholder="الاسم بالكامل" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-orange-900 dark:text-orange-200">التشخيص الحالي</label>
                       <select name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} className="form-input border-orange-100 dark:border-orange-900/30 bg-white/80 dark:bg-slate-900/50">
                          <option value="">اختر...</option>
                          <option>حضانات</option>
                          <option>رعايات</option>
                          <option>أمانة المراكز</option>
                          <option>أخرى</option>
                       </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

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
                       <input type="text" name="cabinetNationalId" maxLength={14} placeholder="14 رقم" value={formData.cabinetNationalId} onChange={handleInputChange} className="form-input border-red-100 dark:border-red-900/30 bg-white/80 dark:bg-slate-900/50 font-mono tracking-widest" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-red-900 dark:text-red-200">المركز / المدينة</label>
                       <select name="cabinetCity" value={formData.cabinetCity} onChange={handleInputChange} className="form-input border-red-100 dark:border-red-900/30 bg-white/80 dark:bg-slate-900/50">
                        <option value="">اختر المركز...</option>
                        {(CABINET_CITIES_MAP[formData.governorate] || []).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 col-span-full">
                       <label className="text-sm font-bold text-red-900 dark:text-red-200">موضوع الشكوى (موجز)</label>
                       <input type="text" name="cabinetSubject" value={formData.cabinetSubject} onChange={handleInputChange} className="form-input border-red-100 dark:border-red-900/30 bg-white/80 dark:bg-slate-900/50" placeholder="عنوان الشكوى في منظومة المجلس" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section: Complaint Details */}
          {!isEmergency && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black text-sm border-b border-slate-100 dark:border-white/5 pb-3">
                 <Building2 className="w-5 h-5" />
                 <span>تفاصيل المكالمة والجهة</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300">جهة الشكوى</label>
                   <select name="complaintEntity" required={!isEmergency} value={formData.complaintEntity} onChange={handleInputChange} className="form-input h-14 text-sm">
                    <option value="">اختر جهة الشكوى...</option>
                    {GOVERNORATES_ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300">موضوع المكالمة</label>
                   <select name="complaintSubject" required={!isEmergency} value={formData.complaintSubject} onChange={handleInputChange} className="form-input h-14 text-sm">
                    <option value="">اختر الموضوع...</option>
                    {COMPLAINT_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* New Message / Details Section */}
          <div className="space-y-6">
             {!isEmergency && (
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors duration-700">
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">حالة المكالمة الحالية</span>
                 <div className="flex flex-wrap gap-4">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, complaintStatus: 'تم الرد'})}
                      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-500 shadow-sm ${formData.complaintStatus === 'تم الرد' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 border-transparent dark:border-white/5 text-slate-500'}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-black">تم الرد</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, complaintStatus: 'جاري المتابعة'})}
                      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-500 shadow-sm ${formData.complaintStatus === 'جاري المتابعة' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-slate-900 border-transparent dark:border-white/5 text-slate-500'}`}
                    >
                      <Timer className="w-5 h-5" />
                      <span className="font-black">جاري المتابعة</span>
                    </button>
                 </div>
               </div>
             )}

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">تفاصيل المكالمة</label>
                <textarea 
                  name="callDetails" 
                  rows={5} 
                  required={!isEmergency} 
                  value={formData.callDetails} 
                  onChange={handleInputChange} 
                  className="form-input min-h-[160px] resize-none pt-4 text-sm" 
                  placeholder="اكتب هنا تفاصيل المكالمة بشكل واضح ومفصل لسهولة المراجعة لاحقاً..."
                ></textarea>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4 py-4">
           <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary min-w-[240px] h-16 flex items-center justify-center gap-3 text-lg"
           >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span>حفظ وإرسال المكالمة</span>
                </>
              )}
           </button>
           <button type="button" onClick={resetForm} className="px-8 h-16 rounded-[20px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">إلغاء</button>
        </div>
      </form>
    </div>
  );
}

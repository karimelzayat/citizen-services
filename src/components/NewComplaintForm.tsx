import React, { useState } from 'react';
import { GOVERNORATES_LIST, GOVERNORATES_ENTITIES, COMPLAINT_SUBJECTS, CABINET_CITIES_MAP } from '../constants';
import { addComplaint } from '../services/dataService';
import { User, MapPin, Phone, Building2, AlertCircle, PenTool, CheckCircle2, Timer, Save, Loader2, Info } from 'lucide-react';
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
      
      await addComplaint(submissionData);
      alert('تم تسجيل البيانات بنجاح!');
      // Reset form instead of reload
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
    } catch (err: any) {
      alert('خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
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

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="glass-card p-5 space-y-5 transition-all duration-700 border-[#0023ff]">
          {/* Section: Basic Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs border-b border-slate-100 dark:border-white/5 pb-2 transition-colors duration-500">
               <User className="w-3.5 h-3.5" />
               <span>بيانات المتصل</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">الاسم</label>
                <div className="relative">
                   <User className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                   <input type="text" name="callerName" required value={formData.callerName} onChange={handleInputChange} className="form-input h-9 pr-9 text-xs" placeholder="الاسم الكامل" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                <div className="relative">
                   <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                   <input type="tel" name="phoneNumber" required pattern="[0-9]{11}" placeholder="01xxxxxxxxx" value={formData.phoneNumber} onChange={handleInputChange} className="form-input h-9 pr-9 font-mono text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">المحافظة</label>
                <div className="relative">
                   <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                   <select name="governorate" required value={formData.governorate} onChange={handleInputChange} className="form-input h-9 pr-9 appearance-none text-xs">
                    <option value="">اختر...</option>
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
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-700 ${isEmergency ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-orange-500/30'}`}
              >
                <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded-lg transition-all duration-500 ${isEmergency ? 'bg-white/20' : 'bg-orange-500/10 text-orange-500'}`}>
                      <AlertCircle className="w-4 h-4" />
                   </div>
                   <div className="text-right">
                      <div className="font-black text-xs">طوارئ 48 ساعة</div>
                   </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 ${isEmergency ? 'bg-white border-white' : 'border-slate-300 dark:border-slate-700'}`}>
                   {isEmergency && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
                </div>
              </button>

              <button 
                type="button" 
                onClick={() => setIsCabinet(!isCabinet)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-700 ${isCabinet ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-red-500/30'}`}
              >
                <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded-lg transition-all duration-500 ${isCabinet ? 'bg-white/20' : 'bg-red-500/10 text-red-500'}`}>
                      <PenTool className="w-4 h-4" />
                   </div>
                   <div className="text-right">
                      <div className="font-black text-xs">مجلس الوزراء</div>
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
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold border-b border-slate-100 dark:border-white/5 pb-4">
                 <Building2 className="w-5 h-5" />
                 <span>تفاصيل المكالمة والجهة</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">جهة الشكوى</label>
                   <select name="complaintEntity" required={!isEmergency} value={formData.complaintEntity} onChange={handleInputChange} className="form-input">
                    <option value="">اختر جهة الشكوى...</option>
                    {GOVERNORATES_ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">موضوع المكالمة</label>
                   <select name="complaintSubject" required={!isEmergency} value={formData.complaintSubject} onChange={handleInputChange} className="form-input">
                    <option value="">اختر الموضوع...</option>
                    {COMPLAINT_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* New Message / Details Section */}
          <div className="space-y-4">
             {!isEmergency && (
               <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">حالة المكالمة عند الإرسال</span>
                 <div className="flex flex-wrap gap-3">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, complaintStatus: 'تم الرد'})}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-500 ${formData.complaintStatus === 'تم الرد' ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-white/5 text-slate-500'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-black text-xs">تم الرد</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, complaintStatus: 'جاري المتابعة'})}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-500 ${formData.complaintStatus === 'جاري المتابعة' ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-white/5 text-slate-500'}`}
                    >
                      <Timer className="w-4 h-4" />
                      <span className="font-black text-xs">جاري المتابعة</span>
                    </button>
                 </div>
               </div>
             )}

             <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">التفاصيل</label>
                <textarea 
                  name="callDetails" 
                  rows={4} 
                  required={!isEmergency} 
                  value={formData.callDetails} 
                  onChange={handleInputChange} 
                  className="form-input min-h-[140px] resize-none pt-3 text-xs" 
                  placeholder="اكتب هنا تفاصيل المكالمة بشكل واضح ومفصل..."
                ></textarea>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
           <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2 text-sm h-12"
           >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التسجيل...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ وإرسال</span>
                </>
              )}
           </button>
        </div>
      </form>
    </div>
  );
}

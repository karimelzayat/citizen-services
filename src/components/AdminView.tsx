import React, { useState } from 'react';
import { addAdminComplaint } from '../services/dataService';
import { GOVERNORATES_LIST } from '../constants';
import { LayoutGrid, AlertTriangle, FileX, FileText, MapPin, Hash, CheckCircle2, Clock, Save, Search, Calendar, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SearchableSelect from './ui/SearchableSelect';
import { toast } from '../lib/toast';


import SearchComplaints from './SearchComplaints';
import Reports from './Reports';
import SettingsView from './SettingsView';
import DirectorAssignments from './DirectorAssignments';
import Schedules from './Schedules';
import { UserPermissions } from '../types';

export default function AdminView({ activeSubTab, permissions }: { activeSubTab: string, permissions: UserPermissions | null }) {
  const allWorkTypes = [
    { id: 'الجاري', icon: LayoutGrid, color: 'blue', label: 'الجاري', show: permissions?.canRegisterOngoing },
    { id: 'توجية خطأ', icon: AlertTriangle, color: 'amber', label: 'توجية خطأ', show: permissions?.canRegisterWrongDirection },
    { id: 'شكاوي غير مسجلة', icon: FileX, color: 'rose', label: 'شكاوي غير مسجلة', show: permissions?.canRegisterUnregistered }
  ];

  const workTypes = allWorkTypes.filter(t => t.show);
  
  // Use the first available work type as initial state
  const [workType, setWorkType] = useState(() => workTypes[0]?.id || 'الجاري');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    complaintNo: '',
    governorate: '',
    status: 'تم الرد',
    notes: '',
    registrant: ''
  });

  if (activeSubTab === 'search' || activeSubTab === 'adminSearch') return <SearchComplaints permissions={permissions} />;
  if (activeSubTab === 'reports' || activeSubTab === 'reportsTab') return <Reports permissions={permissions} />;
  if (activeSubTab === 'directorTab') return <DirectorAssignments permissions={permissions} />;
  if (activeSubTab === 'schedulesTab') return <Schedules permissions={permissions} />;
  if (activeSubTab === 'userManagement') return <SettingsView />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addAdminComplaint({ 
        ...formData, 
        workType: workType as any,
        employeeName: permissions?.employeeData?.name || ''
      });
      
      // Auto-reset and scroll to top
      setFormData({
        complaintNo: '',
        governorate: '',
        status: 'تم الرد',
        notes: '',
        registrant: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('تم حفظ البيانات بنجاح');
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    } finally {

      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {activeSubTab === 'adminWork' || activeSubTab === 'register' ? (
        <div className="space-y-6">
           {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">تسجيل عمل الإدارة</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium">توثيق العمل اليومي ومتابعة الشكاوى الجارية</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 rounded-[24px] transition-all duration-700">
              <div className="space-y-6">
                {/* Work Type Selection - Only show if more than 1 type is available */}
                {workTypes.length > 1 && (
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Info className="w-3.5 h-3.5 text-blue-600" />
                       تصنيف العمل
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {workTypes.map(type => {
                        const Icon = type.icon;
                        const isActive = workType === type.id;
                        return (
                          <button 
                            key={type.id}
                            type="button"
                            onClick={() => setWorkType(type.id)}
                            className={`flex items-center gap-4 p-4 rounded-[16px] border-2 transition-all duration-700 text-right ${
                              isActive 
                                ? `bg-${type.color}-500 border-${type.color}-500 text-white shadow-xl shadow-${type.color}-500/20 font-black`
                                : 'bg-slate-50 dark:bg-slate-800/40 border-transparent dark:border-white/5 text-slate-500 hover:border-slate-300 dark:hover:border-white/10 font-bold'
                            }`}
                          >
                            <div className={`p-3 rounded-xl transition-all duration-500 shadow-sm ${isActive ? 'bg-white/20' : `bg-white dark:bg-slate-900 text-${type.color}-600 dark:text-${type.color}-400`}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-base">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-widest leading-none">
                       <Hash className="w-4 h-4 text-blue-600" />
                       رقم الشكوى بالنظام
                    </label>
                    <input 
                      type="text" 
                      value={formData.complaintNo} 
                      onChange={(e) => setFormData({...formData, complaintNo: e.target.value})} 
                      required 
                      className="form-input font-mono tracking-widest" 
                      placeholder="0000-0000"
                    />
                  </div>

                  {workType === 'الجاري' && (
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-widest leading-none">
                         <MapPin className="w-4 h-4 text-blue-600" />
                         المحافظة
                      </label>
                      <SearchableSelect
                        options={GOVERNORATES_LIST}
                        value={formData.governorate}
                        onChange={(val) => setFormData({...formData, governorate: val})}
                        placeholder="اختر المحافظة..."
                        required
                      />
                    </div>
                  )}

                  {workType === 'توجية خطأ' && (
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-widest leading-none">
                         <FileText className="w-4 h-4 text-amber-600" />
                         مسجل الشكوى الحالي
                      </label>
                      <input 
                        type="text" 
                        value={formData.registrant} 
                        onChange={(e) => setFormData({...formData, registrant: e.target.value})} 
                        required 
                        className="form-input"
                        placeholder="اسم الموظف"
                      />
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {workType === 'الجاري' && (
                    <motion.div 
                      key="status-section"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-6 pt-4 border-t border-slate-100 dark:border-white/5"
                    >
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">موقف الشكوى الحالي</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, status: 'تم الرد'})}
                              className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-500 shadow-sm ${formData.status === 'تم الرد' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-black' : 'bg-slate-50 dark:bg-slate-900 border-transparent dark:border-white/5 text-slate-500 font-bold'}`}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              <span>تم الرد</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, status: 'جاري المتابعة'})}
                              className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-500 shadow-sm ${formData.status === 'جاري المتابعة' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 font-black' : 'bg-slate-50 dark:bg-slate-900 border-transparent dark:border-white/5 text-slate-500 font-bold'}`}
                            >
                             <Clock className="w-5 h-5" />
                             <span>جاري المتابعة / استعجال</span>
                           </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ملاحظات إدراية</label>
                        <textarea 
                          rows={4} 
                          value={formData.notes} 
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="form-input min-h-[120px] resize-none bg-slate-50 dark:bg-slate-800 border-transparent transition-all text-sm"
                          placeholder="اكتب أي ملاحظات أو تفاصيل إضافية هنا..."
                        ></textarea>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-center py-6">
               <button 
                  type="submit" 
                  disabled={isSubmitting || workTypes.length === 0}
                  className="btn-primary min-w-[280px] h-14 flex items-center justify-center gap-3 shadow-blue-500/30"
               >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>حفظ البيانات</span>
                    </>
                  )}
               </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
           <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">سجل شكاوى الإدارة</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">مراجعة والبحث في الشكاوى المسجلة بنظام الإدارة</p>
            </div>
          </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none p-8 rounded-[32px] transition-all duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-blue-600" />
                       الفترة الزمنية
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 'today', label: 'اليوم' },
                        { value: 'month', label: 'هذا الشهر' },
                        { value: 'custom', label: 'فترة مخصصة...' }
                      ]}
                      value="today"
                      onChange={() => {}}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">من تاريخ</label>
                    <input type="date" className="form-input bg-slate-50 dark:bg-slate-800 border-transparent transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">إلى تاريخ</label>
                    <input type="date" className="form-input bg-slate-50 dark:bg-slate-800 border-transparent transition-all" />
                 </div>
              </div>
              <div className="mt-8">
                 <button className="btn-primary w-full md:w-auto md:px-12 h-14 flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    <span>البحث في السجلات</span>
                 </button>
              </div>
           </div>

           <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/5 space-y-4 transition-all duration-700">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center transition-colors duration-500">
                 <FileText className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              </div>
              <div className="text-center">
                 <p className="text-xl text-slate-400 font-black tracking-tight">لا توجد شكاوى مسجلة للعرض</p>
                 <p className="text-slate-400 text-sm">حدد الفترة الزمنية واضغط على زر البحث</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

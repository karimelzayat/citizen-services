import React, { useState } from 'react';
import { addAdminComplaint } from '../services/dataService';
import { GOVERNORATES_LIST } from '../constants';
import { LayoutGrid, AlertTriangle, FileX, FileText, MapPin, Hash, CheckCircle2, Clock, Save, Search, Calendar, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import SearchComplaints from './SearchComplaints';
import Reports from './Reports';

export default function AdminView({ activeSubTab }: { activeSubTab: string }) {
  const [workType, setWorkType] = useState('الجاري');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    complaintNo: '',
    governorate: '',
    status: 'تم الرد',
    notes: '',
    registrant: ''
  });

  if (activeSubTab === 'search') return <SearchComplaints />;
  if (activeSubTab === 'reports') return <Reports />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addAdminComplaint({ ...formData, workType: workType as any });
      alert('تم الحفظ بنجاح!');
      setFormData({
        complaintNo: '',
        governorate: '',
        status: 'تم الرد',
        notes: '',
        registrant: ''
      });
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const workTypes = [
    { id: 'الجاري', icon: LayoutGrid, color: 'blue', label: 'الجاري' },
    { id: 'توجية خطأ', icon: AlertTriangle, color: 'amber', label: 'توجية خطأ' },
    { id: 'شكاوي غير مسجلة', icon: FileX, color: 'rose', label: 'شكاوي غير مسجلة' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {activeSubTab === 'register' ? (
        <div className="space-y-8">
           {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">تسجيل عمل الإدارة</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">توثيق العمل اليومي ومتابعة الشكاوى الجارية</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-8">
              <div className="space-y-8">
                {/* Work Type Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                     <Info className="w-4 h-4 text-blue-600" />
                     نوع العمل المطلوب تسجيله
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
                          className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-700 text-right ${
                            isActive 
                              ? `bg-${type.color}-500 border-${type.color}-500 text-white shadow-xl shadow-${type.color}-500/20`
                              : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                          }`}
                        >
                          <div className={`p-3 rounded-2xl transition-all duration-500 ${isActive ? 'bg-white/20' : `bg-${type.color}-500/10 text-${type.color}-500 dark:text-${type.color}-400`}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="font-black text-lg">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                       <Hash className="w-4 h-4 text-blue-600" />
                       رقم الشكوى
                    </label>
                    <input 
                      type="text" 
                      value={formData.complaintNo} 
                      onChange={(e) => setFormData({...formData, complaintNo: e.target.value})} 
                      required 
                      className="form-input font-mono text-xl tracking-widest uppercase" 
                      placeholder="XXXX-XXXX"
                    />
                  </div>

                  {workType === 'الجاري' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-blue-600" />
                         المحافظة
                      </label>
                      <select 
                        value={formData.governorate} 
                        onChange={(e) => setFormData({...formData, governorate: e.target.value})} 
                        required 
                        className="form-input appearance-none"
                      >
                        <option value="">اختر المحافظة...</option>
                        {GOVERNORATES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}

                  {workType === 'توجية خطأ' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
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
                             className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-500 ${formData.status === 'تم الرد' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-black' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-500 font-bold'}`}
                           >
                             <CheckCircle2 className="w-5 h-5" />
                             <span>تم الرد</span>
                           </button>
                           <button 
                             type="button" 
                             onClick={() => setFormData({...formData, status: 'جاري المتابعة'})}
                             className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-500 ${formData.status === 'جاري المتابعة' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 font-black' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-500 font-bold'}`}
                           >
                             <Clock className="w-5 h-5" />
                             <span>جاري المتابعة / استعجال</span>
                           </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ملاحظات إضافية</label>
                        <textarea 
                          rows={4} 
                          value={formData.notes} 
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="form-input min-h-[120px] resize-none"
                          placeholder="اكتب أي ملاحظات أو تفاصيل إضافية هنا..."
                        ></textarea>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary w-full md:w-auto md:min-w-[240px] h-16 flex items-center justify-center gap-3 text-lg"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              <span>حفظ البيانات الآن</span>
            </button>
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

           <div className="glass-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-blue-600" />
                       الفترة الزمنية
                    </label>
                    <select className="form-input appearance-none">
                      <option value="today">اليوم</option>
                      <option value="month" selected>هذا الشهر</option>
                      <option value="custom">فترة مخصصة...</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">من تاريخ</label>
                    <input type="date" className="form-input" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">إلى تاريخ</label>
                    <input type="date" className="form-input" />
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

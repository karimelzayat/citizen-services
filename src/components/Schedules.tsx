import React, { useState, useEffect, useMemo } from 'react';
import { listenToSchedules, bulkUploadSchedules, getUserPermissions, deleteSchedulesByMonth } from '../services/dataService';
import { auth } from '../lib/firebase';
import { 
  Upload, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileSpreadsheet,
  Info,
  XCircle,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Schedules() {
  const currentMonth = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [dbSchedules, setDbSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser?.email) {
        const perms = await getUserPermissions(auth.currentUser.email);
        setIsAdmin(perms.role === 'Admin');
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToSchedules(selectedMonth, (data) => {
      setDbSchedules(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedMonth]);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    // Generate months from 2024 to 2026 to cover user data
    const start = new Date(2024, 0, 1);
    const end = new Date(2026, 11, 1);
    
    let current = new Date(start);
    while (current <= end) {
      options.push(current.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }));
      current.setMonth(current.getMonth() + 1);
    }
    return options.reverse(); // Show newest first
  }, []);

  const normalizeString = (str: string) => {
    if (!str) return '';
    return str
      .replace(/[أإآ]/g, 'ا')
      .replace(/[١٢٣٤٥٦٧٨٩٠]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .trim();
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) return;
    setIsUploading(true);
    try {
      const lines = bulkData.trim().split('\n');
      const schedules = lines.map(line => {
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length < 3) return null;
        
        const is12Cols = parts.length >= 12;
        const monthYear = is12Cols ? parts[2] : selectedMonth;
        const offset = is12Cols ? 1 : 0;

        return {
          date: parts[0],
          day: parts[1],
          monthYear,
          shift24: parts[2 + offset] || '',
          shift36: parts[3 + offset] || '',
          holidayMorning: parts[4 + offset] || '',
          holidayNoon: parts[5 + offset] || '',
          cabinet1: parts[6 + offset] || '',
          cabinet2: parts[7 + offset] || '',
          cabinet3: parts[8 + offset] || '',
          careMorning: parts[9 + offset] || '',
          careNight: parts[10 + offset] || ''
        };
      }).filter(Boolean);

      await bulkUploadSchedules(schedules as any[]);
      alert(`تم رفع ${schedules.length} سجل بنجاح`);
      setShowUploadModal(false);
      setBulkData('');
    } catch (e) {
      alert('خطأ أثناء الرفع');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearMonth = async () => {
    if (!window.confirm(`هل أنت متأكد من مسح كافة بيانات شهر ${selectedMonth}؟`)) return;
    setIsDeleting(true);
    try {
      await deleteSchedulesByMonth(selectedMonth);
      alert('تم مسح بيانات الشهر بنجاح');
    } catch (e) {
      alert('خطأ أثناء المسح');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="tab-content block pb-10 RTL">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-4 justify-end">
            <Calendar className="w-8 h-8 text-blue-600" />
            جداول الشفتات وتوزيع المهام
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">متابعة توزيع الموظفين على مدار اليوم وتوزيع شفتات مجلس الوزراء والرعاية</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            {dbSchedules.length > 0 && (
              <button 
                onClick={handleClearMonth}
                disabled={isDeleting}
                className="px-6 py-4 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-[24px] font-black hover:bg-rose-100 transition-all flex items-center gap-2 border border-rose-100 dark:border-rose-500/20"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                مسح بيانات الشهر
              </button>
            )}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
            >
              <Upload className="w-5 h-5" />
              رفع جدول الموظفين
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none p-8 mb-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-2 h-full bg-blue-600"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-blue-600 opacity-0 group-hover:opacity-[0.02] transform scale-x-0 group-hover:scale-x-100 origin-right transition-all duration-700"></div>
        
        <div className="relative z-10">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">الفترة الزمنية المختارة:</label>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
             </div>
             <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
               {selectedMonth}
             </div>
          </div>
        </div>
 
        <div className="relative z-10 mt-6 md:mt-0">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-input min-w-[300px] text-center bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all font-black text-blue-600 rounded-2xl py-4"
          >
            {monthOptions.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/20 dark:shadow-none rounded-[40px] overflow-hidden">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-6">
             <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-black animate-pulse">جاري جلب بيانات الجدول...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                  <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">التاريخ</th>
                  <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">اليوم</th>
                  <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">شفت 24 ساعة</th>
                  <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">شفت 36 ساعة</th>
                  <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">عطلة (9:30-12)</th>
                  <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">عطلة (12-2:30)</th>
                  <th className="p-6 text-right text-[10px] font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">مجلس الوزراء (1)</th>
                  <th className="p-6 text-right text-[10px] font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">مجلس الوزراء (2)</th>
                  <th className="p-6 text-right text-[10px] font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">مجلس الوزراء (3)</th>
                  <th className="p-6 text-right text-[10px] font-black text-amber-500 uppercase tracking-widest whitespace-nowrap">الرعاية (صباحاً)</th>
                  <th className="p-6 text-right text-[10px] font-black text-amber-500 uppercase tracking-widest whitespace-nowrap">الرعاية (ليلاً)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {dbSchedules.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="p-6 text-xs font-mono text-slate-400 whitespace-nowrap">{row.date}</td>
                    <td className="p-6 text-[13px] font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">{row.day}</td>
                    <td className="p-6 text-[11px] text-slate-700 dark:text-slate-300 font-bold group-hover:text-blue-600 transition-colors">{row.shift24 || '-'}</td>
                    <td className="p-6 text-[11px] text-slate-700 dark:text-slate-300 font-bold">{row.shift36 || '-'}</td>
                    <td className="p-6 text-[11px] text-slate-700 dark:text-slate-300 font-bold">{row.holidayMorning || '-'}</td>
                    <td className="p-6 text-[11px] text-slate-700 dark:text-slate-300 font-bold">{row.holidayNoon || '-'}</td>
                    <td className="p-6 text-[11px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50/30 dark:bg-emerald-900/10">{row.cabinet1 || '-'}</td>
                    <td className="p-6 text-[11px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50/30 dark:bg-emerald-900/10">{row.cabinet2 || '-'}</td>
                    <td className="p-6 text-[11px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50/30 dark:bg-emerald-900/10">{row.cabinet3 || '-'}</td>
                    <td className="p-6 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-900/10">{row.careMorning || '-'}</td>
                    <td className="p-6 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-900/10">{row.careNight || '-'}</td>
                  </tr>
                ))}
                {dbSchedules.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-32 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-[32px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2">
                             <AlertCircle className="w-10 h-10 text-slate-300" />
                          </div>
                          <p className="text-xl font-black text-slate-300">لا توجد بيانات لهذا الشهر</p>
                          {isAdmin && <p className="text-sm text-slate-400 font-medium">اضغط على زر الرفع لإضافة جدول جديد</p>}
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm RTL">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                    رفع الجدول الشهري
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">انسخ البيانات من Excel والصقها هنا مباشرة لشهر {selectedMonth}</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:rotate-90 transition-all text-slate-500"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-[32px] flex items-start gap-4">
                 <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                 <div className="space-y-2">
                    <p className="text-sm font-black text-blue-900 dark:text-blue-100">تعليمات التنسيق (12 عمود):</p>
                    <p className="text-xs text-blue-700/80 dark:text-blue-300 font-medium leading-relaxed italic">
                      التاريخ | اليوم | الشهر والسنة | شفت 24 | شفت 36 | عطلة م | عطلة ظ | مجلس1 | مجلس2 | مجلس3 | رعاية م | رعاية ل
                    </p>
                 </div>
              </div>

              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder="الصق البيانات هنا..."
                className="w-full h-[400px] bg-slate-50 dark:bg-slate-850 p-6 rounded-[32px] border-2 border-transparent focus:border-blue-600 outline-none font-mono text-sm dark:text-white transition-all resize-none"
              />

              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={handleBulkUpload}
                  disabled={isUploading || !bulkData.trim()}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                  معالجة ورفع البيانات {isUploading ? '...' : ''}
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[24px] font-black hover:bg-slate-200 dark:hover:bg-slate-750 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { listenToSchedules, bulkUploadSchedules, getUserPermissions, deleteSchedulesByMonth, getAvailableScheduleMonths } from '../services/dataService';
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
  Trash2,
  ChevronDown,
  User,
  X,
  ArrowRightLeft,
  RefreshCw,
  ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from '../lib/toast';


import { UserPermissions } from '../types';

export default function Schedules({ permissions }: { permissions: UserPermissions | null }) {
  const currentMonth = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [dbSchedules, setDbSchedules] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState<{ row: any, field: string, employee: string, fullValue: string } | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [pickingSelection, setPickingSelection] = useState<{ row: any, field: string, names: string[], fullValue: string } | null>(null);

  const parseArabicMonth = (str: string) => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const normalizedStr = str.replace(/[أإآ]/g, 'ا').replace(/[ى]/g, 'ي');
    const parts = normalizedStr.split(' ');
    if (parts.length < 2) return 0;
    const monthName = parts[0];
    const year = parseInt(parts[1].replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]));
    
    const normalizedMonths = months.map(m => m.replace(/[أإآ]/g, 'ا').replace(/[ى]/g, 'ي'));
    const monthIndex = normalizedMonths.indexOf(monthName);
    
    return year * 100 + (monthIndex === -1 ? 0 : monthIndex);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (auth.currentUser?.email) {
        const perms = await getUserPermissions(auth.currentUser.email);
        setIsAdmin(perms.role === 'Admin');
        
        if (perms.employeeData?.name) {
          setCurrentUserName(perms.employeeData.name);
        } else {
          const { EMPLOYEE_MAP } = await import('../constants');
          const hardcodedName = EMPLOYEE_MAP[auth.currentUser?.email || ""];
          if (hardcodedName) {
            setCurrentUserName(hardcodedName);
          } else if (auth.currentUser?.displayName) {
            setCurrentUserName(auth.currentUser.displayName);
          }
        }
      }
      
      const months = await getAvailableScheduleMonths();
      if (months.length > 0) {
        const sorted = months.sort((a, b) => parseArabicMonth(a) - parseArabicMonth(b));
        setAvailableMonths(sorted);
        if (sorted.length > 0 && !sorted.includes(selectedMonth)) {
          setSelectedMonth(sorted[sorted.length - 1]);
        }
      } else {
        setAvailableMonths([currentMonth]);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToSchedules(selectedMonth, (data) => {
      setDbSchedules(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedMonth]);

  const normalizeString = (str: string) => {
    if (!str) return '';
    return str
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[١٢٣٤٥٦٧٨٩٠]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
      .replace(/[0123456789]/g, (d) => '0123456789'[d as any])
      .toLowerCase()
      .trim();
  };

  const isMe = (text: string) => {
    if (!text || !currentUserName) return false;
    const normalizedText = normalizeString(text);
    const normalizedMe = normalizeString(currentUserName);
    
    const individuals = normalizedText.split(/[-،,]/).map(s => s.trim()).filter(Boolean);
    const meWords = normalizedMe.split(/\s+/).filter(w => w.length >= 2);
    
    if (meWords.length === 0) return false;

    return individuals.some(individual => {
      const titles = ['د', 'ا', 'م', 'ا د', 'أ د', 'الأستاذ', 'الدكتور', 'المهندس'];
      let indWords = individual.split(/\s+/).filter(w => w.length >= 2);
      
      while (indWords.length > 0 && titles.includes(indWords[0])) {
        indWords.shift();
      }

      if (indWords.length === 0) return false;

      const matches = meWords.filter(mw => indWords.includes(mw));
      
      if (matches.length >= 3) return true;
      
      if (matches.length === 2) {
        return (meWords[0] === indWords[0] && meWords[1] === indWords[1]);
      }
      
      if (meWords.length <= 2) {
        return matches.length === meWords.length && meWords[0] === indWords[0];
      }
      
      return false;
    });
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) return;
    setIsUploading(true);
    try {
      const lines = bulkData.trim().split('\n');
      const schedules = lines.map(line => {
        const parts = line.split(/\t| {2,}/).map(p => p.trim());
        if (parts.length < 3) return null;
        
        const is12Cols = parts.length >= 11;
        const rawMonth = is12Cols ? parts[2] : selectedMonth;
        const normalizedMonth = normalizeString(rawMonth);
        
        const matchedMonth = availableMonths.find(opt => normalizeString(opt) === normalizedMonth) || rawMonth;

        const offset = is12Cols ? 1 : 0;

        return {
          date: parts[0],
          day: parts[1],
          monthYear: matchedMonth,
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
      toast.success(`تم رفع ${schedules.length} سجل بنجاح لشهر ${selectedMonth}`);
      
      const updatedMonths = await getAvailableScheduleMonths();
      const sorted = updatedMonths.sort((a, b) => parseArabicMonth(a) - parseArabicMonth(b));
      setAvailableMonths(sorted);
      
      setShowUploadModal(false);
      setBulkData('');
    } catch (e) {
      console.error(e);
      toast.error('خطأ أثناء الرفع');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearMonth = async () => {
    if (!window.confirm(`هل أنت متأكد من مسح كافة بيانات شهر ${selectedMonth}؟`)) return;
    setIsDeleting(true);
    try {
      await deleteSchedulesByMonth(selectedMonth);
      toast.success('تم مسح بيانات الشهر بنجاح');
      const updatedMonths = await getAvailableScheduleMonths();
      const sorted = updatedMonths.sort((a, b) => parseArabicMonth(a) - parseArabicMonth(b));
      setAvailableMonths(sorted);
      if (sorted.length > 0) {
        setSelectedMonth(sorted[sorted.length - 1]);
      } else {
        setSelectedMonth(currentMonth);
        setAvailableMonths([currentMonth]);
      }
    } catch (e) {
      toast.error('خطأ أثناء المسح');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSwap = async (targetRow: any, targetField: string, targetValue: string) => {
    const names = (targetValue || '')
      .split(/[-،,]/)
      .map(s => s.trim())
      .filter(n => n && n !== '-');
    
    if (names.length > 1) {
      setPickingSelection({ row: targetRow, field: targetField, names, fullValue: targetValue });
    } else {
      processSelection(targetRow, targetField, names[0] || '', targetValue);
    }
  };

  const processSelection = async (targetRow: any, targetField: string, employee: string, fullValue: string) => {
    if (!swapSource) {
      setSwapSource({ row: targetRow, field: targetField, employee, fullValue });
      toast.info(`تم اختيار (${employee || 'فراغ'}). الآن اختر الموظف البديل.`);
      return;
    }

    if (swapSource.row.id === targetRow.id && swapSource.field === targetField && swapSource.employee === employee) {
      setSwapSource(null);
      toast.info('تم إلغاء الاختيار');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من تبديل الموظف (${swapSource.employee || 'فراغ'}) بـ (${employee || 'فراغ'})؟`)) {
      setSwapSource(null);
      return;
    }

    setIsSwapping(true);
    try {
      const { updateSchedule } = await import('../services/dataService');
      
      const replaceInString = (original: string, toRemove: string, toAdd: string) => {
        let names = (original || '').split(/[-،,]/).map(n => n.trim()).filter(Boolean);
        if (!toRemove) {
          if (toAdd) names.push(toAdd);
          return names.join(' - ');
        }
        let replaced = false;
        const resultNames = names.map(n => {
          if (!replaced && n === toRemove) {
            replaced = true;
            return toAdd;
          }
          return n;
        }).filter(Boolean);
        if (!replaced && toAdd) resultNames.push(toAdd);
        return resultNames.join(' - ');
      };

      const newValue1 = replaceInString(swapSource.fullValue, swapSource.employee, employee);
      const updatedSourceRow = { ...swapSource.row, [swapSource.field]: newValue1 };
      await updateSchedule(swapSource.row.date, selectedMonth, updatedSourceRow);
      
      const newValue2 = replaceInString(fullValue, employee, swapSource.employee);
      const updatedTargetRow = { ...targetRow, [targetField]: newValue2 };
      await updateSchedule(targetRow.date, selectedMonth, updatedTargetRow);

      toast.success('تم التبديل بنجاح');
      setSwapSource(null);
    } catch (e) {
      console.error(e);
      toast.error('خطأ أثناء التبديل');
    } finally {
      setIsSwapping(false);
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
                onClick={() => {
                  setIsSwapMode(!isSwapMode);
                  setSwapSource(null);
                }}
                className={`px-6 py-4 rounded-[24px] font-black transition-all flex items-center gap-2 border ${isSwapMode ? 'bg-amber-500 text-white shadow-lg border-transparent animate-pulse' : 'bg-white dark:bg-slate-800 text-amber-600 border-amber-100 dark:border-amber-500/20 hover:bg-amber-50'}`}
              >
                <ArrowLeftRight className="w-5 h-5" />
                {isSwapMode ? 'إلغاء وضع التبديل' : 'نظام التبديل السريع'}
              </button>
            )}
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
           <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <RefreshCw className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
           </div>
           <p className="text-xl font-black text-slate-400">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-white/5 overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1400px] border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
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
              {dbSchedules.map((row, i) => {
                const hasMe = isMe(row.shift24) || isMe(row.shift36) || isMe(row.holidayNoon) || isMe(row.holidayMorning) || isMe(row.cabinet1) || isMe(row.cabinet2) || isMe(row.cabinet3) || isMe(row.careMorning) || isMe(row.careNight);

                return (
                  <tr 
                    key={row.id || i} 
                    className={`hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group ${hasMe ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''}`}
                  >
                    <td className="p-6 text-xs font-mono text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         {hasMe && <User className="w-3 h-3 text-blue-600 animate-pulse" />}
                         {row.date}
                      </div>
                    </td>
                    <td className="p-6 text-[13px] font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">{row.day}</td>
                    
                    {[
                      { field: 'shift24', color: 'blue' },
                      { field: 'shift36', color: 'blue' },
                      { field: 'holidayMorning', color: 'blue' },
                      { field: 'holidayNoon', color: 'blue' },
                      { field: 'cabinet1', color: 'emerald' },
                      { field: 'cabinet2', color: 'emerald' },
                      { field: 'cabinet3', color: 'emerald' },
                      { field: 'careMorning', color: 'amber' },
                      { field: 'careNight', color: 'amber' }
                    ].map((col) => {
                      const val = (row as any)[col.field];
                      const isSelected = swapSource?.row.id === row.id && swapSource?.field === col.field;
                      const isPicking = pickingSelection?.row.id === row.id && pickingSelection?.field === col.field;
                      const isHighlighted = isMe(val);
                      
                      let baseStyle = "p-6 text-[11px] font-bold transition-all";
                      if (col.color === 'emerald') baseStyle = "p-6 text-[11px] font-black transition-all text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10";
                      if (col.color === 'amber') baseStyle = "p-6 text-[11px] font-bold transition-all text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-900/10";

                      return (
                        <td 
                          key={col.field}
                          onClick={() => isSwapMode && handleSwap(row, col.field, val)}
                          className={`${baseStyle} ${isSwapMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-500 hover:scale-105 rounded-lg' : ''} ${isSelected ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 z-10 relative !rounded-lg' : isPicking ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-500 ring-offset-2 animate-pulse rounded-lg' : isHighlighted ? 'bg-blue-600 text-white shadow-inner scale-105 rounded-lg' : ''}`}
                        >
                          {val || '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
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

      {/* Modals Container */}
      <AnimatePresence>
        {showUploadModal && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8 RTL" dir="rtl">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowUploadModal(false)}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden p-10 flex flex-col h-full max-h-[85vh] text-right"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                    رفع الجدول الشهري
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-right">انسخ البيانات من Excel والصقها هنا مباشرة لشهر {selectedMonth}</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:rotate-90 transition-all text-slate-500 font-bold"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-[32px] flex items-start gap-4">
                 <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-blue-600" />
                 </div>
                 <div className="space-y-2 text-right w-full">
                    <p className="text-sm font-black text-blue-900 dark:text-blue-100">تعليمات التنسيق (12 عمود):</p>
                    <p className="text-xs text-blue-700/80 dark:text-blue-300 font-medium leading-relaxed italic">
                      التاريخ | اليوم | الشهر والسنة | شفت 24 | شفت 36 | عطلة م | عطلة ظ | 2:30 - 5 | 5 - 7:30 | 7:30 - 10 | رعاية م | رعاية ل
                    </p>
                 </div>
              </div>

              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder="الصق البيانات هنا..."
                className="flex-1 w-full bg-slate-50 dark:bg-slate-850 p-6 rounded-[32px] border-2 border-transparent focus:border-blue-600 outline-none font-mono text-sm dark:text-white transition-all resize-none text-right shadow-inner"
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
          </div>,
          document.body
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pickingSelection && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 RTL" dir="rtl">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setPickingSelection(null)}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden p-8"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-amber-500/10 rounded-[28px] flex items-center justify-center mb-6 shadow-inner">
                  <ArrowLeftRight className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">اختيار موظف محدد</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium px-4">يرجى اختيار الاسم الذي ترغب في نقله أو تبديله من هذه القائمة:</p>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto px-2 custom-scrollbar text-right">
                {pickingSelection.names.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const { row, field, fullValue } = pickingSelection;
                      processSelection(row, field, name, fullValue);
                      setPickingSelection(null);
                    }}
                    className="w-full py-5 px-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-500 hover:text-white rounded-[24px] font-black transition-all text-right flex items-center justify-between group border border-slate-100 dark:border-white/5 shadow-sm"
                  >
                    <span className="text-lg">{name}</span>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0">
                      <ArrowLeftRight className="w-5 h-5" />
                    </div>
                  </button>
                ))}
                
                <div className="pt-4">
                  <button
                    onClick={() => {
                      const { row, field, fullValue } = pickingSelection;
                      processSelection(row, field, '', fullValue);
                      setPickingSelection(null);
                    }}
                    className="w-full py-4 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/30 rounded-[24px] font-bold transition-all flex items-center justify-center gap-3"
                  >
                    نقل إلى/من (مكان فارغ)
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setPickingSelection(null)}
                className="w-full mt-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black rounded-[24px] hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                إلغاء العملية
              </button>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}

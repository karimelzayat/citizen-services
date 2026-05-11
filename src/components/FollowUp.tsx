import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Complaint } from '../types';
import { Clock, CheckCircle2, Calendar, Database, User, Phone, MapPin, ChevronRight, Loader2, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FollowUp() {
  const [activeSubTab, setActiveSubTab] = useState('ongoing');
  const [ongoingComplaints, setOngoingComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      where('complaintStatus', '==', 'جاري المتابعة'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      setOngoingComplaints(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">متابعة المكالمات والشكاوى</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">متابعة دقيقة للحالات التي تتطلب إجراءات إضافية</p>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 transition-all duration-700">
           <button 
             onClick={() => setActiveSubTab('ongoing')} 
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ${activeSubTab === 'ongoing' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Clock className="w-4 h-4" />
             الجاري
           </button>
           <button 
             onClick={() => setActiveSubTab('completed')} 
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ${activeSubTab === 'completed' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <CheckCircle2 className="w-4 h-4" />
             تم المتابعة
           </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeSubTab === 'ongoing' ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
               <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                  <Clock className="absolute inset-0 m-auto w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight">جاري استرجاع المكالمات الجارية...</p>
            </div>
          ) : ongoingComplaints.length > 0 ? (
            <div className="glass-card overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-right border-collapse">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5">
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">التوقيت</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">المتصل</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">رقم التليفون</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">جهة الشكوى</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">الإجراء</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                     {ongoingComplaints.map((c, idx) => (
                       <motion.tr 
                         key={c.id}
                         initial={{ opacity: 0, scale: 0.98 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: idx * 0.05 }}
                         className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                       >
                         <td className="px-6 py-5">
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-900 dark:text-white">{(c.timestamp as any)?.toDate().toLocaleDateString('ar-EG')}</span>
                               <span className="text-[10px] text-emerald-600 font-bold">{(c.timestamp as any)?.toDate().toLocaleTimeString('ar-EG')}</span>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                                  {c.callerName.charAt(0)}
                               </div>
                               <span className="font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{c.callerName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm font-mono tracking-wider dark:text-slate-300">
                               <Phone className="w-3 h-3 text-slate-400" />
                               {c.phoneNumber}
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.complaintEntity}</span>
                               <span className="text-[10px] text-slate-400 font-medium">بواسطة: {c.employeeName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-5 text-center">
                            <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all">
                               متابعة الآن
                            </button>
                         </td>
                       </motion.tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center justify-center py-32 glass-card border-dashed space-y-6 transition-all duration-700"
             >
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-[32px] flex items-center justify-center transition-colors duration-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 dark:text-emerald-800" />
               </div>
               <div className="text-center">
                  <p className="text-2xl font-black text-slate-400 dark:text-slate-600">لا توجد مكالمات جارية</p>
                  <p className="text-slate-400 dark:text-slate-500">عمل ممتاز! جميع المكالمات تم متابعتها بنجاح</p>
               </div>
            </motion.div>
          )
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="glass-card p-10 flex flex-col items-center space-y-8">
               <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950/20 rounded-[40px] flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-blue-500" />
               </div>
               <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">سجل المكالمات المنتهية</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">الرجاء اختيار الفترة الزمنية لعرض الأرشيف</p>
               </div>
               
               <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-md">
                  <select className="form-input text-center font-bold">
                    <option>مايو 2024</option>
                    <option>أبريل 2024</option>
                    <option>مارس 2024</option>
                  </select>
                  <button className="btn-primary w-full md:w-auto px-12 h-14 flex items-center justify-center gap-2">
                     <Search className="w-5 h-5" />
                     <span>عرض الأرشيف</span>
                  </button>
               </div>
            </div>
            
            <div className="flex items-center gap-2 justify-center text-slate-400">
               <Info className="w-4 h-4" />
               <p className="text-xs font-bold uppercase tracking-widest">تتطلب هذه الوظيفة صلاحيات متابعة الحالات</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

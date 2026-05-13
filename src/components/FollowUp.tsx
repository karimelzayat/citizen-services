import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Complaint } from '../types';
import { Clock, CheckCircle2, Calendar, Phone, Info, Search } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">متابعة المكالمات والشكاوى</h2>
           <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium">متابعة دقيقة للحالات التي تتطلب إجراءات إضافية</p>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-white/5 transition-all duration-700">
           <button 
             onClick={() => setActiveSubTab('ongoing')} 
             className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-500 ${activeSubTab === 'ongoing' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <Clock className="w-3.5 h-3.5" />
             الجاري
           </button>
           <button 
             onClick={() => setActiveSubTab('completed')} 
             className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-500 ${activeSubTab === 'completed' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             <CheckCircle2 className="w-3.5 h-3.5" />
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
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-700">
               <div className="overflow-x-auto">
                 <table className="w-full text-right border-collapse">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">التوقيت</th>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">المتصل</th>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">التليفون</th>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">جهة الشكوى</th>
                        <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-center">الإجراء</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                     {ongoingComplaints.map((c, idx) => (
                       <motion.tr 
                         key={c.id}
                         initial={{ opacity: 0, scale: 0.98 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: idx * 0.05 }}
                         className="group hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all border-r-4 border-r-transparent hover:border-r-emerald-500"
                       >
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-900 dark:text-white mb-1">{(c.timestamp as any)?.toDate().toLocaleDateString('ar-EG')}</span>
                               <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">{(c.timestamp as any)?.toDate().toLocaleTimeString('ar-EG')}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-100 dark:border-emerald-900/20 shadow-sm">
                                   {c.callerName.charAt(0)}
                               </div>
                               <span className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{c.callerName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-xs font-mono tracking-widest dark:text-slate-300">
                               <Phone className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                               {c.phoneNumber}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-800 dark:text-slate-200">{c.complaintEntity}</span>
                               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">بواسطة: {c.employeeName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <button className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-black text-[9px] shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-widest">
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
               className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[24px] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm space-y-6 transition-all duration-700"
             >
                <div className="w-16 h-16 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[24px] flex items-center justify-center transition-colors duration-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 dark:text-emerald-800" />
               </div>
               <div className="text-center">
                  <p className="text-xl font-black text-slate-400 dark:text-slate-600">لا توجد مكالمات جارية</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px]">عمل ممتاز! جميع المكالمات تم متابعتها بنجاح</p>
               </div>
            </motion.div>
          )
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-8 flex flex-col items-center space-y-6">
               <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/20 rounded-[32px] flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-blue-500" />
               </div>
               <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">سجل المكالمات المنتهية</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium">الرجاء اختيار الفترة الزمنية لعرض الأرشيف</p>
               </div>
               
               <div className="flex flex-col md:flex-row items-center gap-3 w-full max-w-md">
                  <select className="form-input text-center font-bold h-11 text-xs">
                    <option>مايو 2024</option>
                    <option>أبريل 2024</option>
                    <option>مارس 2024</option>
                  </select>
                  <button className="btn-primary w-full md:w-auto px-10 h-11 flex items-center justify-center gap-2 text-xs">
                     <Search className="w-4 h-4" />
                     <span>عرض الأرشيف</span>
                  </button>
               </div>
            </div>
            
            <div className="flex items-center gap-2 justify-center text-slate-400">
               <Info className="w-3.5 h-3.5" />
               <p className="text-[9px] font-bold uppercase tracking-widest">تتطلب هذه الوظيفة صلاحيات متابعة الحالات</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

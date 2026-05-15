import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Medal, Star, User, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyRanking, getMonthlyRanking } from '../services/dataService';

export default function RankingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const fetchRanking = activeTab === 'daily' ? getDailyRanking() : getMonthlyRanking();
      fetchRanking.then(data => {
        setRankings(data);
        setLoading(false);
      });
    }
  }, [isOpen, activeTab]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 overflow-hidden RTL" dir="rtl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] border border-slate-100 dark:border-white/5 p-0 flex flex-col w-full max-w-md h-auto max-h-[90vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
                   <Trophy className="w-6 h-6" />
                 </div>
                 <div className="text-right">
                   <h2 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">ترتيب الأداء</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                     {activeTab === 'daily' ? 'إحصائيات اليوم (شفتات اليوم)' : 'إحصائيات الشهر الحالي'}
                   </p>
                 </div>
              </div>
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all font-black" onClick={onClose}>
                 <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 flex gap-2">
              <button 
                onClick={() => setActiveTab('daily')}
                className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'daily' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
              >
                <Clock className="w-4 h-4" />
                اليوم الحالي
              </button>
              <button 
                onClick={() => setActiveTab('monthly')}
                className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
              >
                <Calendar className="w-4 h-4" />
                الشهر الحالي
              </button>
            </div>
            
            {/* List */}
            <div className="p-6 space-y-4 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar flex-1">
              {loading ? (
                <div className="h-60 flex flex-col items-center justify-center opacity-40">
                    <div className="w-12 h-12 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                    <p className="font-black text-slate-400">جاري جلب الإحصائيات...</p>
                </div>
              ) : rankings.length > 0 ? (
                rankings.map((user, idx) => (
                  <motion.div 
                    key={`${activeTab}-${idx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${idx === 0 ? 'bg-yellow-50 dark:bg-yellow-500/5 border-yellow-200 dark:border-yellow-500/30 shadow-lg shadow-yellow-500/5' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4 text-right">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                         {idx + 1}
                      </div>
                      <div>
                         <span className="text-base font-black text-slate-900 dark:text-white block">{user.name}</span>
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter shrink-0">{user.calls} مكالمة تم الرد عليها</span>
                         </div>
                      </div>
                    </div>
                    
                    {idx === 0 ? (
                      <Medal className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                    ) : idx < 3 ? (
                      <Star className="w-6 h-6 text-slate-300" />
                    ) : null}
                  </motion.div>
                ))
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-slate-400 opacity-40">
                   <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                     <User className="w-10 h-10" />
                   </div>
                   <p className="font-black text-lg">لا توجد بيانات أداء {activeTab === 'daily' ? 'لليوم' : 'للشهر'}</p>
                </div>
              )}
            </div>

            {/* Footer / User Progress */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
                <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl border border-blue-500/10 flex items-center justify-between shadow-xl shadow-blue-500/20 text-white">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                         <User className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-0.5">حالة النظام الآن:</span>
                        <span className="text-xl font-black tracking-tight flex items-center gap-2">
                          تحديث فوري
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] rounded-lg animate-pulse">مباشر</span>
                        </span>
                      </div>
                   </div>
                   <div className="text-sm font-black bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">أداء متميز!</div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

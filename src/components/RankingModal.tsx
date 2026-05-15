import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, User, Calendar, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyRanking, getMonthlyRanking } from '../services/dataService';

export default function RankingPopover({ isOpen }: { isOpen: boolean }) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className="absolute top-full left-0 mt-4 bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[32px] border border-slate-100 dark:border-white/10 p-0 flex flex-col w-80 sm:w-96 max-h-[500px] overflow-hidden z-[100] origin-top-left RTL" 
          dir="rtl"
          onClick={e => e.stopPropagation()}
        >
          {/* Tabs */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5 flex gap-2">
            <button 
              onMouseEnter={() => setActiveTab('daily')}
              className={`flex-1 py-2 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${activeTab === 'daily' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
            >
              <Clock className="w-3.5 h-3.5" />
              اليوم الحالي
            </button>
            <button 
              onMouseEnter={() => setActiveTab('monthly')}
              className={`flex-1 py-2 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              الشهر الحالي
            </button>
          </div>
          
          {/* List Content */}
          <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
            {loading ? (
              <div className="h-40 flex flex-col items-center justify-center opacity-40">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-2" />
                  <p className="font-black text-xs text-slate-400">جاري التحميل...</p>
              </div>
            ) : rankings.length > 0 ? (
              rankings.map((user, idx) => (
                <motion.div 
                  key={`${activeTab}-${idx}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${idx === 0 ? 'bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-100 dark:border-yellow-500/20' : 'bg-slate-50/30 dark:bg-slate-800/40 border-slate-50 dark:border-white/5'}`}
                >
                  <div className="flex items-center gap-3 text-right flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                       {idx + 1}
                    </div>
                    <div className="flex items-center justify-between w-full gap-2 min-w-0">
                       <span className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</span>
                       <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${idx === 0 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                         {user.calls} مكالمة
                       </span>
                    </div>
                  </div>
                  
                  {idx === 0 && <Medal className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-2 shrink-0" />}
                </motion.div>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 opacity-40">
                 <User className="w-8 h-8 mb-2" />
                 <p className="font-black text-xs">لا توجد بيانات</p>
              </div>
            )}
          </div>

          {/* Minimal Status bar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">تحديث مباشر</span>
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-500">متصل</span>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

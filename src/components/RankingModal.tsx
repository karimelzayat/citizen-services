import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, User, X, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { getUserRanking } from '../services/dataService';

export default function RankingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      getUserRanking().then(data => {
        setRankings(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 md:p-6 sm:pt-[15vh]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] border border-slate-100 dark:border-white/5 max-w-md w-full flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">ترتيب الموظفين</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">إحصائيات الأداء في الشيفت الحالي</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 bg-white dark:bg-slate-900 min-h-[200px]">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-blue-600 font-bold animate-pulse">جاري جلب الإحصائيات...</div>
          ) : rankings.length > 0 ? (
            rankings.map((user, idx) => (
              <motion.div 
                key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${idx === 0 ? 'bg-yellow-50 dark:bg-yellow-500/5 border-yellow-200 dark:border-yellow-500/30' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {user.rank}
                </div>
                <div>
                   <span className="text-sm font-black text-slate-900 dark:text-white block">{user.name}</span>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter shrink-0">{user.calls} مكالمة</span>
                   </div>
                </div>
              </div>
              
              {idx === 0 ? (
                <Medal className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              ) : idx < 3 ? (
                <Star className="w-4 h-4 text-slate-400" />
              ) : null}
            </motion.div>
          ))
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 font-bold opacity-50">
              <User className="w-10 h-10 mb-2" />
              <span>لا توجد بيانات أداء حتى الآن</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-white/5">
           <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <User className="w-3 h-3" />
                 </div>
                 <span className="text-[10px] font-black text-blue-700 dark:text-blue-400">مركزك الحالي:</span>
              </div>
              <span className="text-sm font-black text-blue-700 dark:text-blue-400">7#</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

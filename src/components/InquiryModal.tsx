import React from 'react';
import { motion } from 'motion/react';

export default function InquiryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] grid place-items-center p-4">
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
        className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] border border-slate-100 dark:border-white/5 p-0 flex flex-col w-full max-w-4xl h-[85vh] max-h-[800px] overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
               <i className="fas fa-database text-xl"></i>
             </div>
             <div>
               <h2 className="font-black text-2xl text-slate-900 dark:text-white">قاعدة الاستفسارات المختصرة</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">المعلومات النموذجية لخدمة المواطنين</p>
             </div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-white/5">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-2 flex gap-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
             <div className="relative flex-1">
               <i className="fas fa-search absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
               <input type="text" placeholder="ابحث في قاعدة البيانات (مثلاً: تطعيمات، تكليف، كورونا)..." className="form-input pr-12 border-none bg-transparent h-14" />
             </div>
             <button className="btn-primary px-10 rounded-xl">بحث الآن</button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 flex flex-col items-center justify-center opacity-40">
           <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
             <i className="fas fa-database text-4xl"></i>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">الرجاء اختيار فئة أو كتابة كلمة بحث لبدء التصفح</p>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';

export default function InquiryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container p-0 flex flex-col !h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <h2 className="font-black text-2xl text-slate-800 dark:text-white">قاعدة الاستفسارات</h2>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900">
          <div className="glass-card p-2 flex gap-4 bg-slate-50/50 dark:bg-slate-800/30">
             <div className="relative flex-1">
               <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
               <input type="text" placeholder="1. اختر الفئة المطلوبة (مثلاً: تطعيمات)..." className="form-input pr-12 border-none bg-transparent" />
             </div>
             <button className="btn-primary px-8">بحث</button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 flex flex-col items-center justify-center">
           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
             <i className="fas fa-database text-3xl"></i>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold">الرجاء اختيار فئة لبدء البحث.</p>
        </div>
      </div>
    </div>
  );
}

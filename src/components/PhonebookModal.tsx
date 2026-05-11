import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function PhonebookModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container p-0 flex flex-col !h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <h2 className="font-black text-2xl text-slate-800 dark:text-white">دليل أرقام الهواتف</h2>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900">
          <div className="glass-card p-6 flex flex-wrap gap-6 bg-slate-50/50 dark:bg-slate-800/30">
             <div className="flex-1 min-w-[200px]">
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">1. اختر الجهة:</label>
               <select className="form-input">
                 <option value="">-- اختر جهة --</option>
                 <option value="المديريات">المديريات</option>
                 <option value="التأمين">التأمين الصحي</option>
               </select>
             </div>
             <div className="flex-1 min-w-[200px]">
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">2. اختر المحافظة:</label>
               <select className="form-input">
                 <option value="">-- اختر --</option>
               </select>
             </div>
             <div className="w-full sm:w-auto self-end">
               <button className="btn-primary w-full px-12">بحث</button>
             </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-12 flex flex-col items-center justify-center">
           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
             <i className="fas fa-address-book text-3xl"></i>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold">الرجاء اختيار جهة ومحافظة لعرض البيانات.</p>
        </div>
      </div>
    </div>
  );
}

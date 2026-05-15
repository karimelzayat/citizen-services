import React, { useEffect, useState } from 'react';
import { addDirectorCase, listenToDirectorCases } from '../services/dataService';
import { DirectorCase } from '../types';
import SearchableSelect from './ui/SearchableSelect';

import { UserPermissions } from '../types';

export default function DirectorAssignments({ permissions }: { permissions: UserPermissions | null }) {
  const [cases, setCases] = useState<DirectorCase[]>([]);
  const [formData, setFormData] = useState({
    source: 'واتساب المدير',
    caseName: '',
    phone: '',
    details: ''
  });

  useEffect(() => {
    const unsubscribe = listenToDirectorCases(setCases);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDirectorCase(formData);
      alert('تم التسجيل بنجاح!');
      setFormData({ source: 'واتساب المدير', caseName: '', phone: '', details: '' });
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    }
  };

  return (
    <div className="tab-content block pb-10">
      <h2 className="text-center text-blue-600 dark:text-blue-400 mb-8 font-black text-2xl">متابعة تكليفات المدير</h2>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none p-8 mb-8 rounded-[24px] relative overflow-hidden transition-all duration-700">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 transition-all duration-500"></div>
        <h3 className="m-0 text-slate-900 dark:text-white mb-8 flex items-center gap-3 font-black text-lg">
           <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <i className="fas fa-plus"></i>
           </div>
           تسجيل تكليف جديد
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors">مصدر التكليف:</label>
              <SearchableSelect
                options={['واتساب المدير', 'اتصال هاتفي', 'أخرى']}
                value={formData.source}
                onChange={(val) => setFormData({...formData, source: val})}
                placeholder="اختر المصدر..."
                className="bg-slate-50 dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors">اسم الحالة:</label>
              <input type="text" className="form-input bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white transition-all" value={formData.caseName} onChange={(e) => setFormData({...formData, caseName: e.target.value})} required />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors">رقم التليفون:</label>
              <input type="tel" className="form-input bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white transition-all font-mono tracking-widest" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors">تفاصيل التكليف / المشكلة:</label>
            <textarea rows={3} value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} required className="form-input bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white transition-all"></textarea>
          </div>
          
          <div className="pt-2">
            <button type="submit" className="btn-primary w-full md:w-auto px-10 h-14 bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-600/20 active:scale-95 transition-all">
              <i className="fas fa-save ml-2"></i>
              حفظ التكليف
            </button>
          </div>
        </form>
      </div>
 
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[28px] overflow-hidden transition-all duration-700">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                <th className="p-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">التاريــــــخ</th>
                <th className="p-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">المصدر</th>
                <th className="p-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">اسم الحالة</th>
                <th className="p-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">رقم التليفون</th>
                <th className="p-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">التفاصيل</th>
                <th className="p-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                <th className="p-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest text-center">بواسطة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-[11px] font-bold text-slate-400">{(c.timestamp as any)?.toDate()?.toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">{c.source}</td>
                  <td className="p-4 text-sm font-black text-slate-900 dark:text-white">{c.caseName}</td>
                  <td className="p-4 text-sm font-mono tracking-wider text-blue-600 font-bold">{c.phone}</td>
                  <td className="p-4"><div className="max-w-[250px] whitespace-pre-wrap text-[11px] text-slate-500 font-medium leading-relaxed">{c.details}</div></td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm ${c.status === 'تم الحل' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-[10px] font-black text-slate-400">
                       AD
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { addDirectorCase, listenToDirectorCases } from '../services/dataService';
import { DirectorCase } from '../types';

export default function DirectorAssignments() {
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

      <div className="glass-card p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
        <h3 className="m-0 text-slate-800 dark:text-white mb-6 flex items-center gap-2 font-black"><i className="fas fa-plus text-amber-500"></i> تسجيل تكليف جديد</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">مصدر التكليف:</label>
              <select className="form-input" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} required>
                <option value="واتساب المدير">واتساب المدير</option>
                <option value="اتصال هاتفي">اتصال هاتفي</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">اسم الحالة:</label>
              <input type="text" className="form-input" value={formData.caseName} onChange={(e) => setFormData({...formData, caseName: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">رقم التليفون:</label>
              <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">تفاصيل التكليف / المشكلة:</label>
            <textarea rows={3} value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} required className="form-input mb-4"></textarea>
          </div>
          
          <button type="submit" className="btn-primary w-full md:w-auto">
            <i className="fas fa-save ml-2"></i>
            حفظ التكليف
          </button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5">
                <th className="p-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">التاريخ</th>
                <th className="p-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">المصدر</th>
                <th className="p-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">اسم الحالة</th>
                <th className="p-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">رقم التليفون</th>
                <th className="p-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">التفاصيل</th>
                <th className="p-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">الحالة</th>
                <th className="p-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-xs ltr text-right text-slate-500">{(c.timestamp as any)?.toDate()?.toLocaleString('ar-EG')}</td>
                  <td className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">{c.source}</td>
                  <td className="p-4 text-sm font-black text-slate-800 dark:text-white">{c.caseName}</td>
                  <td className="p-4 text-sm ltr text-right text-blue-600 font-bold">{c.phone}</td>
                  <td className="p-4"><div className="max-w-[250px] whitespace-pre-wrap text-xs text-slate-500 leading-relaxed">{c.details}</div></td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${c.status === 'تم الحل' ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all" title="تحديث">
                      <i className="fas fa-edit"></i>
                    </button>
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

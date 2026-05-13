import React, { useState } from 'react';

export default function FAQ() {
  const [search, setSearch] = useState('');
  const faqs = [
    { question: 'ما هي مواعيد عمل مكاتب الصحة؟', answer: 'تعمل مكاتب الصحة على مدار ٢٤ ساعة في الحالات الطارئة، والمواعيد الرسمية من ٨ صباحاً حتى ٢ مساءً.', category: 'عام' },
    { question: 'كيف يمكنني تقديم شكوى ضد منشأة طبية؟', answer: 'يمكنك الاتصال بالرقم المختصر ١٠٥ أو التوجه لمقر الإدارة العامة لخدمة المواطنين.', category: 'شكاوى' }
  ];

  return (
    <div className="tab-content block pb-10">
      <h2 className="text-center text-blue-600 dark:text-blue-400 mb-8 font-black text-2xl">دليل الأسئلة والإجابات النموذجية</h2>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none p-8 mb-8 rounded-[32px] flex flex-col items-center relative overflow-hidden transition-all duration-700">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"></div>
        <label className="block text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 transition-colors duration-500">ابحث عن سؤال أو معلومة:</label>
        <div className="relative w-full max-w-[600px]">
          <i className="fas fa-search absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="اكتب كلمة مفتاحية (مثل: سعار، تطعيم، زواج)..." 
            className="form-input pr-14 text-lg text-center bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white transition-all h-16 rounded-2xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
 
      <div className="flex flex-col gap-5">
        {faqs.filter(f => f.question.includes(search) || f.answer.includes(search)).map((faq, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
            <div className="p-5 cursor-pointer font-black text-slate-900 dark:text-white flex justify-between items-center transition-all hover:bg-slate-50 dark:hover:bg-blue-500/5">
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <i className="fas fa-question-circle"></i>
                </span>
                {faq.question}
                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-1 px-2.5 rounded-lg uppercase tracking-tighter mr-2.5">{faq.category}</span>
              </span>
              <i className="fas fa-chevron-down text-slate-300 group-hover:text-blue-500 transition-colors"></i>
            </div>
            <div className="p-6 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 text-sm leading-relaxed bg-slate-50/20 dark:bg-transparent">
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { addInquiry, listenToInquiries } from '../services/dataService';
import { Inquiry } from '../types';
import { MessageSquare, Send, Search, Reply, User, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from '../lib/toast';

export default function InquiryDatabase() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [question, setQuestion] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = listenToInquiries(setInquiries);
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!question.trim()) return;
    try {
      await addInquiry(question);
      setQuestion('');
      toast.success('تم إرسال استفسارك بنجاح');
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    }
  };

  const filtered = inquiries.filter(i => 
    i.question.toLowerCase().includes(search.toLowerCase()) || 
    i.answer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex flex-col h-[500px] shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[24px] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-xs font-black text-slate-900 dark:text-white leading-none">استفسارات الزملاء</h3>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 block">قاعدة المعرفة الحية</span>
          </div>
        </div>
        <div className="flex -space-x-2 rtl:space-x-reverse">
           {[1, 2, 3].map(i => (
             <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold">
                {String.fromCharCode(64 + i)}
             </div>
           ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="اسأل الزملاء..." 
            className="form-input pr-12" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePost()}
          />
          <button 
            onClick={handlePost} 
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>

        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="البحث في الأسئلة والردود..." 
            className="form-input pr-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 custom-scrollbar">
        <AnimatePresence>
          {filtered.map((inquiry, idx) => (
            <motion.div 
              key={inquiry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group p-4 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-blue-500/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                 <span className="font-black text-sm text-slate-900 dark:text-slate-100 leading-relaxed block flex-1">{inquiry.question}</span>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(inquiry.timestamp || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                 </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-slate-400" />
                 </div>
                 <span className="text-[10px] text-slate-400 font-bold tracking-tight">{inquiry.qUser}</span>
              </div>

              {inquiry.answer ? (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/10 rounded-xl p-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-600 opacity-[0.03] rounded-full -mr-6 -mt-6"></div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-black mb-1">
                     <CheckCircle2 className="w-3 h-3" />
                     <span>الرد المعتمد</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold leading-relaxed">{inquiry.answer}</p>
                  <div className="mt-2 text-[9px] text-emerald-600/60 dark:text-emerald-400/40 text-left font-bold">بواسطة: {inquiry.aUser}</div>
                </div>
              ) : (
                <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-[10px] font-black hover:translate-x-[-4px] transition-transform">
                  <Reply className="w-3 h-3" />
                  <span>تقديم إجابة الآن</span>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

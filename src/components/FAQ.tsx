import React, { useState, useEffect } from 'react';
import { UserPermissions } from '../types';
import { getFAQs, bulkUploadFAQs } from '../services/dataService';
import { FileText, Loader2, Search, Plus, QuestionMarkIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '../lib/toast';

export default function FAQ({ permissions }: { permissions: UserPermissions | null }) {
  const [search, setSearch] = useState('');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const isAdmin = permissions?.role === 'Admin';

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    const data = await getFAQs();
    setFaqs(data);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length <= 1) {
            toast.error('الملف فارغ أو لا يحتوي على بيانات');
            return;
          }

          const batchData = jsonData.slice(1).filter(row => row[0]).map(row => ({
            question: String(row[0] || ''),
            answer: String(row[1] || ''),
            category: String(row[2] || 'عام')
          }));

          await bulkUploadFAQs(batchData);
          toast.success(`تم رفع ${batchData.length} سؤال بنجاح`);
          fetchFaqs();
        } catch (err: any) {
          toast.error('خطأ في معالجة الملف');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      toast.error('خطأ في قراءة الملف');
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="tab-content block pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-blue-600 dark:text-blue-400 font-black text-2xl">دليل الأسئلة والإجابات النموذجية</h2>
        
        {isAdmin && (
          <div className="relative">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              disabled={uploadLoading}
            />
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50">
              {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              رفع داتا قديمة (Excel)
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none p-8 mb-8 rounded-[32px] flex flex-col items-center relative overflow-hidden transition-all duration-700">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"></div>
        <label className="block text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 transition-colors duration-500">ابحث عن سؤال أو معلومة:</label>
        <div className="relative w-full max-w-[600px]">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
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
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-400 font-bold">جاري تحميل الأسئلة...</p>
          </div>
        ) : faqs.filter(f => f.question.includes(search) || f.answer.includes(search)).length > 0 ? (
          faqs.filter(f => f.question.includes(search) || f.answer.includes(search)).map((faq, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <div className="p-5 cursor-pointer font-black text-slate-900 dark:text-white flex justify-between items-center transition-all hover:bg-slate-50 dark:hover:bg-blue-500/5">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Search className="w-4 h-4" />
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
          ))
        ) : (
          <div className="text-center py-20 opacity-40">
            <p className="text-xl font-black text-slate-400">لا توجد نتائج للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { searchPhonebook, bulkUploadPhonebook } from '../services/dataService';
import { Phone, Search, Building2, FileText, Loader2 } from 'lucide-react';
import SearchableSelect from './ui/SearchableSelect';
import { GOVERNORATES_LIST } from '../constants';
import * as XLSX from 'xlsx';
import { toast } from '../lib/toast';

export default function PhonebookModal({ isOpen, onClose, isAdmin }: { isOpen: boolean, onClose: () => void, isAdmin: boolean }) {
  const [entity, setEntity] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleSearch = async () => {
    if (!entity || !governorate) return;
    setLoading(true);
    const data = await searchPhonebook(entity, governorate);
    setResults(data);
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
            name: String(row[0] || ''),
            phone: String(row[1] || ''),
            entity: String(row[2] || ''),
            governorate: String(row[3] || '')
          }));

          await bulkUploadPhonebook(batchData);
          toast.success(`تم رفع ${batchData.length} رقم بنجاح`);
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 overflow-hidden RTL" dir="rtl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] border border-slate-100 dark:border-white/5 p-0 flex flex-col w-full max-w-4xl h-full max-h-[85vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                   <Phone className="w-6 h-6" />
                 </div>
                 <div className="text-right">
                   <h2 className="font-black text-2xl text-slate-900 dark:text-white">دليل أرقام الهواتف</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">قاعدة بيانات التواصل مع المديريات والجهات</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".xlsx,.xls" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      disabled={uploadLoading}
                    />
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50">
                      {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      رفع داتا
                    </button>
                  </div>
                )}
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all font-black" onClick={onClose}>
                   <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-white/5">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 flex flex-wrap gap-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                 <div className="flex-1 min-w-[200px] text-right">
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">1. اختر الجهة:</label>
                   <SearchableSelect
                     options={['المديريات', 'التأمين الصحي', 'الإدارة المركزية']}
                     value={entity}
                     onChange={setEntity}
                     placeholder="اختر جهة..."
                   />
                 </div>
                 <div className="flex-1 min-w-[200px] text-right">
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">2. اختر المحافظة:</label>
                   <SearchableSelect
                     options={GOVERNORATES_LIST}
                     value={governorate}
                     onChange={setGovernorate}
                     placeholder="اختر محافظة..."
                   />
                 </div>
                 <div className="w-full sm:w-auto self-end pb-1 mt-4 sm:mt-0">
                   <button 
                     onClick={handleSearch}
                     disabled={loading}
                     className="btn-primary w-full px-12 h-14 rounded-2xl flex items-center justify-center gap-2 font-black transition-all active:scale-95 shadow-lg shadow-blue-600/30"
                   >
                     <Search className="w-5 h-5" />
                     {loading ? 'جاري البحث...' : 'بحث الآن'}
                   </button>
                 </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-black/20">
               {results.length > 0 ? (
                 results.map((res, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="p-5 bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5"
                   >
                     <div className="flex items-center gap-4 text-right">
                       <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                         <Building2 className="w-7 h-7" />
                       </div>
                       <div>
                         <h4 className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight text-lg">{res.name}</h4>
                         <p className="text-xs text-slate-400 font-bold">{res.entity} - {res.governorate}</p>
                       </div>
                     </div>
                     <a href={`tel:${res.phone}`} className="flex items-center gap-2 px-8 py-3.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm font-black border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <Phone className="w-4 h-4" />
                        {res.phone}
                     </a>
                   </motion.div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                   <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                     <i className="fas fa-search text-4xl"></i>
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 font-black text-xl">
                     {loading ? 'جاري جلب البيانات...' : 'الرجاء اختيار جهة ومحافظة لعرض البيانات'}
                   </p>
                 </div>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

import React from 'react';
import { createPortal } from 'react-dom';
import { Building2, X, Phone, Globe, ShieldAlert, Heart, Activity, UserCheck, Stethoscope, FileText, ClipboardList, HelpingHand } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EXTERNAL_ENTITIES = [
  { name: 'الإسعاف', number: '123' },
  { name: 'التأمين الصحي', number: '106' },
  { name: 'التأمين الصحي الشامل', number: '15344' },
  { name: 'الصحة النفسية', number: '16328' },
  { name: 'المصل واللقاح', number: '0237611111' },
  { name: 'دعم نفسي', number: '080088880700' },
  { name: 'شكاوى مجلس الوزراء', number: '16528' },
  { name: 'علاج الإدمان (التضامن)', number: '16023' },
  { name: 'قوائم الانتظار', number: '15300' },
  { name: 'كارت الخدمات المتكاملة', number: '15044' },
  { name: 'لجان التأمين', number: '19806' },
  { name: 'نقابة التمريض', number: '01111017435' },
  { name: 'هيئة الدواء', number: '15301' },
  { name: 'تنسيق غسيل الكلى', number: '0225873050' },
  { name: 'المعامل المركزية (أغذية)', number: '01092989320' },
  { name: 'المعامل المركزية (سفر)', number: '01002144432' },
  { name: 'المعامل المركزية (تحاليل)', number: '01032639222' },
  { name: 'رقم للألبان العلاجية', number: '02225315464' },
];

export default function HotlineTreeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
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
            className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] border border-slate-100 dark:border-white/5 p-0 flex flex-col w-full max-w-7xl h-full max-h-[92vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                   <Building2 className="w-6 h-6" />
                 </div>
                 <div className="text-right">
                   <h2 className="font-black text-2xl text-slate-900 dark:text-white">شجرة الخط الساخن (105) - أرقام الجهات</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">توجيه المكالمات وتوزيع الاختصاصات والأرقام الخارجية</p>
                 </div>
              </div>
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all font-black" onClick={onClose}>
                 <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-12 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/40">
              
              {/* Hierarchy Tree Visualizer */}
              <div className="flex flex-col items-center">
                {/* Root Node */}
                <div className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-center shadow-xl border border-white/10 z-10">
                   الخط الساخن 105 <br />
                   <span className="text-[10px] opacity-60">وزارة الصحة والسكان</span>
                </div>
                
                {/* Connector line from root */}
                <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-800"></div>
                
                {/* Languages Branch */}
                <div className="relative w-full flex justify-center">
                  <div className="absolute top-0 w-[50%] h-0.5 bg-slate-200 dark:bg-slate-800"></div>
                  
                  <div className="flex justify-between w-full max-w-4xl pt-8 relative">
                    {/* Arabic Section */}
                    <div className="flex flex-col items-center w-full">
                       <div className="absolute top-0 right-[25%] w-0.5 h-8 bg-slate-200 dark:bg-slate-800"></div>
                       <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-white/5 relative mb-8">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-800">1</div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-300">اللغة العربية</span>
                       </div>

                       {/* Arabic Sub-sections */}
                       <div className="relative w-full flex justify-center">
                          <div className="absolute top-0 w-[60%] h-0.5 bg-slate-200 dark:bg-slate-800"></div>
                          <div className="flex justify-between w-full gap-8 pt-8 relative px-4">
                             {/* Emergency Services */}
                             <div className="flex flex-col items-center flex-1">
                                <div className="absolute top-0 right-[20%] w-0.5 h-8 bg-slate-200 dark:bg-slate-800"></div>
                                <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 relative mb-6 w-full text-center group transition-all hover:shadow-lg">
                                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-800">1</div>
                                   <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">خدمات الطوارئ والاستغاثة</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full">
                                   <TreeItem number={1} label="الخدمات الطبية الطارئة" color="blue" />
                                   <TreeItem number={2} label="مبادرة جلطات القلب الحادة" color="blue" />
                                   <TreeItem number={3} label="السموم والحروق وأكياس الدم" color="blue" />
                                </div>
                             </div>

                             {/* Medical Services & Inquiries */}
                             <div className="flex flex-col items-center flex-1">
                                <div className="absolute top-0 left-[20%] w-0.5 h-8 bg-slate-200 dark:bg-slate-800"></div>
                                <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 relative mb-6 w-full text-center group transition-all hover:shadow-lg">
                                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-800">2</div>
                                   <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">الخدمات الطبية والاستفسارات</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 w-full">
                                   <TreeItem number={1} label="المجالس الطبية وقوائم الانتظار" color="blue" />
                                   <TreeItem number={2} label="مبادرات الصحة العامة" color="blue" />
                                   <TreeItem number={3} label="الخدمات الوقائية والتطعيمات" color="blue" />
                                   <TreeItem number={4} label="التأمين الصحي" color="blue" />
                                   <TreeItem number={5} label="الأمانة العامة للصحة النفسية" color="blue" />
                                   <TreeItem number={6} label="خدمات تنمية الأسرة" color="blue" />
                                   <TreeItem number={7} label="تراخيص المنشآت الطبية والتكليف" color="blue" />
                                   <TreeItem number={8} label="خدمة المواطنين (شكاوى)" color="blue" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* English Section */}
                    <div className="flex flex-col items-center w-full">
                       <div className="absolute top-0 left-[25%] w-0.5 h-8 bg-slate-200 dark:bg-slate-800"></div>
                       <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-white/5 relative mb-8">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-800">2</div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-300">English</span>
                       </div>
                       <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
                          <span className="text-xs font-bold text-slate-500">For English Press 2</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Entities Section */}
              <div className="pt-12 border-t border-slate-200 dark:border-white/5">
                 <div className="flex items-center gap-3 justify-center mb-10">
                    <div className="h-0.5 flex-1 bg-linear-to-l from-transparent to-slate-200 dark:to-white/10"></div>
                    <div className="flex items-center gap-3 px-6 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full font-black text-lg">
                       <HelpingHand className="w-6 h-6" />
                       الجهات الخارجية
                    </div>
                    <div className="h-0.5 flex-1 bg-linear-to-r from-transparent to-slate-200 dark:to-white/10"></div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {EXTERNAL_ENTITIES.map((entity, idx) => (
                      <motion.a
                        key={idx}
                        href={`tel:${entity.number}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all group text-center flex flex-col gap-2"
                      >
                         <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{entity.name}</span>
                         <span className="text-lg font-black text-blue-600 dark:text-blue-400">{entity.number}</span>
                      </motion.a>
                    ))}
                 </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function TreeItem({ number, label, color }: { number: number, label: string, color: 'blue' | 'green' }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-xs flex items-center gap-3 group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20">
       <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">
          {number}
       </div>
       <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 leading-tight text-right flex-1">{label}</span>
    </div>
  );
}

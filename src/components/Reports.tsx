import React, { useState } from 'react';
import { FileBarChart, PieChart, Activity, Calendar, Download, Info, Search, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function Reports() {
  const [activeSubTab, setActiveSubTab] = useState('entity');

  const tabs = [
    { id: 'entity', label: 'تقرير حسب الجهة', icon: PieChart, color: 'emerald' },
    { id: 'emergency', label: 'تقرير طوارئ 48', icon: Activity, color: 'blue' },
    { id: 'followup', label: 'تقرير المتابعة', icon: FileBarChart, color: 'rose' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">مركز التقارير</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium">توليد تقارير إحصائية وتحليلية شاملة</p>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 transition-all duration-700">
           {tabs.map(tab => {
             const Icon = tab.icon;
             const isActive = activeSubTab === tab.id;
             return (
               <button 
                 key={tab.id}
                 onClick={() => setActiveSubTab(tab.id)} 
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ${isActive ? `bg-white dark:bg-slate-700 text-slate-900 dark:text-${tab.color}-400 shadow-sm` : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Icon className="w-4 h-4" />
                 <span className="hidden sm:inline">{tab.label}</span>
               </button>
             );
           })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-none p-8 h-fit space-y-8 rounded-[32px] border border-slate-100 dark:border-white/5 transition-all duration-700">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                 <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">إعدادات النطاق</h3>
           </div>
 
           <form className="space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700 dark:text-slate-300">تاريخ البدء</label>
                 <input type="date" required className="form-input bg-slate-50 dark:bg-slate-800 border-transparent transition-all" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700 dark:text-slate-300">تاريخ الانتهاء</label>
                 <input type="date" required className="form-input bg-slate-50 dark:bg-slate-800 border-transparent transition-all" />
              </div>
              
              <button 
                type="submit" 
                className={`btn-primary w-full flex items-center justify-center gap-3 ${activeSubTab === 'entity' ? 'bg-emerald-600 shadow-emerald-600/20' : activeSubTab === 'emergency' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-rose-600 shadow-rose-600/20'}`}
              >
                <Download className="w-5 h-5" />
                <span>تحميل التقرير (PDF)</span>
              </button>
           </form>

           <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-white/5 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">سيتم معالجة البيانات وتوليد ملف PDF متوافق مع معايير الأرشفة الرسمية للوزارة.</p>
           </div>
        </div>

        {/* Live Preview / Info Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] shadow-xl shadow-slate-200/40 dark:shadow-none p-12 flex flex-col items-center justify-center space-y-8 min-h-[400px] transition-all duration-700">
           <motion.div 
             key={activeSubTab}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-32 h-32 bg-slate-50 dark:bg-slate-900/60 rounded-[48px] flex items-center justify-center shadow-inner transition-colors duration-500"
           >
              {tabs.map(tab => tab.id === activeSubTab && <tab.icon key={tab.id} className={`w-16 h-16 text-${tab.color}-500/20`} />)}
           </motion.div>
           
           <div className="text-center space-y-4 max-w-md">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">معاينة التقرير</h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {activeSubTab === 'entity' && "يتضمن هذا التقرير تحليلاً بيانياً لمعدلات المكالمات الواردة لكل جهة وسرعة الرد عليها."}
                {activeSubTab === 'emergency' && "ملخص شامل لحالات الطوارئ (48 ساعة) المسجلة، مصنفة حسب المحافظة والتشخيص الطبي."}
                {activeSubTab === 'followup' && "كشف تفصيلي لمسارات متابعة المكالمات الجارية والحالات التي تطلبت تدخلات خاصة."}
              </p>
           </div>

           <div className="flex items-center gap-2 text-slate-300 dark:text-slate-700">
              <Search className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">انتظار اختيار النطاق الزمني</span>
           </div>
        </div>
      </div>
      
      {/* Recent Reports Log */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-4">
            <FileText className="w-3 h-3" />
            آخر التقارير المستخرجة
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm rounded-[24px] p-6 flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                       <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                       <div className="font-bold text-slate-900 dark:text-white text-sm">تقرير إحصائي {i}</div>
                       <div className="text-[10px] text-slate-500 font-medium">الأمس في 04:30 م</div>
                    </div>
                 </div>
                 <Download className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

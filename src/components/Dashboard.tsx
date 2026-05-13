import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Phone, Calendar, Clock, Briefcase, MapPin, Building2, Stethoscope, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { getDashboardStats } from '../services/dataService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    getDashboardStats().then(data => {
      if (data) setStats(data);
      else {
        // Fallback or empty state
        setStats({
          todayCount: 0,
          monthCount: 0,
          ongoingCount: 0,
          directorActive: 0,
          topGovs: {},
          topEntities: {},
          topSubjects: {}
        });
      }
    });
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <Clock className="animate-spin text-blue-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">نظرة عامة على البيانات</h2>
           <p className="text-[9px] text-slate-500 font-medium tracking-tight">متابعة فورية لإحصائيات الخط الساخن والعمليات الجارية</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-1 rounded-xl shadow-sm transition-all duration-700">
           <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95">الكل</button>
           <button className="px-3 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold transition-all duration-500">الشهر الحالي</button>
           <button className="px-3 py-1 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold transition-all duration-500">اليوم</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'مكالمات اليوم', value: stats.todayCount, icon: Phone, color: 'blue', bgColor: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400', trend: '+12%' },
          { label: 'مكالمات الشهر', value: stats.monthCount, icon: Calendar, color: 'emerald', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400', trend: '+5.4%' },
          { label: 'تم الرد عليها', value: stats.ongoingCount, icon: Clock, color: 'amber', bgColor: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400', trend: 'ثابت' },
          { label: 'تكليفات نشطة', value: stats.directorActive, icon: Briefcase, color: 'violet', bgColor: 'bg-violet-50 dark:bg-violet-900/20', iconColor: 'text-violet-600 dark:text-violet-400', trend: '-2%' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="stat-card group cursor-pointer p-5 flex flex-col justify-between shadow-2xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg ${item.bgColor} ${item.iconColor}`}>
                 <item.icon className="w-6 h-6" />
              </div>
              <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${item.trend.startsWith('+') ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : item.trend.startsWith('-') ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {item.trend}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</h3>
              <div className="flex items-end justify-between">
                 <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{item.value}</span>
                 <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-transform" />
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Governorates Bar Chart */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col items-center min-h-[400px] transition-all duration-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5">
          <div className="w-full flex items-center justify-between mb-6">
            <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                 <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              أعلى المحافظات
            </h4>
            <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full uppercase tracking-widest">تحديث مباشر</span>
          </div>
          <div className="w-full flex-1">
            {Object.keys(stats.topGovs).length > 0 ? (
              <Bar 
                data={{
                  labels: Object.keys(stats.topGovs),
                  datasets: [{ 
                    label: 'العدد', 
                    data: Object.values(stats.topGovs), 
                    backgroundColor: '#3b82f6', 
                    borderRadius: 12,
                    hoverBackgroundColor: '#2563eb',
                    barThickness: 20
                  }]
                }}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { 
                    legend: { display: false }, 
                    tooltip: { 
                      padding: 12,
                      bodyFont: { family: 'Cairo', weight: 'bold', size: 14 },
                      titleFont: { family: 'Cairo', weight: 'bold', size: 12 }
                    } 
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: isDarkMode ? '#64748b' : '#475569', font: { weight: 'bold', family: 'Cairo', size: 11 } } },
                    y: { grid: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDarkMode ? '#64748b' : '#475569', font: { weight: 'bold', size: 11 } } }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold italic">لا توجد بيانات كافية</div>
            )}
          </div>
        </div>

        {/* Top Entities Doughnut Chart */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col items-center min-h-[400px] transition-all duration-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5">
          <div className="w-full flex items-center justify-between mb-6">
            <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                 <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              أعلى الجهات
            </h4>
          </div>
          <div className="w-full flex-1 relative">
            {Object.keys(stats.topEntities).length > 0 ? (
              <>
                <Doughnut 
                   data={{
                     labels: Object.keys(stats.topEntities),
                     datasets: [{ 
                       data: Object.values(stats.topEntities), 
                       backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'], 
                       borderWidth: 0,
                       hoverOffset: 15
                     }]
                   }}
                   options={{ 
                     responsive: true, 
                     maintainAspectRatio: false, 
                     cutout: '75%',
                     plugins: { 
                       legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, font: { weight: 'bold', family: 'Cairo', size: 11 }, padding: 30, color: isDarkMode ? '#cbd5e1' : '#475569' } } 
                     } 
                   }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                   <span className="text-4xl font-black text-slate-900 dark:text-white">92%</span>
                   <span className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">معدل الإنجاز</span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold italic">لا توجد سجلات حالية</div>
            )}
          </div>
        </div>

        {/* Top Subjects Pie Chart */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col items-center min-h-[400px] transition-all duration-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5">
          <div className="w-full flex items-center justify-between mb-6">
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                 <Stethoscope className="w-4 h-4 text-orange-600" />
              </div>
              أعلى الموضوعات
            </h4>
          </div>
          <div className="w-full flex-1">
            {Object.keys(stats.topSubjects).length > 0 ? (
              <Pie 
                data={{
                  labels: Object.keys(stats.topSubjects),
                  datasets: [{ 
                    data: Object.values(stats.topSubjects), 
                    backgroundColor: ['#f97316', '#22c55e', '#ef4444', '#a855f7', '#3b82f6'], 
                    borderWidth: 4,
                    borderColor: isDarkMode ? '#0f172a' : '#ffffff',
                    hoverOffset: 12
                  }]
                }}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { 
                    legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, font: { weight: 'bold', family: 'Cairo', size: 10 }, padding: 20, color: isDarkMode ? '#cbd5e1' : '#475569' } } 
                  } 
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold italic">بانتظار البيانات</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

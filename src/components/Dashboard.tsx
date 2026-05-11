import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Phone, Calendar, Clock, Briefcase, MapPin, Building2, Stethoscope, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Mocked response
    setStats({
      todayCount: 45,
      monthCount: 1250,
      ongoingCount: 12,
      directorActive: 8,
      topGovs: { "القاهرة": 120, "الجيزة": 95, "الاسكندرية": 80 },
      topEntities: { "التأمين الصحي": 45, "المستشفيات": 30 },
      topSubjects: { "سعار": 15, "تطعيم": 20 }
    });
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <Clock className="animate-spin text-blue-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-black text-slate-800 dark:text-white">نظرة عامة على البيانات</h2>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">متابعة فورية لإحصائيات الخط الساخن والعمليات الجارية</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-white/5 shadow-xs transition-all duration-700">
           <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95">الكل</button>
           <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition-all duration-500">الشهر الحالي</button>
           <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition-all duration-500">اليوم</button>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="stat-card group cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.iconColor} group-hover:scale-110 transition-all duration-500`}>
                 <item.icon className="w-5 h-5" />
              </div>
              <div className={`text-[9px] font-black px-2 py-0.5 rounded-full transition-colors duration-500 ${item.trend.startsWith('+') ? 'bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : item.trend.startsWith('-') ? 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                {item.trend}
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{item.label}</h3>
              <div className="flex items-end justify-between">
                 <span className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{item.value}</span>
                 <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 group-hover:translate-x-[-4px] transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Governorates Bar Chart */}
        <div className="lg:col-span-1 glass-card p-5 flex flex-col items-center min-h-[350px] transition-all duration-700">
          <div className="w-full flex items-center justify-between mb-6">
            <h4 className="font-black text-xs text-slate-800 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              أعلى المحافظات
            </h4>
            <span className="text-[9px] font-black text-slate-400 bg-slate-100/50 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase transition-colors duration-500">Monthly</span>
          </div>
          <div className="w-full flex-1">
            <Bar 
              data={{
                labels: Object.keys(stats.topGovs),
                datasets: [{ 
                  label: 'العدد', 
                  data: Object.values(stats.topGovs), 
                  backgroundColor: '#3b82f6', 
                  borderRadius: 8,
                  hoverBackgroundColor: '#2563eb',
                  barThickness: 16
                }]
              }}
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false }, tooltip: { bodyFont: { family: 'Cairo', weight: 'bold' } } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { weight: 'bold', family: 'Cairo', size: 10 } } },
                  y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: 'bold', size: 10 } } }
                }
              }}
            />
          </div>
        </div>

        {/* Top Entities Doughnut Chart */}
        <div className="lg:col-span-1 glass-card p-5 flex flex-col items-center min-h-[350px]">
          <div className="w-full flex items-center justify-between mb-6">
            <h4 className="font-black text-xs text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              أعلى الجهات
            </h4>
          </div>
          <div className="w-full flex-1 relative">
            <Doughnut 
               data={{
                 labels: Object.keys(stats.topEntities),
                 datasets: [{ 
                   data: Object.values(stats.topEntities), 
                   backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'], 
                   borderWidth: 0,
                   hoverOffset: 12
                 }]
               }}
               options={{ 
                 responsive: true, 
                 maintainAspectRatio: false, 
                 cutout: '70%',
                 plugins: { 
                   legend: { position: 'bottom', labels: { boxWidth: 8, font: { weight: 'bold', family: 'Cairo', size: 9 }, padding: 12 } } 
                 } 
               }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-3">
               <span className="text-xl font-black text-slate-800 dark:text-white">75%</span>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">الإنجاز</span>
            </div>
          </div>
        </div>

        {/* Top Subjects Pie Chart */}
        <div className="lg:col-span-1 glass-card p-5 flex flex-col items-center min-h-[350px]">
          <div className="w-full flex items-center justify-between mb-6">
            <h4 className="font-black text-xs text-slate-800 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-orange-600" />
              أعلى الموضوعات
            </h4>
          </div>
          <div className="w-full flex-1">
            <Pie 
              data={{
                labels: Object.keys(stats.topSubjects),
                datasets: [{ 
                  data: Object.values(stats.topSubjects), 
                  backgroundColor: ['#f97316', '#22c55e', '#ec4899', '#a855f7', '#3b82f6'], 
                  borderWidth: 0,
                  hoverOffset: 8
                }]
              }}
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                  legend: { position: 'bottom', labels: { boxWidth: 8, font: { weight: 'bold', family: 'Cairo', size: 9 }, padding: 12 } } 
                } 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

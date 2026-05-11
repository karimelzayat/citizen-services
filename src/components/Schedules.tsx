import React, { useState, useMemo } from 'react';
import { SCHEDULE_DATA } from '../data/schedulesData';

export default function Schedules() {
  const months = useMemo(() => {
    const m = Array.from(new Set(SCHEDULE_DATA.map(item => item.month)));
    return m.length > 0 ? m : ['مايو 2026'];
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const filteredData = useMemo(() => {
    return SCHEDULE_DATA.filter(item => item.month === selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="tab-content block pb-10">
      <h2 className="text-center text-blue-600 dark:text-blue-400 mb-8 font-black text-2xl tracking-tighter">جداول الشفتات وتوزيع المهام</h2>

      <div className="glass-card p-6 mb-8 flex flex-col md:flex-row items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden transition-all duration-700">
        <div className="absolute top-0 right-0 w-1 h-full bg-blue-600 transition-all duration-500"></div>
        
        <div>
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 transition-colors duration-500">اختر الفترة الزمنية:</label>
          <div className="text-lg font-bold text-slate-800 dark:text-white">{selectedMonth}</div>
        </div>

        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="form-input max-w-[250px] text-center mt-4 md:mt-0"
        >
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5">
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">التاريخ</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">اليوم</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">شفت 24 ساعة</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">شفت 36 ساعة</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">عطلة (9:30-12)</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">عطلة (12-2:30)</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">مجلس الوزراء (1)</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">مجلس الوزراء (2)</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">مجلس الوزراء (3)</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">الرعاية (صباحاً)</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">الرعاية (ليلاً)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-xs font-mono text-slate-500 whitespace-nowrap">{row.date}</td>
                  <td className="p-3 text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{row.day}</td>
                  <td className="p-3 text-[11px] text-slate-700 dark:text-slate-300 font-medium">{row.shift24 || '-'}</td>
                  <td className="p-3 text-[11px] text-slate-700 dark:text-slate-300 font-medium">{row.shift36 || '-'}</td>
                  <td className="p-3 text-[11px] text-slate-700 dark:text-slate-300 font-medium">{row.holidayMorning || '-'}</td>
                  <td className="p-3 text-[11px] text-slate-700 dark:text-slate-300 font-medium">{row.holidayNoon || '-'}</td>
                  <td className="p-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{row.cabinet1 || '-'}</td>
                  <td className="p-3 text-[11px] text-slate-700 dark:text-slate-300 font-medium">{row.cabinet2 || '-'}</td>
                  <td className="p-3 text-[11px] text-slate-700 dark:text-slate-300 font-medium">{row.cabinet3 || '-'}</td>
                  <td className="p-3 text-[11px] text-amber-600 dark:text-amber-400 font-medium">{row.careMorning || '-'}</td>
                  <td className="p-3 text-[11px] text-amber-600 dark:text-amber-400 font-medium">{row.careNight || '-'}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-20 text-center text-slate-400 font-bold">لا يوجد بيانات متوفرة لهذا الشهر</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

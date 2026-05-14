import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  CheckSquare,
  Calendar,
  FileText,
  HelpCircle,
  Contact,
  BookOpen,
  Home,
  Menu,
  ChevronDown,
  Briefcase,
  Layers,
  Settings,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  permissions: any;
  collapsed: boolean;
  onToggle: () => void;
  onReturnHome: () => void;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  show: boolean;
}

interface Section {
  title: string;
  showSection?: boolean;
  items: NavItem[];
}

export default function Sidebar({ activeTab, onTabChange, permissions, collapsed, onToggle, onReturnHome, onLogout }: SidebarProps) {
  const sections: Section[] = [
    {
      title: 'الخط الساخن',
      showSection: permissions?.showHotlineSection,
      items: [
        { id: 'dashboard', label: 'لوحة المؤشرات', icon: LayoutDashboard, show: permissions?.canViewDashboard },
        { id: 'newComplaint', label: 'تسجيل مكالمة', icon: PlusCircle, show: permissions?.canRegisterHotline },
        { id: 'searchComplaint', label: 'البحث', icon: Search, show: permissions?.canSearchHotline },
        { id: 'followUp', label: 'متابعة المكالمات', icon: CheckSquare, show: permissions?.canFollowUpHotline },
        { id: 'directorTab', label: 'تكليفات المدير', icon: Briefcase, show: permissions?.canViewDirectorAssignments },
        { id: 'schedulesTab', label: 'الجداول والتبديلات', icon: Calendar, show: permissions?.canViewSchedules },
        { id: 'reportsTab', label: 'التقارير', icon: FileText, show: permissions?.canViewReports },
      ]
    },
    {
      title: 'مركز المساعدة',
      showSection: permissions?.showHelpCenterSection,
      items: [
        { id: 'inquiryButton', label: 'الاستفسار عن', icon: HelpCircle, show: permissions?.canViewInquiry },
        { id: 'phonebookButton', label: 'دليل الهاتف', icon: Contact, show: permissions?.canViewPhonebook },
        { id: 'faqTab', label: 'دليل الأسئلة (FAQ)', icon: BookOpen, show: permissions?.canViewFAQ },
      ]
    }
  ];

  const [expandedSections, setExpandedSections] = useState<string[]>(sections.map(s => s.title));

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 300 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 h-screen sticky top-0 flex flex-col shadow-2xl z-50 overflow-hidden border-l border-slate-100 dark:border-white/5 transition-colors duration-700"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 transition-all duration-700">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-xl">الخط الساخن</span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 dark:text-slate-400 active:scale-90"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2 bg-white dark:bg-slate-900/40 border-b border-slate-100 dark:border-white/5">
        <button
          onClick={onReturnHome}
          className={`w-full group flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 
            ${collapsed ? 'justify-center bg-slate-50 dark:bg-slate-800 hover:bg-blue-600/10' : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700'} 
            border border-slate-100 dark:border-white/5 hover:border-blue-500/30 overflow-hidden relative shadow-sm`}
        >
          <Home className={`w-5 h-5 ${collapsed ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} />
          {!collapsed && <span className="font-bold text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">العودة للرئيسية</span>}
          {!collapsed && (
            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        <button
          onClick={onLogout}
          className={`w-full group flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 
            ${collapsed ? 'justify-center bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-500' : 'bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-500 hover:text-white'} 
            border border-rose-100 dark:border-rose-500/20 overflow-hidden relative shadow-sm`}
        >
          <LogOut className={`w-5 h-5 ${collapsed ? 'text-rose-500' : 'text-rose-400 group-hover:text-white'}`} />
          {!collapsed && <span className="font-bold text-sm">تسجيل الخروج</span>}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-6">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter(i => i.show);
          if (section.showSection === false || visibleItems.length === 0) return null;

          const isExpanded = expandedSections.includes(section.title);

          return (
            <div key={idx} className="space-y-2">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-slate-300 transition-all"
                >
                  <span>{section.title}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                </button>
              )}

              <AnimatePresence initial={false}>
                {(isExpanded || collapsed) && (
                  <motion.ul
                    initial={collapsed ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {visibleItems.map(item => (
                      <li key={item.id}>
                        <button
                          onClick={() => onTabChange(item.id)}
                          className={`w-full group flex items-center gap-4 p-2.5 rounded-[24px] transition-all duration-300 
                            ${activeTab === item.id
                              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 font-black scale-[1.02]'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'} 
                            ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                          <item.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-all group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                          {!collapsed && <span className="text-sm font-black truncate tracking-tight">{item.label}</span>}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer / User Info */}
      <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60">
        <div className={`flex items-center gap-4 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/20 uppercase transition-all hover:scale-105 active:scale-95">
            {permissions?.role?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{permissions?.role || 'مستخدم'}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">متصل الآن</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

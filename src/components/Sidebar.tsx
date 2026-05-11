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
  Layers
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  permissions: any;
  collapsed: boolean;
  onToggle: () => void;
  onReturnHome: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  show: boolean;
}

interface Section {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ activeTab, onTabChange, permissions, collapsed, onToggle, onReturnHome }: SidebarProps) {
  const sections: Section[] = [
    {
      title: 'الرئيسية',
      items: [
        { id: 'dashboard', label: 'لوحة المؤشرات', icon: LayoutDashboard, show: true },
      ]
    },
    {
      title: 'إدارة الشكاوى',
      items: [
        { id: 'newComplaint', label: 'تسجيل مكالمة', icon: PlusCircle, show: true },
        { id: 'searchComplaint', label: 'البحث', icon: Search, show: true },
        { id: 'followUp', label: 'متابعة المكالمات', icon: CheckSquare, show: true },
      ]
    },
    {
      title: 'العمل والتكليفات',
      items: [
        { id: 'directorTab', label: 'تكليفات المدير', icon: Briefcase, show: true },
        { id: 'schedulesTab', label: 'الجداول والتبديلات', icon: Calendar, show: true },
        { id: 'reportsTab', label: 'التقارير', icon: FileText, show: true },
      ]
    },
    {
      title: 'مركز المساعدة',
      items: [
        { id: 'inquiryButton', label: 'الاستفسار عن', icon: HelpCircle, show: true },
        { id: 'phonebookButton', label: 'دليل الهاتف', icon: Contact, show: true },
        { id: 'faqTab', label: 'دليل الأسئلة (FAQ)', icon: BookOpen, show: true },
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
      className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 h-screen sticky top-0 flex flex-col shadow-2xl z-50 overflow-hidden border-l border-slate-100 dark:border-white/5 transition-colors duration-700"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-md transition-all duration-700">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-wide">الخط الساخن</span>
          </motion.div>
        )}
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button 
          onClick={onReturnHome}
          className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 
            ${collapsed ? 'justify-center bg-slate-50 dark:bg-slate-800 hover:bg-blue-600/10' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'} 
            border border-slate-200/60 dark:border-white/5 hover:border-blue-500/30 overflow-hidden relative`}
        >
          <Home className={`w-5 h-5 ${collapsed ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500'}`} />
          {!collapsed && <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">العودة للرئيسية</span>}
          {!collapsed && (
            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-6">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter(i => i.show);
          if (visibleItems.length === 0) return null;

          const isExpanded = expandedSections.includes(section.title);

          return (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <button 
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span>{section.title}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3 h-3" />
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
                          className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                            ${activeTab === item.id 
                              ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 dark:border-blue-500/20' 
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'} 
                            ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                          <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                          {!collapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
                          {activeTab === item.id && !collapsed && (
                            <motion.div 
                              layoutId="activeIndicator"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                            />
                          )}
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
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/30">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {permissions?.role?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{permissions?.role || 'مستخدم'}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">متصل الآن</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

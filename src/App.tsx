import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, isConfigured } from './lib/firebase';
import { getUserPermissions } from './services/dataService';
import { UserPermissions } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewComplaintForm from './components/NewComplaintForm';
import DirectorAssignments from './components/DirectorAssignments';
import SearchComplaints from './components/SearchComplaints';
import Schedules from './components/Schedules';
import FAQ from './components/FAQ';
import InquiryDatabase from './components/InquiryDatabase';
import FollowUp from './components/FollowUp';
import Reports from './components/Reports';
import CabinetTracking from './components/CabinetTracking';
import AdminView from './components/AdminView';
import SettingsView from './components/SettingsView';
import PhonebookModal from './components/PhonebookModal';
import InquiryModal from './components/InquiryModal';
import HotlineTreeModal from './components/HotlineTreeModal';
import RankingModal from './components/RankingModal';
import { Home, PlusCircle, Search, Settings, FileText, Bell, GitBranch, Trophy, Menu, X, ChevronRight, Hash, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

enum ViewMode {
  Landing = 'landing',
  Hotline = 'hotline',
  Admin = 'admin'
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Landing);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isPhonebookModalOpen, setIsPhonebookModalOpen] = useState(false);
  const [isHotlineTreeOpen, setIsHotlineTreeOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState('register');
  const [loading, setLoading] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      const tab = e.detail;
      if (tab === 'search') {
        setActiveTab('searchComplaint');
      } else {
        setActiveTab(tab);
      }
    };
    
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("Attempting popup login...");
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      alert("فشل تسجيل الدخول: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setViewMode(ViewMode.Landing);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed, user:", u?.email || "null");
      
      if (!u) {
        setUser(null);
        setPermissions({ 
          role: 'Guest', 
          canRegister: true, 
          canSearch: true, 
          canEditAny: false, 
          showMonthlyCount: false, 
          canFollowUp: true, 
          canGenerateReports: false, 
          canViewHotline: true, 
          canViewAdminOngoing: false 
        });
      } else {
        console.log("Successfully identified user:", u.email);
        setUser(u);
        if (u.email) {
          const perms = await getUserPermissions(u.email);
          console.log("Permissions assigned:", perms.role);
          setPermissions(perms);
        }
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-blue-600 transition-colors duration-300">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600/10 rounded-full animate-pulse"></div>
          </div>
        </div>
        <span className="mt-6 font-bold text-lg tracking-wider animate-pulse">جاري التحقق من الصلاحيات...</span>
        <button 
          onClick={handleLogin}
          className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg"
        >
          تسجيل الدخول يدوياً
        </button>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <div className="animate-fade-in">
        {(() => {
          switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'newComplaint': return <NewComplaintForm />;
            case 'directorTab': return <DirectorAssignments />;
            case 'searchComplaint': return <SearchComplaints />;
            case 'followUp': return <FollowUp />;
            case 'schedulesTab': return <Schedules />;
            case 'reportsTab': return <Reports />;
            case 'faqTab': return <FAQ />;
            case 'settingsTab': return <SettingsView />;
            default: return <Dashboard />;
          }
        })()}
      </div>
    );
  };

  if (viewMode === ViewMode.Landing) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-700 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Theme Toggle for Landing */}
        <div className="absolute top-8 left-8 z-50">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white hover:scale-110 transition-all active:scale-95"
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-blue-600" />}
          </button>
        </div>

        <div className="w-full max-w-5xl relative z-10">
          <div className="text-center mb-16 space-y-4 animate-slide-in-down">
             <div className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold tracking-widest uppercase mb-2">منظومة خدمة المواطنين الذكية</div>
             <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">الخط الساخن لخدمة المواطنين</h1>
             <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">المنصة الشاملة لإدارة الشكاوى والمكالمات وتكليفات الإدارة العامة بوزارة الصحة والسكان</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div 
              onClick={() => { setViewMode(ViewMode.Hotline); setActiveTab('newComplaint'); }}
              className="group relative bg-white dark:bg-slate-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500">
                <i className="fas fa-headset text-4xl text-blue-600 group-hover:text-white transition-colors duration-500"></i>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                الخط الساخن
                <i className="fas fa-arrow-left text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">تسجيل المكالمات، البحث، متابعة الحالات، ومركز المعرفة الشامل (FAQ)</p>
              <div className="mt-8 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">تسجيل سريع</span>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">مخططات ذكية</span>
              </div>
            </div>

            <div 
              onClick={() => setViewMode(ViewMode.Admin)}
              className="group relative bg-white dark:bg-slate-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-500">
                <i className="fas fa-user-tie text-4xl text-emerald-600 group-hover:text-white transition-colors duration-500"></i>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                لوحة الإدارة
                <i className="fas fa-arrow-left text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">متابعة التكليفات، إدارة الشكاوى الجارية، وتصحيح التوجيه الخاطئ</p>
              <div className="mt-8 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">تقارير متقدمة</span>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">توجيه ذكي</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen transition-all duration-700 overflow-x-hidden ${isDarkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in transition-opacity duration-700"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {viewMode === ViewMode.Landing ? null : viewMode === ViewMode.Hotline ? (
        <div className={`fixed inset-y-0 right-0 z-[70] lg:relative lg:block transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              if (tab === 'inquiryButton') setIsInquiryModalOpen(true);
              else if (tab === 'phonebookButton') setIsPhonebookModalOpen(true);
              else setActiveTab(tab);
              setIsMobileMenuOpen(false); // Close on selection
            }} 
            permissions={permissions} 
            collapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onReturnHome={() => setViewMode(ViewMode.Landing)}
            onLogout={handleLogout}
          />
        </div>
      ) : (
        <div className={`fixed inset-y-0 right-0 z-[70] lg:relative lg:block transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <AdminSidebar 
            activeSubTab={adminSubTab}
            onSubTabChange={(t) => { setAdminSubTab(t); setIsMobileMenuOpen(false); }}
            onReturnHome={() => setViewMode(ViewMode.Landing)}
            onLogout={handleLogout}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-700 bg-slate-50 dark:bg-slate-950">
        {/* Top Header / Welcome Bar */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-40 transition-all duration-700">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="lg:hidden w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all shadow-sm"
             >
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>

             <div className="flex flex-col">
               {user ? (
                 <div className="flex items-center gap-3 text-slate-950 dark:text-white font-black text-base md:text-lg tracking-tight">
                    <span className="truncate max-w-[150px] md:max-w-none">{user?.email?.split('@')[0]}</span>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 dark:border-blue-800/30">{permissions?.role}</span>
                 </div>
               ) : (
                 <button 
                   onClick={handleLogin}
                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                 >
                   <i className="fab fa-google"></i>
                   تسجيل الدخول
                 </button>
               )}
             </div>
           </div>

           <div className="flex items-center gap-3 md:gap-6">
              {/* Stats & Icons */}
              <div className="hidden sm:flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">مكالماتك اليوم</span>
                   <span className="text-base font-black text-blue-600 leading-none">42</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                   <Hash className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setIsHotlineTreeOpen(true)}
                   className="nav-tool-btn group" 
                   title="شجرة الخط الساخن"
                 >
                   <GitBranch className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                 </button>
                 <button 
                   onClick={() => setIsRankingModalOpen(true)}
                   className="nav-tool-btn group" 
                   title="ترتيب الموظفين"
                 >
                   <Trophy className="w-4 h-4 text-slate-500 group-hover:text-amber-500 transition-colors" />
                 </button>
                 <button className="nav-tool-btn group" title="الإشعارات">
                   <Bell className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                   <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                 </button>
                 
                 <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-1 hidden xs:block"></div>

                 <button 
                   onClick={() => setIsDarkMode(!isDarkMode)} 
                   className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all shadow-md border border-slate-200 dark:border-white/10 group overflow-hidden"
                 >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                       <motion.div
                         initial={false}
                         animate={{ 
                           y: isDarkMode ? -30 : 0,
                           opacity: isDarkMode ? 0 : 1
                         }}
                         className="absolute"
                       >
                         <Moon className="w-6 h-6 text-blue-600" />
                       </motion.div>
                       <motion.div
                         initial={false}
                         animate={{ 
                           y: isDarkMode ? 0 : 30,
                           opacity: isDarkMode ? 1 : 0
                         }}
                         className="absolute"
                       >
                         <Sun className="w-6 h-6 text-amber-500" />
                       </motion.div>
                    </div>
                 </button>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-6 flex-1 bg-slate-50/50 dark:bg-transparent transition-colors duration-700">
          <div className="w-full max-w-[2200px] mx-auto flex flex-col xl:flex-row gap-6 px-4">
            <div className="flex-1 min-w-0 bg-white dark:bg-slate-900/30 backdrop-blur-md rounded-[32px] p-6 md:p-8 transition-all duration-700 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none">
               {viewMode === ViewMode.Hotline ? renderContent() : <AdminView activeSubTab={adminSubTab} />}
            </div>

            {viewMode === ViewMode.Hotline && (
              <div className="w-full xl:w-[300px] flex flex-col gap-6 flex-shrink-0">
                 <InquiryDatabase />
                 <CabinetTracking />
                 
                 <div className="glass-card p-6 bg-linear-to-br from-indigo-600 to-blue-700 text-white shadow-blue-500/20 hover:scale-[1.02] transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                          <i className="fas fa-life-ring text-base"></i>
                       </div>
                       <span className="px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-bold uppercase">مساعدة</span>
                    </div>
                    <h4 className="text-lg font-bold mb-1">هل تحتاج مساعدة؟</h4>
                    <p className="text-white/70 text-[10px] mb-4 leading-relaxed">فريقنا متاح دائماً لمساعدتك في حل أي مشكلات تقنية أو استفسارات حول النظام.</p>
                    <button className="w-full py-3 bg-white text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors shadow-xl">اتصل بالدعم الفني</button>
                 </div>
              </div>
            )}
          </div>
        </div>

        <footer className="p-8 mt-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-semibold bg-white/30 dark:bg-black/10 backdrop-blur-sm border-t border-slate-200 dark:border-white/5">
           <div className="flex items-center gap-4">
             <span>جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</span>
             <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
             <span className="text-slate-600 dark:text-slate-200">الإدارة العامة لخدمة المواطنين - وزارة الصحة والسكان</span>
           </div>
           <div className="flex items-center gap-2">
             <span>تم التطوير بواسطة:</span>
             <span className="text-blue-600 font-bold">Karim El-Zayat</span>
           </div>
        </footer>
      </main>

      <InquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
      <PhonebookModal isOpen={isPhonebookModalOpen} onClose={() => setIsPhonebookModalOpen(false)} />
      <HotlineTreeModal isOpen={isHotlineTreeOpen} onClose={() => setIsHotlineTreeOpen(false)} />
      <RankingModal isOpen={isRankingModalOpen} onClose={() => setIsRankingModalOpen(false)} />
    </div>
  );
}

function AdminSidebar({ activeSubTab, onSubTabChange, onReturnHome, onLogout }: { activeSubTab: string, onSubTabChange: (t: string) => void, onReturnHome: () => void, onLogout: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 h-screen sticky top-0 w-full lg:w-[300px] flex flex-col shadow-2xl z-50 overflow-hidden border-l border-slate-200 dark:border-white/5 font-bold transition-all duration-700">
      <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 transition-all duration-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-slate-900 dark:text-white tracking-tight text-lg">لوحة الإدارة</span>
        </div>
      </div>
      
      <div className="p-4 space-y-2 bg-white dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
        <button 
          onClick={onReturnHome}
          className="w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-100 dark:border-white/5 hover:border-red-500/30 overflow-hidden relative shadow-sm"
        >
          <Home className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span className="font-bold text-sm text-slate-600 dark:text-slate-300">العودة للرئيسية</span>
          <div className="absolute right-0 top-0 h-full w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button 
          onClick={onLogout}
          className="w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-500 hover:text-white border border-rose-100 dark:border-rose-500/20 overflow-hidden relative shadow-sm"
        >
          <X className="w-5 h-5 text-rose-500 group-hover:text-white" />
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        <div className="space-y-2">
          <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">العمليات الإدارية</div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onSubTabChange('register')}
                className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                  ${activeSubTab === 'register' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <PlusCircle className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeSubTab === 'register' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="font-bold text-sm">تسجيل شكوى</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSubTabChange('search')}
                className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                  ${activeSubTab === 'search' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <Search className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeSubTab === 'search' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="font-bold text-sm">البحث</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSubTabChange('reports')}
                className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                  ${activeSubTab === 'reports' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <FileText className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeSubTab === 'reports' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="font-bold text-sm">التقارير</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

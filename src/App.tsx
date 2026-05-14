import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
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
import { Bell, GitBranch, Trophy, Menu, X, Hash, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

enum ViewMode {
  Landing = 'landing',
  Main = 'main'
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
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
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
      if (!u) {
        setUser(null);
        setPermissions({ 
          role: 'Guest', 
          canViewHotlineSection: false, canViewAdminSection: false, canViewHelpCenterSection: false,
          canViewDashboard: false, canRegisterHotline: false, canSearchHotline: false, canFollowUpHotline: false,
          canRegisterAdminWork: false, canViewDirectorAssignments: false, canViewSchedules: false, canViewReports: false, canViewSettings: false,
          canViewInquiry: false, canViewPhonebook: false, canViewFAQ: false,
          canEditAny: false, showMonthlyCount: false, canApproveSwaps: false
        });
      } else {
        setUser(u);
        if (u.email) {
          const perms = await getUserPermissions(u.email);
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
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <span className="font-bold text-lg tracking-wider animate-pulse">جاري التحقق من الصلاحيات...</span>
        <button onClick={handleLogin} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg">تسجيل الدخول يدوياً</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'newComplaint': return <NewComplaintForm />;
      case 'searchComplaint': return <SearchComplaints />;
      case 'followUp': return <FollowUp />;
      case 'directorTab': return <DirectorAssignments />;
      case 'schedulesTab': return <Schedules />;
      case 'reportsTab': return <Reports />;
      case 'faqTab': return <FAQ />;
      case 'settingsTab': return <SettingsView />;
      case 'adminWork': return <AdminView activeSubTab="register" />;
      default: return <Dashboard />;
    }
  };

  if (viewMode === ViewMode.Landing) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-8 left-8 z-50">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white transition-all">
            {isDarkMode ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-blue-600" />}
          </button>
        </div>
        <div className="w-full max-w-5xl relative z-10 text-center">
          <div className="mb-16 space-y-4">
             <div className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold tracking-widest uppercase mb-2">منظومة خدمة المواطنين الذكية</div>
             <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">الخط الساخن لخدمة المواطنين</h1>
             <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">المنصة الشاملة لإدارة الشكاوى والمكالمات وتكليفات الإدارة العامة بوزارة الصحة والسكان</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={() => { setViewMode(ViewMode.Main); setActiveTab('newComplaint'); }} className="group bg-white dark:bg-slate-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                <i className="fas fa-headset text-4xl text-blue-600 group-hover:text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">الخط الساخن</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">تسجيل المكالمات، البحث، متابعة الحالات، ومركز المعرفة الشامل (FAQ)</p>
            </div>
            <div onClick={() => { setViewMode(ViewMode.Main); setActiveTab('directorTab'); }} className="group bg-white dark:bg-slate-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:scale-110 transition-all">
                <i className="fas fa-user-tie text-4xl text-emerald-600 group-hover:text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">لوحة الإدارة</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">متابعة التكليفات، إدارة الشكاوى الجارية، وتصحيح التوجيه الخاطئ</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen transition-all duration-700 ${isDarkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)} />}
      <div className={`fixed inset-y-0 right-0 z-[70] lg:relative lg:block transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === 'inquiryButton') setIsInquiryModalOpen(true);
            else if (tab === 'phonebookButton') setIsPhonebookModalOpen(true);
            else setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }} 
          permissions={permissions} 
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onReturnHome={() => setViewMode(ViewMode.Landing)}
          onLogout={handleLogout}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        <header className="h-20 flex items-center justify-between px-6 md:px-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-40">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-400">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
             <div className="flex flex-col">
               {user ? (
                 <div className="flex items-center gap-3 text-slate-950 dark:text-white font-black text-lg">
                    <span>{user?.email?.split('@')[0]}</span>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] uppercase border border-blue-100 dark:border-blue-800/30">{permissions?.role}</span>
                 </div>
               ) : (
                 <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg">تسجيل الدخول</button>
               )}
             </div>
           </div>
           <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2">
                 <button onClick={() => setIsHotlineTreeOpen(true)} className="nav-tool-btn group" title="شجرة الخط الساخن"><GitBranch className="w-4 h-4 text-slate-500 group-hover:text-blue-600" /></button>
                 <button onClick={() => setIsRankingModalOpen(true)} className="nav-tool-btn group" title="ترتيب الموظفين"><Trophy className="w-4 h-4 text-slate-500 group-hover:text-amber-500" /></button>
                 <button className="nav-tool-btn group" title="الإشعارات"><Bell className="w-4 h-4 text-slate-500 group-hover:text-blue-600" /></button>
                 <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/10">
                    {isDarkMode ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-blue-600" />}
                 </button>
              </div>
           </div>
        </header>

        <div className="p-4 md:p-6 flex-1 bg-slate-50/50 dark:bg-transparent">
          <div className="w-full max-w-[2200px] mx-auto flex flex-col xl:flex-row gap-6 px-4">
            <div className="flex-1 min-w-0 bg-white dark:bg-slate-900/30 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-slate-200/60 dark:border-white/5 shadow-2xl">
               <div className="animate-fade-in">{renderContent()}</div>
            </div>
            {activeTab === 'newComplaint' && (
              <div className="w-full xl:w-[300px] flex flex-col gap-6 flex-shrink-0">
                 <InquiryDatabase />
                 <CabinetTracking />
              </div>
            )}
          </div>
        </div>

        <footer className="p-8 mt-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-semibold bg-white/30 dark:bg-black/10 backdrop-blur-sm border-t border-slate-200 dark:border-white/5 text-center">
           <div>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - الإدارة العامة لخدمة المواطنين - وزارة الصحة والسكان</div>
           <div className="flex items-center gap-2">تم التطوير بواسطة: <span className="text-blue-600 font-bold">Karim El-Zayat</span></div>
        </footer>
      </main>

      <InquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
      <PhonebookModal isOpen={isPhonebookModalOpen} onClose={() => setIsPhonebookModalOpen(false)} />
      <HotlineTreeModal isOpen={isHotlineTreeOpen} onClose={() => setIsHotlineTreeOpen(false)} />
      <RankingModal isOpen={isRankingModalOpen} onClose={() => setIsRankingModalOpen(false)} />
    </div>
  );
}

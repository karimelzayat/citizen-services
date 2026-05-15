import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, isConfigured } from './lib/firebase';
import { getUserPermissions, getUserMonthlyCallCount } from './services/dataService';
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
import RankingPopover from './components/RankingModal';
import NotificationsPopover from './components/NotificationsPopover';
import { listenToNotifications } from './services/dataService';
import { AppNotification } from './types';
import { ToastContainer } from './components/ui/Toast';
import { toast } from './lib/toast';
import { Home, PlusCircle, Search, Settings, FileText, Bell, GitBranch, Trophy, Menu, X, LogOut, ChevronRight, Hash, Sun, Moon, Layers, Briefcase, Calendar, Users, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_CAPABILITIES } from './constants';

enum ViewMode {
  Landing = 'landing',
  Hotline = 'hotline',
  Admin = 'admin',
  Settings = 'settings'
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
  const [monthlyCallCount, setMonthlyCallCount] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const fetchMonthlyCount = async (email: string) => {
    const count = await getUserMonthlyCallCount(email);
    setMonthlyCallCount(count);
  };

  useEffect(() => {
    if (user?.email) {
      fetchMonthlyCount(user.email);
    }
    
    const handleComplaintAdded = () => {
      if (user?.email) {
        fetchMonthlyCount(user.email);
      }
    };
    
    window.addEventListener('complaintAdded', handleComplaintAdded);
    return () => window.removeEventListener('complaintAdded', handleComplaintAdded);
  }, [user]);

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

  useEffect(() => {
    if (user?.email) {
      const unsubscribe = listenToNotifications(user.email, (data) => {
        setNotifications(data as any);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      console.error("Login failed", error);
      toast.error("فشل تسجيل الدخول: " + error.message);
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
          ...DEFAULT_CAPABILITIES,
          role: 'Guest',
        } as any);
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

  useEffect(() => {
    const isAnyModalOpen = isHotlineTreeOpen || isRankingModalOpen || isInquiryModalOpen || isPhonebookModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isHotlineTreeOpen, isRankingModalOpen, isInquiryModalOpen, isPhonebookModalOpen]);

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
            case 'newComplaint': return <NewComplaintForm permissions={permissions} />;
            case 'directorTab': return <DirectorAssignments permissions={permissions} />;
            case 'searchComplaint': return <SearchComplaints permissions={permissions} />;
            case 'followUp': return <FollowUp permissions={permissions} />;
            case 'schedulesTab': return <Schedules permissions={permissions} />;
            case 'reportsTab': return <Reports permissions={permissions} />;
            case 'faqTab': return <FAQ permissions={permissions} />;
            case 'settingsTab': return <SettingsView />;
            default: return <Dashboard />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-700 ${isDarkMode ? 'dark bg-slate-950' : 'bg-white'}`} dir="rtl">
      {/* Toast Messages */}
      <ToastContainer />
      
      {/* Portals for Modals */}
      <InquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
      <PhonebookModal isOpen={isPhonebookModalOpen} onClose={() => setIsPhonebookModalOpen(false)} />
      <HotlineTreeModal isOpen={isHotlineTreeOpen} onClose={() => setIsHotlineTreeOpen(false)} />

      {viewMode === ViewMode.Landing ? (
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors duration-700 flex items-center justify-center p-6 relative overflow-hidden">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in items-stretch">
              {!user ? (
                <div
                  onClick={handleLogin}
                  className="group relative bg-blue-600 p-10 rounded-[40px] border border-blue-500 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-[0.1] rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500">
                    <i className="fab fa-google text-4xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    تسجيل الدخول
                  </h2>
                  <p className="text-blue-100 leading-relaxed font-medium">قم بتسجيل الدخول بحساب جوجل الخاص بك للوصول إلى المنظومة</p>
                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white">
                    <span className="px-3 py-1 bg-white/20 rounded-full">دخول آمن</span>
                  </div>
                </div>
              ) : (permissions?.role === 'Guest') ? (
                <div
                  onClick={handleLogout}
                  className="group relative bg-red-600 p-10 rounded-[40px] border border-red-500 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/40 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-[0.1] rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500">
                    <LogOut className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    تغيير الحساب
                  </h2>
                  <p className="text-red-100 leading-relaxed font-medium">هذا الحساب ({user.email}) غير مصرح له بالدخول. اضغط لتسجيل الخروج والدخول بحساب آخر.</p>
                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white">
                    <span className="px-3 py-1 bg-white/20 rounded-full">حساب غير مسجل</span>
                  </div>
                </div>
              ) : null}

              {permissions?.showHotlineSection && (
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
              )}

              {permissions?.showAdminSection && (
                <div
                  onClick={() => { setViewMode(ViewMode.Admin); setActiveTab('adminWork'); }}
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
              )}

              {permissions?.canManageUsers && (
                <div
                  onClick={() => { setViewMode(ViewMode.Settings); }}
                  className="group relative bg-white dark:bg-slate-900/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/5 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600 opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:scale-110 transition-all duration-500">
                    <ShieldCheck className="w-10 h-10 text-amber-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    الصلاحيات
                    <i className="fas fa-arrow-left text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">إدارة أدوار المستخدمين وتعديل صلاحيات الوصول للمنظومة</p>
                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full">أدوار المستخدمين</span>
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full">تحكم كامل</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in transition-opacity duration-700"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          <div className={`fixed inset-y-0 right-0 z-[70] transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} w-[360px] lg:w-auto`}>
            {viewMode === ViewMode.Hotline ? (
              <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                  if (tab === 'inquiryButton') setIsInquiryModalOpen(true);
                  else if (tab === 'phonebookButton') setIsPhonebookModalOpen(true);
                  else if (tab === 'rankingButton') {} // Hover handled in header
                  else if (tab === 'treeButton') setIsHotlineTreeOpen(true);
                  else {
                    setActiveTab(tab);
                    // Scroll to top smoothly when switching tabs
                    const mainElement = document.querySelector('main');
                    if (mainElement) {
                      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                  setIsMobileMenuOpen(false);
                }}
                permissions={permissions}
                collapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onReturnHome={() => setViewMode(ViewMode.Landing)}
                onLogout={handleLogout}
              />
            ) : (
              <AdminSidebar
                activeSubTab={viewMode === ViewMode.Admin ? adminSubTab : 'userManagement'}
                onSubTabChange={(t) => { 
                  setAdminSubTab(t); 
                  const mainElement = document.querySelector('main');
                  if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsMobileMenuOpen(false); 
                }}
                onReturnHome={() => setViewMode(ViewMode.Landing)}
                onLogout={handleLogout}
                permissions={permissions}
                collapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            )}
          </div>

          <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out bg-slate-50 dark:bg-slate-950 overflow-y-auto ${isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-[360px]'}`}>
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
                      <span className="truncate max-w-[150px] md:max-w-none">{permissions?.employeeData?.name || user?.displayName || user?.email?.split('@')[0]}</span>
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
                <div className="hidden sm:flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">مكالماتك الشهر الحالي</span>
                    <span className="text-base font-black text-blue-600 leading-none">{monthlyCallCount}</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setIsHotlineTreeOpen(true)} className="nav-tool-btn group" title="شجرة الخط الساخن">
                    <GitBranch className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </button>
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsRankingModalOpen(true)}
                    onMouseLeave={() => setIsRankingModalOpen(false)}
                  >
                    <button className="nav-tool-btn group" title="ترتيب الموظفين">
                      <Trophy className="w-4 h-4 text-slate-500 group-hover:text-amber-500 transition-colors" />
                    </button>
                    <RankingPopover isOpen={isRankingModalOpen} />
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                      className="nav-tool-btn group" 
                      title="الإشعارات"
                    >
                      <Bell className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      {notifications.filter(n => n.status === 'unread').length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
                          {notifications.filter(n => n.status === 'unread').length}
                        </span>
                      )}
                    </button>
                    <NotificationsPopover 
                      isOpen={isNotificationsOpen} 
                      onClose={() => setIsNotificationsOpen(false)} 
                      notifications={notifications} 
                    />
                  </div>

                  <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-1 hidden xs:block"></div>

                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-950 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all shadow-md border border-slate-200 dark:border-white/10 group overflow-hidden"
                  >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <motion.div initial={false} animate={{ y: isDarkMode ? -30 : 0, opacity: isDarkMode ? 0 : 1 }} className="absolute">
                        <Moon className="w-6 h-6 text-blue-600" />
                      </motion.div>
                      <motion.div initial={false} animate={{ y: isDarkMode ? 0 : 30, opacity: isDarkMode ? 1 : 0 }} className="absolute">
                        <Sun className="w-6 h-6 text-amber-500" />
                      </motion.div>
                    </div>
                  </button>
                </div>
              </div>
            </header>

            <div className="p-4 md:p-6 flex-1 bg-slate-50/50 dark:bg-transparent transition-colors duration-700">
              <div className="w-full max-w-[1700px] mx-auto flex flex-col xl:flex-row gap-6 px-4">
                <div className="flex-1 min-w-0 bg-white dark:bg-slate-900/30 backdrop-blur-md rounded-[32px] p-6 md:p-8 transition-colors duration-700 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                  {viewMode === ViewMode.Hotline ? renderContent() : viewMode === ViewMode.Admin ? <AdminView activeSubTab={adminSubTab} permissions={permissions} /> : <SettingsView />}
                </div>

                {viewMode === ViewMode.Hotline && (
                  <div className="w-full xl:w-[420px] flex flex-col gap-6 flex-shrink-0 sticky top-24 self-start">
                    <InquiryDatabase />
                    <CabinetTracking />
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
        </>
      )}
    </div>
  );
}

function AdminSidebar({ activeSubTab, onSubTabChange, onReturnHome, onLogout, permissions, collapsed, onToggle }: { activeSubTab: string, onSubTabChange: (t: string) => void, onReturnHome: () => void, onLogout: () => void, permissions: UserPermissions | null, collapsed: boolean, onToggle: () => void }) {
  const isPermissionsMode = activeSubTab === 'userManagement';

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 360 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 h-screen w-full lg:w-[360px] flex flex-col shadow-2xl z-50 overflow-hidden border-l border-slate-200 dark:border-white/5 font-bold transition-all duration-700"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 transition-all duration-700">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${isPermissionsMode ? 'bg-amber-600 shadow-amber-500/20' : 'bg-red-600 shadow-red-500/20'}`}>
              {isPermissionsMode ? <ShieldCheck className="w-5 h-5 text-white" /> : <Settings className="w-5 h-5 text-white" />}
            </div>
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-lg">
              {isPermissionsMode ? 'الصلاحيات' : 'لوحة الإدارة'}
            </span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 dark:text-slate-400 active:scale-90"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 space-y-2 bg-white dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
        <button
          onClick={onReturnHome}
          className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 
            ${collapsed ? 'justify-center bg-slate-50 dark:bg-slate-800 hover:bg-red-600/10' : 'bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700'} 
            border border-slate-100 dark:border-white/5 hover:border-red-500/30 overflow-hidden relative shadow-sm`}
        >
          <Home className={`w-5 h-5 ${collapsed ? 'text-red-600' : 'text-slate-400 group-hover:text-red-500'}`} />
          {!collapsed && <span className="font-bold text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">العودة للرئيسية</span>}
          {!collapsed && (
            <div className="absolute right-0 top-0 h-full w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        <button
          onClick={onLogout}
          className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 
            ${collapsed ? 'justify-center bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-500' : 'bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-500 hover:text-white'} 
            border border-rose-100 dark:border-rose-500/20 overflow-hidden relative shadow-sm`}
        >
          <LogOut className={`w-5 h-5 ${collapsed ? 'text-rose-500' : 'text-rose-400 group-hover:text-white'}`} />
          {!collapsed && <span className="font-bold text-sm">تسجيل الخروج</span>}
        </button>
      </div>
      
      {!isPermissionsMode && (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <div className="space-y-2">
            {!collapsed && <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">العمليات الإدارية</div>}
            <ul className="space-y-1">
              {permissions?.canRegisterAdminWork && (
                <li>
                  <button
                    onClick={() => onSubTabChange('adminWork')}
                    className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                      ${activeSubTab === 'adminWork' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} 
                      ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Layers className={`w-5 h-5 ${activeSubTab === 'adminWork' ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:scale-110'}`} />
                    {!collapsed && <span className="font-bold text-sm">تسجيل عمل الإدارة</span>}
                  </button>
                </li>
              )}
              {permissions?.showAdminSection && (
                <li>
                  <button
                    onClick={() => onSubTabChange('adminSearch')}
                    className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                      ${activeSubTab === 'adminSearch' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} 
                      ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Search className={`w-5 h-5 ${activeSubTab === 'adminSearch' ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:scale-110'}`} />
                    {!collapsed && <span className="font-bold text-sm">بحث السجلات</span>}
                  </button>
                </li>
              )}
              {permissions?.canViewReports && (
                <li>
                  <button
                    onClick={() => onSubTabChange('reportsTab')}
                    className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                      ${activeSubTab === 'reportsTab' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} 
                      ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <FileText className={`w-5 h-5 ${activeSubTab === 'reportsTab' ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:scale-110'}`} />
                    {!collapsed && <span className="font-bold text-sm">التقارير</span>}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}

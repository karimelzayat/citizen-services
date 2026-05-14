import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Lock, 
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getRoleCapabilities,
  updateRoleCapabilities
} from '../services/dataService';
import { ROLE_CAPABILITIES } from '../constants';
import { UserRole } from '../types';
import EmployeeManagement from './EmployeeManagement';

export default function SettingsView() {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'users' | 'roles'>('users');
  const [roleCapabilities, setRoleCapabilities] = useState<any>(ROLE_CAPABILITIES);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRole | null>(null);
  const [isSavingRole, setIsSavingRole] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const rolesData = await getRoleCapabilities();
    if (rolesData && Object.keys(rolesData).length > 0) {
      setRoleCapabilities(rolesData);
    }
  };

  const handleUpdateRoleCapability = async (role: UserRole, key: string, value: boolean) => {
    const newCaps = { ...roleCapabilities[role], [key]: value };
    setRoleCapabilities({
      ...roleCapabilities,
      [role]: newCaps
    });
  };

  const saveRoleCapabilities = async (role: UserRole) => {
    setIsSavingRole(true);
    try {
      await updateRoleCapabilities(role, roleCapabilities[role]);
      alert('تم حفظ صلاحيات الدور بنجاح');
    } catch (e) {
      alert('خطأ في الحفظ');
    } finally {
      setIsSavingRole(false);
    }
  };

  const roles = Object.keys(ROLE_CAPABILITIES) as UserRole[];

  const capabilityLabels: Record<string, string> = {
    showHotlineSection: "قسم الخط الساخن",
    showAdminSection: "قسم لوحة الإدارة",
    canViewDashboard: "لوحة المؤشرات",
    canRegisterHotline: "تسجيل مكالمة",
    canSearchHotline: "البحث",
    canFollowUpHotline: "متابعة المكالمات",
    canRegisterAdminWork: "تسجيل عمل الإدارة",
    canRegisterOngoing: "زر الجاري",
    canRegisterUnregistered: "زر شكاوى غير مسجلة",
    canRegisterWrongDirection: "زر توجيه خطأ",
    canViewReports: "التقارير",
    canManageUsers: "إدارة الموظفين"
  };

  return (
    <div className="space-y-8 animate-fade-in RTL">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Shield className="w-5 h-5" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">إدارة الصلاحيات والموظفين</h2>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-medium">التحكم في وصول الموظفين وتخصيص تبويبات النظام لكل موظف بشكل مستقل</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
           <button 
             onClick={() => setActiveSettingsTab('users')}
             className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeSettingsTab === 'users' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             شؤون الموظفين
           </button>
           <button 
             onClick={() => setActiveSettingsTab('roles')}
             className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeSettingsTab === 'roles' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             قوالب الصلاحيات
           </button>
        </div>
      </div>

      {activeSettingsTab === 'users' ? (
        <EmployeeManagement />
      ) : (
        <div className="grid grid-cols-1 gap-8">
           <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[40px] p-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                تعديل صلاحيات الأدوار الوظيفية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {roles.map(role => (
                   <div 
                     key={role} 
                     className={`p-6 rounded-3xl border transition-all cursor-pointer ${selectedRoleForEdit === role ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-blue-500/30'}`}
                     onClick={() => setSelectedRoleForEdit(role)}
                   >
                     <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRoleForEdit === role ? 'bg-white/20' : 'bg-blue-500/10 text-blue-600'}`}>
                           <Users className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRoleForEdit === role ? 'text-white/60' : 'text-slate-400'}`}>دور وظيفي</span>
                     </div>
                     <h4 className="text-lg font-black">{role}</h4>
                     <p className={`text-xs mt-2 font-medium ${selectedRoleForEdit === role ? 'text-white/70' : 'text-slate-500'}`}>اضغط لتعديل صلاحيات هذا الدور</p>
                   </div>
                 ))}
              </div>

              <AnimatePresence>
                {selectedRoleForEdit && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-12 p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[32px] border border-blue-200/50 dark:border-blue-500/10"
                  >
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                          <Shield className="w-6 h-6 text-blue-600" />
                          صلاحيات الدور: <span className="text-blue-600">{selectedRoleForEdit}</span>
                       </h4>
                       <button 
                         onClick={() => saveRoleCapabilities(selectedRoleForEdit)}
                         disabled={isSavingRole}
                         className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-3 disabled:opacity-50"
                       >
                         {isSavingRole ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                         حفظ التغييرات
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {Object.keys(capabilityLabels).map(capKey => (
                         <div 
                           key={capKey}
                           onClick={() => handleUpdateRoleCapability(selectedRoleForEdit, capKey, !roleCapabilities[selectedRoleForEdit][capKey])}
                           className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${roleCapabilities[selectedRoleForEdit][capKey] ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-900/50 border-transparent opacity-60'}`}
                         >
                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{capabilityLabels[capKey]}</span>
                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${roleCapabilities[selectedRoleForEdit][capKey] ? 'bg-blue-600' : 'bg-slate-400'}`}>
                               <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${roleCapabilities[selectedRoleForEdit][capKey] ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      )}
    </div>
  );
}

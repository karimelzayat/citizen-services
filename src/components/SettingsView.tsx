import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Trash2, 
  UserPlus, 
  Loader2, 
  Search, 
  Lock, 
  Eye, 
  EyeOff,
  UserCheck,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getAllUsers, 
  addUserPermission, 
  updateUserPermissions, 
  deleteUserPermission,
  getRoleCapabilities,
  updateRoleCapabilities
} from '../services/dataService';
import { ROLE_CAPABILITIES } from '../constants';
import { UserRole } from '../types';

export default function SettingsView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Employee');
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'users' | 'roles'>('users');
  const [roleCapabilities, setRoleCapabilities] = useState<any>(ROLE_CAPABILITIES);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRole | null>(null);
  const [isSavingRole, setIsSavingRole] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    
    setIsAdding(true);
    try {
      await addUserPermission(newEmail, newRole);
      setNewEmail('');
      await fetchUsers();
    } catch (error: any) {
      alert('خطأ في إضافة المستخدم: ' + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      await deleteUserPermission(id);
      await fetchUsers();
    } catch (error: any) {
      alert('خطأ في حذف المستخدم: ' + error.message);
    }
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    try {
      await updateUserPermissions(userId, { role });
      await fetchUsers();
      setEditingUserId(null);
    } catch (error: any) {
      alert('خطأ في تحديث الصلاحيات: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roles = Object.keys(ROLE_CAPABILITIES) as UserRole[];

  const capabilityLabels: Record<string, string> = {
    canRegister: "تسجيل مكالمة",
    canSearch: "البحث في الشكاوى",
    canEditAny: "تعديل جميع البيانات",
    showMonthlyCount: "عرض الإحصائيات الشهرية",
    canFollowUp: "متابعة الشكاوى",
    canGenerateReports: "إصدار التقارير",
    canViewHotline: "عرض الخط الساخن",
    canViewAdminOngoing: "عرض العمل الجاري",
    canApproveSwaps: "اعتماد التبديلات"
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
           <p className="text-slate-500 dark:text-slate-400 font-medium">التحكم في وصول الموظفين وتخصيص تبويبات النظام لكل دور</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
           <button 
             onClick={() => setActiveSettingsTab('users')}
             className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeSettingsTab === 'users' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             الموظفين
           </button>
           <button 
             onClick={() => setActiveSettingsTab('roles')}
             className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeSettingsTab === 'roles' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             الصلاحيات
           </button>
        </div>
      </div>

      {activeSettingsTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Permission Definition Card */}
          <div className="lg:col-span-1 space-y-6">
             <div className="glass-card p-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[40px] shadow-sm">
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                 <Lock className="w-5 h-5 text-blue-600" />
                 إضافة وصول جديد
               </h3>
               <form onSubmit={handleAddUser} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-sm font-black text-slate-700 dark:text-slate-300">البريد الإلكتروني</label>
                   <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="form-input pr-12 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all font-mono"
                      />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-black text-slate-700 dark:text-slate-300">الدور الوظيفي</label>
                   <select 
                     value={newRole}
                     onChange={(e) => setNewRole(e.target.value as UserRole)}
                     className="form-input bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
                   >
                     {roles.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                 </div>

                 <button 
                   type="submit" 
                   disabled={isAdding}
                   className="btn-primary w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-base shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-white"
                 >
                   {isAdding ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
                   <span>إضافة للمنظومة</span>
                 </button>
               </form>
             </div>

             <div className="glass-card p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h3 className="text-xl font-black mb-6 relative z-10 flex items-center gap-3">
                 <Eye className="w-5 h-5 text-blue-400" />
                 ملخص الأدوار
               </h3>
               <div className="space-y-4 relative z-10">
                 {roles.map(role => (
                   <div key={role} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-default">
                     <div className="flex flex-col">
                       <span className="font-black text-sm">{role}</span>
                       <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest mt-0.5">
                         {roleCapabilities[role]?.canGenerateReports ? 'كامل الصلاحيات' : 'صلاحيات محدودة'}
                       </span>
                     </div>
                     <div className="flex gap-1.5">
                        {roleCapabilities[role]?.canRegister ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                        {roleCapabilities[role]?.canGenerateReports ? <CheckCircle2 className="w-4 h-4 text-blue-400" /> : <XCircle className="w-4 h-4 text-white/20" />}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* User List Table */}
          <div className="lg:col-span-2 space-y-6">
             <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="بحث ايميل..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="form-input pr-11 w-[200px] h-10 text-xs bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                   </div>
                   <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black">{filteredUsers.length} عميل</span>
                </div>

                {loading ? (
                  <div className="p-20 flex flex-col items-center justify-center text-slate-400 italic">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                    <span className="font-bold">جاري تحميل القائمة...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-right">
                          <th className="p-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">الموظف / البريد</th>
                          <th className="p-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">الدور</th>
                          <th className="p-6 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">{u.email?.[0].toUpperCase()}</div>
                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{u.email}</span>
                              </div>
                            </td>
                            <td className="p-6">
                               {editingUserId === u.id ? (
                                 <select 
                                   autoFocus
                                   onBlur={() => setEditingUserId(null)}
                                   onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                                   value={u.role}
                                   className="form-input h-8 text-[10px] font-black w-[140px]"
                                 >
                                   {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                 </select>
                               ) : (
                                 <button 
                                   onClick={() => setEditingUserId(u.id)}
                                   className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black"
                                 >
                                   {u.role}
                                 </button>
                               )}
                            </td>
                            <td className="p-6">
                              <div className="flex justify-center">
                                 <button 
                                   onClick={() => handleDeleteUser(u.id)}
                                   className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
          </div>
        </div>
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

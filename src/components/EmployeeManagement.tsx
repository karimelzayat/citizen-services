import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Search, Loader2, Save, Trash2, 
  Mail, Phone, CreditCard, MapPin, Briefcase, Calendar, 
  User, CheckCircle2, XCircle, ChevronLeft, LayoutDashboard,
  Layers, PlusCircle, Search as SearchIcon, CheckSquare, 
  FileText, HelpCircle, Contact, BookOpen, Settings, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllEmployees, saveEmployee, deleteEmployee } from '../services/dataService';
import { Employee, UserRole, UserCapabilities } from '../types';
import { ROLE_CAPABILITIES, DEFAULT_CAPABILITIES } from '../constants';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const data = await getAllEmployees();
    setEmployees(data);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingEmployee({
      name: '',
      status: 'قوة أساسية',
      jobTitle: '',
      phone: '',
      nationalId: '',
      address: '',
      code: '',
      email: '',
      startDate: '',
      assignmentStatus: '',
      annualLeave: 21,
      casualLeave: 7,
      gender: 'ذكر',
      role: 'Employee',
      permissions: { ...DEFAULT_CAPABILITIES }
    });
    setIsFormOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    
    setIsSaving(true);
    try {
      await saveEmployee(editingEmployee);
      setIsFormOpen(false);
      setEditingEmployee(null);
      await fetchEmployees();
    } catch (error: any) {
      alert('خطأ في الحفظ: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف تماماً؟')) return;
    try {
      await deleteEmployee(id);
      await fetchEmployees();
    } catch (e) {
      alert('خطأ في الحذف');
    }
  };

  const togglePermission = (key: keyof UserCapabilities) => {
    if (!editingEmployee || !editingEmployee.permissions) return;
    setEditingEmployee({
      ...editingEmployee,
      permissions: {
        ...editingEmployee.permissions,
        [key]: !editingEmployee.permissions[key]
      }
    });
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.nationalId.includes(searchTerm) ||
    e.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const permissionGroups = [
    {
      title: 'الأقسام الرئيسية',
      items: [
        { key: 'showHotlineSection', label: 'قسم الخط الساخن', icon: LayoutDashboard },
        { key: 'showAdminSection', label: 'قسم لوحة الإدارة', icon: Layers },
        { key: 'showHelpCenterSection', label: 'قسم مركز المساعدة', icon: HelpCircle },
      ]
    },
    {
      title: 'تبويبات الخط الساخن',
      items: [
        { key: 'canViewDashboard', label: 'لوحة المؤشرات', icon: LayoutDashboard },
        { key: 'canRegisterHotline', label: 'تسجيل مكالمة', icon: PlusCircle },
        { key: 'canSearchHotline', label: 'البحث', icon: SearchIcon },
        { key: 'canFollowUpHotline', label: 'متابعة المكالمات', icon: CheckSquare },
      ]
    },
    {
      title: 'تبويبات وأعمال الإدارة',
      items: [
        { key: 'canRegisterOngoing', label: 'زر "الجاري"', icon: CheckCircle2 },
        { key: 'canRegisterUnregistered', label: 'زر "شكاوى غير مسجلة"', icon: FileX },
        { key: 'canRegisterWrongDirection', label: 'زر "توجيه خطأ"', icon: AlertTriangle },
        { key: 'canViewDirectorAssignments', label: 'تكليفات المدير', icon: Briefcase },
        { key: 'canViewSchedules', label: 'الجداول والتبديلات', icon: Calendar },
        { key: 'canViewReports', label: 'التقارير', icon: FileText },
      ]
    },
    {
      title: 'مركز المساعدة والسياسات',
      items: [
        { key: 'canViewInquiry', label: 'الاستفسار عن', icon: HelpCircle },
        { key: 'canViewPhonebook', label: 'دليل الهاتف', icon: Contact },
        { key: 'canViewFAQ', label: 'دليل الأسئلة (FAQ)', icon: BookOpen },
      ]
    },
    {
      title: 'صلاحيات إضافية',
      items: [
        { key: 'canEditAny', label: 'تعديل أي شكوى', icon: Shield },
        { key: 'canApproveSwaps', label: 'اعتماد التبديلات', icon: UserCheck },
        { key: 'canManageUsers', label: 'إدارة الموظفين والصلاحيات', icon: Users },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {!isFormOpen ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="بحث بالاسم، الكود، الرقم القومي، أو المسمى الوظيفي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pr-12 bg-white dark:bg-slate-900 shadow-sm"
              />
            </div>
            <button 
              onClick={handleOpenAdd}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-blue-500/20"
            >
              <UserPlus className="w-5 h-5" />
              <span>إضافة موظف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center text-slate-400 italic">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <span>جاري تحميل قائمة الموظفين...</span>
              </div>
            ) : filteredEmployees.map(emp => (
              <div key={emp.id} className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] hover:shadow-xl transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-lg">
                      {emp.name[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white leading-tight">{emp.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(emp)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(emp.id!)} className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="font-medium truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="font-mono tracking-widest">{emp.nationalId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{emp.code}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${emp.status === 'قوة أساسية' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                      {emp.status}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase">
                      {emp.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="animate-fade-in space-y-8 pb-20">
          <div className="flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4 z-10 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => { setIsFormOpen(false); setEditingEmployee(null); }}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm border border-slate-200 dark:border-white/5 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingEmployee?.id ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">بيانات الموظف الشخصية وصلاحيات الوصول للنظام</p>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSaving}
              className="btn-primary px-8 h-12 flex items-center gap-3 shadow-blue-500/30"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>حفظ البيانات والصلاحيات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Employee Data */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[40px] shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  البيانات الأساسية
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">الاسم بالكامل</label>
                    <input 
                      type="text" required
                      value={editingEmployee?.name}
                      onChange={e => setEditingEmployee({...editingEmployee!, name: e.target.value})}
                      className="form-input" placeholder="ادخل الاسم الرباعي..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">البريد الإلكتروني (جوجل)</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" required
                        value={editingEmployee?.email}
                        onChange={e => setEditingEmployee({...editingEmployee!, email: e.target.value.toLowerCase()})}
                        className="form-input pr-12 font-mono" placeholder="username@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">المسمى الوظيفي</label>
                    <div className="relative">
                      <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" required
                        value={editingEmployee?.jobTitle}
                        onChange={e => setEditingEmployee({...editingEmployee!, jobTitle: e.target.value})}
                        className="form-input pr-12" placeholder="مثال: فني تسجيل طبي..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">كود الموظف</label>
                    <div className="relative">
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" required
                        value={editingEmployee?.code}
                        onChange={e => setEditingEmployee({...editingEmployee!, code: e.target.value})}
                        className="form-input pr-12 font-mono" placeholder="00000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">الرقم القومي (14 رقم)</label>
                    <input 
                      type="text" required maxLength={14}
                      value={editingEmployee?.nationalId}
                      onChange={e => setEditingEmployee({...editingEmployee!, nationalId: e.target.value})}
                      className="form-input font-mono tracking-widest" placeholder="00000000000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">رقم التليفون</label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" required
                        value={editingEmployee?.phone}
                        onChange={e => setEditingEmployee({...editingEmployee!, phone: e.target.value})}
                        className="form-input pr-12" placeholder="01000000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">العنوان بالتفصيل</label>
                    <div className="relative">
                      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" required
                        value={editingEmployee?.address}
                        onChange={e => setEditingEmployee({...editingEmployee!, address: e.target.value})}
                        className="form-input pr-12" placeholder="المحافظة - المركز - القرية/الشارع..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">الحالة الإدارية</label>
                    <select 
                      value={editingEmployee?.status}
                      onChange={e => setEditingEmployee({...editingEmployee!, status: e.target.value as any})}
                      className="form-input font-bold"
                    >
                      <option value="قوة أساسية">قوة أساسية</option>
                      <option value="انتداب">انتداب</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">موقف التكليف</label>
                    <input 
                      type="text"
                      value={editingEmployee?.assignmentStatus}
                      onChange={e => setEditingEmployee({...editingEmployee!, assignmentStatus: e.target.value})}
                      className="form-input" placeholder="مثال: تعديل تكليف، انتداب..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300">تاريخ استلام العمل</label>
                    <input 
                      type="date"
                      value={editingEmployee?.startDate}
                      onChange={e => setEditingEmployee({...editingEmployee!, startDate: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-50 dark:border-white/5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">رصيد الاعتيادي</label>
                    <input 
                      type="number"
                      value={editingEmployee?.annualLeave}
                      onChange={e => setEditingEmployee({...editingEmployee!, annualLeave: parseInt(e.target.value)})}
                      className="form-input text-center font-black text-blue-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">رصيد العارضة</label>
                    <input 
                      type="number"
                      value={editingEmployee?.casualLeave}
                      onChange={e => setEditingEmployee({...editingEmployee!, casualLeave: parseInt(e.target.value)})}
                      className="form-input text-center font-black text-amber-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">النوع</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setEditingEmployee({...editingEmployee!, gender: 'ذكر'})}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${editingEmployee?.gender === 'ذكر' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}
                      >ذكر</button>
                      <button 
                        type="button"
                        onClick={() => setEditingEmployee({...editingEmployee!, gender: 'أنثى'})}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${editingEmployee?.gender === 'أنثى' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}
                      >أنثى</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Panel */}
            <div className="space-y-6">
              <div className="glass-card p-8 bg-slate-950 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h4 className="text-lg font-black mb-8 flex items-center gap-3 relative z-10">
                  <Shield className="w-5 h-5 text-blue-400" />
                  لوحة الصلاحيات الفردية
                </h4>
                
                <div className="space-y-8 relative z-10 custom-scrollbar max-h-[800px] pr-2">
                  {permissionGroups.map(group => (
                    <div key={group.title} className="space-y-3">
                      <div className="px-2 text-[10px] font-black text-blue-400/60 uppercase tracking-widest mb-1">{group.title}</div>
                      <div className="space-y-1">
                        {group.items.map(item => {
                          const Icon = item.icon as any;
                          const isActive = (editingEmployee?.permissions as any)?.[item.key];
                          return (
                            <button 
                              key={item.key}
                              type="button"
                              onClick={() => togglePermission(item.key as any)}
                              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                <span className="text-xs font-black">{item.label}</span>
                              </div>
                              {isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-20" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px]">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">الدور الوظيفي العام</label>
                 <select 
                    value={editingEmployee?.role}
                    onChange={e => {
                      const role = e.target.value as UserRole;
                      setEditingEmployee({
                        ...editingEmployee!,
                        role,
                        permissions: { ...ROLE_CAPABILITIES[role] }
                      });
                    }}
                    className="form-input bg-slate-50 dark:bg-slate-800 font-black text-blue-600"
                 >
                    {Object.keys(ROLE_CAPABILITIES).map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
                 <p className="text-[10px] text-slate-400 mt-3 font-medium leading-relaxed italic">
                   تنبيه: اختيار الدور الوظيفي سيقوم بإعادة ضبط الصلاحيات أعلاه للقيم الافتراضية الخاصة بهذا الدور.
                 </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

const AlertTriangle = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const FileX = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9.5 12.5 5 5"/><path d="m14.5 12.5-5 5"/></svg>;
const UserCheck = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;

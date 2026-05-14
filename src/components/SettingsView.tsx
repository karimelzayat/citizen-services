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

import React from 'react';
import { 
  Shield 
} from 'lucide-react';
import EmployeeManagement from './EmployeeManagement';

export default function SettingsView() {
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
      </div>

      <EmployeeManagement />
    </div>
  );
}

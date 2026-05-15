import React from 'react';
import { Bell, Check, Clock, Info, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { markNotificationAsRead } from '../services/dataService';
import { AppNotification } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}

export default function NotificationsPopover({ isOpen, onClose, notifications }: Props) {
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute top-full left-0 mt-4 bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[32px] border border-slate-100 dark:border-white/10 p-0 flex flex-col w-80 sm:w-[400px] max-h-[550px] overflow-hidden z-[70] origin-top-left RTL"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-none">الإشعارات</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    لديك {unreadCount} إشعار غير مقروء
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-[300px] bg-white dark:bg-slate-900">
              {notifications.length > 0 ? (
                notifications.map((notification, idx) => (
                  <motion.div 
                    key={notification.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                      notification.status === 'unread' 
                        ? 'bg-blue-50/50 dark:bg-blue-600/5 border-blue-100 dark:border-blue-500/20 shadow-sm' 
                        : 'bg-white dark:bg-slate-800/40 border-slate-50 dark:border-white/5'
                    }`}
                    onClick={() => {
                      if (notification.status === 'unread') markNotificationAsRead(notification.id);
                    }}
                  >
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notification.status === 'unread' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}>
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed mb-2 ${notification.status === 'unread' ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp ? (notification.timestamp as any).toDate?.().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                          </div>
                          {notification.status === 'unread' && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                              جديد
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 opacity-40">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10" />
                  </div>
                  <p className="font-black">لا توجد إشعارات حالياً</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-white/5">
              <button 
                className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all flex items-center justify-center gap-2"
                onClick={() => {
                   // Add logic to mark all as read if needed
                }}
              >
                <Check className="w-4 h-4" />
                تحديد الكل كمقروء
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

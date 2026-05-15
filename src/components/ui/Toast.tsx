import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 2500); 
    
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100',
    error: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100',
    info: 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg min-w-[300px] max-w-md ${colors[type]}`}
      dir="rtl"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="flex-1 font-bold text-sm leading-relaxed">
        {message}
      </p>
      <button 
        onClick={() => onClose(id)}
        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 opacity-50" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<{ id: string, message: string, type: ToastType }[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const { message, type } = e.detail;
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, message, type: type || 'success' }]);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-3 items-center">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            {...toast} 
            onClose={removeToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

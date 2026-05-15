import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronRight, Hash, Phone, Building2, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHotlineTree } from '../services/dataService';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  phone?: string;
  info?: string;
}

const TREE_DATA: TreeNode[] = [
  {
    id: '1',
    label: 'الإدارة المركزية للمعامل',
    children: [
      { id: '1-1', label: 'معمل السموم الرئيسي', phone: '0223910344', info: 'يعمل على مدار الساعة' },
      { id: '1-2', label: 'معامل الأغذية', phone: '0223910355' },
    ]
  },
  {
    id: '2',
    label: 'قطاع الطب الوقائي',
    children: [
      { id: '2-1', label: 'إدارة التطعيمات', phone: '105', info: 'الاستفسار عن تطعيمات الأطفال والكورونا' },
      { id: '2-2', label: 'صحة البيئة', phone: '0227947199' },
    ]
  },
  {
    id: '3',
    label: 'العلاج على نفقة الدولة',
    phone: '0222630505',
    info: 'المجالس الطبية المتخصصة'
  }
];

export default function HotlineTreeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [path, setPath] = useState<TreeNode[]>([]);
  const [dbTree, setDbTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      getHotlineTree().then(data => {
        if (data && data.length > 0) {
          setDbTree(data as any);
        }
        setLoading(false);
      });
    }
  }, [isOpen]);
  
  const currentTree = dbTree.length > 0 ? dbTree : TREE_DATA;
  const currentNodes = path.length > 0 ? path[path.length - 1].children || [] : currentTree;

  const filteredNodes = search 
    ? currentTree.reduce((acc: any[], node) => {
        const matches = node.label.includes(search) || (node.phone && node.phone.includes(search));
        const childMatches = node.children?.filter(c => c.label.includes(search) || (c.phone && c.phone.includes(search)));
        
        if (matches) acc.push(node);
        else if (childMatches && childMatches.length > 0) acc.push({...node, children: childMatches});
        
        return acc;
      }, [])
    : currentNodes;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] border border-slate-100 dark:border-white/5 max-w-3xl w-full h-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">شجرة الخط الساخن</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">توجيه المكالمات وتوزيع الاختصاصات</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all font-bold" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 shadow-sm relative z-10 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-white/5">
              <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="ابحث في الشجرة (مثال: معامل، تطعيمات)..." 
                  className="form-input pr-12 h-14 bg-slate-50 dark:bg-slate-800/40 border-transparent focus:bg-white transition-all rounded-2xl" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {!search && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
                  <button 
                    onClick={() => setPath([])}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all ${path.length === 0 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <Hash className="w-3 h-3" />
                    الرئيسية
                  </button>
                  {path.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                      <button 
                        onClick={() => setPath(path.slice(0, i + 1))}
                        className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${i === path.length - 1 ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      >
                        {node.label}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="h-full flex items-center justify-center text-blue-600 font-bold animate-pulse">جاري جلب بيانات الشجرة...</div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredNodes.length > 0 ? (
                  filteredNodes.map((node, idx) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.98, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.98, x: -10 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => node.children ? setPath([...path, node]) : null}
                      className={`group bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center justify-between cursor-pointer border border-slate-100 dark:border-white/5 hover:border-amber-500/30 transition-all ${node.children ? 'hover:bg-amber-50/30 dark:hover:bg-amber-500/5' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${node.children ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 group-hover:scale-110' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-white/5'}`}>
                          {node.children ? <Building2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">{node.label}</h4>
                          {node.info && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{node.info}</p>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {node.phone && (
                          <a 
                            href={`tel:${node.phone}`} 
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          >
                            <Phone className="w-3 h-3" />
                            {node.phone}
                          </a>
                        )}
                        {node.children && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <Search className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="font-bold text-slate-400">لا توجد نتائج تطابق بحثك</p>
                  </div>
                )}
              </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-white/5 flex items-center justify-center">
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Data Synchronized with Central Registry</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

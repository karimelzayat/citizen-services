import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: (string | Option)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  tabIndex?: number;
  icon?: React.ReactNode;
}

const normalizeArabic = (text: string) => {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .toLowerCase()
    .trim();
};

export default function SearchableSelect({
  options: rawOptions,
  value,
  onChange,
  placeholder = "اختر...",
  className = "",
  disabled = false,
  required = false,
  name,
  tabIndex = 0,
  icon
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options: Option[] = rawOptions.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const filteredOptions = options.filter(opt =>
    normalizeArabic(opt.label).includes(normalizeArabic(search))
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        setIsOpen(true);
        e.preventDefault();
      } else if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex].value);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      if (isOpen) {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
      e.preventDefault();
    } else if (e.key === 'Tab' && isOpen) {
      // User requested: "when I choose and press tab, it should accept the choice"
      if (filteredOptions.length > 0) {
        const target = activeIndex >= 0 ? filteredOptions[activeIndex] : filteredOptions[0];
        handleSelect(target.value);
      } else {
        setIsOpen(false);
      }
      // We don't preventDefault here so it moves focus to next element
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // User requested: "When I tab to a select and start typing, it should search immediately"
      if (!isOpen) {
        setIsOpen(true);
        setSearch(e.key);
        e.preventDefault();
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={onKeyDown}
        tabIndex={disabled ? -1 : tabIndex}
        className={`form-input flex items-center justify-between cursor-pointer transition-all duration-300 min-h-[3.5rem] outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'}`}
      >
        <div className="flex items-center gap-3 truncate ml-2">
          {icon && <div className="shrink-0 text-slate-400">{icon}</div>}
          <span className={`truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 font-bold'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-3 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  placeholder="ابحث هنا..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm pr-9 text-slate-700 dark:text-slate-200 font-bold h-10"
                />
              </div>
            </div>

            <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all duration-200 group ${
                      value === opt.value 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : idx === activeIndex
                          ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <span className="text-sm truncate pr-2">{opt.label}</span>
                    {value === opt.value && <Check className="w-4 h-4 shrink-0" />}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 italic text-sm">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden input for form submission if needed */}
      {name && <input type="hidden" name={name} value={value} required={required} />}
    </div>
  );
}

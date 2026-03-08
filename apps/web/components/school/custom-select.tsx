'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CustomSelect({ value, onChange, options, placeholder = 'Select...', className = '', size = 'md' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);
  const sizeClasses = size === 'sm'
    ? 'h-8 px-3 text-xs gap-1.5'
    : 'h-9 px-3 text-sm gap-2';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-between ${sizeClasses} font-medium bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all cursor-pointer w-full`}
      >
        <span className={selected ? 'text-slate-700' : 'text-slate-400'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[120px] bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 ${size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-sm'} text-left transition-colors ${
                opt.value === value
                  ? 'bg-[#824ef2]/5 text-[#824ef2] font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.value === value && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              {opt.value !== value && <span className="w-3.5 flex-shrink-0" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

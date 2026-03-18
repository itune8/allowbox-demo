'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Calendar as CalendarIcon } from 'lucide-react';

/* ─── Custom Select ─── */

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  /** compact mode for inline filters (smaller height) */
  compact?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
  compact = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  const selected = options.find((o) => o.value === value);
  const h = compact ? 'h-9' : 'h-10';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${h} w-full flex items-center justify-between gap-2 px-3 border border-slate-200 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] ${
          selected ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[160px] bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-[220px] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                close();
              }}
              className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between transition-colors ${
                value === opt.value
                  ? 'bg-[#824ef2]/5 text-[#824ef2] font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
              {value === opt.value && <Check className="w-4 h-4 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Date Input ─── */

interface CustomDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

export function CustomDateInput({
  value,
  onChange,
  className = '',
  compact = false,
}: CustomDateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const h = compact ? 'h-9' : 'h-10';

  const formatDisplay = (v: string) => {
    if (!v) return '';
    const d = new Date(v + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker?.()}
        className={`${h} w-full flex items-center gap-2 px-3 border border-slate-200 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] ${
          value ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        <CalendarIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
        <span className="truncate">{value ? formatDisplay(value) : 'Select date'}</span>
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        tabIndex={-1}
      />
    </div>
  );
}

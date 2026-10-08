import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface DobPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  maxDate?: string;
  minDate?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DobPicker({
  value,
  onChange,
  id = 'dob-picker-input',
  placeholder = 'YYYY-MM-DD',
  maxDate,
  minDate = '1940-01-01',
  required = false,
  className = '',
  inputClassName = ''
}: DobPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default max date: 18 years ago if not specified
  const effectiveMaxDate = maxDate || (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  const maxYear = parseInt(effectiveMaxDate.split('-')[0], 10) || new Date().getFullYear();
  const minYear = parseInt(minDate.split('-')[0], 10) || 1940;

  // Initialize view year & month from value or 20 years ago
  const parseInitialDate = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parts = value.split('-').map(Number);
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    }
    // Default to ~22 years ago
    const defaultYear = Math.min(maxYear, new Date().getFullYear() - 22);
    return { year: defaultYear, month: 0, day: 1 };
  };

  const initial = parseInitialDate();
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [viewMonth, setViewMonth] = useState<number>(initial.month);

  // Keep viewYear and viewMonth in sync when value changes externally
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parts = value.split('-').map(Number);
      setViewYear(parts[0]);
      setViewMonth(parts[1] - 1);
    }
  }, [value]);

  // Close calendar popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Year list for dropdown (descending from maxYear down to minYear)
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Days in selected view month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewYear(viewYear - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < maxYear) {
        setViewYear(viewYear + 1);
        setViewMonth(0);
      }
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${mStr}-${dStr}`;
    
    // Bounds check
    if (effectiveMaxDate && formatted > effectiveMaxDate) return;
    if (minDate && formatted < minDate) return;

    onChange(formatted);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return value === `${viewYear}-${mStr}-${dStr}`;
  };

  const isDayDisabled = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mStr}-${dStr}`;
    if (effectiveMaxDate && dateStr > effectiveMaxDate) return true;
    if (minDate && dateStr < minDate) return true;
    return false;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container with calendar icon trigger button */}
      <div className="relative flex items-center w-full">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={
            inputClassName ||
            "w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl px-4 py-3 pr-11 text-xs text-white placeholder-zinc-500 outline-none transition-colors [color-scheme:dark]"
          }
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Open calendar to pick date of birth"
          className="absolute right-2.5 p-1.5 rounded-lg text-[#c5a059] hover:bg-[#c5a059]/20 transition-all cursor-pointer flex items-center justify-center focus:outline-none"
        >
          <CalendarIcon className="w-4 h-4 text-[#c5a059]" />
        </button>
      </div>

      {/* Popover Calendar Widget */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full max-w-[320px] bg-[#0c1938] border border-[#c5a059]/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          {/* Header Controls: Month & Year Selectors */}
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={viewYear <= minYear && viewMonth === 0}
              className="p-1 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {/* Month Selector Dropdown */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-[#07122a] text-white border border-zinc-700/80 rounded-lg px-2 py-1 text-xs font-mono outline-none focus:border-[#c5a059] cursor-pointer"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx} className="bg-[#0c1938] text-white">
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Selector Dropdown */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-[#07122a] text-white border border-zinc-700/80 rounded-lg px-2 py-1 text-xs font-mono outline-none focus:border-[#c5a059] cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#0c1938] text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={viewYear >= maxYear && viewMonth === 11}
              className="p-1 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[10px] font-mono font-bold text-zinc-400">
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset cells for starting day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-7 w-7" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDayDisabled(day);
              const selected = isSelected(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                    selected
                      ? 'bg-[#c5a059] text-black font-extrabold shadow-md'
                      : disabled
                      ? 'text-zinc-600 cursor-not-allowed opacity-30'
                      : 'text-zinc-200 hover:bg-[#c5a059]/20 hover:text-[#c5a059]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-zinc-400 hover:text-red-400 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>

            <span className="text-[10px] text-zinc-400">
              Min 18 yrs required
            </span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-[#c5a059]/20 text-[#c5a059] px-2.5 py-1 rounded-lg hover:bg-[#c5a059]/30 font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

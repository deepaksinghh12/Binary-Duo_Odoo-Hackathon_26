import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  label?: string;
  activeColorClass?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options, value, onChange, icon, label, activeColorClass = 'border-[#4CAF3A]', disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {icon}
        </div>
      )}
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border rounded-xl transition-all ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70' : 'bg-transparent cursor-pointer'} ${isOpen && !disabled ? activeColorClass : 'border-slate-200'}`}
      >
        <span className={value ? 'text-slate-800' : 'text-transparent'}>
          {selectedOption ? selectedOption.label : 'Select'}
        </span>
      </div>

      {label && (
        <label className={`absolute transition-all pointer-events-none bg-white px-1 ${value || isOpen ? 'left-3 -top-2 text-xs' : `${icon ? 'left-10' : 'left-4'} top-1/2 -translate-y-1/2`} text-slate-400 z-10`}>
          {label}
        </label>
      )}

      <MdKeyboardArrowDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} pointer-events-none`} size={22} />

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-1">
          {options.map(option => (
            <div
              key={option.value}
              className={`px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 ${value === option.value ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-600'}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

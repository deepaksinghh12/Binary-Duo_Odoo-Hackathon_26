import React, { forwardRef, useState, useId } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className = '', placeholder = " ", icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = useId();

    return (
      <div className="flex flex-col w-full relative mb-1">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 z-10 flex items-center justify-center text-[#4CAF3A] text-xl">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={inputType}
            className={`block ${icon ? 'pl-11' : 'px-3'} pr-3 pb-2.5 pt-4 w-full text-sm text-[#0D3B3E] bg-transparent rounded-lg border appearance-none focus:outline-none focus:ring-1 peer transition-all ${
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-slate-300 focus:border-[#4CAF3A] focus:ring-[#4CAF3A]'
            } ${isPassword ? 'pr-10' : ''} ${className}`}
            placeholder={placeholder}
            ref={ref}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 
              peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
              peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 ${icon ? 'start-10 peer-focus:start-10 peer-placeholder-shown:start-10' : 'start-1'} cursor-text
              ${error ? 'text-red-500' : 'text-slate-500 peer-focus:text-[#4CAF3A]'}`}
          >
            {label}
          </label>
          
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#0D3B3E] transition-colors z-20 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          )}
        </div>
        {error && <span className="text-sm text-red-500 mt-1 ml-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

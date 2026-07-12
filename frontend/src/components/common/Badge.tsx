import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'default', className?: string }> = ({ 
  children, 
  variant = 'default',
  className = ''
}) => {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

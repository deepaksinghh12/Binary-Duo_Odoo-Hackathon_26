import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};

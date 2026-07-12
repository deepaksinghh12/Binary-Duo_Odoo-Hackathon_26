import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-12 text-center shadow-[0_30px_60px_-15px_rgba(13,59,62,0.1)] border-2 border-slate-100 max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-[#0D3B3E] mb-4">Hello! 👋</h1>
        <p className="text-slate-500 font-medium mb-8">
          Welcome to your new EcoSphere Dashboard.
        </p>
        
        <button
          onClick={handleLogout}
          className="px-8 py-3 rounded-full font-bold text-white bg-[#0D3B3E] hover:bg-[#4CAF3A] transition-colors shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

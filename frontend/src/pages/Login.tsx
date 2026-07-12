import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock } from 'react-icons/md';
import { Input } from '../components/Input';
import { loginSchema, type LoginFormData } from '../utils/validation';
import { AuthService } from '../services/auth.service';
import logo from '../assets/logo/EcoSphere.png';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await AuthService.login(data);
      navigate('/');
    } catch (error) {
      setErrorMsg('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Branding Section */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-[#f8fafc] via-[#f0fdf4] to-[#e0f2fe] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#4CAF3A]/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#0D3B3E]/10 to-transparent"></div>
        
        <div className="z-10 text-center flex flex-col items-center">
          <img src={logo} alt="EcoSphere Logo" className="w-72 mb-10 object-contain drop-shadow-sm" />
          <h2 className="text-4xl font-extrabold text-[#0D3B3E] mb-4">Welcome Back</h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            Log in to continue managing your ecological impact seamlessly.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative bg-white overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(13,59,62,0.3)] my-auto transition-shadow duration-300">
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-8">
              <img src={logo} alt="EcoSphere Logo" className="w-48 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#0D3B3E] mb-1 tracking-wide uppercase">SIGN IN</h1>
            <p className="text-slate-500 font-medium text-base">Access your dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMsg && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium text-center">
                {errorMsg}
              </div>
            )}
            
            <div className="flex flex-col gap-3 pt-2">
              <Input
                label="Email Address"
                type="email"
                icon={<MdEmail />}
                {...register('email')}
                error={errors.email?.message}
                className="bg-slate-50/50 border-slate-200 focus:bg-white h-12 transition-all"
              />
              
              <Input
                label="Password"
                type="password"
                icon={<MdLock />}
                {...register('password')}
                error={errors.password?.message}
                className="bg-slate-50/50 border-slate-200 focus:bg-white h-12 transition-all"
              />
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-11/12 py-3 rounded-full text-base font-bold tracking-wide shadow-lg shadow-[#4CAF3A]/25 h-12 uppercase cursor-pointer hover:bg-[#0D3B3E] hover:shadow-[#0D3B3E]/40 active:scale-[0.98] transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="loader border-[3px] border-white/30 border-r-white h-5 w-5 mr-2"></span>
                    SIGNING IN...
                  </span>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#4CAF3A] hover:text-[#3f7628] font-bold transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

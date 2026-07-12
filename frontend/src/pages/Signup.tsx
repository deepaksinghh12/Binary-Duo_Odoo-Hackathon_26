import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdPerson } from 'react-icons/md';
import { Input } from '../components/Input';
import { OtpModal } from '../components/OtpModal';
import { signupSchema, type SignupFormData } from '../utils/validation';
import { AuthService } from '../services/auth.service';
import logo from '../assets/logo/EcoSphere.png';

export const Signup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      await AuthService.signup(data);
      setRegisteredEmail(data.email);
      setIsOtpModalOpen(true);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerified = (data: any) => {
    // Save token if returned, then redirect to dashboard
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Branding Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#f8fafc] via-[#f0fdf4] to-[#e0f2fe] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center]" />
        
        {/* SVG Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img 
            src="/favicon.svg" 
            alt="" 
            className="w-[40rem] opacity-10"
          />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#4CAF3A]/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#0D3B3E]/10 to-transparent"></div>
        
        <div className="z-10 text-center flex flex-col items-center">
          <img src={logo} alt="EcoSphere Logo" className="w-72 mb-10 object-contain drop-shadow-sm" />
          <h2 className="text-4xl font-extrabold text-[#0D3B3E] mb-4">Join EcoSphere</h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            Create an account and start making a positive impact on the environment today.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-12 relative bg-white overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(13,59,62,0.3)] my-auto transition-shadow duration-300">
          
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-8">
              <img src={logo} alt="EcoSphere Logo" className="w-48 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#0D3B3E] mb-1 tracking-wide uppercase">CREATE ACCOUNT</h1>
            <p className="text-slate-500 font-medium text-base">Register your ESG profile</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMsg && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <Input
                label="Full Name"
                type="text"
                icon={<MdPerson />}
                {...register('name')}
                error={errors.name?.message}
                className="bg-slate-50/50 border-slate-200 focus:bg-white h-11 transition-all"
              />

              <Input
                label="Email Address"
                type="email"
                icon={<MdEmail />}
                {...register('email')}
                error={errors.email?.message}
                className="bg-slate-50/50 border-slate-200 focus:bg-white h-11 transition-all"
              />

              <Input
                label="Password"
                type="password"
                icon={<MdLock />}
                {...register('password')}
                error={errors.password?.message}
                className="bg-slate-50/50 border-slate-200 focus:bg-white h-11 transition-all"
              />

              <Input
                label="Confirm Password"
                type="password"
                icon={<MdLock />}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                className="bg-slate-50/50 border-slate-200 focus:bg-white h-11 transition-all"
              />
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-11/12 py-3 rounded-full text-base font-bold tracking-wide shadow-lg shadow-[#4CAF3A]/25 h-12 uppercase cursor-pointer hover:bg-[#0D3B3E] hover:shadow-[#0D3B3E]/40 active:scale-[0.98] transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="loader border-[3px] border-white/30 border-r-white h-5 w-5 mr-2"></span>
                    CREATING ACCOUNT...
                  </span>
                ) : (
                  'CREATE ACCOUNT'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4CAF3A] hover:text-[#0D3B3E] font-bold transition-colors">
              Sign in
            </Link>
          </div>

        </div>
      </div>

      <OtpModal 
        isOpen={isOtpModalOpen}
        email={registeredEmail}
        onClose={() => setIsOtpModalOpen(false)}
        onVerified={handleVerified}
      />
    </div>
  );
};
export default Signup;

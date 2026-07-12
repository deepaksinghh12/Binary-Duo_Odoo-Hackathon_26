import React, { useState, useEffect, useRef } from 'react';
import { MdClose, MdEmail, MdCheckCircle } from 'react-icons/md';
import { AuthService } from '../services/auth.service';
import toast from 'react-hot-toast';

interface OtpModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onVerified: (data: any) => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, email, onClose, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      setCanResend(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    // Allow replacing a digit if they type a new one
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await AuthService.verifyOtp({ email, code: otpString });
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onVerified(response.data);
        }, 1500);
      } else {
        toast.error(response.data.message || 'Invalid code.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await AuthService.sendOtp(email);
      setTimer(60);
      setCanResend(false);
      toast.success('Verification code resent successfully.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D3B3E]/60 backdrop-blur-md p-4 transition-all">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 sm:p-12 shadow-[0_40px_80px_-20px_rgba(13,59,62,0.5)] relative border border-white/20 animate-in fade-in zoom-in-95 duration-300 overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4CAF3A]/20 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-[#4CAF3A]/10 flex items-center justify-center rounded-full mb-6 relative z-10">
            <MdCheckCircle size={56} className="text-[#4CAF3A]" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-[#0D3B3E] mb-3 tracking-tight relative z-10">Email Verified!</h2>
          <p className="text-slate-500 text-base leading-relaxed relative z-10">
            Your account has been successfully verified. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D3B3E]/60 backdrop-blur-md p-4 transition-all">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 sm:p-10 shadow-[0_40px_80px_-20px_rgba(13,59,62,0.5)] relative border border-white/20 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Background glow effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4CAF3A]/10 via-transparent to-transparent pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-[#0D3B3E] bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-all duration-200 z-10"
        >
          <MdClose size={20} />
        </button>

        <div className="flex justify-center mb-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#4CAF3A]/20 to-[#4CAF3A]/5 flex items-center justify-center rounded-full shadow-inner">
            <MdEmail size={34} className="text-[#4CAF3A]" />
          </div>
        </div>

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-extrabold text-[#0D3B3E] mb-3 tracking-tight">Check your email</h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Enter the verification code sent to<br/>
            <span className="font-bold text-[#0D3B3E] break-all">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8 relative z-10">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder="0"
                className="w-11 h-14 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-3xl font-bold text-[#0D3B3E] bg-slate-50/80 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-[#4CAF3A] focus:shadow-[0_0_20px_rgba(76,175,58,0.15)] focus:-translate-y-1 transition-all duration-200 placeholder:text-slate-300 placeholder:text-2xl focus:placeholder-transparent"
              />
            ))}
          </div>

          <div className="text-center text-[15px] font-medium">
            <span className="text-slate-500">
              Didn't get a code?{' '}
            </span>
            {canResend ? (
              <button 
                type="button" 
                onClick={handleResend}
                className="text-[#4CAF3A] hover:text-[#0D3B3E] font-bold cursor-pointer transition-colors ml-1"
              >
                Resend now
              </button>
            ) : (
              <span className="text-slate-400 font-bold ml-1">
                Resend in {timer}s
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isOtpComplete}
            className={`w-full py-4 rounded-2xl text-[15px] font-bold tracking-wide uppercase transition-all duration-300 ${
              isOtpComplete 
                ? 'bg-[#4CAF3A] text-white shadow-[0_10px_20px_-10px_rgba(76,175,58,0.5)] hover:bg-[#0D3B3E] hover:shadow-[0_10px_20px_-10px_rgba(13,59,62,0.5)] active:scale-[0.98] cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="loader border-[3px] border-white/30 border-r-white h-5 w-5 mr-3"></span>
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

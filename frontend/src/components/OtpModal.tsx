import React, { useState, useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import { AuthService } from '../services/auth.service';

interface OtpModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onVerified: (data: any) => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, email, onClose, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
      setOtp('');
      setErrorMsg('');
      setTimer(60);
      setCanResend(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await AuthService.verifyOtp({ email, code: otp });
      if (response.data.success) {
        onVerified(response.data);
      } else {
        setErrorMsg(response.data.message || 'Invalid OTP.');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setErrorMsg('');
      await AuthService.sendOtp(email);
      setTimer(60);
      setCanResend(false);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D3B3E]/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-[0_30px_60px_-15px_rgba(13,59,62,0.4)] relative border-2 border-[#0D3B3E]/10 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-[#0D3B3E] transition-colors"
        >
          <MdClose size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-[#0D3B3E] mb-2 uppercase tracking-wide">Verification</h2>
          <p className="text-slate-500 text-sm font-medium">
            We've sent a 6-digit code to<br/>
            <span className="font-bold text-[#4CAF3A]">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <input
              ref={inputRef}
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.5em] font-bold text-[#0D3B3E] bg-slate-50/50 border border-slate-200 rounded-xl h-16 focus:bg-white focus:outline-none focus:border-[#4CAF3A] focus:ring-1 focus:ring-[#4CAF3A] transition-all placeholder:text-slate-300 placeholder:font-normal"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="btn-primary w-full py-3 rounded-full text-sm font-bold tracking-wide shadow-lg shadow-[#4CAF3A]/25 h-12 uppercase cursor-pointer hover:bg-[#0D3B3E] hover:shadow-[#0D3B3E]/40 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="loader border-[3px] border-white/30 border-r-white h-4 w-4 mr-2"></span>
                VERIFYING...
              </span>
            ) : (
              'VERIFY OTP'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium">
          <p className="text-slate-500">
            Didn't receive OTP?{' '}
            {canResend ? (
              <button 
                type="button" 
                onClick={handleResend}
                className="text-[#4CAF3A] hover:text-[#0D3B3E] hover:underline font-bold transition-colors"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-slate-400">
                Resend in <span className="font-bold text-[#0D3B3E]">{timer}s</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

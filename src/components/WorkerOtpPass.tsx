import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppScreen, WorkerApplication } from '../types';
import { 
  ShieldCheck, Phone, Mail, Lock, KeyRound, CheckCircle2, 
  AlertCircle, ChevronRight, RefreshCw, Eye, EyeOff
} from 'lucide-react';

interface WorkerOtpPassProps {
  onTransition: (target: AppScreen) => void;
  showNotification: (msg: string) => void;
  workerApplication: WorkerApplication | null;
  setWorkerApplicationData: (data: WorkerApplication) => void;
}

export default function WorkerOtpPass({
  onTransition,
  showNotification,
  workerApplication,
  setWorkerApplicationData
}: WorkerOtpPassProps) {
  const [phoneOtp, setPhoneOtp] = useState('8842');
  const [emailOtp, setEmailOtp] = useState('9921');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phoneOtp.trim() || phoneOtp.trim().length < 4) {
      setErrorMsg('Please enter the 4-digit Phone OTP sent to your mobile.');
      return;
    }
    if (!emailOtp.trim() || emailOtp.trim().length < 4) {
      setErrorMsg('Please enter the 4-digit Gmail OTP sent to your inbox.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please check and retry.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (workerApplication) {
        const updatedApp: WorkerApplication = {
          ...workerApplication,
          status: 'PENDING'
        };
        setWorkerApplicationData(updatedApp);

        // Update in localStorage
        const existingApps = JSON.parse(localStorage.getItem('punchx_worker_applications') || '[]');
        const filtered = existingApps.filter((a: WorkerApplication) => a.id !== updatedApp.id);
        localStorage.setItem('punchx_worker_applications', JSON.stringify([updatedApp, ...filtered]));

        // Also save account credentials for future worker login
        const workerAccount = {
          email: workerApplication.email,
          phone: workerApplication.phone,
          password: password,
          legalName: workerApplication.legalName,
          status: 'PENDING'
        };
        localStorage.setItem(`punchx_worker_cred_${workerApplication.phone}`, JSON.stringify(workerAccount));
      }

      showNotification('✓ Dual OTP verified & password set successfully! Details submitted to Company Dashboard.');
      onTransition('worker-pending-approval');
    }, 1200);
  };

  return (
    <div id="worker-otp-pass-screen" className="min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans py-10 px-4 sm:px-6 relative flex flex-col justify-center">
      
      <div className="max-w-xl mx-auto w-full bg-[#11192e] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-zinc-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c5a059] to-[#07122a] border border-[#c5a059]/40 flex items-center justify-center text-[#e9c176] mx-auto shadow-lg">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            DUAL OTP & SECURITY PASSWORD LOCK
          </h1>
          <p className="text-xs text-zinc-300 max-w-sm mx-auto">
            Verification codes sent to both your registered Phone number and Gmail address.
          </p>
        </div>

        {/* Verification Destinations Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#07122a] border border-zinc-800 p-4 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#c5a059]" /> Mobile Sent
            </span>
            <span className="text-xs font-mono font-bold text-white block truncate">
              {workerApplication?.phone || '+91 98765 43210'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#c5a059]" /> Gmail Inbox Sent
            </span>
            <span className="text-xs font-mono font-bold text-white block truncate">
              {workerApplication?.email || 'worker.expert@gmail.com'}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerifyAndSubmit} className="space-y-5">
          
          {/* Dual OTP Field Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Mobile OTP */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-[#e9c176] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Mobile Phone OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="Enter Mobile OTP"
                className="w-full bg-[#07122a] border border-[#c5a059]/40 focus:border-[#c5a059] rounded-xl px-4 py-3 text-sm font-mono font-bold text-white text-center outline-none"
              />
              <p className="text-[10px] text-zinc-500 text-center">Verification Code: <span className="text-[#e9c176] font-bold">8842</span></p>
            </div>

            {/* Gmail OTP */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-[#e9c176] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Gmail Inbox OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Enter Gmail OTP"
                className="w-full bg-[#07122a] border border-[#c5a059]/40 focus:border-[#c5a059] rounded-xl px-4 py-3 text-sm font-mono font-bold text-white text-center outline-none"
              />
              <p className="text-[10px] text-zinc-500 text-center">Verification Code: <span className="text-[#e9c176] font-bold">9921</span></p>
            </div>

          </div>

          {/* Password Setup for Future Sign Ins */}
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            <label className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#c5a059]" /> Create Sign-In Password
            </label>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Set account password (min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-zinc-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirm account password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#e9c176] hover:from-[#e9c176] hover:to-[#c5a059] text-black font-extrabold text-xs uppercase tracking-widest font-mono rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl border border-[#ffdea5]/50 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <span>Submit Details to Company Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

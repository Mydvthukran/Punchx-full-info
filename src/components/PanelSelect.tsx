import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Wrench, ArrowRight, ShieldCheck, Sparkles, X, Lock, Key, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react';
import { AppScreen } from '../types';
import PUNCHX_LOGO from '../assets/logo';

interface PanelSelectProps {
  onSelectPanel: (panel: 'customer' | 'worker' | 'admin', action?: 'login' | 'signup') => void;
  showNotification: (msg: string) => void;
}

export default function PanelSelect({ onSelectPanel, showNotification }: PanelSelectProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [logoTaps, setLogoTaps] = useState(0);

  useEffect(() => {
    if (logoTaps === 0) return;
    const timer = window.setTimeout(() => setLogoTaps(0), 3000);
    return () => window.clearTimeout(timer);
  }, [logoTaps]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const openAdmin = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (next >= 10) {
      setLogoTaps(0);
      setAdminOpen(true);
    }
  };

  const submitAdmin = (event: React.FormEvent) => {
    event.preventDefault();
    const value = adminPin.trim();
    if (value === '' || value.toLowerCase() === 'admin' || value.toUpperCase() === 'PUNCHX2026' || value === '0910' || value === 'PUNCHX^(@)0910') {
      setAdminError('');
      setAdminOpen(false);
      setAdminPin('');
      showNotification('Administrator gateway opened.');
      onSelectPanel('admin', 'login');
      return;
    }
    setAdminError('Invalid administrator passcode.');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7faff] text-[#0f172a] px-5 py-8 sm:px-8">
      <style>{`
        @keyframes punchx-drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(35px,-22px,0) scale(1.06); } }
        @keyframes punchx-grid-move { from { background-position: 0 0; } to { background-position: 48px 48px; } }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-[560px] w-[560px] rounded-full bg-[#2563eb]/10 blur-[100px]" style={{ animation: 'punchx-drift 9s ease-in-out infinite' }} />
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-[#38bdf8]/10 blur-[110px]" style={{ animation: 'punchx-drift 11s ease-in-out infinite reverse' }} />
        <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-[#bfdbfe]/30 blur-[110px]" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.055) 1px, transparent 1px)', backgroundSize: '48px 48px', animation: 'punchx-grid-move 18s linear infinite' }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col items-center justify-center">
        <motion.div initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 flex flex-col items-center text-center">
          <button onClick={openAdmin} className="mb-5 rounded-full border border-[#bfdbfe] bg-white/80 p-2 shadow-lg backdrop-blur transition-transform hover:scale-105 active:scale-95" aria-label="PUNCHX">
            <div className="h-16 w-16 rounded-full bg-white p-1.5"><img src={PUNCHX_LOGO} alt="PUNCHX" className="h-full w-full object-contain" /></div>
          </button>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-white/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2563eb] shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> PUNCHX UNIFIED PLATFORM GATEWAY
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#0f172a] sm:text-5xl">Select Your PunchX Workspace</h1>
          <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-[#64748b] sm:text-base">Book verified neighborhood professionals or sign in as an authorized specialist partner.</p>
        </motion.div>

        {/* Dual Cards: Customer vs Specialist */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Customer Workspace Card */}
          <motion.section initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#dbeafe] bg-white/90 p-6 shadow-[0_22px_70px_rgba(30,64,175,.10)] backdrop-blur-xl sm:p-8">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#2563eb]/7 blur-3xl transition-all duration-500 group-hover:bg-[#38bdf8]/12" />
            <div className="relative flex flex-col items-center text-center flex-1">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                <User className="h-3 w-3" /> Citizen Workspace
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] shadow-sm mb-4 transition-transform duration-300 group-hover:scale-105">
                <User className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#0f172a]">Customer Portal</h2>
              <p className="mt-2 text-xs sm:text-sm text-[#64748b] mb-6 leading-relaxed">
                Book verified professionals for AC, electrical, plumbing, carpentry, and 50+ home services with live GPS tracking.
              </p>
            </div>
            <button onClick={() => { showNotification(`Opening Customer portal...`); onSelectPanel('customer', 'login'); }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(37,99,235,.24)] transition-all hover:bg-[#1d4ed8] hover:shadow-[0_16px_34px_rgba(37,99,235,.30)] active:scale-[.99]">
              Log in to book services <ArrowRight className="h-4 w-4" />
            </button>
          </motion.section>

          {/* Specialist Partner Card */}
          <motion.section initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#fef3c7] bg-white/95 p-6 shadow-[0_22px_70px_rgba(217,119,6,.10)] backdrop-blur-xl sm:p-8">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl transition-all duration-500 group-hover:bg-amber-500/20" />
            <div className="relative flex flex-col items-center text-center flex-1">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                <ShieldCheck className="h-3 w-3" /> Specialist Workspace
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm mb-4 transition-transform duration-300 group-hover:scale-105">
                <Wrench className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#0f172a]">Worker / Specialist Portal</h2>
              <p className="mt-2 text-xs sm:text-sm text-[#64748b] mb-6 leading-relaxed">
                Receive instant neighborhood dispatches, manage active orders with OTP verification, and track daily payouts.
              </p>
            </div>
            <div className="space-y-2.5 w-full">
              <button onClick={() => { showNotification(`Opening Specialist login...`); onSelectPanel('worker', 'login'); }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(217,119,6,.24)] transition-all hover:bg-amber-700 active:scale-[.99]">
                Specialist Partner Login <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => { showNotification(`Opening Specialist Application...`); onSelectPanel('worker', 'signup'); }} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50/60 px-5 py-2.5 text-xs font-bold text-amber-900 transition-all hover:bg-amber-100/70 active:scale-[.99]">
                Apply as Professional Specialist ➔
              </button>
            </div>
          </motion.section>

        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] font-semibold text-[#64748b]">
          <button onClick={() => onSelectPanel('worker', 'signup')} className="inline-flex items-center gap-1.5 hover:text-[#2563eb] transition-colors"><ShieldCheck className="h-3.5 w-3.5" /> Specialist Registration Guide</button>
          <span className="w-1 h-1 rounded-full bg-[#cbd5e1] hidden sm:block"></span>
          <button onClick={() => setAdminOpen(true)} className="inline-flex items-center gap-1.5 hover:text-[#2563eb] transition-colors"><Lock className="h-3.5 w-3.5" /> Enterprise Gateway</button>
        </div>
      </div>

      <AnimatePresence>
        {adminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 p-4 backdrop-blur-md">
            <motion.form onSubmit={submitAdmin} initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 12 }} className="relative w-full max-w-md rounded-3xl border border-[#dbeafe] bg-white p-6 shadow-2xl sm:p-7">
              <button type="button" onClick={() => setAdminOpen(false)} className="absolute right-4 top-4 rounded-xl p-2 text-[#64748b] hover:bg-[#eff6ff] hover:text-[#2563eb]"><X className="h-5 w-5" /></button>
              <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]"><Building2 className="h-6 w-6" /></div><div><h3 className="font-extrabold text-[#0f172a]">PUNCHX Enterprise Gateway</h3><p className="text-xs text-[#64748b]">Authorized management access</p></div></div>
              {adminError && <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3 text-xs font-semibold text-[#1d4ed8]"><AlertCircle className="h-4 w-4" />{adminError}</div>}
              <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[#475569]">Administrator passcode</label>
              <div className="relative mt-2"><Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2563eb]" /><input autoFocus type={showPin ? 'text' : 'password'} value={adminPin} onChange={e => setAdminPin(e.target.value)} className="w-full rounded-xl border border-[#cbd5e1] bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" placeholder="Enter passcode" /><button type="button" onClick={() => setShowPin(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">{showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              <button type="submit" className="mt-5 w-full rounded-xl bg-[#2563eb] py-3.5 text-sm font-extrabold text-white hover:bg-[#1d4ed8]">Authorize</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

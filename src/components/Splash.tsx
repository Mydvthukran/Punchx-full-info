import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Wrench, Home, Zap, Droplets, Hammer } from 'lucide-react';
import { AppScreen } from '../types';
import PUNCHX_LOGO from '../assets/logo';

interface SplashProps {
  onTransition: (target: AppScreen) => void;
}

export default function Splash({ onTransition }: SplashProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onTransition('panel-select'), 1900);
    return () => window.clearTimeout(timer);
  }, [onTransition]);

  const serviceIcons = [Wrench, Home, Zap, Droplets, Hammer, ShieldCheck];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7faff] text-[#0f172a] flex items-center justify-center px-6">
      <style>{`
        @keyframes punchx-orbit { from { transform: rotate(0deg) translateX(145px) rotate(0deg); } to { transform: rotate(360deg) translateX(145px) rotate(-360deg); } }
        @keyframes punchx-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes punchx-grid { from { transform: translate3d(0,0,0); } to { transform: translate3d(42px,42px,0); } }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-[#2563eb]/16 blur-[110px] animate-pulse" />
        <div className="absolute -bottom-40 -right-32 h-[560px] w-[560px] rounded-full bg-[#38bdf8]/14 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.32]" style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.09) 1px, transparent 1px)', backgroundSize: '42px 42px', animation: 'punchx-grid 14s linear infinite' }} />
        <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2563eb]/10" />
        <div className="absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#38bdf8]/10" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-[-24px] rounded-full border border-[#2563eb]/20" />
          <div className="absolute inset-[-48px] rounded-full border border-[#38bdf8]/10" />
          <div className="h-28 w-28 rounded-full border border-[#bfdbfe] bg-white p-2 shadow-[0_20px_70px_rgba(37,99,235,.22)]">
            <img src={PUNCHX_LOGO} alt="PUNCHX" className="h-full w-full object-contain" />
          </div>

          {serviceIcons.map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white bg-white text-[#2563eb] shadow-lg"
              style={{ animation: `punchx-orbit ${8 + index * 0.6}s linear infinite`, animationDelay: `${-index * 1.3}s` }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="mt-14">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2563eb] shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted local services
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#0f172a]">PUNCH<span className="text-[#2563eb]">X</span></h1>
          <p className="mt-2 text-sm font-medium text-[#64748b]">Verified professionals. Simple booking. Better service.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-[#64748b]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#2563eb]" />
          Preparing your secure workspace...
        </motion.div>

        <div className="mt-5 h-1 w-44 overflow-hidden rounded-full bg-[#dbeafe]">
          <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1.75, ease: 'easeInOut' }} className="h-full w-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8]" />
        </div>
      </div>
    </main>
  );
}

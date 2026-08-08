import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { AppScreen } from '../types';
import PUNCHX_LOGO from '../assets/logo';

interface SplashProps {
  onTransition: (target: AppScreen) => void;
}

export default function Splash({ onTransition }: SplashProps) {
  const [initPercent, setInitPercent] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const totalDuration = 5000; // exactly 5 seconds
    const intervalTime = 50; // smooth update step
    const steps = totalDuration / intervalTime; // 100 increments
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setInitPercent(progress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setCompleted(true);
        onTransition('panel-select');
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onTransition]);

  const handleQuickProceed = () => {
    onTransition('panel-select');
  };

  return (
    <main
      id="splash-screen-container"
      className="relative h-screen w-full flex flex-col items-center justify-center bg-[#07122a] overflow-hidden select-none"
    >
      {/* Background Atmospheric Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[40%] bg-[#c5a059]/10 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[40%] bg-[#e9c176]/5 rounded-full blur-[140px]"></div>
        {/* Futuristic Grid Layer */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#c5a059_1px,transparent_1px),linear-gradient(to_bottom,#c5a059_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Center Logo with Premium Glow Framing */}
      <div id="splash-core" className="relative z-10 flex flex-col items-center gap-6 max-w-md px-6 text-center">
        <motion.div
          id="splash-logo-container"
          className="relative group cursor-pointer"
          onClick={handleQuickProceed}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        >
          {/* Pulsing Outer Radiance Aura */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#c5a059]/30 to-[#e9c176]/30 blur-3xl rounded-full scale-105 animate-pulse"></div>

          {/* Golden Rotating Metallic Frame */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 bg-[#111415] rounded-full p-0 flex items-center justify-center shadow-2xl border-2 border-[#c5a059]/40 overflow-hidden">
            <img
              id="splash-logo-image"
              src={PUNCHX_LOGO}
              alt="PunchX Logo"
              className="object-cover rounded-full w-full h-full transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </motion.div>

        {/* Brand Name Text with Gradient Shine */}
        <div id="splash-brand-details" className="flex flex-col items-center gap-1.5 mt-2" onClick={handleQuickProceed}>
          <motion.h1
            id="splash-brand-heading"
            className="font-sans font-extrabold text-[44px] md:text-[52px] leading-tight text-white tracking-tight cursor-pointer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            PUNCH<span className="text-[#c5a059] font-light">X</span>
          </motion.h1>
          <motion.p
            id="splash-brand-tagline"
            className="font-mono text-xs text-[#c5a059] tracking-[0.25em] uppercase font-bold opacity-80 cursor-pointer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Prestige Service Utility
          </motion.p>
        </div>

        {/* Value Proposition Statement */}
        <motion.p
          id="splash-brand-description"
          className="text-sm text-zinc-300 leading-relaxed max-w-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Connecting Citizens, Workers, and Authorities through AI-driven smart living.
        </motion.p>
      </div>

      {/* Loader with Loading Percentage Slider */}
      <div id="splash-loader-area" className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full max-w-[280px] px-4">
        {completed ? (
          <motion.button
            id="splash-proceed-btn"
            onClick={() => onTransition('panel-select')}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#c5a059] to-[#e9c176] hover:from-[#e9c176] hover:to-[#c5a059] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_4px_25px_rgba(197,160,89,0.3)] hover:shadow-[0_4px_30px_rgba(197,160,89,0.45)] transition-all cursor-pointer border border-[#ffdea5]/50 active:scale-[0.98]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            Initialize Protocol
            <ArrowRight className="w-4 h-4 text-black" />
          </motion.button>
        ) : (
          <div id="loading-meter" className="w-full flex flex-col gap-2.5 items-center cursor-pointer" onClick={handleQuickProceed}>
            {/* Minimalist Tech Stats */}
            <div className="w-full flex justify-between font-mono text-[10px] text-[#e9c176] font-bold opacity-80">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#c5a059] animate-spin" />
                INIT SECURE_SHELL
              </span>
              <span>{initPercent}%</span>
            </div>
            {/* Glowing Golden Bar */}
            <div className="w-full h-1 bg-zinc-900 border border-[#c5a059]/10 rounded-full overflow-hidden">
              <div
                id="loading-bar-completion"
                className="h-full bg-gradient-to-r from-[#c5a059] to-[#e9c176] shadow-[0_0_8px_#c5a059] transition-all duration-75"
                style={{ width: `${initPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono tracking-wider mt-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>MIL-GRADE SECURED</span>
        </div>
      </div>

      {/* Decorative Bottom glowing accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent"></div>
    </main>
  );
}

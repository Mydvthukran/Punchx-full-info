import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Wrench, Home, Zap, Droplets, Hammer, Wind, Settings2 } from 'lucide-react';
import { AppScreen } from '../types';
import PUNCHX_LOGO from '../assets/logo';

interface SplashProps {
  onTransition: (target: AppScreen) => void;
}

export default function Splash({ onTransition }: SplashProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onTransition('panel-select'), 2300);
    return () => window.clearTimeout(timer);
  }, [onTransition]);

  const serviceIcons = [Wrench, Home, Zap, Droplets, Hammer, ShieldCheck, Wind, Settings2];

  return (
    <main className="punchx-splash relative min-h-screen overflow-hidden bg-[#f6faff] text-[#0f172a] flex items-center justify-center px-6">
      <style>{`
        @keyframes punchx-orbit { from { transform: rotate(0deg) translateX(clamp(105px,26vw,170px)) rotate(0deg); } to { transform: rotate(360deg) translateX(clamp(105px,26vw,170px)) rotate(-360deg); } }
        @keyframes punchx-grid { from { transform:translate3d(0,0,0); } to { transform:translate3d(42px,42px,0); } }
        @keyframes punchx-pulse-ring { 0%,100% { transform:scale(.96); opacity:.35 } 50% { transform:scale(1.04); opacity:.75 } }
        @keyframes punchx-breathe { 0%,100% { transform:translateY(0) scale(1) } 50% { transform:translateY(-7px) scale(1.015) } }
        @keyframes punchx-shimmer { 0% { transform:translateX(-110%) } 100% { transform:translateX(110%) } }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#2563eb]/16 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-44 -right-40 h-[600px] w-[600px] rounded-full bg-[#38bdf8]/14 blur-[125px]" />
        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage:'linear-gradient(rgba(37,99,235,.08) 1px, transparent 1px),linear-gradient(90deg,rgba(37,99,235,.08) 1px,transparent 1px)', backgroundSize:'42px 42px', animation:'punchx-grid 13s linear infinite' }} />
        <motion.div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2563eb]/15" animate={{scale:[.96,1.04,.96],opacity:[.25,.65,.25]}} transition={{duration:3.2,repeat:Infinity,ease:'easeInOut'}} />
        <motion.div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#38bdf8]/10" animate={{scale:[1.03,.96,1.03],opacity:[.12,.4,.12]}} transition={{duration:4.5,repeat:Infinity,ease:'easeInOut'}} />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <motion.div initial={{scale:.55,opacity:0,rotate:-8}} animate={{scale:1,opacity:1,rotate:0}} transition={{duration:.8,ease:[.22,1,.36,1]}} className="relative">
          <motion.div className="absolute inset-[-22px] rounded-full border border-[#2563eb]/20" animate={{scale:[1,1.1,1],opacity:[.45,.05,.45]}} transition={{duration:2.6,repeat:Infinity}} />
          <motion.div className="absolute inset-[-44px] rounded-full border border-[#38bdf8]/10" animate={{scale:[1.05,.96,1.05],opacity:[.15,.5,.15]}} transition={{duration:3.8,repeat:Infinity}} />
          <motion.div animate={{y:[0,-6,0],scale:[1,1.015,1]}} transition={{duration:2.8,repeat:Infinity,ease:'easeInOut'}} className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#bfdbfe] bg-white p-2 shadow-[0_20px_70px_rgba(37,99,235,.22)]">
            <img src={PUNCHX_LOGO} alt="PUNCHX" className="h-full w-full rounded-full object-cover" />
          </motion.div>

          {serviceIcons.map((Icon,index)=>(
            <motion.div key={index} className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white bg-white text-[#2563eb] shadow-[0_8px_24px_rgba(37,99,235,.16)]" style={{animation:`punchx-orbit ${9+index*.65}s linear infinite`,animationDelay:`${-index*1.1}s`}}>
              <Icon className="h-4 w-4" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{y:22,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:.28,duration:.55}} className="mt-14">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-white/85 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2563eb] shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Trusted local services
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#0f172a]">PUNCH<span className="text-[#2563eb]">X</span></h1>
          <p className="mt-2 text-sm font-medium text-[#64748b]">Verified professionals. Simple booking. Better service.</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.7,duration:.45}} className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-[#64748b]">
          <motion.span className="h-2 w-2 rounded-full bg-[#2563eb]" animate={{scale:[1,1.45,1],opacity:[.55,1,.55]}} transition={{duration:1.1,repeat:Infinity}} />
          Preparing your secure workspace...
        </motion.div>

        <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-[#dbeafe] shadow-inner">
          <motion.div initial={{x:'-105%'}} animate={{x:'105%'}} transition={{duration:1.9,ease:'easeInOut'}} className="relative h-full w-2/3 rounded-full bg-gradient-to-r from-[#2563eb] via-[#38bdf8] to-[#2563eb]" />
        </div>
      </div>
    </main>
  );
}

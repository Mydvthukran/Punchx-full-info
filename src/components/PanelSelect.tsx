import React from 'react';
import { motion } from 'motion/react';
import { AppScreen } from '../types';
import { User, Wrench, Building2, ArrowRight, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import PUNCHX_LOGO from '../assets/logo';

interface PanelSelectProps {
  onSelectPanel: (panel: 'customer' | 'worker' | 'admin', action?: 'login' | 'signup') => void;
  showNotification: (msg: string) => void;
}

export default function PanelSelect({ onSelectPanel, showNotification }: PanelSelectProps) {
  const panels = [
    {
      id: 'customer' as const,
      title: 'PUNCHX Customer Panel',
      subtitle: 'Citizen Service & Smart Utility',
      badge: 'CITIZEN PANEL',
      badgeColor: 'bg-[#c5a059]/20 text-[#e9c176] border-[#c5a059]/30',
      icon: User,
      description: 'Book verified master specialists, track live technician coordinates, consult Drago AI, and manage luxury bookings.',
      btnText: 'Launch Customer Panel',
      gradient: 'from-[#c5a059]/15 via-[#11192e] to-[#0d1527]',
      accentColor: '#c5a059'
    },
    {
      id: 'worker' as const,
      title: 'PUNCHX Authority (Worker) Panel',
      subtitle: 'Specialist Operations & Task Dispatch',
      badge: 'WORKER PANEL',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: Wrench,
      description: 'Receive dispatched service tasks, verify customer 4-digit security OTP gates, attach proof receipts, and track earnings.',
      btnText: 'Launch Worker Panel',
      gradient: 'from-emerald-500/10 via-[#11192e] to-[#0d1527]',
      accentColor: '#10b981'
    },
    {
      id: 'admin' as const,
      title: 'PUNCHX Company Dashboard',
      subtitle: 'Enterprise Control & Command Center',
      badge: 'ADMIN DASHBOARD',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: Building2,
      description: 'Monitor real-time live dispatches, technician networks, revenue analytics, and enforce system security protocols.',
      btnText: 'Launch Admin Dashboard',
      gradient: 'from-blue-500/10 via-[#11192e] to-[#0d1527]',
      accentColor: '#3b82f6'
    }
  ];

  return (
    <div id="panel-select-screen" className="min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Radiance */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c5a059]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full space-y-8 z-10 my-auto">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-[#07122a] border-2 border-[#c5a059]/40 p-0 shadow-2xl overflow-hidden mb-1 flex items-center justify-center"
          >
            <img src={PUNCHX_LOGO} alt="PunchX Logo" className="w-full h-full object-cover rounded-full" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11192e] border border-[#c5a059]/30 text-[#e9c176] text-xs font-mono font-bold uppercase tracking-wider shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-pulse" />
            <span>PUNCHX ECOSYSTEM WORKSPACE</span>
          </motion.div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            SELECT OPERATING PANEL
          </h1>
        </div>

        {/* 3 Panel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {panels.map((p, idx) => {
            const IconComp = p.icon;
            const isWorker = p.id === 'worker';

            return (
              <motion.div
                key={p.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-b ${p.gradient} border border-zinc-800 hover:border-[#c5a059] rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-6 transition-all duration-300 group relative overflow-hidden`}
              >
                {/* Glow Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl group-hover:bg-[#c5a059]/15 transition-all"></div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#07122a] border border-[#c5a059]/30 flex items-center justify-center text-[#e9c176] group-hover:scale-110 transition-transform shadow-md">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white group-hover:text-[#e9c176] transition-colors">
                        {p.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <button
                    onClick={() => {
                      showNotification(`🔑 Opening Log In...`);
                      onSelectPanel(p.id, 'login');
                    }}
                    className="w-full py-3 px-4 bg-[#07122a] group-hover:bg-[#c5a059] text-white group-hover:text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all duration-300 border border-zinc-700 group-hover:border-[#ffdea5] shadow-lg font-mono cursor-pointer"
                  >
                    <span>Log In (Gmail & Password)</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {isWorker && (
                    <button
                      onClick={() => {
                        showNotification('📝 Opening Worker Application Signup...');
                        onSelectPanel('worker', 'signup');
                      }}
                      className="w-full py-2 px-3 bg-[#07122a]/80 hover:bg-[#11192e] text-zinc-300 hover:text-white font-mono text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer"
                    >
                      <span>New Worker Signup Application →</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security Footer Note */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-zinc-500 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Unified PUNCHX Data Hub • Real-time Session Sync Active</span>
          </p>
        </div>

      </div>
    </div>
  );
}

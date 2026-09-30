import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronRight, Clock3, MapPin, Navigation2, ShieldCheck, UserRound, X } from 'lucide-react';
import { AppScreen } from '../types';

interface CitizenProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTransition: (screen: AppScreen) => void;
  citizenName: string;
  citizenAddress: string;
  showNotification: (message: string) => void;
}

export default function CitizenProfileDrawer({
  isOpen,
  onClose,
  onTransition,
  citizenName,
  citizenAddress,
  showNotification,
}: CitizenProfileDrawerProps) {
  const [history] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('punchx_order_history') || '[]';
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const activeOrder = useMemo(() => {
    try {
      const raw = localStorage.getItem('punchx_active_order');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const go = (screen: AppScreen) => {
    onClose();
    onTransition(screen);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[140]">
          <motion.button
            aria-label="Close account drawer"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-[0_0_70px_rgba(17,18,25,.22)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 px-5 py-4 backdrop-blur-xl">
              <div><div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7358d7]">Citizen account</div><h2 className="mt-0.5 text-lg font-black">Your PunchX space</h2></div>
              <button onClick={onClose} className="rounded-xl bg-[#f5f6f8] p-2 text-[#555a64]" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4 p-5">
              <section className="rounded-3xl bg-[#f2efff] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17191d] text-white"><UserRound className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-black">{citizenName || 'PunchX Citizen'}</h3><p className="mt-1 flex items-center gap-1 text-[10px] text-[#7e828d]"><MapPin className="h-3.5 w-3.5" /> <span className="truncate">{citizenAddress || 'Service address not set'}</span></p></div>
                  <span className="rounded-full bg-white px-2 py-1 text-[8px] font-black text-[#5b45c7] ring-1 ring-[#7358d7]/10"><ShieldCheck className="mr-1 inline h-3 w-3" /> VERIFIED</span>
                </div>
              </section>

              {activeOrder?.id && (
                <section className="rounded-3xl bg-[#17191d] p-4 text-white">
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#b9adff]"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Active service</span><span className="text-[10px] text-white/45">{activeOrder.status || 'Processing'}</span></div>
                  <h3 className="mt-3 text-base font-black">{activeOrder.category || 'Home service'}</h3>
                  <p className="mt-1 text-xs text-white/55">{activeOrder.workerName || 'Professional assignment pending'}</p>
                  <button onClick={() => go('tracking')} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#17191d]">Open live tracking <Navigation2 className="h-4 w-4" /></button>
                </section>
              )}

              <section className="grid grid-cols-2 gap-2.5">
                <button onClick={() => go('providers')} className="rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5"><CalendarDays className="h-5 w-5 text-[#7358d7]" /><div className="mt-3 text-sm font-black">Book service</div><div className="mt-1 text-[10px] text-[#8b8f98]">Browse verified professionals</div></button>
                <button onClick={() => go('tracking')} className="rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5"><Navigation2 className="h-5 w-5 text-[#7358d7]" /><div className="mt-3 text-sm font-black">Track service</div><div className="mt-1 text-[10px] text-[#8b8f98]">Open your active job</div></button>
              </section>

              <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9296a0]">Order activity</div><div className="mt-1 text-lg font-black">{history.length}</div><div className="text-[10px] text-[#8b8f98]">saved service records on this device</div></div><Clock3 className="h-7 w-7 text-[#7358d7]" /></div>
                <button onClick={() => showNotification('Your service history is available from the booking records shown in PunchX.')} className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#f6f6f8] px-3 py-2.5 text-[10px] font-black text-[#4c5058]">View activity details <ChevronRight className="h-4 w-4" /></button>
              </section>

              <div className="rounded-2xl bg-[#f7f8fa] p-3 text-[10px] leading-5 text-[#7b808a]">
                Your saved address is used when matching nearby professionals. Change the address from the service booking screen before confirming a job.
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

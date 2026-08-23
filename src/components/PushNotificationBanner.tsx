import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PushAlert, 
  subscribeToPushAlerts, 
  markPushNotificationAsRead, 
  getPushPreferences, 
  savePushPreferences,
  playNotificationChime
} from '../lib/pushNotifications';
import { AppScreen } from '../types';
import { 
  Navigation, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Wrench,
  Sparkles,
  Radio
} from 'lucide-react';
import PUNCHX_LOGO from '../assets/logo';

interface PushNotificationBannerProps {
  onTransition?: (screen: AppScreen) => void;
  onOpenCenter?: () => void;
  onOpenNotificationCenter?: () => void;
}

export default function PushNotificationBanner({
  onTransition,
  onOpenCenter,
  onOpenNotificationCenter
}: PushNotificationBannerProps) {
  const handleOpenCenter = onOpenCenter || onOpenNotificationCenter;
  const [currentAlert, setCurrentAlert] = useState<PushAlert | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(getPushPreferences().soundEnabled);

  // Subscribe to push notification broadcast engine
  useEffect(() => {
    const unsubscribe = subscribeToPushAlerts((newAlert) => {
      setCurrentAlert(newAlert);
      markPushNotificationAsRead(newAlert.id);
    });

    // Also listen for BroadcastChannel events across multi-tabs
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('punchx_push_channel');
        bc.onmessage = (event) => {
          if (event.data && event.data.id) {
            setCurrentAlert(event.data);
            markPushNotificationAsRead(event.data.id);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    return () => {
      unsubscribe();
      if (bc) bc.close();
    };
  }, []);

  // Auto-dismiss timer (7 seconds unless hovered)
  useEffect(() => {
    if (!currentAlert || isHovered) return;

    const timer = setTimeout(() => {
      setCurrentAlert(null);
    }, 7000);

    return () => clearTimeout(timer);
  }, [currentAlert, isHovered]);

  const handleDismiss = () => {
    setCurrentAlert(null);
  };

  const handleAction = () => {
    if (!currentAlert) return;
    const targetScreen = currentAlert.actionScreen || 'tracking';
    setCurrentAlert(null);
    if (onTransition) {
      onTransition(targetScreen);
    } else if (handleOpenCenter) {
      handleOpenCenter();
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = !soundEnabled;
    setSoundEnabled(updated);
    savePushPreferences({ soundEnabled: updated });
    if (updated) {
      playNotificationChime('worker_accepted');
    }
  };

  return (
    <div className="fixed top-3 left-0 right-0 z-[9999] pointer-events-none flex justify-center px-3 sm:px-4">
      <AnimatePresence>
        {currentAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="pointer-events-auto w-full max-w-md bg-[#09152e]/98 backdrop-blur-xl border-2 border-[#c5a059] shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_20px_rgba(197,160,89,0.25)] rounded-2xl p-3.5 sm:p-4 text-white overflow-hidden relative cursor-pointer group"
            onClick={handleAction}
          >
            {/* Top Glowing Edge Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e9c176] to-transparent opacity-80" />

            {/* Header: OS Push Metadata & Dismiss */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-white border border-[#c5a059] flex items-center justify-center p-0.5 flex-shrink-0 shadow-sm">
                  <img
                    src={PUNCHX_LOGO}
                    alt="PunchX"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#e9c176] font-extrabold truncate">
                  PunchX Live Alert
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">• Just now</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Audio chime toggle */}
                <button
                  onClick={toggleSound}
                  title={soundEnabled ? "Push chime active (tap to mute)" : "Push chime muted (tap to enable)"}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-[#e9c176] transition-colors cursor-pointer"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#e9c176]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </button>

                {/* Dismiss X */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Alert Body */}
            <div className="flex items-start gap-3">
              {/* Avatar / Event Icon */}
              <div className="relative flex-shrink-0">
                {currentAlert.workerAvatar ? (
                  <div className="relative">
                    <img
                      src={currentAlert.workerAvatar}
                      alt={currentAlert.workerName || 'Worker'}
                      className="w-11 h-11 rounded-xl object-cover border border-[#c5a059]/60 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full border border-black shadow">
                      {currentAlert.type === 'worker_travel_started' ? (
                        <Navigation className="w-2.5 h-2.5" />
                      ) : currentAlert.type === 'worker_arrived' ? (
                        <MapPin className="w-2.5 h-2.5" />
                      ) : (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#e9c176]">
                    {currentAlert.type === 'worker_travel_started' ? (
                      <Navigation className="w-5 h-5 animate-pulse text-emerald-400" />
                    ) : currentAlert.type === 'worker_arrived' ? (
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-[#e9c176]" />
                    )}
                  </div>
                )}
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight font-sans tracking-tight">
                    {currentAlert.title}
                  </h4>
                  {currentAlert.type === 'worker_travel_started' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold animate-pulse">
                      <Radio className="w-2.5 h-2.5" /> EN ROUTE
                    </span>
                  )}
                </div>

                <p className="text-[11px] sm:text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2">
                  {currentAlert.body}
                </p>

                {/* Telemetry pill if travel started */}
                {currentAlert.type === 'worker_travel_started' && currentAlert.etaMinutes && (
                  <div className="flex items-center gap-3 pt-0.5 text-[10px] font-mono text-zinc-400">
                    <span className="text-[#e9c176] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#e9c176]" /> ETA: ~{currentAlert.etaMinutes} mins
                    </span>
                    {currentAlert.distanceKm && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" /> {currentAlert.distanceKm} km away
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Footer Bar */}
            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#c5a059]" /> Verified PunchX Specialist
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#e9c176] text-black font-mono font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <span>Track Live GPS</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Auto-dismiss progress bar */}
            {!isHovered && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 7, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a059]/60"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

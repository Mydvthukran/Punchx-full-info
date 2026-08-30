import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PushAlert, 
  getStoredPushNotifications, 
  clearAllPushNotifications, 
  markPushNotificationAsRead,
  getPushPreferences,
  savePushPreferences,
  requestNotificationPermission,
  playNotificationChime,
  triggerHapticFeedback
} from '../lib/pushNotifications';
import { AppScreen } from '../types';
import { 
  Bell, 
  X, 
  Trash2, 
  Navigation, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Check
} from 'lucide-react';
import PUNCHX_LOGO from '../assets/logo';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransition?: (screen: AppScreen) => void;
  showToast?: (msg: string) => void;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  onTransition,
  showToast
}: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<PushAlert[]>([]);
  const [prefs, setPrefs] = useState(getPushPreferences());

  const loadNotifications = () => {
    setNotifications(getStoredPushNotifications());
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      setPrefs(getPushPreferences());
    }
  }, [isOpen]);

  const handleClearAll = () => {
    clearAllPushNotifications();
    setNotifications([]);
    if (showToast) showToast('🗑️ Push notification history cleared.');
  };

  const handleNotificationClick = (item: PushAlert) => {
    markPushNotificationAsRead(item.id);
    loadNotifications();
    onClose();
    if (onTransition) {
      if (item.actionScreen) {
        onTransition(item.actionScreen);
      } else {
        onTransition('tracking');
      }
    }
  };

  const handleToggleSound = () => {
    const updated = savePushPreferences({ soundEnabled: !prefs.soundEnabled });
    setPrefs(updated);
    if (updated.soundEnabled) {
      playNotificationChime('worker_accepted');
    }
  };

  const handleToggleBrowserPush = async () => {
    if (!prefs.browserNotificationsEnabled) {
      const granted = await requestNotificationPermission();
      setPrefs(getPushPreferences());
      if (granted && showToast) {
        showToast('🔔 Browser push notifications enabled!');
      } else if (!granted && showToast) {
        showToast('⚠️ Push notification permission denied in browser.');
      }
    } else {
      const updated = savePushPreferences({ browserNotificationsEnabled: false });
      setPrefs(updated);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0b162c] border-2 border-[#c5a059]/40 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#07122a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#c5a059]/20 text-[#e9c176] border border-[#c5a059]/40">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-sans">
                  <span>Push Notification Center</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#e9c176] text-[10px] font-mono font-bold">
                    {notifications.length} Alerts
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Real-time worker dispatches, travel alerts & service status
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preferences Row */}
          <div className="px-4 py-2.5 bg-[#07122a] border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSound}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  prefs.soundEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                {prefs.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Sound Chime: {prefs.soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={handleToggleBrowserPush}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  prefs.browserNotificationsEnabled
                    ? 'bg-[#c5a059]/20 border-[#c5a059]/50 text-[#e9c176] font-bold'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>OS Push: {prefs.browserNotificationsEnabled ? 'Active' : 'Enable'}</span>
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-500">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-300">No push notifications yet</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Alerts will trigger automatically in real-time when a specialist accepts your booking, starts navigation, or arrives at your doorstep.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.type === 'worker_travel_started'
                      ? 'bg-[#0a1834] border-[#c5a059]/50 hover:border-[#c5a059]'
                      : item.type === 'worker_accepted'
                      ? 'bg-[#08152e] border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-[#07122a] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {item.type === 'worker_travel_started' ? (
                        <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#e9c176]">
                          <Navigation className="w-4 h-4 animate-pulse" />
                        </div>
                      ) : item.type === 'worker_accepted' ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-white truncate">
                          {item.title}
                        </h5>
                        <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                        {item.body}
                      </p>

                      {item.etaMinutes && (
                        <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-[#e9c176]">
                          <Clock className="w-3 h-3" />
                          <span>Estimated Arrival: {item.etaMinutes} mins ({item.distanceKm || 2.4} km)</span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-500">Order: {item.orderId || 'Active Dispatch'}</span>
                        <span className="text-[#e9c176] font-bold flex items-center gap-1 hover:underline">
                          <span>Track GPS</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#07122a] border-t border-zinc-800 text-center">
            <p className="text-[10px] font-mono text-zinc-500">
              PunchX Push Notification Service v2.4 • Integrated with Live Dispatch Telemetry
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

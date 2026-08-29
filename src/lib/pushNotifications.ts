// Push Notification Simulation & Telemetry Engine for PunchX

export interface PushAlert {
  id: string;
  type: 'worker_accepted' | 'worker_travel_started' | 'worker_arrived' | 'service_completed' | 'system_alert';
  title: string;
  body: string;
  workerName?: string;
  workerAvatar?: string;
  category?: string;
  orderId?: string;
  etaMinutes?: number;
  distanceKm?: number;
  customerAddress?: string;
  timestamp: number;
  read: boolean;
  actionScreen?: 'tracking' | 'home' | 'booking' | 'providers';
}

const STORAGE_KEY = 'punchx_push_notifications';
const PREFS_KEY = 'punchx_push_preferences';

export interface PushPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export const getPushPreferences = (): PushPreferences => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading push preferences:', e);
  }
  return {
    soundEnabled: true,
    vibrationEnabled: true,
    browserNotificationsEnabled: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  };
};

export const savePushPreferences = (prefs: Partial<PushPreferences>): PushPreferences => {
  const current = getPushPreferences();
  const updated = { ...current, ...prefs };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving push preferences:', e);
  }
  return updated;
};

// Web Audio API Synthesizer Chime - Clean harmonic tones
export const playNotificationChime = (type: PushAlert['type'] = 'worker_accepted') => {
  const prefs = getPushPreferences();
  if (!prefs.soundEnabled) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    
    // Choose chime melody based on event type
    let freq1 = 587.33; // D5
    let freq2 = 880.00; // A5
    let freq3 = 1174.66; // D6

    if (type === 'worker_travel_started') {
      freq1 = 523.25; // C5
      freq2 = 659.25; // E5
      freq3 = 1046.50; // C6
    } else if (type === 'worker_arrived') {
      freq1 = 659.25; // E5
      freq2 = 880.00; // A5
      freq3 = 1318.51; // E6
    }

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Tone 2 (Upper harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq2, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.65);

    // Tone 3 (Shimmer chord for travel/arrival)
    if (type === 'worker_travel_started' || type === 'worker_arrived') {
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq3, now + 0.22);
      gain3.gain.setValueAtTime(0, now + 0.22);
      gain3.gain.linearRampToValueAtTime(0.2, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.22);
      osc3.stop(now + 0.85);
    }
  } catch (e) {
    console.warn('Audio chime playback omitted or blocked by browser policy:', e);
  }
};

// Haptic Vibration feedback for mobile browsers
export const triggerHapticFeedback = () => {
  const prefs = getPushPreferences();
  if (!prefs.vibrationEnabled) return;
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch (e) {
    // Ignore vibration error
  }
};

// Browser OS Level Push Notification trigger
export const triggerBrowserNotification = (title: string, options?: NotificationOptions) => {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  } catch (e) {
    console.warn('Browser notification trigger fallback:', e);
  }
};

// Request browser native notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    const granted = perm === 'granted';
    savePushPreferences({ browserNotificationsEnabled: granted });
    return granted;
  } catch (e) {
    console.warn('Could not request notification permission:', e);
    return false;
  }
};

// Listeners for in-app push dispatching
type PushListener = (alert: PushAlert) => void;
const listeners: Set<PushListener> = new Set();

export const subscribeToPushAlerts = (callback: PushListener): (() => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

// Retrieve all stored notifications
export const getStoredPushNotifications = (): PushAlert[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored push alerts:', e);
  }
  return [];
};

// Mark notification as read
export const markPushNotificationAsRead = (id: string): void => {
  const current = getStoredPushNotifications();
  const updated = current.map(item => item.id === id ? { ...item, read: true } : item);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn(e);
  }
};

// Clear all notifications
export const clearAllPushNotifications = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn(e);
  }
};

// Core Dispatcher
export const dispatchPushNotification = (
  alertData: Omit<PushAlert, 'id' | 'timestamp' | 'read'>
): PushAlert => {
  const alert: PushAlert = {
    ...alertData,
    id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    read: false
  };

  // 1. Save to local storage history
  try {
    const existing = getStoredPushNotifications();
    const updated = [alert, ...existing].slice(0, 50); // keep up to 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not store push alert:', e);
  }

  // 2. Play sound & haptics
  playNotificationChime(alert.type);
  triggerHapticFeedback();

  // 3. Trigger Browser OS Native Notification if enabled
  triggerBrowserNotification(alert.title, {
    body: alert.body,
    tag: alert.orderId || 'punchx-alert'
  });

  // 4. Notify all React component subscribers
  listeners.forEach(cb => {
    try {
      cb(alert);
    } catch (err) {
      console.warn('Push alert listener error:', err);
    }
  });

  // 5. Broadcast to other tabs/windows if available
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('punchx_push_channel');
      bc.postMessage(alert);
      bc.close();
    }
  } catch (e) {
    // BroadcastChannel unsupported
  }

  return alert;
};

// REAL-TIME SERVICE NOTIFICATION DISPATCHERS

export const dispatchWorkerAcceptedAlert = (params?: {
  workerName?: string;
  category?: string;
  orderId?: string;
  workerAvatar?: string;
  customerAddress?: string;
}) => {
  const workerName = params?.workerName || 'Service Specialist';
  const category = params?.category || 'Service';
  const orderId = params?.orderId || `PX-${Math.floor(1000 + Math.random() * 9000)}`;

  return dispatchPushNotification({
    type: 'worker_accepted',
    title: `⚡ Specialist Accepted Your ${category} Request!`,
    body: `${workerName} has accepted your service booking (${orderId}). Diagnostic equipment and toolkits are prepared for dispatch.`,
    workerName,
    workerAvatar: params?.workerAvatar,
    category,
    orderId,
    customerAddress: params?.customerAddress,
    actionScreen: 'tracking'
  });
};

export const dispatchWorkerTravelAlert = (params?: {
  workerName?: string;
  category?: string;
  orderId?: string;
  etaMinutes?: number;
  distanceKm?: number;
  workerAvatar?: string;
  customerAddress?: string;
}) => {
  const workerName = params?.workerName || 'Service Specialist';
  const etaMinutes = params?.etaMinutes || 10;
  const distanceKm = params?.distanceKm || 2.0;
  const orderId = params?.orderId || `PX-${Math.floor(1000 + Math.random() * 9000)}`;

  return dispatchPushNotification({
    type: 'worker_travel_started',
    title: `🚚 Specialist Began Travel to Your Location`,
    body: `${workerName} has started travelling towards your address. Live GPS route tracking is active. Estimated arrival: ~${etaMinutes} mins (${distanceKm} km).`,
    workerName,
    workerAvatar: params?.workerAvatar,
    category: params?.category,
    orderId,
    etaMinutes,
    distanceKm,
    customerAddress: params?.customerAddress,
    actionScreen: 'tracking'
  });
};

export const dispatchWorkerArrivedAlert = (params?: {
  workerName?: string;
  orderId?: string;
  workerAvatar?: string;
}) => {
  const workerName = params?.workerName || 'Service Specialist';
  const orderId = params?.orderId || `PX-${Math.floor(1000 + Math.random() * 9000)}`;

  return dispatchPushNotification({
    type: 'worker_arrived',
    title: `📍 Specialist Arrived at Doorstep!`,
    body: `${workerName} has reached your service location with verified PunchX security credentials. Share your secure OTP to initiate service.`,
    workerName,
    workerAvatar: params?.workerAvatar,
    orderId,
    actionScreen: 'tracking'
  });
};

// Aliases for compatibility
export const simulateWorkerAcceptedAlert = dispatchWorkerAcceptedAlert;
export const simulateWorkerTravelAlert = dispatchWorkerTravelAlert;
export const simulateWorkerArrivedAlert = dispatchWorkerArrivedAlert;

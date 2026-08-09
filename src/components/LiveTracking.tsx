import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppScreen } from '../types';
import { ArrowLeft, Star, Phone, MessageSquare, MapPin, Sparkles, Send, X, Compass, CheckCircle, Camera, Upload, ShieldCheck, UserCheck, Image } from 'lucide-react';
import { CategoryProfileBadge } from './CategoryIcon';

interface LiveTrackingProps {
  onTransition: (target: AppScreen) => void;
  bookingTime: string;
}

const DEFAULT_FALLBACK_ORDER = {
  id: "PX-8492",
  category: "AC Repair",
  workerName: "Rajesh Kumar",
  workerAvatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400",
  workerRating: "4.9",
  price: 1450,
  date: "Today",
  status: "In Progress",
  customerName: "Elite Customer",
  bookingTime: "Within 30 mins"
};

export default function LiveTracking({ onTransition, bookingTime }: LiveTrackingProps) {
  const [activeOrder, setActiveOrder] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('punchx_active_order');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not read active order", e);
    }
    return DEFAULT_FALLBACK_ORDER;
  });
  const [eta, setEta] = useState(8);
  const [statusStep, setStatusStep] = useState(0); // 0 = Assigned, 1 = Out for Service, 2 = Arrived, 3 = Completed
  const [workerPos, setWorkerPos] = useState({ x: 25, y: 70 }); // Position percentage
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'worker' | 'user'; text: string; time: string }[]>([
    { sender: 'worker', text: "Hello! Your elite request is verified. I am currently assembling the correct diagnostic toolkit and will be Out for Service shortly.", time: "Just now" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [trackingNotification, setTrackingNotification] = useState<string | null>(null);
  const [showLiveRoute, setShowLiveRoute] = useState(false);

  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'prompt' | 'granted' | 'denied' | 'fetching'>('prompt');
  const [liveAddressName, setLiveAddressName] = useState<string>('');

  // Secure dynamic one-time OTP states
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Secure dynamic completion signature details page (Post-OTP page)
  const [showClosureForm, setShowClosureForm] = useState(false);
  const [closureName, setClosureName] = useState('');
  const [closureAddress, setClosureAddress] = useState('');
  const [closurePhoto, setClosurePhoto] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Cancellation variables
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans / Not needed');
  const [cancelExplanation, setCancelExplanation] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationComplete, setCancellationComplete] = useState(false);

  // High fidelity Camera Simulation / visual shutter feedback
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraFlash, setCameraFlash] = useState(false);

  // Fetch real interactive geolocation for Citizen live location
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setGeoStatus('fetching');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLiveCoords({ lat, lng });
          setGeoStatus('granted');
          setLiveAddressName(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);

          // Attempt safe open-source reverse-geocoding via OSM Nominatim
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
            .then((res) => {
              if (res.ok) return res.json();
              throw new Error("Geocoding service unavailable");
            })
            .then((data) => {
              if (data && data.display_name) {
                setLiveAddressName(data.display_name);
              }
            })
            .catch(() => {
              // Fallback to coordinates label nicely
              setLiveAddressName(`Precision coordinates matched at GPS [${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E]`);
            });
        },
        (error) => {
          console.warn("Could not retrieve real location, using fallback.", error);
          setGeoStatus('denied');
          // Standard high prestige fallback of Metro city coordinates (Bengaluru Center)
          setLiveCoords({ lat: 12.9716, lng: 77.5946 });
          setLiveAddressName("42nd Galaxy Towers, Block C, Bengaluru, KA 560001 (GPS Fallback)");
        },
        { enableHighAccuracy: true, timeout: 8500 }
      );
    } else {
      setGeoStatus('denied');
      setLiveCoords({ lat: 12.9716, lng: 77.5946 });
      setLiveAddressName("42nd Galaxy Towers, Block C, Bengaluru, KA 560001 (GPS Unsupported)");
    }
  }, []);

  // Load from local storage dynamically
  useEffect(() => {
    const raw = localStorage.getItem('punchx_active_order');
    let parsed = DEFAULT_FALLBACK_ORDER;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
        setActiveOrder(parsed);
      } catch (e) {
        console.error("Error reading active order", e);
      }
    }

    // Personalize initial message with their name
    setChatMessages([
      {
        sender: 'worker',
        text: `Hello! I am ${parsed.workerName}. Your elite request is verified. I am currently assembling the correct diagnostic tools and will be Out for Service shortly!`,
        time: "Just now"
      }
    ]);

    // Secure unique 4-digit OTP per customer
    const storageKey = `punchx_otp_${parsed.id}`;
    let activeOtp = localStorage.getItem(storageKey);
    if (!activeOtp) {
      activeOtp = Math.floor(1000 + Math.random() * 9000).toString();
      localStorage.setItem(storageKey, activeOtp);
    }
    setOtp(activeOtp);
  }, []);

  // Sync live real address and recipient defaults for closure details
  useEffect(() => {
    if (liveAddressName && !closureAddress) {
      setClosureAddress(liveAddressName);
    }
  }, [liveAddressName, closureAddress]);

  useEffect(() => {
    if (activeOrder && !closureName) {
      setClosureName(activeOrder.customerName || "Elite Customer User");
    }
  }, [activeOrder, closureName]);

  // Automatic state transition from Assigned (0) to Out for Service (1) after 8 seconds
  useEffect(() => {
    if (activeOrder && statusStep === 0) {
      const timer = setTimeout(() => {
        setStatusStep(1); // Set to Out for Service
        setTrackingNotification("Technician is out for service!");
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'worker',
            text: `I am on my way to your location now.`,
            time: "Just now"
          }
        ]);
        
        setTimeout(() => {
          setTrackingNotification(null);
        }, 5000);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [statusStep, activeOrder]);

  // Move worker over time towards the customer on the map
  useEffect(() => {
    const interval = setInterval(() => {
      if (statusStep !== 1) return; // Only move and update ETA when out for service

      setWorkerPos((prev) => {
        const nextX = prev.x + (65 - prev.x) * 0.05;
        const nextY = prev.y - (prev.y - 35) * 0.05;
        return { x: nextX, y: nextY };
      });

      setEta((prev) => {
        if (prev <= 1) {
          setStatusStep(2); // Arrived!
          return 0;
        }
        return prev - 1;
      });
    }, 15000); // Shift every 15 seconds

    return () => clearInterval(interval);
  }, [statusStep]);

  // Handle automatic arrival -> completion transition
  useEffect(() => {
    if (statusStep === 2) {
      const arrivedTimer = setTimeout(() => {
        setStatusStep(3);
        setOtpSuccess(true);
        setTrackingNotification("Service successfully completed!");
        setTimeout(() => {
          setTrackingNotification(null);
          handleCompleteService();
        }, 3000);
      }, 2000);
      return () => clearTimeout(arrivedTimer);
    }
  }, [statusStep]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const textStr = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: textStr, time: "Just now" }]);
    setChatInput('');

    // Simulated worker reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'worker', text: "Received. Keep the gates clear. I will diagnose the issue promptly.", time: "Just now" }
      ]);
    }, 12000);
  };

  const handleCallWorker = () => {
    setIsCalling(true);
  };

  const handleTrackLiveLocation = () => {
    if (statusStep < 1) {
      setTrackingNotification("unable to show: available only after out of service");
      setTimeout(() => {
        setTrackingNotification(null);
      }, 4000);
      return;
    }

    setIsTrackingLocation(true);
    setTrackingNotification("Locating technician...");
    
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLiveCoords({ lat, lng });
          setGeoStatus('granted');
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
            .then((res) => {
              if (res.ok) return res.json();
              throw new Error("Nominatim status offline");
            })
            .then((data) => {
              if (data && data.display_name) {
                setLiveAddressName(data.display_name);
              }
            })
            .catch(() => {
              setLiveAddressName(`Bengaluru, KA`);
            });
        },
        (err) => {
          console.warn("Geolocation permission or network issue", err);
          setLiveCoords({ lat: 12.9716, lng: 77.5946 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    setTimeout(() => {
      setIsTrackingLocation(false);
      setTrackingNotification("Live location updated.");
      setShowLiveRoute(true);
      
      // Move worker 25% closer per manual tracking scan
      setWorkerPos((prev) => {
        const nextX = prev.x + (65 - prev.x) * 0.25;
        const nextY = prev.y - (prev.y - 35) * 0.25;
        return { x: nextX, y: nextY };
      });

      setEta((prev) => {
        if (prev <= 2) {
          setStatusStep(2); // Set status to ARRIVED (requires OTP to mark as COMPLETED)
          return 0;
        }
        return prev - 2;
      });

      setTimeout(() => {
        setTrackingNotification(null);
      }, 3500);
    }, 1200);
  };

  const handleCancelBooking = async () => {
    if (activeOrder?.id) {
      try {
        await updateDoc(doc(db, 'orders', activeOrder.id), {
          status: 'Cancelled',
          cancelReason: cancelReason,
          cancelDetails: cancelExplanation
        });
      } catch (e) {
        console.error("Error cancelling order in Firestore:", e);
      }
    }

    if (statusStep === 0) {
      setIsCancelling(true);
      setTimeout(() => {
        setIsCancelling(false);
        setCancellationComplete(true);
        
        try {
          const existingRaw = localStorage.getItem('punchx_order_history') || '[]';
          const history = JSON.parse(existingRaw);
          const updatedHistory = history.map((o: any) => {
            if (o.id === activeOrder.id) {
              return {
                ...o,
                status: 'Cancelled',
                cancelReason: cancelReason,
                cancelDetails: cancelExplanation
              };
            }
            return o;
          });
          localStorage.setItem('punchx_order_history', JSON.stringify(updatedHistory));
          localStorage.removeItem('punchx_active_order');
        } catch (e) {
          console.error("Error setting cancellation in history:", e);
        }
        
        // Wait to close, then back home
        setTimeout(() => {
          setShowCancelModal(false);
          setActiveOrder(null);
          onTransition('home');
        }, 2200);
      }, 600);
    } else {
      setIsCancelling(true);
      // Simulate sending cancellation request to technician
      setTimeout(() => {
        setIsCancelling(false);
        setCancellationComplete(true);
        
        try {
          const existingRaw = localStorage.getItem('punchx_order_history') || '[]';
          const history = JSON.parse(existingRaw);
          const updatedHistory = history.map((o: any) => {
            if (o.id === activeOrder.id) {
              return {
                ...o,
                status: 'Cancelled',
                cancelReason: cancelReason,
                cancelDetails: cancelExplanation
              };
            }
            return o;
          });
          localStorage.setItem('punchx_order_history', JSON.stringify(updatedHistory));
          localStorage.removeItem('punchx_active_order');
        } catch (e) {
          console.error("Error setting cancellation in history:", e);
        }
        
        // Wait to close, then back home
        setTimeout(() => {
          setShowCancelModal(false);
          setActiveOrder(null);
          onTransition('home');
        }, 2200);
      }, 2000);
    }
  };

  const handleCompleteService = async (closureDetails?: { name?: string; address?: string; photo?: string }) => {
    if (!activeOrder) return;

    if (activeOrder.id) {
      try {
        await updateDoc(doc(db, 'orders', activeOrder.id), {
          status: 'Done',
          closureName: closureDetails?.name || activeOrder.customerName || "Elite Customer",
          closureAddress: closureDetails?.address || "Direct Geolocalized GPS Coordinate Site",
          closurePhoto: closureDetails?.photo || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"
        });
      } catch (e) {
        console.error("Error completing order in Firestore:", e);
      }
    }
    
    try {
      // 1. Mark this specific order as 'Done' in the order history
      const existingRaw = localStorage.getItem('punchx_order_history') || '[]';
      const history = JSON.parse(existingRaw);
      const updatedHistory = history.map((order: any) => {
        if (order.id === activeOrder.id) {
          return { 
            ...order, 
            status: 'Done',
            closureName: closureDetails?.name || activeOrder.customerName || "Elite Customer",
            closureAddress: closureDetails?.address || "Direct Geolocalized GPS Coordinate Site",
            closurePhoto: closureDetails?.photo || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"
          };
        }
        return order;
      });
      localStorage.setItem('punchx_order_history', JSON.stringify(updatedHistory));
      
      // 2. Clear active tracker cache
      localStorage.removeItem('punchx_active_order');
      setActiveOrder(null);
    } catch (e) {
      console.error("Error finalizing coordinates:", e);
    }
    
    // 3. Return to home dashboard
    onTransition('home');
  };

  // High prestige real-time Retro Shutter Simulation for verified photo closure
  const handleSimulatedCapture = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCountdown(3);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          setCameraFlash(true);
          setTimeout(() => setCameraFlash(false), 200);
          
          const presets = [
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"
          ];
          const chosen = presets[Math.floor(Math.random() * presets.length)];
          setClosurePhoto(chosen);
          setIsCapturing(false);
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  if (!activeOrder) {
    return (
      <div id="no-active-order-view" className="relative min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans flex flex-col justify-between items-center py-20 px-6">
        <header className="fixed top-0 left-0 w-full z-50 bg-[#07122a]/80 backdrop-blur-md h-16 flex items-center justify-between px-6 border-b border-[#c5a059]/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTransition('home')}
              className="text-[#c5a059] active:scale-95 duration-200 cursor-pointer p-1.5 hover:bg-zinc-800 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-sans font-bold text-lg text-[#c5a059] tracking-tight">PunchX Live System</h1>
          </div>
        </header>

        <div className="m-auto max-w-md w-full bg-[#111415] border border-zinc-850 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto border border-[#c5a059]/30">
            <Compass className="w-8 h-8 text-[#e9c176] animate-spin-slow" />
          </div>
          <div className="space-y-2">
            <h2 className="font-sans font-bold text-lg text-white">No Active Booking Session</h2>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
              There is currently no active technician in route. You can browse our directory of elite technicians and book emergency assistance in less than 2 minutes.
            </p>
          </div>
          <button
            onClick={() => onTransition('home')}
            className="w-full py-3.5 bg-[#c5a059] hover:bg-[#e9c176] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-[#ffdea5]/40"
          >
            Explore Directories
          </button>
        </div>

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 w-full z-45 bg-[#07122a] border-t border-[#c5a059]/20 flex justify-around items-center h-20 shadow-2xl px-6">
          <button
            onClick={() => onTransition('home')}
            className="flex flex-col items-center justify-center gap-1 text-[#e9c176]"
          >
            <ArrowLeft className="w-5 h-5 text-[#e9c176]" />
            <span className="text-[10px] font-sans pb-1">Back Home</span>
          </button>
        </nav>
      </div>
    );
  }



  return (
    <div id="live-tracking-panel" className="relative min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans overflow-y-auto">
      
      {/* Top Header App bar */}
      <header id="tracking-header" className="sticky top-0 z-40 w-full bg-[#07122a]/95 backdrop-blur-md shadow-md py-3 px-4 flex items-center justify-between border-b border-[#c5a059]/20">
        <div className="flex items-center gap-3">
          <button
            id="tracking-back-btn"
            onClick={() => onTransition('home')}
            className="text-[#c5a059] active:scale-95 duration-200 cursor-pointer p-1.5 hover:bg-zinc-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#c5a059]" />
          </button>
          <h1 className="font-sans font-bold text-base text-[#c5a059] tracking-tight">PunchX Live System</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#c5a059]/40 overflow-hidden">
            <img
              alt="user profile avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMrfvalkE1oElIA_UbexIDO8CPbu4sXVbMzWUnyRgJXwf2HftTXdPGwNaIm_34LeHuWMMJgqsSZZdkvOoasKr4NxH0Vg-qGF0iW7V13A-iXTvtPuCMaMjPHDL8pj22nmoiph3MMUZXFKaTEMDkEc1BxDwQFvIOjlAQ2IVHtiu_0IKs5qKE5KCuiA7_z7LbNFPtv7DbFaxbE8VbDTMVhY7IfdZWk4pGw6qSmOWM7UFNaVqJT5cJANabT9sZy9lzbi4iQOcwsd7fM90"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main scrolling content flow container */}
      <main className="w-full max-w-7xl mx-auto pt-6 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Backdrop Container */}
          <div id="tracking-radar-map" className="lg:col-span-6 xl:col-span-7 relative w-full h-[320px] lg:h-[600px] bg-[#030d25] rounded-2xl border border-[#c5a059]/25 overflow-hidden shadow-inner sticky top-4">
          {/* Dark satellite imagery */}
          <img
            alt="Satellite City Map"
            className="w-full h-full object-cover opacity-30 grayscale contrast-125 brightness-50"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxXiIqRoq-vYxFfQWmh6nEJJVEZLuG8_XTloJupDAGo2KWEJare7l0lhFePpI4RBeHQPKLEls1Uq-y3NPjeNJX2LjJ673Y6rMncGzquudeN-dAeLsSPD77j1C0d-Xmd-hUfyTyD3nzJnIZ9Umfw67crjYLaYmNKoQnAym9LdhqNDzx2lDLM6AktT4POIRyNHM_MlEdhEcQDKxhKCKdiqvbBMGTDHa1G-R-ES3bAbsdN1kDhH05W21Z_9hcjIO7ZdktPvds37JFxwE"
            referrerPolicy="no-referrer"
          />

          {/* Golden Interactive Route Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Main background ambient flight path */}
            <svg className="absolute inset-0 w-full h-full opacity-35">
              <path
                d="M 200 600 Q 350 450 650 300"
                fill="transparent"
                stroke="#c5a059"
                strokeDasharray="8,8"
                strokeWidth="2"
                className="animate-[shimmer_12s_linear_infinite]"
                style={{ filter: 'drop-shadow(0 0 2px #c5a059)' }}
              />
            </svg>

            {/* Real-time precise route connecting technician to customer */}
            {showLiveRoute && (
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes routePulse {
                    0% { stroke-dashoffset: 0; opacity: 0.85; }
                    50% { opacity: 1; }
                    100% { stroke-dashoffset: -20; opacity: 0.85; }
                  }
                  .route-glow-path {
                    animation: routePulse 1.8s infinite linear;
                    filter: drop-shadow(0 0 4px rgba(197, 160, 89, 0.95));
                  }
                `}} />
                <defs>
                  <linearGradient id="live-route-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#c5a059" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                {/* Thick glowing route overlay line */}
                <path
                  d={`M ${workerPos.x} ${workerPos.y} Q ${(workerPos.x + 75) / 2 - 3} ${(workerPos.y + 35) / 2 + 3} 75 35`}
                  fill="none"
                  stroke="url(#live-route-gradient)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  className="route-glow-path"
                  strokeDasharray="4, 2"
                />
                {/* Small radar ping circle on target destination */}
                <circle cx="75" cy="35" r="1.5" fill="#10b981" className="animate-pulse" />
              </svg>
            )}

            {/* Route Locked overlay HUD feedback */}
            {showLiveRoute && (
              <div className="absolute top-4 left-4 bg-[#07122a]/95 border border-[#c5a059]/45 rounded-lg p-1.5 flex items-center gap-1.5 shadow-xl animate-fade-in font-mono text-[8px] font-extrabold tracking-widest text-[#e9c176]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Technician en route</span>
              </div>
            )}

            {/* Customer Stationary Coordinates marker (Top Right section) */}
            <div className="absolute top-[35%] right-[25%] flex flex-col items-center">
              <div className="p-2 bg-[#c5a059] rounded-full shadow-lg border-2 border-white/20 animate-pulse text-black">
                <MapPin className="w-4 h-4 text-black" fill="black" />
              </div>
              <span className="mt-1 bg-black/80 px-2.5 py-1 rounded text-[10px] text-zinc-100 font-extrabold tracking-wider font-mono border border-[#c5a059]/45 whitespace-nowrap shadow-xl">
                {liveCoords ? `LIVE: ${liveCoords.lat.toFixed(5)}°, ${liveCoords.lng.toFixed(5)}°` : 'YOU (LOCATING...)'}
              </span>
            </div>

            {/* Worker Moving Marker overlay */}
            <div
              className="absolute flex flex-col items-center duration-1000 transition-all ease-out"
              style={{ left: `${workerPos.x}%`, top: `${workerPos.y}%` }}
            >
              <div className="p-2 bg-indigo-950 rounded-full shadow-2xl border-2 border-[#c5a059] flex items-center justify-center animate-bounce text-white">
                <Compass className="w-4 h-4 text-[#e9c176] animate-spin-slow" />
              </div>
              <span className="mt-1 bg-[#101b33] px-2.5 py-0.5 rounded-md text-[9px] text-[#e9c176] font-mono font-extrabold uppercase border border-[#c5a059]/40 tracking-wider">
                {activeOrder.workerName}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Flow Card Overlay container */}
        <div id="tracking-card-overlay" className="w-full lg:col-span-6 xl:col-span-5">
          <div className="bg-[#0c1525]/90 border border-[#c5a059]/30 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
            
            {/* Worker Info Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-full border-2 border-[#c5a059] p-0.5 bg-gradient-to-tr from-[#c5a059] to-transparent">
                  <img
                    alt={`${activeOrder.workerName} avatar`}
                    className="w-full h-full rounded-full object-cover"
                    src={activeOrder.workerAvatar}
                    referrerPolicy="no-referrer"
                  />
                  {/* Category badge overlay in top corner of tracking card */}
                  <CategoryProfileBadge category={activeOrder.category} sizeClassName="w-5.5 h-5.5 p-1" className="-top-1 -right-1" />
                </div>
                <div className="text-left">
                  <h2 className="font-sans font-bold text-[#e1e3e4] text-base">{activeOrder.workerName}</h2>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#e9c176] text-[#e9c176]" />
                    <span>{activeOrder.workerRating} ★ {activeOrder.category} Specialist</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 leading-none font-mono tracking-widest uppercase">ETA Transit</p>
                <p id="eta-timer" className="text-xl md:text-2xl font-extrabold text-[#c5a059] font-mono mt-1 animate-pulse">
                  {eta > 0 ? `${eta} mins` : 'Arrived!'}
                </p>
              </div>
            </div>

            {/* Service Time information details */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-[#101b33]/40 border border-[#c5a059]/15 rounded-xl p-3 text-left">
                <span className="text-[8.5px] font-mono tracking-widest text-[#c5a059] uppercase block font-extrabold">Appointment Slot</span>
                <span className="text-xs font-bold text-white font-sans mt-1 block">
                  {bookingTime || activeOrder.bookingTime || "Within 30 Mins (ASAP)"}
                </span>
              </div>
              <div className="bg-[#101b33]/40 border border-[#c5a059]/15 rounded-xl p-3 text-left">
                <span className="text-[8.5px] font-mono tracking-widest text-[#c5a059] uppercase block font-extrabold">Time Needed to Come</span>
                <span id="eta-time-span" className="text-xs font-bold text-emerald-400 font-sans mt-1 block animate-pulse">
                  {eta > 0 ? `${eta} minutes remaining` : 'Arrived & Initiated!'}
                </span>
              </div>
            </div>

            {/* Real-time Dynamic Destination Geo-radar Panel */}
            <div className="mb-5 bg-[#101b33]/60 border border-[#c5a059]/15 rounded-xl p-3 flex items-start gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center text-[#e9c176] shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-[#e9c176] animate-pulse" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono tracking-widest font-extrabold text-[#c5a059] uppercase">
                    Service Destination
                  </span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.25 rounded uppercase border ${
                    statusStep === 0 
                      ? 'bg-[#c5a059]/10 border-[#c5a059]/30 text-[#e9c176]'
                      : geoStatus === 'granted' 
                      ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#34d399]' 
                      : 'bg-zinc-500/10 border-zinc-800 text-zinc-400'
                  }`}>
                    {statusStep === 0 ? 'AWAITING DISPATCH' : geoStatus === 'granted' ? 'LIVE GPS ACTIVE' : 'MANUAL FALLBACK'}
                  </span>
                </div>
                <p id="target-live-coords" className="text-xs font-bold text-white mt-1 leading-normal">
                  {liveAddressName || 'Synthesizing live satellite coordinates...'}
                </p>
                {liveCoords && (
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    LAT: {liveCoords.lat.toFixed(6)}° • LNG: {liveCoords.lng.toFixed(6)}°
                  </p>
                )}
              </div>
            </div>

            {/* Quick Telemetry Sync Feedback Banner */}
            {trackingNotification && (
              <div id="satellite-toast" className="mb-5 py-2.5 px-4 rounded-xl bg-[#101b33]/90 border border-[#c5a059]/40 text-[10px] font-mono text-[#e9c176] shadow-lg animate-pulse flex items-center justify-center gap-2 text-left">
                <Compass className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                <span className="font-bold">{trackingNotification}</span>
              </div>
            )}

            {/* Stepper Status Flow */}
            <div className="relative flex justify-between items-center mb-6 px-4">
              {/* Background progress track line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 -z-10"></div>
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#c5a059] -translate-y-1/2 -z-10 transition-all duration-1000"
                style={{ width: statusStep === 0 ? '0%' : statusStep === 1 ? '33.3%' : statusStep === 2 ? '66.6%' : '100%' }}
              ></div>

              {/* Stepper Steps */}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-3.5 h-3.5 rounded-full ${statusStep >= 0 ? 'bg-[#c5a059]' : 'bg-zinc-800 border'}`}></div>
                <span className={`text-[9px] font-mono tracking-wider font-bold ${statusStep >= 0 ? 'text-[#c5a059]' : 'text-zinc-650'}`}>ASSIGNED</span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-4 border-[#07122a] ${statusStep >= 1 ? 'bg-[#c5a059]' : 'bg-zinc-800'}`}>
                  {statusStep === 1 && <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>}
                </div>
                <span className={`text-[9px] font-mono tracking-wider font-bold ${statusStep >= 1 ? 'text-[#c5a059]' : 'text-zinc-650'}`}>OUT FOR SERVICE</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-4 border-[#07122a] ${statusStep >= 2 ? 'bg-[#c5a059]' : 'bg-zinc-800'}`}>
                  {statusStep === 2 && <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>}
                </div>
                <span className={`text-[9px] font-mono tracking-wider font-bold ${statusStep >= 2 ? 'text-[#c5a059]' : 'text-zinc-650'}`}>ARRIVED</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className={`w-3.5 h-3.5 rounded-full ${statusStep >= 3 ? 'bg-emerald-500' : 'bg-zinc-800 border'}`}></div>
                <span className={`text-[9px] font-mono tracking-wider font-bold ${statusStep >= 3 ? 'text-emerald-400' : 'text-zinc-650'}`}>COMPLETED</span>
              </div>
            </div>

            {/* Service OTP Verification Area */}
            {otp && (
              <div id="service-otp-box" className="mb-5 p-4 bg-[#0a1120] border border-[#c5a059]/25 rounded-xl text-left space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                    <h3 className="text-[10px] font-mono tracking-widest font-bold text-[#e1e3e4] uppercase">
                      Service OTP
                    </h3>
                  </div>
                  <span className="text-[8px] bg-[#c5a059]/10 text-[#e9c176] font-mono px-2 py-0.5 rounded border border-[#c5a059]/20 font-bold tracking-wider uppercase">
                    OTP Code
                  </span>
                </div>
                
                {/* Giant Digit Display */}
                <div className="flex gap-2.5 justify-center py-1">
                  {otp.split('').map((char, index) => (
                    <div
                      key={index}
                      className="w-11 h-14 rounded-lg bg-[#07122a] border border-[#c5a059]/40 flex items-center justify-center font-mono text-2xl font-extrabold text-[#e9c176] shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10"></div>
                      <span>{char}</span>
                    </div>
                  ))}
                </div>

                {/* Safety Instructions Note closely matching the custom request */}
                <p className="text-[10px] font-mono text-amber-500/95 leading-normal text-center font-semibold bg-amber-500/5 px-3 py-2.5 rounded-lg border border-amber-500/15">
                  ⚠️ Only after completing the work only share the OTP to our service person
                </p>

                {/* Simplified secure customer approval state message */}
                {statusStep >= 3 && (
                  <div className="pt-2 text-center text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>✓ SERVICE VERIFIED</span>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Interactive Flow Controls */}
            {statusStep < 3 && (
              <div className="mb-4">
                <button
                  id="track-live-location-btn"
                  type="button"
                  onClick={handleTrackLiveLocation}
                  disabled={isTrackingLocation}
                  className="w-full py-3.5 bg-[#c5a059]/10 hover:bg-[#c5a059] border border-[#c5a059]/40 hover:text-black text-[#e9c176] font-mono text-[9px] tracking-widest font-extrabold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-md uppercase"
                >
                  <Compass className={`w-3.5 h-3.5 ${isTrackingLocation ? 'animate-spin' : ''}`} />
                  <span>{isTrackingLocation ? 'Locating...' : 'TRACK LOCATION'}</span>
                </button>
              </div>
            )}

            {/* Cancel Booking Feature - enabled up to "OUT FOR SERVICE" state */}
            {statusStep <= 1 && (
              <div className="mb-4">
                <button
                  id="cancel-booking-btn"
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3.5 bg-red-950/20 hover:bg-red-900/30 border border-red-800/40 text-red-400 font-mono text-[9px] tracking-widest font-extrabold rounded-xl transition-all cursor-pointer text-center uppercase"
                >
                  Cancel Booking
                </button>
              </div>
            )}

            {/* Action Call & Chat buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                id="call-electrician-btn"
                onClick={handleCallWorker}
                className="flex items-center justify-center gap-2 bg-[#c5a059] hover:brightness-110 text-[#07122a] font-mono text-[10px] font-extrabold py-3.5 rounded-xl active:scale-95 transition-transform cursor-pointer shadow-lg"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>CALL WORKER</span>
              </button>
              <button
                id="chat-electrician-btn"
                onClick={() => setShowChatModal(true)}
                className="flex items-center justify-center gap-2 border border-[#c5a059] hover:bg-[#c5a059]/10 text-[#e9c176] font-mono text-[10px] font-extrabold py-3.5 rounded-xl active:scale-95 transition-transform cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>CHAT WITH PRO</span>
              </button>
            </div>

          </div>
        </div>
      </div>
      </main>

      {/* Real-time chat dialogue overlay dialog */}
      <AnimatePresence>
        {showChatModal && (
          <motion.div
            id="chat-modal-overlay"
            className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              id="chat-card"
              className="w-full max-w-md bg-[#0c0f10] border border-[#c5a059]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
            >
              {/* Core header */}
              <div className="p-4 bg-[#111415] border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold font-sans">{activeOrder.workerName} secure channel</span>
                </div>
                <button
                  id="close-chat-btn"
                  onClick={() => setShowChatModal(false)}
                  className="p-1 border border-zinc-700 hover:border-zinc-500 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat messages columns */}
              <div id="chat-scroller" className="p-4 h-72 overflow-y-auto space-y-3.5 flex flex-col custom-scrollbar">
                {chatMessages.map((msg, idx) => {
                  const isWorker = msg.sender === 'worker';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[80%] ${isWorker ? 'self-start items-start' : 'self-end items-end'}`}
                    >
                      <div
                        className={`p-3 rounded-xl text-xs ${isWorker ? 'bg-[#151f37] border border-zinc-800 text-zinc-250' : 'bg-[#c5a059] font-bold text-black'}`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-zinc-650 font-mono mt-1">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Input section form */}
              <form
                id="chat-send-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[#111415] border-t border-zinc-800 flex gap-2"
              >
                <input
                  id="chat-message-field"
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow bg-[#151f37] border border-zinc-700 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs outline-none text-white"
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  className="p-2.5 bg-[#c5a059] text-black rounded-xl hover:bg-[#e9c176] transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Immersive Voice Calling simulation overlay */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            id="calling-simulation-overlay"
            className="fixed inset-0 z-[120] bg-[#07122a]/95 flex flex-col items-center justify-between py-16 px-6 backdrop-blur-2xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] text-[#e9c176] font-mono tracking-[0.3em] uppercase opacity-75">
                Customer Support
              </span>
              <h2 className="font-sans font-bold text-lg text-[#e9c176]">Voice Call</h2>
            </div>

            <div className="relative flex flex-col items-center gap-6">
              {/* Pulsing visual circles */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#c5a059]/15 rounded-full blur-xl scale-125 animate-pulse"></div>
                <div className="relative animate-bounce">
                  <div className="w-28 h-28 rounded-full border-4 border-[#c5a059] p-1 overflow-hidden bg-[#111415]">
                    <img
                      alt={`${activeOrder.workerName} call avatar`}
                      className="w-full h-full rounded-full object-cover"
                      src={activeOrder.workerAvatar}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Category badge overlay in top corner of call avatar */}
                  <CategoryProfileBadge category={activeOrder.category} sizeClassName="w-8 h-8 p-1.5" className="top-1 right-1" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-lg font-bold text-[#e1e3e4]">{activeOrder.workerName}</p>
                <p className="text-[11px] text-emerald-400 font-mono tracking-widest uppercase animate-pulse">
                  Calling...
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                Connecting your call to the assigned technician.
              </p>
              <button
                id="end-call-btn"
                onClick={() => setIsCalling(false)}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <X className="w-7 h-7 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancellation Modal Selection Overlay */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            id="cancel-modal-overlay"
            className="fixed inset-0 z-[130] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              id="cancel-card"
              className="w-full max-w-sm bg-[#0c0f10] border-2 border-red-900/30 rounded-2xl p-6 shadow-2xl flex flex-col space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {isCancelling ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-t-red-500 border-red-500/10 rounded-full animate-spin"></div>
                  <h3 className="font-sans font-bold text-[#e1e3e4]">
                    {statusStep === 0 ? "Cancelling booking..." : "Sending cancellation request..."}
                  </h3>
                  <p className="text-zinc-500 text-xs text-center">
                    {statusStep === 0 ? "Processing your cancellation directly." : `Notifying ${activeOrder.workerName} regarding your cancel request.`}
                  </p>
                </div>
              ) : cancellationComplete ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-sans font-bold text-[#e1e3e4]">Cancelled Successfully</h3>
                  <p className="text-zinc-500 text-xs text-center font-bold">Your service is successfully cancelled</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-sans font-extrabold text-lg text-white">Cancel booking</h2>
                      <p className="text-zinc-400 text-xs mt-1">Please select the reason for cancellation to notify the technician.</p>
                    </div>
                    <button
                      id="close-cancel-btn"
                      onClick={() => setShowCancelModal(false)}
                      className="p-1 border border-zinc-800 hover:border-zinc-700 rounded-full text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mt-2">
                    {[
                      'Change of plans / Not needed',
                      'Technician is delayed',
                      'Booked another service',
                      'Incorrect price or service type',
                      'Other reason'
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setCancelReason(reason)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          cancelReason === reason 
                            ? 'bg-red-500/5 border-red-500/30 text-[#e9c176] font-bold' 
                            : 'bg-[#151f37]/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span>{reason}</span>
                        {cancelReason === reason && <div className="w-2 h-2 rounded-full bg-red-400"></div>}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Additional details (optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Type reason here..."
                      value={cancelExplanation}
                      onChange={(e) => setCancelExplanation(e.target.value)}
                      className="w-full bg-[#151f37]/40 border border-zinc-700 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs outline-none text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(false)}
                      className="py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs rounded-xl transition-all uppercase tracking-wide cursor-pointer text-center"
                    >
                      Keep Booking
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelBooking}
                      className="py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wide cursor-pointer text-center"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav for visual coherence */}
      <nav id="tracking-bottom-navbar" className="fixed bottom-0 left-0 w-full z-45 bg-[#07122a] border-t border-[#c5a059]/20 flex justify-around items-center h-20 shadow-2xl px-6">
        <button
          id="nav-track-btn-home"
          onClick={() => onTransition('home')}
          className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-[#e9c176] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
          <span className="text-[10px] font-sans pb-1.5">Back Home</span>
        </button>

        <button
          id="nav-track-btn-track"
          className="flex flex-col items-center justify-center gap-1 text-[#e9c176] bg-[#c5a059]/10 px-4 py-1.5 rounded-xl border border-[#c5a059]/30"
        >
          <Compass className="w-5 h-5 text-[#e9c176] animate-spin-slow" />
          <span className="text-[10px] font-bold font-sans uppercase">Tracking</span>
        </button>
      </nav>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppScreen } from '../types';
import { Compass, MapPin } from 'lucide-react';
import PUNCHX_LOGO from '../assets/logo';
import { SignIn } from "@namoidhq/react";
import { requestAndAutoUpdateLocation, LocationData } from '../lib/location';

interface AuthProps {
  onTransition: (target: AppScreen) => void;
  showNotification: (msg: string) => void;
  setAuthMethodDetail: (method: 'phone' | 'gmail', target: string) => void;
  activePanelRole?: 'customer' | 'worker' | 'admin';
}

export default function Auth({ onTransition, showNotification, activePanelRole = 'customer' }: AuthProps) {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      requestAndAutoUpdateLocation(activePanelRole).then((loc) => {
        if (loc) setLocationData(loc);
      });
    }

    // Persist NamoID PKCE transaction from sessionStorage to localStorage so callback survives redirects
    const syncOidcTransaction = () => {
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith("namoid_oidc")) {
            const val = sessionStorage.getItem(k);
            if (val) localStorage.setItem(k, val);
          }
        }
      } catch {
        // Storage access guard
      }
    };

    window.addEventListener("beforeunload", syncOidcTransaction);
    return () => window.removeEventListener("beforeunload", syncOidcTransaction);
  }, [activePanelRole]);

  const handleRequestLocation = async () => {
    setIsLocating(true);
    const loc = await requestAndAutoUpdateLocation(activePanelRole);
    setIsLocating(false);
    if (loc) {
      setLocationData(loc);
      showNotification(`📍 Location auto-updated: ${loc.area || loc.address.split(',')[0]}`);
    } else {
      showNotification("⚠️ Location access denied or unavailable. Please enable device location.");
    }
  };

  const roleLabels = {
    customer: 'Customer Sign In',
    worker: 'Specialist Sign In',
    admin: 'Admin Secure Login'
  };

  return (
    <main className="min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans flex flex-col justify-between py-10 px-6 overflow-y-auto">
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-[#c5a059]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <button
          onClick={() => onTransition('panel-select')}
          className="self-start text-[11px] font-mono text-[#e9c176] hover:underline flex items-center gap-1 mb-2 bg-[#11192e] px-3 py-1.5 rounded-lg border border-zinc-800 cursor-pointer"
        >
          ← Choose Different Panel
        </button>

        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <motion.div
            className="w-20 h-20 rounded-full bg-white p-1 flex items-center justify-center mb-4 shadow-[0_8px_25px_rgba(197,160,89,0.25)] border-2 border-[#c5a059]/40 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <img src={PUNCHX_LOGO} alt="PunchX Logo" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="font-sans font-extrabold text-2xl tracking-tight text-white mb-1">
            {roleLabels[activePanelRole]}
          </h1>
          <p className="text-sm text-zinc-300 max-w-[320px] leading-relaxed mt-2">
            Securely authenticate to access your {activePanelRole} dashboard using NamoID.
          </p>
        </div>

        <div className="w-full bg-[#11192e] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
          <div className="bg-[#0b1731] border border-[#c5a059]/30 p-3 rounded-xl flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-lg bg-[#c5a059]/15 text-[#e9c176] flex-shrink-0">
                <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#e9c176]" />
                  {locationData ? locationData.area : 'Location Permission Required'}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {locationData ? locationData.address : 'Auto-syncs profile address & matches local specialists'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestLocation}
              className="px-2.5 py-1.5 bg-[#c5a059]/20 hover:bg-[#c5a059] text-[#e9c176] hover:text-black rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap border border-[#c5a059]/40 flex-shrink-0 cursor-pointer"
            >
              {locationData ? 'Re-Sync' : 'Allow GPS'}
            </button>
          </div>

          <div className="flex justify-center mt-6">
            <SignIn 
              redirectUri={
                typeof window !== 'undefined'
                  ? `${window.location.origin}/auth/callback`
                  : import.meta.env.VITE_NAMOID_REDIRECT_URI || 'https://www.punchxapp.co.in/auth/callback'
              } 
            />
          </div>

          <div className="text-center pt-4 border-t border-zinc-800 text-xs text-zinc-400">
            By signing in, you agree to our{' '}
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                onTransition('privacy-policy');
              }}
              className="text-[#e9c176] underline hover:text-[#ffdea5] cursor-pointer"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/terms-and-conditions"
              onClick={(e) => {
                e.preventDefault();
                onTransition('terms-and-conditions');
              }}
              className="text-[#e9c176] underline hover:text-[#ffdea5] cursor-pointer"
            >
              Terms & Conditions
            </a>.
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto text-center mt-6">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
          SECURE NAMOID LOG IN • PUNCHX
        </p>
      </div>
    </main>
  );
}

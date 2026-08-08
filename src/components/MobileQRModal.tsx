import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, X, ExternalLink, Copy, Check } from 'lucide-react';

interface MobileQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileQRModal({ isOpen, onClose }: MobileQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use current window location, but default to the fallback if local dev
      let currentUrl = window.location.href;
      if (currentUrl.includes('localhost') || currentUrl.includes('3000')) {
        // Provide the real public dev URL as primary destination for real mobile testing
        currentUrl = 'https://ais-dev-zippe7ymaud5au46elqjj4-24490771387.asia-east1.run.app';
      }
      setAppUrl(currentUrl);
    }
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL', err);
    }
  };

  if (!isOpen) return null;

  // Use high-reliability direct QR Code generation services
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}&color=07122a&bgcolor=e9c176&format=png&qzone=2`;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#0a1120] border-2 border-[#c5a059] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(197,160,89,0.3)] animate-scale-up">
        {/* Golden glow accents */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-[#c5a059] to-emerald-500"></div>

        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-[#07122a]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#c5a059]/10 text-[#e9c176]">
              <Smartphone className="w-4 h-4 animate-bounce" />
            </div>
            <span className="text-[11px] font-mono tracking-widest font-extrabold text-[#e9c176] uppercase">
              Mobile Demo Gateway
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative p-2.5 bg-[#e9c176] rounded-xl shadow-xl flex items-center justify-center">
            {/* Embedded QR Code Image */}
            <img
              src={qrCodeUrl}
              alt="Scan QR code for mobile demo"
              className="w-40 h-40 object-contain rounded-lg border border-[#07122a]/10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 p-1 bg-emerald-500 rounded-full text-white shadow-md">
              <QrCode className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-bold tracking-wider text-[#e9c176] uppercase">
              SCAN QR TO RUN DEMO
            </h4>
            <p className="text-[10px] font-mono text-amber-500/90 leading-relaxed font-semibold bg-amber-500/5 px-2.5 py-1.5 rounded-lg border border-amber-500/15">
              💡 No Expo Go App Required! Standard Safari/Chrome mobile browser handles this fully-responsive layout natively.
            </p>
          </div>

          <div className="w-full pt-1.5 space-y-2">
            <span className="text-[9px] font-mono tracking-wider font-semibold text-zinc-400 uppercase block">
              Direct Application link:
            </span>
            <div className="flex gap-1.5 items-center justify-between bg-[#050c18] border border-zinc-800 rounded-lg p-2">
              <p className="text-[9px] font-mono text-zinc-300 truncate text-left max-w-[200px]">
                {appUrl}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-[#e9c176] transition-all"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-[#e9c176] transition-all"
                  title="Open Link in New Tab"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info step instructions */}
        <div className="p-3.5 bg-[#050c18] border-t border-zinc-950 flex flex-col gap-1.5 text-left text-[9px] font-mono text-zinc-400 font-medium leading-relaxed">
          <div className="flex gap-1.5 items-start">
            <span className="text-[#c5a059] font-bold">1.</span>
            <span>Open your iPhone/Android native **Camera App**.</span>
          </div>
          <div className="flex gap-1.5 items-start">
            <span className="text-[#c5a059] font-bold">2.</span>
            <span>Focus camera on this code and click the pop-up banner link.</span>
          </div>
          <div className="flex gap-1.5 items-start">
            <span className="text-[#c5a059] font-bold">3.</span>
            <span>Experience this Elite System on your phone!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

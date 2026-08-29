import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppScreen, Worker } from '../types';
import { 
  ArrowLeft, Clock, Calendar, MapPin, Camera, Clipboard, 
  ShoppingBag, CheckCircle, ShieldCheck, ShieldAlert, Zap, 
  Radio, Users, Check, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../lib/authContext';

interface ConfirmBookingProps {
  onTransition: (target: AppScreen) => void;
  selectedCategory: string;
  selectedWorker: Worker | null;
  promoApplied: boolean;
  issueDescription: string;
  setIssueDescription: (text: string) => void;
  bookingTime: string;
  setBookingTime: (time: string) => void;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  citizenAddress: string;
  setCitizenAddress: (val: string) => void;
}

const DATES = [
  { day: 'TODAY', num: 'NOW' },
  { day: 'MON', num: '12' },
  { day: 'TUE', num: '13' },
  { day: 'WED', num: '14' },
  { day: 'THU', num: '15' },
  { day: 'FRI', num: '16' },
];

const TIMES = ['Instant SOS', '09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '08:30 PM'];

export default function ConfirmBooking({
  onTransition,
  selectedCategory,
  selectedWorker,
  promoApplied,
  issueDescription,
  setIssueDescription,
  bookingTime,
  setBookingTime,
  bookingDate,
  setBookingDate,
  citizenAddress,
  setCitizenAddress
}: ConfirmBookingProps) {
  const { currentUser } = useAuth() as any;
  const [photoAdded, setPhotoAdded] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressVal, setEditAddressVal] = useState(citizenAddress);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🔴 1. 30-Day Free Service Guarantee Option (+₹99)
  const [hasWarrantyGuarantee, setHasWarrantyGuarantee] = useState<boolean>(() => {
    const saved = localStorage.getItem('punchx_opt_warranty');
    return saved !== null ? saved === 'true' : true; // Default ON for repair safety
  });

  // 🔴 4. Dispatch Mode: Personal Choice (+₹9) vs 15km Quick Match Broadcast (FREE)
  const [dispatchMode, setDispatchMode] = useState<'PERSONAL_SELECT' | 'BROADCAST_15KM'>(() => {
    return (localStorage.getItem('punchx_dispatch_mode') as any) || (selectedWorker ? 'PERSONAL_SELECT' : 'BROADCAST_15KM');
  });

  // 🟢 7. Emergency SOS Fast-Track Mode (+₹49)
  const [isEmergency, setIsEmergency] = useState<boolean>(() => {
    return localStorage.getItem('punchx_is_emergency') === 'true' || bookingDate === 'NOW';
  });

  // Dynamic cost calculations
  const baseFee = selectedWorker ? (selectedWorker.visitingFee || selectedWorker.price || 199) : 199;
  const visitingFee = 100;
  const warrantyFee = hasWarrantyGuarantee ? 99 : 0;
  const personalSelectFee = dispatchMode === 'PERSONAL_SELECT' ? 9 : 0;
  const emergencySurcharge = isEmergency ? 49 : 0;
  
  const subtotal = baseFee + visitingFee + personalSelectFee + emergencySurcharge;
  const discount = promoApplied ? Math.round((baseFee + visitingFee) * 0.2) : 0;
  const totalCost = subtotal - discount + warrantyFee;

  const handleToggleWarranty = (val: boolean) => {
    setHasWarrantyGuarantee(val);
    localStorage.setItem('punchx_opt_warranty', String(val));
  };

  const handleToggleDispatchMode = (mode: 'PERSONAL_SELECT' | 'BROADCAST_15KM') => {
    setDispatchMode(mode);
    localStorage.setItem('punchx_dispatch_mode', mode);
  };

  const handleToggleEmergency = (val: boolean) => {
    setIsEmergency(val);
    localStorage.setItem('punchx_is_emergency', String(val));
    if (val) {
      setBookingDate('NOW');
      setBookingTime('Instant SOS');
    }
  };

  const handleConfirm = () => {
    setSubmitting(true);
    // Save booking preferences to localStorage for payment gateway & Firestore sync
    localStorage.setItem('punchx_opt_warranty', String(hasWarrantyGuarantee));
    localStorage.setItem('punchx_dispatch_mode', dispatchMode);
    localStorage.setItem('punchx_is_emergency', String(isEmergency));
    localStorage.setItem('punchx_warranty_fee', String(warrantyFee));
    localStorage.setItem('punchx_personal_fee', String(personalSelectFee));
    localStorage.setItem('punchx_emergency_fee', String(emergencySurcharge));

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onTransition('payment');
      }, 800);
    }, 1200);
  };

  return (
    <div id="booking-container" className="w-full min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans pb-28 overflow-x-hidden">
      {/* Top App Bar Header segment */}
      <header id="booking-topbar" className="sticky top-0 z-40 w-full bg-[#07122a]/95 backdrop-blur-md border-b border-[#c5a059]/30 px-4 py-3 shadow-md">
        <div className="flex justify-between items-center w-full max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              id="booking-back-btn"
              onClick={() => onTransition('home')}
              className="p-1.5 hover:bg-zinc-800 rounded-full text-[#c5a059] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#c5a059]" />
            </button>
            <div>
              <h1 id="booking-bar-title" className="font-sans font-bold text-base text-[#c5a059] tracking-tight">
                Review & Confirm Booking
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono">Guaranteed Elite Service by PunchX</p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full border border-[#c5a059]/40 overflow-hidden">
            <img
              id="booking-profile-avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlRCkOTPvGdF_cQiOTGX6eI5gL1Fnk5vZwLM1nW9xIRpj9eAn05WVz48PLxgMr4NU5lqV_i1o-HtH76xMYpeqYTlz4M4amVujpLLjnkmyAzbuu1fbzhoSdfgK3BiGZoXcQuFCAgrGUFwdQU7KYU4XhJDOfVPOBwSqTWmG9i9UV7skA3elaBvljem2K4Sqzm5BOZxDb1emhmy_b8XgHdBIogy-lktt_4I_IkBCYtOvTtBJUKkbuetJjtIA7OqZdsXtVbXGe66lmG-M"
              alt="Profile avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main Form Fields */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-6">
        
        {/* 🔴 RED REQUIREMENT 1: 30-Day Free Service Guarantee Add-on Box */}
        <section id="warranty-guarantee-card" className="border-2 border-[#c5a059] bg-gradient-to-br from-[#11192e] to-[#0c1424] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#c5a059] text-black text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-black fill-black" />
            PunchX Protection
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#c5a059]/20 text-[#e9c176] border border-[#c5a059]/40 flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-7 h-7 text-[#e9c176]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-white">30-Day Free Service Guarantee</h3>
                <span className="bg-[#c5a059]/20 text-[#e9c176] border border-[#c5a059]/40 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">+₹99</span>
              </div>
              <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                If the <strong className="text-white">exact same problem recurs within 30 days</strong> of service completion, PunchX provides <strong className="text-[#e9c176]">100% Free Rebooking & Free Problem Diagnostics</strong> with priority dispatch.
              </p>
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-zinc-800/80">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasWarrantyGuarantee}
                    onChange={(e) => handleToggleWarranty(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-zinc-700 text-[#c5a059] focus:ring-[#c5a059] bg-[#07122a] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#e9c176]">
                    {hasWarrantyGuarantee ? "✓ 30-Day Free Service Guarantee Included" : "Add 30-Day Protection (+₹99)"}
                  </span>
                </label>
                <span className="text-[10px] font-mono text-zinc-400">Available for repair services</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🔴 RED REQUIREMENT 4: Personal Choice vs 15km Quick Match Broadcast */}
        <section id="dispatch-mode-card" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Specialist Dispatch Option
            </h2>
            <span className="text-[10px] font-mono text-zinc-400">Choose booking style</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Option A: Personal Choice */}
            <div
              onClick={() => handleToggleDispatchMode('PERSONAL_SELECT')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                dispatchMode === 'PERSONAL_SELECT'
                  ? 'border-[#c5a059] bg-[#151f37] shadow-lg shadow-[#c5a059]/10'
                  : 'border-zinc-800 bg-[#0d121c] hover:border-zinc-700 opacity-80'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    👤 Personal Choice Specialist
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#e9c176] bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/30">+₹9</span>
                </div>
                <p className="text-[11px] text-zinc-350 leading-relaxed">
                  Directly book your specifically chosen specialist ({selectedWorker ? selectedWorker.name : 'Rajesh Kumar'}). Fixed direct reservation.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#e9c176]">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dispatchMode === 'PERSONAL_SELECT' ? 'border-[#c5a059] bg-[#c5a059]' : 'border-zinc-600'}`}>
                  {dispatchMode === 'PERSONAL_SELECT' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
                <span>{dispatchMode === 'PERSONAL_SELECT' ? 'Active Selection (+₹9)' : 'Select Specific Specialist'}</span>
              </div>
            </div>

            {/* Option B: 15km Quick Match Broadcast */}
            <div
              onClick={() => handleToggleDispatchMode('BROADCAST_15KM')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                dispatchMode === 'BROADCAST_15KM'
                  ? 'border-[#c5a059] bg-[#151f37] shadow-lg shadow-[#c5a059]/10'
                  : 'border-zinc-800 bg-[#0d121c] hover:border-zinc-700 opacity-80'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    ⚡ 15 km Quick Match Broadcast
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">FREE (₹0)</span>
                </div>
                <p className="text-[11px] text-zinc-350 leading-relaxed">
                  Sends broadcast alerts to all verified {selectedCategory || 'AC Repair'} technicians within a <strong className="text-white">15 km radius</strong>. The fastest specialist to accept gets assigned!
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${dispatchMode === 'BROADCAST_15KM' ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600'}`}>
                  {dispatchMode === 'BROADCAST_15KM' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
                <span>{dispatchMode === 'BROADCAST_15KM' ? 'Fast-Match Active (FREE)' : 'Broadcast to 15km Radius'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🟢 REQUIREMENT 7: Emergency Services Mode (Find Someone Now) */}
        <section id="emergency-mode-card" className="border border-red-500/30 bg-gradient-to-r from-[#1f0d14] to-[#12080c] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                <Zap className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-red-200 uppercase tracking-wider">
                  Emergency Instant Mode (Within 15-30 Mins)
                </h3>
                <p className="text-[11px] text-zinc-400">Urgent leak, electrical failure, or severe breakdown</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => handleToggleEmergency(e.target.checked)}
                className="w-5 h-5 rounded border-red-500 text-red-600 focus:ring-red-500 bg-black cursor-pointer"
              />
              <span className="text-xs font-bold text-red-400">{isEmergency ? "ON (+₹49)" : "Enable SOS"}</span>
            </label>
          </div>
          {isEmergency && (
            <div className="p-3 bg-red-950/40 rounded-xl border border-red-500/20 text-[11px] text-red-200 leading-snug">
              🚨 <strong>High-Priority Emergency:</strong> Guaranteed rapid dispatch within <strong>15–30 minutes</strong> directly to your coordinate.
            </div>
          )}
        </section>

        {/* Active Worker Metadata panel */}
        {selectedWorker && dispatchMode === 'PERSONAL_SELECT' && (
          <div id="booking-worker-card" className="p-4 bg-[#111415] border border-[#c5a059]/30 rounded-2xl flex items-center gap-4 shadow-md">
            <img
              src={selectedWorker.avatar}
              alt={selectedWorker.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#c5a059]"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-[#e9c176] font-mono tracking-widest uppercase">Assigned Professional</p>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/40 font-mono">6-Tier Verified</span>
              </div>
              <h3 className="font-bold text-white text-sm">{selectedWorker.name}</h3>
              <p className="text-xs text-zinc-400">{selectedWorker.category} • rated {selectedWorker.rating} ★ • 1,245 jobs</p>
            </div>
          </div>
        )}

        {/* Section 1: Date & Time selector */}
        <section id="datetime-section" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-5">
          <div>
            <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              1. Select Date
            </h2>
            <div id="dates-slide-row" className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {DATES.map((d) => {
                const isActive = bookingDate === d.num;
                return (
                  <button
                    id={`date-button-${d.num}`}
                    key={d.num}
                    onClick={() => {
                      setBookingDate(d.num);
                      if (d.num === 'NOW') setIsEmergency(true);
                      else setIsEmergency(false);
                    }}
                    className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${isActive ? 'bg-[#c5a059] text-black font-extrabold shadow-[0_0_15px_rgba(197,160,89,0.4)]' : 'bg-[#151f37] text-zinc-400 border border-zinc-800'}`}
                  >
                    <span className="text-[10px] font-mono tracking-wider font-semibold opacity-70 mb-1">{d.day}</span>
                    <span className="text-xl font-bold font-sans">{d.num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              2. Select Hourly Slot
            </h2>
            <div id="times-chips-grid" className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {TIMES.map((time) => {
                const isActive = bookingTime === time;
                return (
                  <button
                    id={`time-button-${time.replace(/\s+/g, '')}`}
                    key={time}
                    onClick={() => setBookingTime(time)}
                    className={`py-3 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${isActive ? 'bg-[#c5a059] text-black border-[#ffdea5] shadow-lg shadow-[#c5a059]/10' : 'bg-[#151f37] border-zinc-800 text-zinc-400 hover:border-[#c5a059]/30'}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Address Selector */}
        <section id="address-section" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#e9c176]" />
              3. Service Location
            </h2>
            {!isEditingAddress ? (
              <button
                id="change-address-btn"
                onClick={() => {
                  setEditAddressVal(citizenAddress);
                  setIsEditingAddress(true);
                }}
                className="text-xs font-sans font-bold text-[#e9c176] hover:underline cursor-pointer"
              >
                Change
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (editAddressVal.trim()) {
                      const newAddr = editAddressVal.trim();
                      setCitizenAddress(newAddr);
                      if (currentUser?.uid) {
                        try {
                          await updateDoc(doc(db, 'users', currentUser.uid), {
                            address: newAddr,
                            updatedAt: new Date().toISOString()
                          });
                        } catch (e) {
                          console.error("Error updating address in Firestore:", e);
                        }
                      }
                    }
                    setIsEditingAddress(false);
                  }}
                  className="text-xs font-sans font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingAddress(false)}
                  className="text-xs font-sans font-bold text-zinc-400 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 p-4 bg-[#151f37] rounded-xl border border-zinc-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#c5a059]" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-white text-xs">Primary Home Coordinates</h3>
                {isEditingAddress ? (
                  <input
                    id="address-inline-edit-input"
                    type="text"
                    value={editAddressVal}
                    onChange={(e) => setEditAddressVal(e.target.value)}
                    className="w-full mt-2 bg-[#07122a] border border-[#c5a059]/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#e9c176]"
                    autoFocus
                  />
                ) : (
                  <p id="target-address-label" className="text-zinc-300 text-xs mt-1 leading-snug">{citizenAddress}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Problem description input with camera image attachment */}
        <section id="problem-form-section" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Clipboard className="w-3.5 h-3.5" />
            4. Describe the Problem
          </h2>
          <textarea
            id="issue-textarea-input"
            rows={4}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="w-full bg-[#151f37] border border-zinc-800 rounded-xl p-4 text-[#e1e3e4] text-xs focus:border-[#c5a059] outline-none resize-none placeholder-zinc-500 leading-relaxed font-sans"
            placeholder="Describe the exact breakdown, noise, leak, or issue. (Used for precision diagnostics & 30-day warranty records)"
          ></textarea>

          {/* Photo attachment zone */}
          <div className="flex gap-3 items-center">
            <button
              id="attach-photo-btn"
              onClick={() => setPhotoAdded(!photoAdded)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl border border-dashed text-xs cursor-pointer transition-colors ${photoAdded ? 'border-emerald-500/50 bg-[#151f37]' : 'border-zinc-700 hover:border-[#c5a059] bg-[#151f37] text-zinc-400'}`}
            >
              <Camera className={`w-5 h-5 mb-1 ${photoAdded ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <span className="text-[10px] font-mono font-bold">{photoAdded ? '✓ Added' : 'Add Photo'}</span>
            </button>
            {photoAdded ? (
              <div id="photo-preview-box" className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden relative border border-emerald-500">
                <img
                  alt="Issue thumbnail"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNQG_Ib7sdiH6QXYqBw6S_FG0Y67Y7FgIXUPIeaY2UwugJ-dsjGIOuz75pqZ-gmDI4nO6bU7pf-MCFxgjHfSXbnc5pdyy9dYr_j2loJtuv5iowie-V1v3XdqJBksNQGIRl4df5rkYh9GQtdBVuclqjfOZ-F4XvkL7Uk0YPh3VFfiAVKx1Pe91GJISO7Eaag0wncdLNhCWtreBTVBTblTZTeKb92BfW9pJ-_gtgDPnzRD3o9Uy1Yn4uF9dO9YgCZf7CQLSNc0qSkPw"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 italic max-w-sm leading-snug">
                Attach a clean camera photo of the repair area to verify initial condition for 30-day warranty protection.
              </p>
            )}
          </div>
        </section>

        {/* Section 4: Itemized Cost Breakdown */}
        <section id="cost-breakdown-section" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            Transparent Pricing Analysis
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-zinc-300">
              <span>Service Base Diagnostics Fee</span>
              <span className="font-mono text-white">₹{baseFee}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span>Vetting & Visiting Charges</span>
              <span className="font-mono text-white">₹{visitingFee}</span>
            </div>
            {dispatchMode === 'PERSONAL_SELECT' && (
              <div className="flex justify-between items-center text-[#e9c176]">
                <span>Personal Specialist Direct Booking</span>
                <span className="font-mono">+₹{personalSelectFee}</span>
              </div>
            )}
            {isEmergency && (
              <div className="flex justify-between items-center text-red-400">
                <span>Emergency Instant Dispatch Surcharge (15-30m)</span>
                <span className="font-mono">+₹{emergencySurcharge}</span>
              </div>
            )}
            {hasWarrantyGuarantee && (
              <div className="flex justify-between items-center text-[#e9c176] bg-[#c5a059]/10 p-1.5 rounded-lg border border-[#c5a059]/20">
                <span className="flex items-center gap-1 font-bold">🛡️ 30-Day Free Service Guarantee Add-on</span>
                <span className="font-mono font-bold">+₹99</span>
              </div>
            )}
            {promoApplied && (
              <div className="flex justify-between items-center text-emerald-400 py-1 border-t border-dashed border-zinc-800">
                <span className="flex items-center gap-1">Exclusive Promo Discount (20%)</span>
                <span className="font-semibold font-mono">-₹{discount}</span>
              </div>
            )}
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
              <div>
                <span className="font-bold text-white block">Grand Total Payable</span>
                <span className="text-[10px] text-zinc-400 font-mono">Includes 18% GST & Commission</span>
              </div>
              <span className="font-bold font-mono text-xl text-[#e9c176]">₹{totalCost}</span>
            </div>
          </div>
          <p id="disclaimer-text" className="text-[10px] text-zinc-400 italic leading-snug">
            *In case of any arrival issue or poor behavior, an instant 10% discount is applied automatically upon technician arrival.
          </p>
        </section>

      </main>

      {/* Persistent Bottom sticky action buttons container */}
      <div id="booking-sticky-action" className="fixed bottom-0 left-0 w-full z-45 bg-[#07122a]/95 border-t border-[#c5a059]/30 p-4 backdrop-blur-md">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Estimated Total</span>
            <span className="text-lg font-mono font-bold text-[#e9c176]">₹{totalCost}</span>
          </div>

          <button
            id="proceed-payment-booking-btn"
            onClick={handleConfirm}
            disabled={submitting || success}
            className={`flex-1 h-14 font-extrabold text-[#07122a] rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl transition-all cursor-pointer border ${success ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-[#c5a059] border-[#ffdea5]/50 shadow-[#c5a059]/10 hover:brightness-110 active:scale-[0.98]'}`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Locking In Dispatch...
              </span>
            ) : success ? (
              <span className="flex items-center gap-2 text-black">
                <CheckCircle className="w-5 h-5 text-black animate-bounce" />
                Proceeding to Payment Gateway...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue to Payment (₹{totalCost})
                <ArrowLeft className="w-4 h-4 transform rotate-180 text-[#07122a]" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppScreen, Worker } from '../types';
import { ArrowLeft, Clock, Calendar, MapPin, Camera, Clipboard, Terminal, ShoppingBag, CheckCircle, ShieldAlert } from 'lucide-react';

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
  { day: 'MON', num: '12' },
  { day: 'TUE', num: '13' },
  { day: 'WED', num: '14' },
  { day: 'THU', num: '15' },
  { day: 'FRI', num: '16' },
];

const TIMES = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM', '08:30 PM'];

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
  const [photoAdded, setPhotoAdded] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressVal, setEditAddressVal] = useState(citizenAddress);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamic cost calculations
  const baseFee = selectedWorker ? selectedWorker.price : 199;
  const visitingFee = 100;
  const subtotal = baseFee + visitingFee;
  const discount = promoApplied ? Math.round(subtotal * 0.2) : 0;
  const totalCost = subtotal - discount;

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onTransition('payment');
      }, 1000);
    }, 1500);
  };

  return (
    <div id="booking-container" className="w-full min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans pb-24 overflow-x-hidden">
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
            <h1 id="booking-bar-title" className="font-sans font-bold text-base text-[#c5a059] tracking-tight">
              Confirm Booking
            </h1>
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
      <main className="w-full max-w-xl mx-auto px-4 pt-4 space-y-5">
        
        {/* Active Worker Metadata panel */}
        {selectedWorker && (
          <div id="booking-worker-card" className="p-4 bg-[#111415] border border-[#c5a059]/30 rounded-2xl flex items-center gap-4 shadow-md">
            <img
              src={selectedWorker.avatar}
              alt={selectedWorker.name}
              className="w-14 h-14 rounded-full object-cover border border-[#c5a059]"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-[10px] text-[#e9c176] font-mono tracking-widest uppercase">Assigned Professional</p>
              <h3 className="font-bold text-white text-sm">{selectedWorker.name}</h3>
              <p className="text-xs text-zinc-400">{selectedWorker.category} • rated {selectedWorker.rating} ★</p>
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
                    onClick={() => setBookingDate(d.num)}
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
            <div id="times-chips-grid" className="grid grid-cols-3 gap-2.5">
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

        {/* Section 2: Address Selector with satellite view image */}
        <section id="address-section" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 text-center">
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
                  onClick={() => {
                    if (editAddressVal.trim()) {
                      setCitizenAddress(editAddressVal.trim());
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
                  <p id="target-address-label" className="text-zinc-400 text-xs mt-1 leading-snug">{citizenAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Satellite Map backdrop preview with overlay gradient */}
          <div id="satellite-mini-map" className="mt-4 rounded-xl h-32 overflow-hidden relative grayscale opacity-45 border border-zinc-800 shadow-inner">
            <img
              alt="City Map"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdxZgVvxYxIBVsfgDVcfExRhvJqKEo22UWg5z4XIh4Y9Q_DD7VosVY7t9_n9L_GZkWquZqVRy_XuQUD9IP2-v08Rb2L2aCazg5xrkd-iiF3YdcdRd303W4CRHhICuaCU9mn4nK3RqF_UsPpgtZifERU1NtyNjHTmNRkq8bvJEwYXw0AM1RRLuMgcBkbOYwYHacmHTwU3EjzsCIcd6WjrLgmqlM02lPGYQB73YaqJkUfqpx7SZ3OzKu1fM94-x_LarcqEcJlJer4Xw"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07122a] to-transparent"></div>
          </div>
        </section>

        {/* Section 3: Problem description input with camera image attachment */}
        <section id="problem-form-section" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Clipboard className="w-3.5 h-3.5" />
            4. Describe the Issue
          </h2>
          <textarea
            id="issue-textarea-input"
            rows={4}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="w-full bg-[#151f37] border border-zinc-800 rounded-xl p-4 text-[#e1e3e4] text-xs focus:border-[#c5a059] outline-none resize-none placeholder-zinc-500 leading-relaxed font-sans"
            placeholder="Briefly describe the repair or diagnostics service needed. Feel free to use our floating DRAGO AI Assistant on the bottom right to auto-generate a technical description."
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
              <p className="text-[11px] text-zinc-500 italic max-w-[200px] leading-snug">
                Attach a clean screenshot or camera photo of the repair area to minimize inspection delays.
              </p>
            )}
          </div>
        </section>

        {/* Section 4: Cost Breakdown */}
        <section id="cost-breakdown-section" className="border border-[#c5a059]/30 bg-[#111415] rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-[11px] font-mono text-[#c5a059] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            Cost Analysis
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-zinc-400">
              <span>Service Base Fee</span>
              <span className="font-mono text-zinc-250">₹{baseFee}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Vetting & Visiting Charges</span>
              <span className="font-mono text-zinc-250">₹{visitingFee}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between items-center text-emerald-400 py-1 border-t border-dashed border-zinc-800">
                <span className="flex items-center gap-1">Exclusive 20% Discount Code Applied</span>
                <span className="font-semibold font-mono">-₹{discount}</span>
              </div>
            )}
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
              <span className="font-bold text-white">Estimated Grand Total</span>
              <span className="font-bold font-mono text-lg text-[#e9c176]">₹{totalCost}</span>
            </div>
          </div>
          <p id="disclaimer-text" className="text-[10px] text-zinc-500 italic leading-snug">
            *Final parts and advanced technical labor costs will be shared transparently after Rajesh Kumar finishes physical core inspection.
          </p>
        </section>

      </main>

      {/* Persistent Bottom sticky action buttons container */}
      <div id="booking-sticky-action" className="fixed bottom-0 left-0 w-full z-45 bg-[#07122a]/95 border-t border-[#c5a059]/30 p-4">
        <div className="max-w-xl mx-auto">
          <button
            id="proceed-payment-booking-btn"
            onClick={handleConfirm}
            disabled={submitting || success}
            className={`w-full h-14 font-extrabold text-[#07122a] rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl transition-all cursor-pointer border ${success ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-[#c5a059] border-[#ffdea5]/50 shadow-[#c5a059]/10 hover:brightness-110 active:scale-[0.98]'}`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing secure reservation...
              </span>
            ) : success ? (
              <span className="flex items-center gap-2 text-black">
                <CheckCircle className="w-5 h-5 text-black animate-bounce" />
                Booked! Loading secures...
              </span>
            ) : (
                <span className="flex items-center gap-2">
                Confirm Booking details
                <ArrowLeft className="w-4 h-4 transform rotate-180 text-[#07122a]" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

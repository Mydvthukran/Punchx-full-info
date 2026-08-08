import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppScreen, Worker } from '../types';
import { ALL_EXPERTS } from '../data/experts';
import { ArrowLeft, Star, ShieldCheck, Clock, MapPin, CheckCircle, AlertTriangle, Filter, Laptop, User, Mail, Phone, Calendar } from 'lucide-react';
import { CategoryProfileBadge } from './CategoryIcon';

interface ProvidersListProps {
  onTransition: (target: AppScreen) => void;
  selectedCategory: string;
  onSelectWorker: (worker: Worker) => void;
  authMethod: 'phone' | 'gmail';
  authTarget: string;
  showNotification: (msg: string) => void;
  citizenName: string;
  setCitizenName: (name: string) => void;
  citizenAddress: string;
  setCitizenAddress: (addr: string) => void;
}

export default function ProvidersList({
  onTransition,
  selectedCategory,
  onSelectWorker,
  authMethod,
  authTarget,
  showNotification,
  citizenName,
  setCitizenName,
  citizenAddress,
  setCitizenAddress
}: ProvidersListProps) {
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high'>('rating');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile edit fields
  const [tempName, setTempName] = useState(citizenName);
  const [tempAddress, setTempAddress] = useState(citizenAddress);

  // Live Worker Online Status Tracker
  const [workerOnlineStatus, setWorkerOnlineStatus] = React.useState<'online' | 'offline'>(() => {
    return (localStorage.getItem('punchx_worker_online_status') as 'online' | 'offline') || 'online';
  });

  React.useEffect(() => {
    const handleStatusChange = () => {
      const st = (localStorage.getItem('punchx_worker_online_status') as 'online' | 'offline') || 'online';
      setWorkerOnlineStatus(st);
    };
    window.addEventListener('punchx_worker_status_change', handleStatusChange);
    window.addEventListener('storage', handleStatusChange);
    return () => {
      window.removeEventListener('punchx_worker_status_change', handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
    };
  }, []);

  // Normalize category name for filtering
  const displayCategory = selectedCategory || 'AC Repair';
  const isAllSpecialties = displayCategory.toLowerCase() === 'all specialties' || displayCategory.toLowerCase() === 'all';
  
  // Filter providers based on category & availability toggle
  let filtered = ALL_EXPERTS.filter(expert => {
    const expertCat = expert.category.toLowerCase();
    const targetCat = displayCategory.toLowerCase();
    
    // Support partial match for categories or match all
    const isMatch = isAllSpecialties ||
                    expertCat === targetCat || 
                    expertCat.includes(targetCat) || 
                    targetCat.includes(expertCat);
    
    if (filterAvailableOnly) {
      return isMatch && expert.available;
    }
    return isMatch;
  });

  // Sort providers
  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const handleSelect = (worker: Worker) => {
    if (worker.available === false) {
      showNotification(`⚠️ ${worker.name} is currently busy at another precinct. Please choose an active provider.`);
      return;
    }
    onSelectWorker(worker);
    showNotification(`✓ Specialist ${worker.name} selected. Opening details page.`);
    onTransition('provider-details');
  };

  const handleSaveProfile = () => {
    if (!tempName.trim() || !tempAddress.trim()) {
      showNotification("⚠️ User details fields cannot be left empty.");
      return;
    }
    setCitizenName(tempName.trim());
    setCitizenAddress(tempAddress.trim());
    setIsEditingProfile(false);
    showNotification("✓ Citizen profile metadata refreshed successfully.");
  };

  return (
    <div id="providers-list-root" className="min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans pb-32">
      {/* Top Main Luxurious Header with integrated Citizen Credentials */}
      <header id="providers-header" className="relative z-40 bg-[#11192e]/90 backdrop-blur-md border-b border-[#c5a059]/25 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          
          {/* Header left side (Navigation, category context) */}
          <div className="flex items-center gap-4">
            <button
              id="providers-back-to-home"
              onClick={() => onTransition('home')}
              className="p-2.5 bg-zinc-900/60 hover:bg-[#c5a059]/15 rounded-xl text-[#c5a059] border border-zinc-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#c5a059]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-widest text-[#e9c176] uppercase font-extrabold bg-[#c5a059]/10 px-2.5 py-0.5 rounded-full border border-[#c5a059]/20">
                  Elite Force Directory
                </span>
              </div>
              <h1 id="providers-category-title" className="font-sans font-bold text-xl text-white tracking-tight mt-0.5">
                {displayCategory} Specialists
              </h1>
            </div>
          </div>

          {/* Header right side: PREMIUM CITIZEN / USER DETAILS BLOCK */}
          <div id="header-citizen-block" className="relative md:self-end self-center w-full md:w-auto">
            <div className="bg-[#0b1325]/90 border border-[#c5a059]/40 p-3.5 rounded-xl shadow-lg max-w-sm md:ml-auto">
              <div className="flex justify-between items-center gap-2 border-b border-zinc-800/80 pb-2 mb-2">
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#e9c176] uppercase tracking-wider font-extrabold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                  Citizen Access Token
                </div>
                <button
                  onClick={() => {
                    setIsEditingProfile(!isEditingProfile);
                    setTempName(citizenName);
                    setTempAddress(citizenAddress);
                  }}
                  className="text-[9px] font-mono text-[#c5a059] hover:underline uppercase tracking-wide cursor-pointer font-bold bg-[#c5a059]/10 px-2 py-0.5 rounded"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Citizen Name"
                    className="w-full bg-[#07122a] border border-[#c5a059]/50 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="Installation Address"
                    className="w-full bg-[#07122a] border border-[#c5a059]/50 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-1 text-[10px] font-mono text-black font-extrabold bg-[#c5a059] rounded hover:bg-[#e9c176]"
                  >
                    SAVE PROFILE DETAILS
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span id="citizen-name-badge" className="text-xs font-bold text-white tracking-wide">
                      {citizenName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0" />
                    <span id="citizen-address-badge" className="text-[10px] text-zinc-400 truncate max-w-[240px]" title={citizenAddress}>
                      {citizenAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {authMethod === 'gmail' ? (
                      <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    ) : (
                      <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    )}
                    <span id="citizen-contact-badge" className="text-[9px] text-zinc-500 font-mono">
                      {authTarget || 'demo@gmail.com'} (Master Link Verified)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main content grid */}
      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        
        {/* Dynamic Controls layout */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-[#111415] border border-zinc-800 p-4 rounded-2xl gap-4 shadow">
          {/* Availability filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="toggle-available-only"
              onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                filterAvailableOnly 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-[#c5a059]'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${filterAvailableOnly ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
              Active Available Only
            </button>
          </div>

          {/* Sorter tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-2">Sort:</span>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-[10px]">
              <button
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold uppercase ${sortBy === 'rating' ? 'bg-[#c5a059] text-black font-extrabold' : 'text-zinc-400'}`}
              >
                Top Rating
              </button>
              <button
                onClick={() => setSortBy('price-low')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold uppercase ${sortBy === 'price-low' ? 'bg-[#c5a059] text-black font-extrabold' : 'text-zinc-400'}`}
              >
                Price: Low
              </button>
              <button
                onClick={() => setSortBy('price-high')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold uppercase ${sortBy === 'price-high' ? 'bg-[#c5a059] text-black font-extrabold' : 'text-zinc-400'}`}
              >
                Price: High
              </button>
            </div>
          </div>
        </div>

        {/* Directory Listings */}
        <div id="providers-card-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((worker) => {
                const isRajesh = worker.id === 'rajesh' || worker.name.toLowerCase().includes('rajesh');
                const isAvailable = isRajesh ? (workerOnlineStatus === 'online') : (worker.available !== false);

                const handleSelect = (w: Worker) => {
                  if (!isAvailable) {
                    showNotification(`⚠️ ${w.name} is currently OFFLINE / OFF DUTY. Please choose an active online specialist.`);
                    return;
                  }
                  onSelectWorker(w);
                  onTransition('provider-details');
                };

                return (
                  <motion.div
                    id={`provider-list-card-${worker.id}`}
                    key={worker.id}
                    className={`relative bg-[#111415] border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 group ${
                      isAvailable 
                        ? 'border-zinc-850 hover:border-[#c5a059]/55' 
                        : 'border-zinc-800/40 opacity-70'
                    }`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    {/* Top block */}
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="relative">
                          <img
                            src={worker.avatar}
                            alt={worker.name}
                            className={`w-14 h-14 rounded-full object-cover border-2 shadow-md ${
                              isAvailable ? 'border-[#c5a059]' : 'border-zinc-700 brightness-75'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          {/* Category badge in the top-right corner of the profile */}
                          <CategoryProfileBadge category={worker.category} sizeClassName="w-5.5 h-5.5 p-1" />
                          {/* Live pulse dot */}
                          <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#111415] flex items-center justify-center ${
                            isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`} />
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white tracking-wide group-hover:text-[#c5a059] transition-colors">
                              {worker.name}
                            </h3>
                            <span className="bg-[#c5a059] text-black font-mono text-[8px] font-extrabold px-2 py-0.5 rounded-full border border-yellow-200/20">
                              {worker.proBadge}
                            </span>
                          </div>
                          
                          <p className="text-xs text-[#e9c176] font-mono tracking-wide mt-0.5">
                            {worker.category} Specialist
                          </p>

                          <div className="flex items-center gap-1.5 mt-2">
                            <Star className="w-3.5 h-3.5 fill-[#e9c176] text-[#e9c176]" />
                            <span className="font-bold text-xs text-zinc-300">{worker.rating}</span>
                            <span className="text-zinc-500 text-[10px] font-mono">({worker.reviewsCount} jobs)</span>
                          </div>
                        </div>

                        {/* Availability Text label */}
                        <div className="text-right flex flex-col items-end">
                          {isAvailable ? (
                            <div className="flex items-center gap-1 text-emerald-400 font-mono text-[9px] font-black tracking-widest uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              Active Online
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-rose-400 font-mono text-[9px] font-black tracking-widest uppercase bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                              OFFLINE (OFF DUTY)
                            </div>
                          )}
                          <div className="mt-2 text-right">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">RATE</span>
                            <p className="text-sm font-extrabold text-white leading-none">
                              ₹{worker.price}<span className="text-[10px] font-bold text-zinc-400">/hr</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info lines */}
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                        Highly recommended for {worker.category} installations, diagnostic sweeps, and security clearances.
                      </p>
                    </div>

                    {/* Button actions */}
                    <div className="border-t border-zinc-800/60 pt-4 flex items-center justify-between gap-4">
                      <div className="flex gap-2">
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
                          ⚡ Express Contact
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
                          🛡️ Bonded Core
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleSelect(worker)}
                        className={`px-5 py-2.5 rounded-xl text-xs uppercase font-extrabold tracking-widest transition-all cursor-pointer ${
                          isAvailable
                            ? 'bg-[#c5a059] text-black hover:bg-[#e9c176] shadow-lg shadow-[#c5a059]/15'
                            : 'bg-zinc-800 text-rose-300 border border-rose-500/30 opacity-70 cursor-pointer'
                        }`}
                      >
                        {isAvailable ? 'Book Expert' : 'Worker Offline'}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 py-12 px-6 border border-dashed border-zinc-800 rounded-3xl text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-[#c5a059] mx-auto opacity-75 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-base text-zinc-300">No Specialized Pros Found</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    We currently don't have available experts matching the filters in this sector, or the toggle for "Active Available Only" filtered them out.
                  </p>
                </div>
                <button
                  onClick={() => setFilterAvailableOnly(false)}
                  className="px-4 py-2 bg-zinc-800 text-[#e9c176] rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold border border-zinc-700 hover:border-[#c5a059] cursor-pointer"
                >
                  Reset Active Filter
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Floating Bottom Nav for visual coherence */}
      <nav id="providers-bottom-navbar" className="fixed bottom-0 left-0 w-full z-45 bg-[#07122a] border-t border-[#c5a059]/20 flex justify-around items-center h-20 shadow-2xl px-6">
        <button
          onClick={() => onTransition('home')}
          className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-[#e9c176] transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-sans">Home</span>
        </button>

        <button
          onClick={() => {
            onTransition('home');
          }}
          className="flex flex-col items-center justify-center gap-1 text-[#e9c176] bg-[#c5a059]/10 px-4 py-1.5 rounded-xl border border-[#c5a059]/30"
        >
          <Calendar className="w-5 h-5 text-[#e9c176]" />
          <span className="text-[10px] font-bold font-sans uppercase">Directory</span>
        </button>
      </nav>
    </div>
  );
}

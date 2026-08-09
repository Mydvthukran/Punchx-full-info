import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, MapPin, ChevronRight, Star, Verified, Home, Shield, Wrench, Navigation, Plus, Laptop, CreditCard, User, Mail, Phone, Calendar, X, CheckCircle, AlertTriangle, ShieldCheck, Edit3, ChevronDown, FileText, BookOpen } from 'lucide-react';
import { AppScreen, Worker, ServiceCategory, OrderRecord, CustomerReview } from '../types';
import CategoryIcon, { CategoryProfileBadge } from './CategoryIcon';
import PUNCHX_LOGO from '../assets/logo';
import PostServiceReviewModal from './PostServiceReviewModal';

interface HomeProps {
  onTransition: (target: AppScreen) => void;
  onSelectWorker: (worker: Worker) => void;
  onSelectCategory: (category: string) => void;
  hasActiveBooking: boolean;
  promoApplied: boolean;
  onClaimPromo: () => void;
  citizenName: string;
  setCitizenName: (val: string) => void;
  citizenAddress: string;
  setCitizenAddress: (val: string) => void;
  authMethod: 'phone' | 'gmail';
  authTarget: string;
  showNotification: (msg: string) => void;
}

const CATEGORIES: ServiceCategory[] = [
  { id: 'electrical', name: 'Electrical', icon: 'electrical_services' },
  { id: 'plumbing', name: 'Plumbing', icon: 'plumbing' },
  { id: 'cleaning', name: 'Cleaning', icon: 'cleaning_services' },
  { id: 'ac', name: 'AC Repair', icon: 'ac_unit' },
  { id: 'painting', name: 'Painting', icon: 'format_paint' },
  { id: 'carpentry', name: 'Carpentry', icon: 'carpenter' },
  { id: 'pest', name: 'Pest Control', icon: 'pest_control' },
  { id: 'moving', name: 'Moving', icon: 'local_shipping' },
];

const EXPERTS: Worker[] = [
  {
    id: 'marcus',
    name: 'Marcus Thorne',
    category: 'Master Electrician',
    rating: 4.9,
    reviewsCount: 128,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzF-ZNX1ONoqZl4NpujkifTMt7bovwv5F_dHcy6LKgigipMusAINZ49fwFybVr8bv5ajkmEebzd7JjWTKdbrLoUtswcs-_hAJFyB5E1jUH32721A6RxM_xmDQ9WYGP4vl5r8qEvV66JF0l_ExQnbN9_4AD2qy8YyV3lOqt4LiPdNOUpvwmhtCQgwbDf18scKXjX_-yDedvydF7z3-IkIHxiD4QOGKwJ5Uje1wEcAYAkS3OXQBxY5PUt3cHt3ewunp_nyeLRUeS974',
    proBadge: 'PRO',
    price: 199,
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    category: 'Elite Concierge Care',
    rating: 4.95,
    reviewsCount: 250,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAl2mlPeDILv0yu23h0u0gdaAnA7Sx2IcCja5YlCHj0SI468csLOLd3qWJDY8X2lcEIAnwR2d5bQ23J7eQUvQHDNYjVDFNi3FipehpDpZUiUAOJgTgPy-1wT99JU7GIqy4eUs0b0fB28X3DL6TlIGhoXqV-tLhRyU2ibRfIvwuoLmF6aYBp-HD30Mre9n_ZmOrCG0jzVjUBEsDTiXiwUh9hsEsoq8DVIpGUlZjmI6ZXRiZM_JEfIbTiLQrZBsPv2-O1kSJIx1dq_g',
    proBadge: 'TOP',
    price: 249,
  },
  {
    id: 'david',
    name: 'David Chen',
    category: 'Custom Carpenter',
    rating: 4.8,
    reviewsCount: 89,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBnQN095fkHnimX3ZMLBOnXJJOxndVI3YgA-s7n6Px1ACC_lCXM_93dMVgnMbT4x5i9XbPD_QXkkuzGcaPrKSaaHxUxI6xfPs6L_3n_KQP-q7A89kBnLSr08YKmhq8NJC9DJ4dsMdwcbKOXzCMHWa7luCe3xAAgPMeEOsR__JcrN0-XN4N0z2T21OPHgDyYhOQDfSFPW9DRnR2vSm20hNyVzZGuVzQoaGQmnC_OYq2XYizdFkWcTvFmPQLwTvvF3WDWKC_QPzX6V0',
    proBadge: 'VET',
    price: 149,
  }
];

export default function HomeDashboard({
  onTransition,
  onSelectWorker,
  onSelectCategory,
  hasActiveBooking,
  promoApplied,
  onClaimPromo,
  citizenName,
  setCitizenName,
  citizenAddress,
  setCitizenAddress,
  authMethod,
  authTarget,
  showNotification
}: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editName, setEditName] = useState(citizenName);
  const [editAddress, setEditAddress] = useState(citizenAddress);

  // Review & Rating State For Completed Works Only
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [tempRatingStars, setTempRatingStars] = useState<number>(5);
  const [tempBehaviourFeedback, setTempBehaviourFeedback] = useState<string>('');
  const [reviewModalOrder, setReviewModalOrder] = useState<OrderRecord | null>(null);

  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Loading state for Firestore backend sync
  const [isLoading, setIsLoading] = useState(true);

  // States for expandable profile policy/details sections
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Synchronize dynamic booking history values with Firestore & localStorage
  useEffect(() => {
    // 1. Initial fallback load from localStorage
    const raw = localStorage.getItem('punchx_order_history') || '[]';
    try {
      setHistoryOrders(JSON.parse(raw));
    } catch {
      setHistoryOrders([]);
    }

    const rawActive = localStorage.getItem('punchx_active_order');
    if (rawActive) {
      try {
        setActiveOrder(JSON.parse(rawActive));
      } catch {
        setActiveOrder(null);
      }
    }

    // 2. Real-time Firestore subscription for live orders sync
    let unsubscribe: () => void;
    try {
      const ordersCol = collection(db, 'orders');
      unsubscribe = onSnapshot(ordersCol, (snapshot) => {
        const liveOrders: OrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          liveOrders.push({ id: docSnap.id, ...docSnap.data() } as OrderRecord);
        });
        if (liveOrders.length > 0) {
          // Sort by creation or ID
          setHistoryOrders(liveOrders);
          localStorage.setItem('punchx_order_history', JSON.stringify(liveOrders));
          
          // Find active order
          const active = liveOrders.find(o => o.status === 'In-Progress' || o.status === 'Pending');
          if (active) {
            setActiveOrder(active);
            localStorage.setItem('punchx_active_order', JSON.stringify(active));
          }
        }
      }, (err) => {
        console.warn("Firestore orders listener offline fallback active:", err);
      });
    } catch (e) {
      console.warn("Firestore connection error in Home.tsx:", e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isProfileOpen]);

  // Keep transient inputs in sync when global props update
  useEffect(() => {
    setEditName(citizenName);
    setEditAddress(citizenAddress);
  }, [citizenName, citizenAddress]);

  const handleSaveProfile = () => {
    if (!editName.trim() || !editAddress.trim()) {
      showNotification("⚠️ Please fill out all profile fields.");
      return;
    }
    setCitizenName(editName.trim());
    setCitizenAddress(editAddress.trim());
    setIsEditing(false);
    showNotification("✓ Profile updated successfully.");
  };

  const handleCancelBooking = async (orderId: string) => {
    const updated = historyOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Cancelled' as const };
      }
      return o;
    });
    setHistoryOrders(updated);
    localStorage.setItem('punchx_order_history', JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'Cancelled' });
    } catch (e) {
      console.error("Firestore cancel update failed:", e);
    }

    showNotification(`⚠️ Booking ${orderId} has been cancelled.`);
  };

  const handleSubmitReview = async (orderId: string, workerName: string) => {
    const updated = historyOrders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          isRated: true,
          userRating: tempRatingStars,
          userBehaviour: tempBehaviourFeedback.trim() || 'Polite and professional behaviour.'
        };
      }
      return o;
    });
    setHistoryOrders(updated);
    localStorage.setItem('punchx_order_history', JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        isRated: true,
        userRating: tempRatingStars,
        userBehaviour: tempBehaviourFeedback.trim() || 'Polite and professional behaviour.'
      });

      // Also save to reviews collection
      const reviewId = `REV-${Date.now()}`;
      await setDoc(doc(db, 'reviews', reviewId), {
        id: reviewId,
        customer: citizenName || 'Verified Customer',
        rating: tempRatingStars,
        category: 'Service Review',
        comment: tempBehaviourFeedback.trim() || 'Polite and professional behaviour.',
        date: new Date().toLocaleDateString()
      });
    } catch (e) {
      console.error("Firestore review submission error:", e);
    }

    showNotification(`⭐ Rating of ${tempRatingStars} ★ and behaviour review submitted for ${workerName}!`);
    setRatingOrderId(null);
    setTempRatingStars(5);
    setTempBehaviourFeedback('');
  };

  const handleRebookWorker = (categoryName: string) => {
    onSelectCategory(categoryName);
    setIsProfileOpen(false);
    onTransition('providers');
    showNotification(`⚡ Opening service providers for: ${categoryName}`);
  };

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookExpert = (expert: Worker) => {
    onSelectWorker(expert);
    onSelectCategory(expert.category);
    onTransition('provider-details');
  };

  const handleCategoryClick = (categoryName: string) => {
    onSelectCategory(categoryName);
    onTransition('providers');
  };

  return (
    <div id="home-dashboard-root" className="w-full min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans pb-24 overflow-x-hidden">
      {/* Top Android App Bar */}
      <header id="home-topappbar" className="sticky top-0 z-40 w-full bg-[#07122a]/95 backdrop-blur-md border-b border-[#c5a059]/20 shadow-md flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white border border-[#c5a059]/60 flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 shadow-md">
            <img
              id="bar-brand-logo"
              alt="PunchX Logo"
              className="w-full h-full object-contain"
              src={PUNCHX_LOGO}
            />
          </div>
          <span className="font-sans font-extrabold text-base text-white tracking-tight">
            PUNCH<span className="text-[#c5a059]">X</span>
          </span>
        </div>

        {/* Global Action items */}
        <div className="flex items-center gap-2.5">
          <button
            id="top-search-btn"
            className="p-1.5 rounded-full hover:bg-zinc-800 text-[#c5a059] transition-colors cursor-pointer"
            onClick={() => {
              const el = document.getElementById('dashboard-search-bar');
              el?.focus();
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Search className="w-4 h-4 text-[#c5a059]" />
          </button>
          
          {/* Easy-to-touch Profile Avatar Toggle */}
          <button
            id="top-profile-toggle-btn"
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-full border border-[#c5a059] p-0.5 overflow-hidden active:scale-95 transition-all cursor-pointer focus:outline-none flex items-center justify-center bg-zinc-900"
            title="View User Profile & Orders"
          >
            <img
              id="top-avatar-img"
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfBtABLKSPqddxrtWDSdl9c5daP9YVcbg3P_EfbjjHvQNdNJvYYmMzLoAMTez0tdXrxqAJdUuy8KgettOAxfIpaQOSUIGXnMHO2yJ0A1ge_YxS8OPbgyA8xyvIx_APQVn5R2ZCbaBPwIFLH-P4TGnMmmmSIIkQ4Kh6YxwSeWCPjs7ZpX2gTQN7OWHlEhjzheYXdrCKknsAwVPuDggLTM0sMcv26ZlNwDDU-zeEm3vQpo6PValfhRBMBP2rndZh-fksKGFua62D8uQ"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 space-y-8">
        
        {/* Dynamic Search Input with Holographic Glow */}
        <div id="search-section" className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/10 to-transparent blur-md rounded-2xl opacity-70"></div>
          <div className="relative bg-[#111415] border border-[#c5a059]/20 rounded-2xl p-1 flex items-center shadow-lg">
            <Search className="w-5 h-5 text-[#c5a059] ml-4 flex-shrink-0" />
            <input
              id="dashboard-search-bar"
              type="text"
              placeholder="Search master electrical repair, carpenters, cleaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 text-sm py-3 px-3 focus:ring-0 outline-none text-white placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Hero Banner Section */}
        <section id="hero-banner" className="relative overflow-hidden rounded-3xl border border-[#c5a059]/20 bg-gradient-to-br from-[#111415] to-[#151f37] shadow-xl p-6 md:p-8">
          <div className="relative z-10 max-w-[65%] space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#e9c176] font-mono text-[10px] uppercase tracking-widest font-semibold">
              EXCLUSIVE OFFERS
            </span>
            <h1 className="font-sans font-bold text-2xl md:text-3xl text-white tracking-tight leading-tight">
              Experience <span className="text-[#c5a059]">Excellence</span> at Your Doorstep.
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans">
              Unlock prestigious home repair and consultation services curated strictly for premium lifestyles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="claim-discount-btn"
                onClick={onClaimPromo}
                disabled={promoApplied}
                className={`py-3 px-6 rounded-xl text-xs font-bold tracking-widest uppercase cursor-pointer transition-all active:scale-[0.98] ${promoApplied ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20 hover:brightness-110'}`}
              >
                {promoApplied ? '✓ 20% OFF Claimed' : 'Claim 20% OFF'}
              </button>
              <button
                id="explore-scroller-btn"
                onClick={() => {
                  const el = document.getElementById('categories-grid-label');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 px-6 rounded-xl text-xs font-bold tracking-widest uppercase border border-[#c5a059] text-[#e9c176] hover:bg-[#c5a059]/10 transition-all cursor-pointer"
              >
                Explore Services
              </button>
            </div>
          </div>

          {/* Golden Ambient Lights */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#c5a059]/10 blur-[80px] rounded-full"></div>
          <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-20 pointer-events-none">
            <img
              id="hero-deco-image"
              alt="Service Hero"
              className="w-full h-full object-cover object-left"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNQG_Ib7sdiH6QXYqBw6S_FG0Y67Y7FgIXUPIeaY2UwugJ-dsjGIOuz75pqZ-gmDI4nO6bU7pf-MCFxgjHfSXbnc5pdyy9dYr_j2loJtuv5iowie-V1v3XdqJBksNQGIRl4df5rkYh9GQtdBVuclqjfOZ-F4XvkL7Uk0YPh3VFfiAVKx1Pe91GJISO7Eaag0wncdLNhCWtreBTVBTblTZTeKb92BfW9pJ-_gtgDPnzRD3o9Uy1Yn4uF9dO9YgCZf7CQLSNc0qSkPw"
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* Recent Active Service Banner / Live Tracker shortcut (rendered only if real active order exists) */}
        {activeOrder && (
          <section id="in-progress-tracker-zone">
            <div
              id="tracking-shortcut-card"
              onClick={() => onTransition('tracking')}
              className="bg-[#101b33]/60 rounded-2xl p-4 flex items-center justify-between border border-[#c5a059]/20 hover:border-[#c5a059]/50 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#c5a059]/15 flex items-center justify-center text-[#e9c176]">
                  <Navigation className="w-5 h-5 text-[#e9c176] animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{activeOrder.category} in progress</h4>
                  <p className="text-xs text-zinc-400">Technician {activeOrder.workerName} is in route</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 bg-[#c5a059]/20 border border-[#c5a059]/40 px-3 py-1.5 rounded-full">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#e9c176]">LIVE TRACK</span>
                <ChevronRight className="w-3 h-3 text-[#e9c176] ml-0.5" />
              </div>
            </div>
          </section>
        )}

        {/* Service Categories Section */}
        <section id="categories-panel" className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 id="categories-grid-label" className="font-sans font-bold text-xl text-white">
                Premium Categories
              </h2>
              <p className="text-xs text-zinc-400">Select an expert service segment</p>
            </div>
            <button
              id="categories-view-all"
              onClick={() => handleCategoryClick('AC Repair')}
              className="text-xs font-bold text-[#c5a059] hover:underline cursor-pointer"
            >
              View Specialities
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div key={idx} className="p-5 bg-[#111415] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/80"></div>
                  <div className="h-3.5 w-16 bg-zinc-800/60 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div id="categories-grid-list" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredCategories.map((cat) => (
                <button
                  id={`cat-card-${cat.id}`}
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group p-5 bg-[#111415] border border-zinc-800 hover:border-[#c5a059]/60 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#151f37] group-hover:bg-[#c5a059]/10 border border-zinc-800 group-hover:border-[#c5a059]/30 flex items-center justify-center text-[#e9c176] transition-all">
                    <CategoryIcon category={cat.name} className="w-5 h-5 text-[#e9c176] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Top Rated Experts Grid */}
        <section id="experts-panel" className="space-y-4">
          <div>
            <h2 id="experts-lead-title" className="font-sans font-bold text-xl text-white">
              Elite Special Forces
            </h2>
            <p className="text-xs text-zinc-400 font-sans">Highly-vetted, certified pro technicians</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="w-full bg-[#111415] border border-zinc-850 rounded-2xl p-5 flex flex-col items-center text-center animate-pulse space-y-3">
                  <div className="w-16 h-16 rounded-full bg-zinc-800/80"></div>
                  <div className="h-4 w-28 bg-zinc-800/80 rounded"></div>
                  <div className="h-3.5 w-36 bg-zinc-800/60 rounded"></div>
                  <div className="h-3.5 w-24 bg-zinc-800/60 rounded"></div>
                  <div className="w-full h-9 bg-zinc-800/80 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div id="experts-grid-row" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {EXPERTS.map((expert) => (
                <div
                  id={`expert-crd-${expert.id}`}
                  key={expert.id}
                  className="w-full bg-[#111415] border border-zinc-850 hover:border-[#c5a059]/40 rounded-2xl p-5 flex flex-col items-center text-center group relative transition-all"
                >
                  {/* Pro Badge indicators */}
                  <span className="absolute top-4 right-4 bg-[#c5a059] text-black font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#ffdea5]/50 shadow">
                    {expert.proBadge}
                  </span>

                  <div className="relative mb-3">
                    <img
                      id={`expert-avatar-${expert.id}`}
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#c5a059] shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    {/* Category icon badge in top corner of profile */}
                    <CategoryProfileBadge category={expert.category} sizeClassName="w-6 h-6 p-1.5" />
                  </div>

                  <h3 id={`expert-name-${expert.id}`} className="font-bold text-sm text-white mb-0.5">{expert.name}</h3>
                  <p id={`expert-category-${expert.id}`} className="text-xs font-mono text-[#e9c176] tracking-wide mb-2">
                    {expert.category}
                  </p>

                  {/* Star rating details */}
                  <div className="flex items-center gap-1 mb-4 justify-center text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#e9c176] text-[#e9c176]" />
                    <span className="font-bold text-zinc-300">{expert.rating}</span>
                    <span className="text-zinc-500 font-mono">({expert.reviewsCount} reviews)</span>
                  </div>

                  <button
                    id={`expert-book-btn-${expert.id}`}
                    onClick={() => handleBookExpert(expert)}
                    className="w-full py-2.5 bg-zinc-800 group-hover:bg-[#c5a059] text-zinc-300 group-hover:text-black hover:brightness-110 font-bold text-xs rounded-xl tracking-wider uppercase transition-all cursor-pointer border border-zinc-700 group-hover:border-[#ffdea5]/40"
                  >
                    Book Professional
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bento Board Sections */}
        <section id="bento-board" className="space-y-4">
          <h2 id="bento-heading-label" className="font-sans font-bold text-lg text-white">Explore Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Corporate Care Block */}
            <div id="corporate-bento-tile" className="md:col-span-2 bg-[#111415] border border-zinc-800 p-6 rounded-3xl relative overflow-hidden h-44 flex flex-col justify-between">
              <div>
                <h3 className="font-sans font-bold text-white text-base">Corporate Care Portfolio</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Sub-surface structural maintenance audits for modern enterprise workspaces and embassies.
                </p>
              </div>
              <button
                id="corporate-pkg-btn"
                onClick={() => handleCategoryClick('Corporate Care')}
                className="text-xs font-bold text-[#e1e3e4] flex items-center gap-1 hover:text-[#c5a059]"
              >
                Inquire details <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none w-1/3">
                <Laptop className="w-24 h-24 text-[#c5a059]" />
              </div>
            </div>

            {/* Verification highlights */}
            <div id="verified-bento-tile" className="bg-[#101b33]/30 border border-[#c5a059]/20 p-6 rounded-3xl flex flex-col justify-between h-44">
              <Shield className="w-8 h-8 text-[#e9c176]" />
              <div>
                <h3 className="font-sans font-extrabold text-sm text-[#e9c176] flex items-center gap-1 uppercase">
                  Safe & Secure
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  All service providers have verified background checks to ensure professional assistance.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Floating Action CTA Button */}
      <button
        id="fab-plus-category"
        onClick={() => {
          onSelectCategory('All Specialties');
          onTransition('providers');
          showNotification("✓ Showing all service providers.");
        }}
        className="fixed bottom-24 right-24 md:right-28 w-14 h-14 bg-[#c5a059] text-black hover:bg-[#e9c176] rounded-2xl flex items-center justify-center shadow-2xl transition-all cursor-pointer z-20 hover:scale-105 active:scale-95"
        title="Show all registered service providers from all categories"
      >
        <Plus className="w-6 h-6 text-black" />
      </button>

      {/* Bottom Floating App Navigation Bar with blur filters */}
      <nav id="bottom-glass-navbar" className="fixed bottom-0 left-0 w-full z-45 bg-[#07122a]/95 border-t border-[#c5a059]/20 flex justify-around items-center h-20 shadow-2xl px-6">
        <button
          id="nav-btn-home"
          onClick={() => onTransition('home')}
          className="flex flex-col items-center justify-center gap-1 text-[#e9c176] bg-[#c5a059]/10 px-4 py-1.5 rounded-xl border border-[#c5a059]/30"
        >
          <Home className="w-5 h-5 text-[#e9c176]" />
          <span className="text-[10px] font-bold font-sans uppercase">Home</span>
        </button>

        <button
          id="nav-btn-services"
          onClick={() => {
            onSelectCategory('Electrical');
            onTransition('providers');
          }}
          className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-[#e9c176] transition-colors"
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-sans">Services</span>
        </button>

        <button
          id="nav-btn-tracking"
          onClick={() => onTransition('tracking')}
          className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-[#e9c176] transition-colors"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] font-sans">Track</span>
        </button>
      </nav>

      {/* Dynamic Profile Side Drawer Panel with Order history */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            {/* Backdrop filter blur with fade transition */}
            <motion.div
              id="profile-sidebar-backdrop"
              className="fixed inset-0 z-50 bg-[#07122a]/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
            />

            {/* Slide-out secure terminal workspace panel */}
            <motion.div
              id="profile-secure-panel"
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0b1325] border-l border-[#c5a059]/20 shadow-2xl z-55 flex flex-col justify-between overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div className="p-6 space-y-6">
                
                {/* Drawer Header */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                    <h2 className="text-sm font-sans uppercase tracking-wider font-extrabold text-white">
                      User Profile
                    </h2>
                  </div>
                  <button
                    id="close-profile-drawer"
                    onClick={() => setIsProfileOpen(false)}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Secure Customer Identification Block */}
                <div className="bg-[#11192e] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#e9c176] font-extrabold">
                      Customer Details
                    </span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-[10px] font-sans text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer font-bold uppercase"
                    >
                      <Edit3 className="w-3" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1 bg-[#11192e] text-left">
                        <label className="text-[9px] font-sans uppercase tracking-wider text-zinc-500 font-bold block">First & Last Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#07122a] border border-[#c5a059]/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#c5a059]"
                        />
                      </div>
                      <div className="space-y-1 bg-[#11192e] text-left">
                        <label className="text-[9px] font-sans uppercase tracking-wider text-zinc-500 font-bold block">Delivery Address</label>
                        <textarea
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full bg-[#07122a] border border-[#c5a059]/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#c5a059] min-h-[60px] resize-none"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="w-full py-2.5 bg-[#c5a059] hover:bg-[#e9c176] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all font-sans cursor-pointer"
                      >
                        SAVE CHANGES
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-3 text-left">
                        <div className="w-10 h-10 rounded-full border border-[#c5a059] p-0.5 overflow-hidden self-start flex-shrink-0">
                          <img
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfBtABLKSPqddxrtWDSdl9c5daP9YVcbg3P_EfbjjHvQNdNJvYYmMzLoAMTez0tdXrxqAJdUuy8KgettOAxfIpaQOSUIGXnMHO2yJ0A1ge_YxS8OPbgyA8xyvIx_APQVn5R2ZCbaBPwIFLH-P4TGnMmmmSIIkQ4Kh6YxwSeWCPjs7ZpX2gTQN7OWHlEhjzheYXdrCKknsAwVPuDggLTM0sMcv26ZlNwDDU-zeEm3vQpo6PValfhRBMBP2rndZh-fksKGFua62D8uQ"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-1 overflow-hidden font-sans">
                          <h4 className="font-extrabold text-sm text-white tracking-wide">
                            {citizenName}
                          </h4>
                          <p className="text-xs font-sans text-zinc-300 font-medium flex items-center gap-1.5 flex-wrap">
                            {authMethod === 'gmail' ? <Mail className="w-3.5 h-3.5 text-[#e9c176]" /> : <Phone className="w-3.5 h-3.5 text-[#e9c176]" />}
                            <span className="text-[#e9c176] font-extrabold bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/25 shadow-sm">{authTarget || 'demo@gmail.com'}</span>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-black">Logged In</span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/60 pt-3 text-left">
                        <span className="text-[9px] font-sans uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                          Saved Address:
                        </span>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#c5a059] mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans select-all">
                            {citizenAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE LEGAL & POLICIES ACCORDION SECTION */}
                <div className="space-y-3">
                  {/* REFUND & CANCELLATION POLICIES */}
                  <div className="bg-[#11192e] border border-zinc-800 rounded-2xl overflow-hidden shadow-inner text-left">
                    <button
                      type="button"
                      onClick={() => setIsRefundOpen(!isRefundOpen)}
                      className="w-full flex items-center justify-between p-5 hover:bg-[#151f37] transition-all cursor-pointer select-none outline-none focus:outline-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-[#e9c176]" />
                        <h3 className="text-[10px] font-sans uppercase tracking-widest text-[#e9c176] font-extrabold">
                          Refund & Cancellation Policy
                        </h3>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isRefundOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isRefundOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-zinc-800/60 space-y-3 font-sans text-xs">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                1. Instant Cancellation
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                Cancel booking within <span className="text-white font-semibold">5 minutes</span> or before technician dispatch for a <span className="text-emerald-400 font-bold">100% full refund</span> back to your source account.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                2. Late Cancellation Fee
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                Cancellations made after the expert has been dispatched are subject to a nominal transit compensation fee of <span className="text-white font-semibold">₹99</span>.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                3. Service Guarantee Refund
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                If you are unsatisfied with the quality of the service delivered, raise a claim within <span className="text-white font-semibold">24 hours</span> to get a <span className="text-emerald-400 font-bold">free re-visit or 100% refund</span>.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                4. Refund Settlement
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                Approved refunds are processed automatically and will credit to your bank or card within <span className="text-[#e9c176] font-semibold">3-5 business days</span>.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* TERMS & CONDITIONS */}
                  <div className="bg-[#11192e] border border-zinc-800 rounded-2xl overflow-hidden shadow-inner text-left">
                    <button
                      type="button"
                      onClick={() => setIsTermsOpen(!isTermsOpen)}
                      className="w-full flex items-center justify-between p-5 hover:bg-[#151f37] transition-all cursor-pointer select-none outline-none focus:outline-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[#e9c176]" />
                        <h3 className="text-[10px] font-sans uppercase tracking-widest text-[#e9c176] font-extrabold">
                          Terms & Conditions
                        </h3>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isTermsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isTermsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-zinc-800/60 space-y-3 font-sans text-xs">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                1. Scope of Service
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                We act as a high-fidelity platform matching verified independent service professionals ("Technicians" or "Experts") with customers.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                2. User Accounts
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                You are solely responsible for maintaining accuracy of your registered phone, email, name, and address.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                3. Safety & Verification
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                Customers must verify the unique secure OTP with the assigned expert before service starts to ensure security.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                4. Payments
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                Prices listed are transparent starting rates. Actual material or complex additions should be agreed upon between customer and expert directly.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* PRIVACY POLICY */}
                  <div className="bg-[#11192e] border border-zinc-800 rounded-2xl overflow-hidden shadow-inner text-left">
                    <button
                      type="button"
                      onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                      className="w-full flex items-center justify-between p-5 hover:bg-[#151f37] transition-all cursor-pointer select-none outline-none focus:outline-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-[#e9c176]" />
                        <h3 className="text-[10px] font-sans uppercase tracking-widest text-[#e9c176] font-extrabold">
                          Privacy Policy
                        </h3>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isPrivacyOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isPrivacyOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-zinc-800/60 space-y-3 font-sans text-xs">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                1. Data Collection
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                We collect essential identity credentials (name, email/phone, site address, and service proof images) for verification and booking matching.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                2. Location Sharing
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                Real-time geolocation tracking is used solely during active bookings to show the Technician's ETA.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                3. Information Security
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                Your personal contact details are shielded and shared with the selected expert only for service delivery.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[#e1e3e4] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                                4. Portability
                              </h4>
                              <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">
                                You can update, edit, or remove your name and saved address at any time directly through your Profile Dashboard.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* HISTORICAL WORK ORDERS SECTION */}
                <div className="space-y-4 text-left">
                  
                  {/* DONE / COMPLETED BOOKINGS BLOCK */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-sans uppercase tracking-widest text-emerald-400 font-extrabold flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Completed Orders ({historyOrders.filter(o => o.status === 'Done').length})
                    </h3>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                      {historyOrders.filter(o => o.status === 'Done').length > 0 ? (
                        historyOrders.filter(o => o.status === 'Done').map((order) => (
                          <div
                            key={order.id}
                            className="bg-[#111415] border border-zinc-850 rounded-xl p-3 flex flex-col gap-2 hover:border-zinc-800 transition-all duration-200"
                          >
                            <div className="flex justify-between items-center">
                              <div className="space-y-0.5 max-w-[70%] text-left">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] text-zinc-400 font-sans font-bold">
                                    {order.id}
                                  </span>
                                  <span className="text-[8px] font-sans bg-[#c5a059]/10 text-[#e9c176] px-1.5 py-0.2 rounded border border-[#c5a059]/20 uppercase">
                                    {order.category}
                                  </span>
                                </div>
                                <p className="text-xs text-white font-bold tracking-tight truncate font-sans">
                                  Pro: {order.workerName}
                                </p>
                                <span className="text-[9px] text-zinc-500 font-sans block">
                                  {order.date}
                                </span>
                              </div>
                              <div className="text-right space-y-0.5">
                                <p className="font-sans text-emerald-400 font-bold text-xs">
                                  ₹{order.price}
                                </p>
                                <div className="flex flex-col gap-1 items-end">
                                  <span className="text-[8px] font-sans uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                                    Done
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Verified Hand-over details */}
                            {(order.closureName || order.closureAddress || order.closurePhoto) && (
                              <div className="mt-1 p-2 bg-[#0b101d]/60 border border-zinc-850/50 rounded-lg flex gap-3 text-left">
                                {order.closurePhoto && (
                                  <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-zinc-800">
                                    <img src={order.closurePhoto} alt="Witness receipt" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="space-y-0.5 min-w-0 flex-grow">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                    <span className="text-[8px] font-mono font-bold tracking-widest text-[#e9c176] block uppercase">DIGITAL CLOSURE RECEIPT</span>
                                  </div>
                                  {order.closureName && (
                                    <p className="text-[10px] text-zinc-300 font-bold truncate">Signee: {order.closureName}</p>
                                  )}
                                  {order.closureAddress && (
                                    <p className="text-[9px] text-zinc-500 line-clamp-1 font-sans" title={order.closureAddress}>{order.closureAddress}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Conditional Rendering of Submitted Review vs Active Rating Fields */}
                            {order.isRated ? (
                              <div className="bg-[#0b1325] border border-[#c5a059]/15 rounded-xl p-2.5 mt-1 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-[#e9c176] uppercase font-bold font-sans">Rating Given:</span>
                                  <div className="flex text-[#e9c176] gap-0.5">
                                    {[...Array(order.userRating || 5)].map((_, idx) => (
                                      <Star key={idx} className="w-2.5 h-2.5 fill-current text-[#e9c176]" />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-[11px] text-zinc-350 leading-relaxed font-sans mt-1">
                                  <span className="text-[9.5px] text-zinc-500 font-bold block uppercase not-italic">Behaviour Description:</span>
                                  "{order.userBehaviour}"
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center gap-2 mt-1 pt-2 border-t border-zinc-900 flex-wrap">
                                <span className="text-[9px] text-zinc-500 italic font-sans">No feedback submitted yet.</span>
                                <button
                                  type="button"
                                  onClick={() => setReviewModalOrder(order)}
                                  className="text-[10px] bg-[#c5a059]/10 hover:bg-[#c5a059] text-[#e9c176] hover:text-black hover:font-bold border border-[#c5a059]/30 px-3 py-1 rounded-xl transition-all font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5 text-[#e9c176]" />
                                  Rate & Review Behaviour
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] font-sans text-zinc-500 italic text-left">No completed orders yet.</p>
                      )}
                    </div>
                  </div>

                  {/* CANCELLED BOOKINGS BLOCK */}
                  <div className="space-y-2.5 pt-2">
                    <h3 className="text-[10px] font-sans uppercase tracking-widest text-[#c5a059] font-extrabold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#c5a059]" />
                      Cancelled Orders ({historyOrders.filter(o => o.status === 'Cancelled').length})
                    </h3>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar text-left">
                      {historyOrders.filter(o => o.status === 'Cancelled').length > 0 ? (
                        historyOrders.filter(o => o.status === 'Cancelled').map((order) => (
                          <div
                            key={order.id}
                            className="bg-[#111415] border border-zinc-850 rounded-xl p-3 flex justify-between items-center opacity-75 hover:opacity-90"
                          >
                            <div className="space-y-0.5 max-w-[70%] text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400 font-sans font-bold">
                                  {order.id}
                                </span>
                                <span className="text-[8px] font-sans bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-700 uppercase">
                                  {order.category}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-350 font-bold tracking-tight truncate font-sans">
                                Pro: {order.workerName}
                              </p>
                              <span className="text-[9px] text-zinc-500 font-sans block">
                                {order.date}
                              </span>
                            </div>
                            <div className="text-right space-y-0.5">
                              <p className="font-sans text-zinc-400 line-through text-xs">
                                ₹{order.price}
                              </p>
                              <div className="flex flex-col gap-1 items-end">
                                <span className="text-[8px] font-sans uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
                                  Cancelled
                                </span>
                                <button
                                  onClick={() => handleRebookWorker(order.category)}
                                  className="text-[8px] font-sans text-[#c5a059] hover:underline cursor-pointer uppercase font-bold"
                                >
                                  Rebook
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] font-sans text-zinc-500 italic text-left">No cancelled orders yet.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Secure Token Footer inside Drawer */}
              <div className="p-6 bg-[#0c121e] border-t border-zinc-850 space-y-3">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onTransition('auth');
                    showNotification("✓ Logged out successfully.");
                  }}
                  className="w-full py-2.5 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all font-sans cursor-pointer border border-red-600/40 text-center"
                >
                  LOGOUT
                </button>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      localStorage.setItem('punchx_order_history', '[]');
                      setHistoryOrders([]);
                      showNotification("✓ History cleared successfully.");
                    }}
                    className="text-[10px] text-zinc-500 hover:text-[#c5a059] font-sans transition-colors uppercase bg-zinc-900/50 hover:bg-zinc-800/80 px-3 py-1.5 rounded-lg cursor-pointer border border-zinc-800"
                  >
                    Clear History
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Structured Post-Service Rating & Citizen Feedback Modal */}
      {reviewModalOrder && (
        <PostServiceReviewModal
          order={reviewModalOrder}
          isOpen={!!reviewModalOrder}
          onClose={() => setReviewModalOrder(null)}
          onSubmitSuccess={(submittedReview: CustomerReview) => {
            const updated = historyOrders.map((o) => {
              if (o.id === submittedReview.orderId) {
                return {
                  ...o,
                  isRated: true,
                  userRating: submittedReview.rating,
                  userBehaviour: submittedReview.comment
                };
              }
              return o;
            });
            setHistoryOrders(updated);
            localStorage.setItem('punchx_order_history', JSON.stringify(updated));
          }}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}

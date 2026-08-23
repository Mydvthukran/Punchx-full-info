import React, { useState, useEffect } from 'react';
import Splash from './components/Splash';
import Auth from './components/Auth';
import OtpVerify from './components/OtpVerify';
import HomeDashboard from './components/Home';
import ProvidersList from './components/ProvidersList';
import ProviderDetails from './components/ProviderDetails';
import ConfirmBooking from './components/ConfirmBooking';
import ChoosePayment from './components/ChoosePayment';
import LiveTracking from './components/LiveTracking';
import DragoAssistant from './components/DragoAssistant';
import MobileQRModal from './components/MobileQRModal';
import WorkerDashboard from './components/WorkerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ModuleSwitcher from './components/ModuleSwitcher';
import PanelSelect from './components/PanelSelect';
import WorkerSignup from './components/WorkerSignup';
import WorkerOtpPass from './components/WorkerOtpPass';
import WorkerPendingApproval from './components/WorkerPendingApproval';
import CustomerLocationSetup from './components/CustomerLocationSetup';
import WorkerLocationSetup from './components/WorkerLocationSetup';
import PushNotificationBanner from './components/PushNotificationBanner';
import NotificationCenterModal from './components/NotificationCenterModal';
import { AppScreen, Worker, WorkerApplication } from './types';
import { AuthProvider, useAuth } from './lib/authContext';
import { ensureFirebaseDashboardCredentials } from './lib/dashboardAuth';

function AppMain() {
  const { currentUser, userProfile, isLoadingProfile } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [activePanelRole, setActivePanelRole] = useState<'customer' | 'worker' | 'admin'>('customer');
  const [workerApplication, setWorkerApplication] = useState<WorkerApplication | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('AC Repair');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const [citizenName, setCitizenName] = useState('PunchX Citizen');
  const [citizenAddress, setCitizenAddress] = useState('42nd Galaxy Towers, Block C, Bengaluru, KA 560001');

  const [authMethod, setAuthMethod] = useState<'phone' | 'gmail'>('phone');
  const [authTarget, setAuthTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [hasClaimedBonus, setHasClaimedBonus] = useState<boolean>(() => {
    return localStorage.getItem('punchx_first_order_coupon_claimed') === 'true';
  });
  const [hasUsedBonus, setHasUsedBonus] = useState<boolean>(() => {
    return localStorage.getItem('punchx_first_order_coupon_used') === 'true';
  });
  const [promoApplied, setPromoApplied] = useState<boolean>(() => {
    return localStorage.getItem('punchx_active_coupon_applied') === 'true';
  });
  const [issueDescription, setIssueDescription] = useState('AC compressor circuit board triggers system short circuit on startup.');
  const [bookingTime, setBookingTime] = useState('11:30 AM');
  const [bookingDate, setBookingDate] = useState('12');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // State for mobile QR modal trigger
  const [isMobileQrOpen, setIsMobileQrOpen] = useState(false);
  // State for Push Notification Center Modal
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Initialize Firebase credentials for Dashboard security
  useEffect(() => {
    ensureFirebaseDashboardCredentials();
  }, []);

  // Sync authenticated profile from AuthContext
  useEffect(() => {
    if (isLoadingProfile && currentUser) {
      setCitizenName('Loading profile...');
      setCitizenAddress('Loading address...');
    } else if (userProfile) {
      setCitizenName(userProfile.name || 'PunchX Member');
      setCitizenAddress(userProfile.address || 'Address not provided');
      if (userProfile.email) {
        setAuthMethod('gmail');
        setAuthTarget(userProfile.email);
      } else if (userProfile.phone) {
        setAuthMethod('phone');
        setAuthTarget(userProfile.phone);
      }
    }
  }, [userProfile, isLoadingProfile, currentUser]);

  // Step 4: Secure Routing Guard - Redirect to auth screen if unauthenticated user attempts to access protected screens
  useEffect(() => {
    const protectedScreens: AppScreen[] = ['home', 'customer-setup', 'worker-setup', 'worker-dashboard', 'admin-dashboard', 'tracking', 'booking', 'payment', 'providers', 'provider-details'];
    if (!isLoadingProfile && !currentUser && protectedScreens.includes(currentScreen)) {
      showToast("🔒 Active session required. Redirecting to login...");
      setCurrentScreen('auth');
    }
  }, [currentUser, isLoadingProfile, currentScreen]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4500);
  };

  const onClaimPromo = () => {
    if (hasClaimedBonus || hasUsedBonus) {
      showToast("⚠️ 20% First Order Bonus coupon has already been claimed.");
      return;
    }
    setPromoApplied(true);
    setHasClaimedBonus(true);
    try {
      localStorage.setItem('punchx_first_order_coupon_claimed', 'true');
      localStorage.setItem('punchx_active_coupon_applied', 'true');
    } catch (e) {
      console.warn("Storage error saving promo status:", e);
    }
    showToast("✓ 20% First Order Bonus claimed! Discount applied to checkout.");
  };

  const handleApplyPromoCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    const validCodes = ['ELITE20', 'PUNCHX20', 'FIRST20', 'WELCOME20', 'BONUS20', 'SAVE20', 'DISCOUNT20'];
    if (validCodes.includes(upper)) {
      if (hasUsedBonus) {
        showToast("⚠️ First-order promo coupon has already been redeemed on an earlier order.");
        return;
      }
      setPromoApplied(true);
      setHasClaimedBonus(true);
      try {
        localStorage.setItem('punchx_first_order_coupon_claimed', 'true');
        localStorage.setItem('punchx_active_coupon_applied', 'true');
      } catch (e) {
        console.warn("Storage error saving coupon status:", e);
      }
      showToast(`✓ Coupon '${upper}' applied! 20% discount added to order.`);
    } else {
      showToast("⚠️ Invalid coupon code. Try 'ELITE20' or 'PUNCHX20'.");
    }
  };

  const handleTransition = (target: AppScreen) => {
    setCurrentScreen(target);
  };

  // Clean out any legacy mock demo orders and ensure clean actual order history
  useEffect(() => {
    try {
      const existing = localStorage.getItem('punchx_order_history');
      if (existing) {
        const parsed = JSON.parse(existing);
        const demoIds = ['PX-5510', 'PX-9012', 'PX-1120', 'PX-3344'];
        const actualOrders = Array.isArray(parsed) ? parsed.filter((o: any) => !demoIds.includes(o.id)) : [];
        localStorage.setItem('punchx_order_history', JSON.stringify(actualOrders));
      } else {
        localStorage.setItem('punchx_order_history', '[]');
      }
    } catch (e) {
      console.warn("Error cleaning mock order history:", e);
      localStorage.setItem('punchx_order_history', '[]');
    }
  }, []);

  const [deviceTime, setDeviceTime] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setDeviceTime(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030816] text-[#e1e3e4] overflow-x-hidden antialiased selection:bg-[#c5a059]/30 flex flex-col justify-center items-center py-0 md:py-8">
      {/* Immersive Background decorative particles glow effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-[#c5a059]/5 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-[#e9c176]/5 rounded-full blur-[160px] animate-[pulse_6s_ease-in-out_infinite]"></div>
        {/* Subtle royal pattern grid lines on desktop */}
        <div className="hidden md:block absolute inset-0 opacity-[0.02] bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Global Prestige Notification Toast */}
      {toastMessage && (
        <div id="global-prestige-toast" className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm bg-[#0c0f10]/95 border border-[#c5a059] px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(197,160,89,0.35)] flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-ping flex-shrink-0" />
          <p className="text-[11px] text-zinc-150 font-sans tracking-wide leading-relaxed">
            {toastMessage}
          </p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#c5a059] hover:text-white ml-auto text-[10px] font-mono font-bold uppercase tracking-wider"
          >
            OK
          </button>
        </div>
      )}

      {/* IMMERSIVE APPLICATION PLATFORM PORTAL */}
      {currentScreen === 'admin-dashboard' ? (
        /* DESKTOP APP MODE: Wide Desktop Layout for Company Admin Dashboard */
        <div 
          id="punchx-desktop-app-wrapper"
          className="relative z-10 w-full max-w-7xl mx-auto min-h-screen md:min-h-[92vh] bg-[#07122a] md:rounded-3xl md:border md:border-[#c5a059]/30 md:shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-0 md:my-4"
        >
          {/* Top Desktop App Control Bar */}
          <div className="bg-[#07122a]/95 border-b border-[#c5a059]/20 px-6 py-2.5 flex justify-between items-center z-45 text-[11px] font-mono select-none flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-extrabold text-[#e9c176] tracking-wider uppercase">PUNCHX DESKTOP WORKSPACE</span>
              <span className="text-[10px] bg-[#c5a059]/20 text-[#e9c176] px-2 py-0.5 rounded border border-[#c5a059]/30">ENTERPRISE OS</span>
            </div>

            <div className="font-sans font-bold text-[#e9c176] text-xs hidden sm:block">
              {deviceTime} IST
            </div>

            <div className="flex items-center gap-3 text-zinc-400 font-mono text-[10px]">
              <span className="text-emerald-400 font-bold">● SYSTEM LEDGER LIVE</span>
            </div>
          </div>

          {/* Module Switcher Header */}
          <ModuleSwitcher 
            currentScreen={currentScreen} 
            onTransition={handleTransition} 
            showNotification={showToast} 
          />

          {/* Admin Desktop Dashboard Component */}
          <div className="relative z-10 w-full flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#07122a]">
            <AdminDashboard
              onTransition={handleTransition}
              showNotification={showToast}
            />
          </div>
        </div>
      ) : (
        /* FULLY RESPONSIVE APPLICATION CONTAINER FOR ALL BREAKPOINTS */
        <div 
          id="punchx-app-wrapper"
          className="relative z-10 w-full max-w-7xl mx-auto min-h-screen md:min-h-[92vh] bg-[#07122a] md:rounded-3xl md:border md:border-[#c5a059]/30 md:shadow-[0_25px_80px_rgba(0,0,0,0.92)] overflow-hidden flex flex-col my-0 md:my-4"
        >
          {/* Responsive Header Bar */}
          <div className="bg-[#07122a] border-b border-zinc-800/60 px-4 sm:px-6 pt-3 pb-2 flex justify-between items-center z-45 text-[11px] font-mono text-zinc-300 select-none flex-shrink-0">
            {/* Left: Device Time & App Label */}
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-[#e9c176] text-xs tracking-tight">
                {deviceTime}
              </span>
              <span className="hidden sm:inline-block text-[10px] bg-[#c5a059]/15 text-[#e9c176] px-2 py-0.5 rounded border border-[#c5a059]/30 font-bold">
                PUNCHX SERVICE PLATFORM
              </span>
            </div>

            {/* Right: System Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider">LIVE SYNC ACTIVE</span>
            </div>
          </div>

          {/* Module Integration Switcher (Customer / Worker / Admin) */}
          <ModuleSwitcher 
            currentScreen={currentScreen} 
            onTransition={handleTransition} 
            showNotification={showToast} 
          />

          {/* Mobile Screen Routing Scroll View Container */}
          <div className="relative z-10 w-full flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#07122a]">
            {currentScreen === 'splash' && (
              <Splash onTransition={handleTransition} />
            )}
            {currentScreen === 'panel-select' && (
              <PanelSelect
                onSelectPanel={(panel, action) => {
                  setActivePanelRole(panel);
                  if (panel === 'worker' && action === 'signup') {
                    setCurrentScreen('worker-signup');
                  } else {
                    setCurrentScreen('auth');
                  }
                }}
                showNotification={showToast}
              />
            )}
            {currentScreen === 'worker-signup' && (
              <WorkerSignup
                onTransition={handleTransition}
                showNotification={showToast}
                setWorkerApplicationData={setWorkerApplication}
              />
            )}
            {currentScreen === 'worker-otp-pass' && (
              <WorkerOtpPass
                onTransition={handleTransition}
                showNotification={showToast}
                workerApplication={workerApplication}
                setWorkerApplicationData={setWorkerApplication}
              />
            )}
            {currentScreen === 'worker-pending-approval' && (
              <WorkerPendingApproval
                onTransition={handleTransition}
                showNotification={showToast}
                workerApplication={workerApplication}
                setWorkerApplicationData={setWorkerApplication}
              />
            )}
            {currentScreen === 'auth' && (
              <Auth
                onTransition={handleTransition}
                showNotification={showToast}
                setAuthMethodDetail={(method, target) => {
                  setAuthMethod(method);
                  setAuthTarget(target);
                }}
                activePanelRole={activePanelRole}
              />
            )}
            {currentScreen === 'otp' && (
              <OtpVerify
                onTransition={handleTransition}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                authMethod={authMethod}
                authTarget={authTarget}
                activePanelRole={activePanelRole}
              />
            )}
            {currentScreen === 'customer-setup' && (
              <CustomerLocationSetup
                onTransition={handleTransition}
                citizenName={citizenName}
                setCitizenName={setCitizenName}
                citizenAddress={citizenAddress}
                setCitizenAddress={setCitizenAddress}
                showNotification={showToast}
                authMethod={authMethod}
                authTarget={authTarget}
              />
            )}
            {currentScreen === 'worker-setup' && (
              <WorkerLocationSetup
                onTransition={handleTransition}
                showNotification={showToast}
                authMethod={authMethod}
                authTarget={authTarget}
                workerApplication={workerApplication}
                setWorkerApplicationData={setWorkerApplication}
              />
            )}
            {currentScreen === 'home' && (
              <HomeDashboard
                onTransition={handleTransition}
                onSelectWorker={setSelectedWorker}
                onSelectCategory={setSelectedCategory}
                hasActiveBooking={true}
                promoApplied={promoApplied}
                hasClaimedBonus={hasClaimedBonus}
                hasUsedBonus={hasUsedBonus}
                onClaimPromo={onClaimPromo}
                citizenName={citizenName}
                setCitizenName={setCitizenName}
                citizenAddress={citizenAddress}
                setCitizenAddress={setCitizenAddress}
                authMethod={authMethod}
                authTarget={authTarget}
                showNotification={showToast}
                onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
              />
            )}
            {currentScreen === 'providers' && (
              <ProvidersList
                onTransition={handleTransition}
                selectedCategory={selectedCategory}
                onSelectWorker={setSelectedWorker}
                authMethod={authMethod}
                authTarget={authTarget}
                showNotification={showToast}
                citizenName={citizenName}
                setCitizenName={setCitizenName}
                citizenAddress={citizenAddress}
                setCitizenAddress={setCitizenAddress}
              />
            )}
            {currentScreen === 'provider-details' && (
              <ProviderDetails
                onTransition={handleTransition}
                selectedWorker={selectedWorker}
                showNotification={showToast}
              />
            )}
            {currentScreen === 'booking' && (
              <ConfirmBooking
                onTransition={handleTransition}
                selectedCategory={selectedCategory}
                selectedWorker={selectedWorker}
                promoApplied={promoApplied}
                issueDescription={issueDescription}
                setIssueDescription={setIssueDescription}
                bookingTime={bookingTime}
                setBookingTime={setBookingTime}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                citizenAddress={citizenAddress}
                setCitizenAddress={setCitizenAddress}
              />
            )}
            {currentScreen === 'payment' && (
              <ChoosePayment
                onTransition={handleTransition}
                selectedWorker={selectedWorker}
                promoApplied={promoApplied}
                hasUsedBonus={hasUsedBonus}
                onOrderFinalized={() => {
                  if (promoApplied) {
                    setHasUsedBonus(true);
                    setPromoApplied(false);
                    try {
                      localStorage.setItem('punchx_first_order_coupon_used', 'true');
                      localStorage.removeItem('punchx_active_coupon_applied');
                    } catch (e) {
                      console.warn(e);
                    }
                  }
                }}
                onApplyPromo={handleApplyPromoCode}
                showNotification={showToast}
              />
            )}
            {currentScreen === 'tracking' && (
              <LiveTracking
                onTransition={handleTransition}
                bookingTime={bookingTime}
              />
            )}
            {currentScreen === 'worker-dashboard' && (
              <WorkerDashboard
                onTransition={handleTransition}
                showNotification={showToast}
              />
            )}
          </div>

          {/* Android Bottom Gesture Navigation Home Pill */}
          <div className="bg-[#07122a] py-2 flex justify-center items-center flex-shrink-0 z-40 border-t border-zinc-900">
            <div className="w-28 h-1 bg-zinc-600/70 hover:bg-[#c5a059] transition-colors rounded-full cursor-pointer"></div>
          </div>
        </div>
      )}

      {/* Global Bot Companion DRAGO AI Assist */}
      <DragoAssistant
        currentScreen={currentScreen}
        onAutoFillOtp={(code) => setOtpCode(code)}
        onApplyPromo={(code) => setPromoApplied(true)}
        onAutoFillBooking={() =>
          setIssueDescription("AC unit short-circuited with smoke coming from compressor board. Needs priority circuit diagnostics.")
        }
      />

      {/* Floating QR Code Mobile Gateway Trigger Button */}
      <button
        id="trigger-mobile-qr-modal"
        type="button"
        onClick={() => setIsMobileQrOpen(true)}
        className="fixed top-4 right-4 z-[999] bg-[#0a1120]/90 hover:bg-[#c5a059] border border-[#c5a059]/40 text-[#e9c176] hover:text-[#07122a] px-3 py-2 rounded-xl text-[9px] font-mono font-extrabold tracking-widest shadow-xl backdrop-blur-md transition-all active:scale-95 items-center gap-1.5 cursor-pointer uppercase select-none hidden md:flex"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <span>Test on Mobile</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
      </button>

      {/* Global Interactive QR Code Modal */}
      <MobileQRModal isOpen={isMobileQrOpen} onClose={() => setIsMobileQrOpen(false)} />

      {/* Global Push Notification Floating Alert Banner */}
      <PushNotificationBanner onOpenCenter={() => setIsNotificationCenterOpen(true)} />

      {/* Global Push Notification Center & Simulator Controls Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppMain />
    </AuthProvider>
  );
}

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Splash from './components/Splash';
import Auth from './components/Auth';
import DragoAssistant from './components/DragoAssistant';
import MobileQRModal from './components/MobileQRModal';
import ModuleSwitcher from './components/ModuleSwitcher';
import PanelSelect from './components/PanelSelect';
import PushNotificationBanner from './components/PushNotificationBanner';
import NotificationCenterModal from './components/NotificationCenterModal';
import WebsiteNavbar from './components/WebsiteNavbar';
import WebsiteFooter from './components/WebsiteFooter';
import { AppScreen, Worker, WorkerApplication } from './types';
import { AuthProvider, useAuth } from './lib/authContext';
import { ensureFirebaseDashboardCredentials } from './lib/dashboardAuth';
import { NamoIDProvider, useNamoID, completeHostedAuthRedirect } from "@namoidhq/react";
// Lazy-loaded heavy screens to improve initial load time
const HomeDashboard = lazy(() => import('./components/Home'));
const ProvidersList = lazy(() => import('./components/ProvidersList'));
const ProviderDetails = lazy(() => import('./components/ProviderDetails'));
const ConfirmBooking = lazy(() => import('./components/ConfirmBooking'));
const ChoosePayment = lazy(() => import('./components/ChoosePayment'));
const LiveTracking = lazy(() => import('./components/LiveTracking'));
const WorkerDashboard = lazy(() => import('./components/WorkerDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const WorkerSignup = lazy(() => import('./components/WorkerSignup'));
const WorkerOtpPass = lazy(() => import('./components/WorkerOtpPass'));
const WorkerPendingApproval = lazy(() => import('./components/WorkerPendingApproval'));
const CustomerLocationSetup = lazy(() => import('./components/CustomerLocationSetup'));
const WorkerLocationSetup = lazy(() => import('./components/WorkerLocationSetup'));

function AuthCallback({ onTransition }: { onTransition: (target: AppScreen) => void }) {
  const client = useNamoID();
  const { loginWithNamoID } = useAuth();
  
  useEffect(() => {
    async function processCallback() {
      try {
        const result = await completeHostedAuthRedirect(client, window.location.href);
        const savedRole = localStorage.getItem('punchx_auth_role') as 'citizen' | 'worker' | 'admin' || 'citizen';
        await loginWithNamoID(result.identity, savedRole);
        
        window.history.replaceState({}, document.title, '/');
        
        if (savedRole === 'admin') onTransition('admin-dashboard');
        else if (savedRole === 'worker') onTransition('worker-dashboard');
        else onTransition('home');
      } catch (e) {
        console.error("Auth callback error:", e);
        onTransition('auth');
      }
    }
    processCallback();
  }, [client, loginWithNamoID, onTransition]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin shadow-[0_0_15px_rgba(197,160,89,0.5)]"></div>
      <p className="mt-4 text-zinc-400 font-mono text-sm animate-pulse">Authenticating with NamoID...</p>
    </div>
  );
}

function AppMain() {
  const { currentUser, userProfile, isLoadingProfile, loginWithNamoID } = useAuth() as any;

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    if (window.location.pathname === '/auth/callback') return 'auth-callback' as any;
    return 'splash';
  });
  const [activePanelRole, setActivePanelRole] = useState<'customer' | 'worker' | 'admin'>(() => {
    return (localStorage.getItem('punchx_auth_role') as 'customer' | 'worker' | 'admin') || 'customer';
  });

  useEffect(() => {
    localStorage.setItem('punchx_auth_role', activePanelRole);
  }, [activePanelRole]);
  const [workerApplication, setWorkerApplication] = useState<WorkerApplication | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('AC Repair');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const [citizenName, setCitizenName] = useState('PunchX Citizen');
  const [citizenAddress, setCitizenAddress] = useState('42nd Galaxy Towers, Block C, Bengaluru, KA 560001');

  const [authMethod, setAuthMethod] = useState<'phone' | 'gmail'>('phone');
  const [authTarget, setAuthTarget] = useState('');
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
    <div className="relative min-h-screen bg-[#07122a] text-[#e1e3e4] overflow-x-hidden antialiased selection:bg-[#c5a059]/30 flex flex-col">
      {/* Immersive Background decorative particles glow effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[15%] right-[10%] w-[35%] h-[35%] bg-[#c5a059]/5 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-[#e9c176]/5 rounded-full blur-[160px] animate-[pulse_6s_ease-in-out_infinite]"></div>
        {/* Subtle royal pattern grid lines */}
        <div className="hidden md:block absolute inset-0 opacity-[0.02] bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Global Prestige Notification Toast */}
      {toastMessage && (
        <div id="global-prestige-toast" className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm bg-[#0c0f10]/95 border border-[#c5a059] px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(197,160,89,0.35)] flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-ping flex-shrink-0" />
          <p className="text-[11px] text-zinc-150 font-sans tracking-wide leading-relaxed">
            {toastMessage}
          </p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#c5a059] hover:text-white ml-auto text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
          >
            OK
          </button>
        </div>
      )}

      {/* Top Global Website Navigation Bar (Shown on all pages except initial splash) */}
      {currentScreen !== 'splash' && (
        <WebsiteNavbar
          currentScreen={currentScreen}
          onTransition={handleTransition}
          activePanelRole={activePanelRole}
          setActivePanelRole={setActivePanelRole}
          citizenName={citizenName}
          citizenAddress={citizenAddress}
          onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
          onSelectCategory={setSelectedCategory}
          showNotification={showToast}
          hasActiveBooking={true}
        />
      )}

      {/* Website Main Content Area */}
      <main className="relative z-10 w-full flex-grow flex flex-col bg-[#07122a]">
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin shadow-[0_0_15px_rgba(197,160,89,0.5)]"></div>
          </div>
        }>
        {currentScreen === 'auth-callback' as any && (
          <AuthCallback onTransition={handleTransition} />
        )}
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
        {currentScreen === 'admin-dashboard' && (
          <AdminDashboard
            onTransition={handleTransition}
            showNotification={showToast}
          />
        )}
        </Suspense>
      </main>

      {/* Global Website Footer (Shown on all pages except initial splash screen) */}
      {currentScreen !== 'splash' && (
        <WebsiteFooter
          onTransition={handleTransition}
          onSelectCategory={setSelectedCategory}
          showNotification={showToast}
        />
      )}

      {/* Global Bot Companion DRAGO AI Assist */}
      <DragoAssistant
        currentScreen={currentScreen}
        onAutoFillOtp={() => {}}
        onApplyPromo={(code) => setPromoApplied(true)}
        onAutoFillBooking={() =>
          setIssueDescription("AC unit short-circuited with smoke coming from compressor board. Needs priority circuit diagnostics.")
        }
      />

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
  const clientId = import.meta.env.VITE_NAMOID_CLIENT_ID || "namoid_client_live_6SHiI0dLuG1BZmiJjC51u5KCbqBZQQjd";
  return (
    <NamoIDProvider clientId={clientId}>
      <AuthProvider>
        <AppMain />
      </AuthProvider>
    </NamoIDProvider>
  );
}

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
import { AppScreen, Worker, WorkerApplication } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [activePanelRole, setActivePanelRole] = useState<'customer' | 'worker' | 'admin'>('customer');
  const [workerApplication, setWorkerApplication] = useState<WorkerApplication | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('AC Repair');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const [citizenName, setCitizenName] = useState('Aarav Sharma');
  const [citizenAddress, setCitizenAddress] = useState('42nd Galaxy Towers, Block C, Bengaluru, KA 560001');

  const [authMethod, setAuthMethod] = useState<'phone' | 'gmail'>('phone');
  const [authTarget, setAuthTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [issueDescription, setIssueDescription] = useState('AC compressor circuit board triggers system short circuit on startup.');
  const [bookingTime, setBookingTime] = useState('11:30 AM');
  const [bookingDate, setBookingDate] = useState('12');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // State for mobile QR modal trigger
  const [isMobileQrOpen, setIsMobileQrOpen] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4500);
  };

  const onClaimPromo = () => {
    setPromoApplied(true);
    showToast("✓ Promotional 20% OFF bound dynamically! Enjoy Elite services.");
  };

  const handleApplyPromoCode = (code: string) => {
    if (code.toUpperCase() === 'ELITE20' || code.toUpperCase() === 'PUNCHX20') {
      setPromoApplied(true);
      showToast("✓ Exclusive coupon applied! Your checkout prices are minimized.");
    }
  };

  const handleTransition = (target: AppScreen) => {
    setCurrentScreen(target);
  };

  useEffect(() => {
    const existing = localStorage.getItem('punchx_order_history');
    if (!existing) {
      const defaultHistory = [
        {
          id: 'PX-5510',
          category: 'AC Repair',
          workerName: 'Rajesh Kumar',
          price: 180,
          date: 'May 24, 2026',
          status: 'Done'
        },
        {
          id: 'PX-9012',
          category: 'Plumbing',
          workerName: 'Rohan Das',
          price: 130,
          date: 'May 22, 2026',
          status: 'Cancelled'
        },
        {
          id: 'PX-1120',
          category: 'Cleaning',
          workerName: 'Sarah Jenkins',
          price: 249,
          date: 'May 18, 2026',
          status: 'Done'
        },
        {
          id: 'PX-3344',
          category: 'Electrical',
          workerName: 'Marcus Thorne',
          price: 199,
          date: 'May 12, 2026',
          status: 'Cancelled'
        }
      ];
      localStorage.setItem('punchx_order_history', JSON.stringify(defaultHistory));
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

            {/* Center: System Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider hidden sm:inline">LIVE SYNC ACTIVE</span>
            </div>

            {/* Right: Network & Battery Indicators */}
            <div className="flex items-center gap-2 text-zinc-300 text-[10px] font-bold">
              <span>5G</span>
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.3c-.2-.2-.2-.51 0-.71L12 11l7.65 7.59c.2.2.2.51 0 .71l-.62.61C20.26 18.07 21 16.12 21 14c0-4.97-4.03-9-9-9z"/>
              </svg>
              <div className="flex items-center gap-0.5 bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/40 text-[9px]">
                <span>98%</span>
              </div>
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
            {currentScreen === 'home' && (
              <HomeDashboard
                onTransition={handleTransition}
                onSelectWorker={setSelectedWorker}
                onSelectCategory={setSelectedCategory}
                hasActiveBooking={true}
                promoApplied={promoApplied}
                onClaimPromo={onClaimPromo}
                citizenName={citizenName}
                setCitizenName={setCitizenName}
                citizenAddress={citizenAddress}
                setCitizenAddress={setCitizenAddress}
                authMethod={authMethod}
                authTarget={authTarget}
                showNotification={showToast}
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
    </div>
  );
}

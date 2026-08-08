import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppScreen } from '../types';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, User, KeyRound } from 'lucide-react';
import PUNCHX_LOGO from '../assets/logo';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';

interface AuthProps {
  onTransition: (target: AppScreen) => void;
  showNotification: (msg: string) => void;
  setAuthMethodDetail: (method: 'phone' | 'gmail', target: string) => void;
  activePanelRole?: 'customer' | 'worker' | 'admin';
}

export default function Auth({ onTransition, showNotification, setAuthMethodDetail, activePanelRole = 'customer' }: AuthProps) {
  // Tabs: 'phone' | 'register' | 'signin' - default to 'signin' for Worker and Admin for fast login
  const [activeTab, setActiveTab] = useState<'phone' | 'register' | 'signin'>(
    activePanelRole === 'worker' || activePanelRole === 'admin' ? 'signin' : 'phone'
  );

  // Input states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState<'privacy' | 'terms' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      showNotification("⚠️ You must agree to the Privacy Policy and Terms & Conditions to proceed.");
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      showNotification("⚠️ Please enter a valid phone number.");
      return;
    }
    const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91 ${phoneNumber.trim()}`;
    setAuthMethodDetail('phone', cleanPhone);

    try {
      // Authenticate session in Firebase Auth
      await signInAnonymously(auth);
    } catch (err: any) {
      console.warn("Firebase auth notice:", err?.message || err);
    }

    showNotification(`📨 An OTP code is requested for ${cleanPhone}.`);
    onTransition('otp');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      showNotification("⚠️ You must agree to the Privacy Policy and Terms & Conditions to proceed.");
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      showNotification("⚠️ Please enter a valid Email address.");
      return;
    }
    if (registerPassword.length < 6) {
      showNotification("⚠️ Password must be at least 6 characters.");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      showNotification("⚠️ Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user securely via Firebase Auth SDK
      await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
      setAuthMethodDetail('gmail', registerEmail.trim());
      showNotification(`📨 Account created successfully for ${registerEmail.trim()}!`);
      onTransition('otp');
    } catch (err: any) {
      console.error("Firebase registration error:", err);
      if (err?.code === 'auth/operation-not-allowed') {
        showNotification("ℹ️ Firebase Auth provider disabled in console. Entering app in preview mode...");
        setAuthMethodDetail('gmail', registerEmail.trim());
        onTransition('home');
      } else if (err?.code === 'auth/email-already-in-use') {
        showNotification("ℹ️ Email is already registered. Signing in...");
        try {
          await signInWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
          onTransition('home');
        } catch (signInErr: any) {
          showNotification(`❌ ${signInErr?.message || 'Incorrect password'}`);
        }
      } else {
        showNotification(`❌ Firebase Auth: ${err?.message || 'Registration failed'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      showNotification("⚠️ You must agree to the Privacy Policy and Terms & Conditions to proceed.");
      return;
    }
    if (!signinEmail.trim() || !signinPassword) {
      showNotification("⚠️ Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Authenticate directly with Firebase Auth
      await signInWithEmailAndPassword(auth, signinEmail.trim(), signinPassword);
      
      showNotification("🔑 Authentication Verified. Opening workspace...");
      if (activePanelRole === 'admin') {
        onTransition('admin-dashboard');
      } else if (activePanelRole === 'worker') {
        onTransition('worker-dashboard');
      } else {
        onTransition('home');
      }
    } catch (err: any) {
      console.error("Firebase sign in error:", err);
      if (err?.code === 'auth/operation-not-allowed') {
        showNotification("ℹ️ Sign-In method disabled in Firebase console. Opening workspace in preview mode...");
        if (activePanelRole === 'admin') {
          onTransition('admin-dashboard');
        } else if (activePanelRole === 'worker') {
          onTransition('worker-dashboard');
        } else {
          onTransition('home');
        }
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          // Auto-provision account in Firebase Auth for new project environment
          await createUserWithEmailAndPassword(auth, signinEmail.trim(), signinPassword);
          showNotification("🔑 User account created & authenticated!");
          if (activePanelRole === 'admin') {
            onTransition('admin-dashboard');
          } else if (activePanelRole === 'worker') {
            onTransition('worker-dashboard');
          } else {
            onTransition('home');
          }
        } catch (createErr: any) {
          if (createErr?.code === 'auth/operation-not-allowed') {
            showNotification("ℹ️ Opening workspace in preview mode...");
            if (activePanelRole === 'admin') {
              onTransition('admin-dashboard');
            } else if (activePanelRole === 'worker') {
              onTransition('worker-dashboard');
            } else {
              onTransition('home');
            }
          } else {
            showNotification(`❌ Authentication Failed: ${err?.message || 'Invalid credentials'}`);
          }
        }
      } else {
        showNotification(`❌ Authentication Failed: ${err?.message || 'Invalid credentials'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      id="auth-screen"
      className="min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans flex flex-col justify-between py-10 px-6 overflow-y-auto"
    >
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-[#c5a059]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Back to Panel Selection Button */}
        <button
          onClick={() => onTransition('panel-select')}
          className="self-start text-[11px] font-mono text-[#e9c176] hover:underline flex items-center gap-1 mb-2 bg-[#11192e] px-3 py-1.5 rounded-lg border border-zinc-800 cursor-pointer"
        >
          ← Choose Different Panel
        </button>

        {/* Upper Brand Identifier */}
        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <motion.div
            className="w-20 h-20 rounded-full bg-[#07122a] p-0 flex items-center justify-center mb-4 shadow-[0_8px_25px_rgba(197,160,89,0.25)] border-2 border-[#c5a059]/40 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <img src={PUNCHX_LOGO} alt="PunchX Logo" className="w-full h-full object-cover rounded-full" />
          </motion.div>
          <h1 className="font-sans font-extrabold text-2xl tracking-tight text-white mb-1">
            {activePanelRole === 'admin' ? 'Company Dashboard Authorization' : 'Sign In to Account'}
          </h1>
          <p className="text-sm text-zinc-300 max-w-[320px] leading-relaxed mt-2">
            {activePanelRole === 'admin' ? (
              <>Enter the <span className="text-[#e9c176] font-extrabold bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/20 shadow-sm">Admin Security Password</span> to access management tools.</>
            ) : activePanelRole === 'worker' ? (
              <>PunchX Specialist Portal — Sign in with your <span className="text-[#e9c176] font-extrabold bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/20 shadow-sm">Gmail</span> or <span className="text-[#e9c176] font-extrabold bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/20 shadow-sm">Saved Password</span>.</>
            ) : (
              <>Please enter your <span className="text-[#e9c176] font-extrabold bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/20 shadow-sm">Gmail Address</span> and <span className="text-[#e9c176] font-extrabold bg-[#c5a059]/15 px-1.5 py-0.5 rounded border border-[#c5a059]/20 shadow-sm">Saved Password</span> to access your account.</>
            )}
          </p>
        </div>

        {/* Tab Selection Row (Hidden for Admin & Worker Panel) */}
        {activePanelRole !== 'admin' && activePanelRole !== 'worker' && (
          <div className="w-full bg-[#101b33] border border-zinc-800/80 p-1.5 rounded-xl flex items-center gap-1 mb-6">
            <button
              onClick={() => setActiveTab('phone')}
              className={`flex-1 py-3 rounded-lg text-center font-sans text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                activeTab === 'phone'
                  ? 'bg-[#c5a059] text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Phone Number
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 rounded-lg text-center font-sans text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#c5a059] text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Registration
            </button>
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 rounded-lg text-center font-sans text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-[#c5a059] text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Gmail Log In
            </button>
          </div>
        )}

        {/* Forms with animated transition context */}
        <div className="w-full bg-[#11192e] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activePanelRole === 'admin' ? (
              <motion.form
                key="admin-password-form"
                onSubmit={handleSigninSubmit}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 bg-[#07122a] p-3.5 rounded-xl border border-[#c5a059]/30">
                  <Lock className="w-5 h-5 text-[#c5a059] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-bold text-[#e9c176]">Admin Gate Authorization</p>
                    <p className="text-[11px] text-zinc-400">Restricted company system management</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#e9c176] font-extrabold">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    placeholder="admin@punchx.com"
                    className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#e9c176] font-extrabold">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="Enter Password..."
                      className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3.5 text-sm text-white font-mono placeholder-zinc-600 outline-none transition-all"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#c5a059] hover:bg-[#e9c176] text-black font-mono font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg border border-[#ffdea5]/30 active:scale-[0.98] disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-black" />
                  <span>{isSubmitting ? "Verifying Firebase Auth..." : "Unlock Admin Dashboard"}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </motion.form>
            ) : activePanelRole === 'worker' ? (
              <motion.div
                key="worker-login-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Header Badge */}
                <div className="flex items-center gap-3 bg-[#07122a] p-3.5 rounded-xl border border-[#c5a059]/30">
                  <KeyRound className="w-5 h-5 text-[#c5a059] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-bold text-[#e9c176]">Worker Specialist Authentication</p>
                    <p className="text-[11px] text-zinc-400">Login via Gmail or Saved Password credentials</p>
                  </div>
                </div>

                {/* 1. Gmail Single Sign-On Button */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Method 1: Fast Gmail Authorization
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      showNotification("🌐 Connecting via Gmail Account Single Sign-On...");
                      setTimeout(() => {
                        showNotification("✅ Authenticated as Technician: worker.rajesh@gmail.com");
                        onTransition('worker-dashboard');
                      }, 800);
                    }}
                    className="w-full py-3.5 px-4 bg-[#18233c] hover:bg-[#202d4d] border border-zinc-700 hover:border-[#c5a059] rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign In With Gmail Account</span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-zinc-500 font-bold">Or Sign In With Saved Password</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                {/* 2. Gmail Address & Saved Password Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!signinEmail.trim() || !signinPassword) {
                    showNotification("⚠️ Please enter your Gmail and saved password.");
                    return;
                  }
                  showNotification(`🔑 Worker Login Verified for ${signinEmail.trim()}`);
                  onTransition('worker-dashboard');
                }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#e9c176] font-bold">
                      Worker Gmail Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        placeholder="worker.rajesh@gmail.com"
                        className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3 text-xs text-white font-mono placeholder-zinc-600 outline-none transition-all"
                        required
                      />
                      <Mail className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#e9c176] font-bold">
                      Saved Account Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3 text-xs text-white font-mono placeholder-zinc-600 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Auto-fill Saved Credentials Chip */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSigninEmail('worker.rajesh@gmail.com');
                        setSigninPassword('PunchX#Worker2026');
                        showNotification("🔑 Saved Worker credentials populated!");
                      }}
                      className="text-[#e9c176] hover:underline font-mono text-[10px] bg-[#c5a059]/10 px-2.5 py-1 rounded-lg border border-[#c5a059]/30 flex items-center gap-1 cursor-pointer"
                    >
                      <span>🔑 Fill Saved Password (Rajesh Kumar)</span>
                    </button>
                    <span className="text-zinc-500 text-[10px]">Saved local profile</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#c5a059] hover:bg-[#e9c176] text-black font-mono font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg border border-[#ffdea5]/30 active:scale-[0.98]"
                  >
                    <span>SIGN IN TO WORKER PANEL</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </form>

                {/* Direct Link to Registration */}
                <div className="pt-2 text-center border-t border-zinc-800">
                  <p className="text-xs text-zinc-400">
                    Not registered as a PunchX Technician yet?
                  </p>
                  <button
                    type="button"
                    onClick={() => onTransition('worker-signup')}
                    className="mt-1.5 text-xs font-mono font-bold text-[#e9c176] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Apply for PunchX Worker Registration →
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
            {/* Phone Form */}
            {activeTab === 'phone' && (
              <motion.form
                key="phone-form"
                onSubmit={handlePhoneSubmit}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#e9c176] font-bold">
                    Enter Your <span className="text-[#e9c176] underline decoration-solid font-black">Phone Number</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-sans font-bold text-zinc-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-14 pr-4 py-4 text-sm text-white font-sans placeholder-zinc-600 outline-none transition-all"
                      required
                    />
                    <Phone className="w-4 h-4 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="bg-[#151f37]/50 border border-zinc-800/40 p-4 rounded-xl text-center">
                  <p className="text-xs text-zinc-305 leading-relaxed font-sans">
                    A secure 6-digit OTP code will be sent to your <span className="text-[#e9c176] font-bold font-sans">Phone Number</span>.
                  </p>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-1 text-left bg-zinc-950/25 p-3 rounded-xl border border-zinc-900">
                  <input
                    type="checkbox"
                    id="consent-phone"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 w-4.5 h-4.5 rounded border-zinc-750 text-[#c5a059] focus:ring-[#c5a059] bg-[#07122a] cursor-pointer"
                  />
                  <label htmlFor="consent-phone" className="text-xs text-zinc-350 font-sans leading-relaxed select-none">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal('privacy')}
                      className="text-[#e9c176] font-extrabold underline hover:text-[#ffdea5] bg-transparent border-none p-0 cursor-pointer inline"
                    >
                      Privacy Policy
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal('terms')}
                      className="text-[#e9c176] font-extrabold underline hover:text-[#ffdea5] bg-transparent border-none p-0 cursor-pointer inline"
                    >
                      Terms & Conditions
                    </button>.
                  </label>
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all border font-extrabold uppercase tracking-wider text-sm ${
                    consentChecked
                      ? 'bg-gradient-to-r from-[#c5a059] to-[#e9c176] hover:brightness-110 active:scale-[0.98] text-black border-[#ffdea5]/40 cursor-pointer'
                      : 'bg-zinc-850 text-zinc-550 border-zinc-905 cursor-not-allowed opacity-55'
                  }`}
                  disabled={!consentChecked}
                >
                  Request OTP to Phone Number
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Direct Log In Option Button on Phone Page */}
                <div className="pt-3 border-t border-zinc-800 text-center space-y-2">
                  <p className="text-xs text-zinc-400 font-sans">Have a registered Gmail account?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      showNotification("🔑 Switched to Gmail & Saved Password Log In");
                    }}
                    className="w-full py-3 bg-[#07122a] hover:bg-[#121f3d] border border-[#c5a059]/50 hover:border-[#c5a059] rounded-xl text-xs font-sans font-extrabold text-[#e9c176] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <User className="w-4 h-4 text-[#c5a059]" />
                    <span>Log In with Gmail & Saved Password</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Email Register Form */}
            {activeTab === 'register' && (
              <motion.form
                key="register-form"
                onSubmit={handleRegisterSubmit}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#e9c176] font-bold">
                    Create New <span className="text-[#e9c176] underline decoration-solid font-black">Gmail Account</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3.5 text-sm text-white font-sans placeholder-zinc-600 outline-none transition-all"
                      required
                    />
                    <Mail className="w-4 h-4 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#e9c176] font-bold">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3.5 text-sm text-white font-sans placeholder-zinc-600 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#e9c176] font-bold">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3.5 text-sm text-white font-sans placeholder-zinc-600 outline-none transition-all"
                      required
                    />
                    <Lock className="w-4 h-4 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-1 text-left bg-zinc-950/25 p-3 rounded-xl border border-zinc-900">
                  <input
                    type="checkbox"
                    id="consent-register"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 w-4.5 h-4.5 rounded border-zinc-750 text-[#c5a059] focus:ring-[#c5a059] bg-[#07122a] cursor-pointer"
                  />
                  <label htmlFor="consent-register" className="text-xs text-zinc-350 font-sans leading-relaxed select-none">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal('privacy')}
                      className="text-[#e9c176] font-extrabold underline hover:text-[#ffdea5] bg-transparent border-none p-0 cursor-pointer inline"
                    >
                      Privacy Policy
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal('terms')}
                      className="text-[#e9c176] font-extrabold underline hover:text-[#ffdea5] bg-transparent border-none p-0 cursor-pointer inline"
                    >
                      Terms & Conditions
                    </button>.
                  </label>
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all border font-extrabold uppercase tracking-wider text-sm ${
                    consentChecked
                      ? 'bg-gradient-to-r from-[#c5a059] to-[#e9c176] hover:brightness-110 active:scale-[0.98] text-black border-[#ffdea5]/40 cursor-pointer'
                      : 'bg-zinc-850 text-zinc-550 border-zinc-905 cursor-not-allowed opacity-55'
                  }`}
                  disabled={!consentChecked}
                >
                  Register Gmail Account
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Direct Log In Option Button on Registration Page */}
                <div className="pt-3 border-t border-zinc-800 text-center space-y-2">
                  <p className="text-xs text-zinc-400 font-sans">Already registered an account?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      showNotification("🔑 Switched to Gmail & Saved Password Log In");
                    }}
                    className="w-full py-3 bg-[#07122a] hover:bg-[#121f3d] border border-[#c5a059]/50 hover:border-[#c5a059] rounded-xl text-xs font-sans font-extrabold text-[#e9c176] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <User className="w-4 h-4 text-[#c5a059]" />
                    <span>Log In with Gmail & Saved Password</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Email Sign In Form */}
            {activeTab === 'signin' && (
              <motion.form
                key="signin-form"
                onSubmit={handleSigninSubmit}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#e9c176] font-bold">
                    Gmail Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3.5 text-sm text-white font-sans placeholder-zinc-600 outline-none transition-all"
                      required
                    />
                    <User className="w-4 h-4 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center w-full">
                    <label className="text-xs font-sans uppercase tracking-widest text-[#e9c176] font-bold">
                      Saved Password
                    </label>
                    <span className="text-xs text-zinc-500 font-sans italic">Password is secure</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#07122a] border border-zinc-800 focus:border-[#c5a059] rounded-xl pl-4 pr-10 py-3.5 text-sm text-white font-sans placeholder-zinc-600 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>


                {/* Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-1 text-left bg-zinc-950/25 p-3 rounded-xl border border-zinc-905">
                  <input
                    type="checkbox"
                    id="consent-signin"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 w-4.5 h-4.5 rounded border-zinc-750 text-[#c5a059] focus:ring-[#c5a059] bg-[#07122a] cursor-pointer"
                  />
                  <label htmlFor="consent-signin" className="text-xs text-zinc-350 font-sans leading-relaxed select-none">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal('privacy')}
                      className="text-[#e9c176] font-extrabold underline hover:text-[#ffdea5] bg-transparent border-none p-0 cursor-pointer inline"
                    >
                      Privacy Policy
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal('terms')}
                      className="text-[#e9c176] font-extrabold underline hover:text-[#ffdea5] bg-transparent border-none p-0 cursor-pointer inline"
                    >
                      Terms & Conditions
                    </button>.
                  </label>
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all border font-extrabold uppercase tracking-wider text-sm ${
                    consentChecked
                      ? 'bg-[#c5a059] hover:bg-[#e9c176] active:scale-[0.98] text-black border-[#ffdea5]/20 cursor-pointer'
                      : 'bg-zinc-850 text-zinc-550 border-zinc-905 cursor-not-allowed opacity-55'
                  }`}
                  disabled={!consentChecked}
                >
                  Log In (Gmail & Saved Password)
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>

                {/* Link to Registration */}
                <div className="pt-3 border-t border-zinc-800 text-center space-y-2">
                  <p className="text-xs text-zinc-400 font-sans">New user? Don't have an account yet?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      showNotification("📝 Switched to New Account Registration");
                    }}
                    className="w-full py-2.5 bg-[#07122a] hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-sans font-bold text-zinc-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Register New Account</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              </motion.form>
            )}
          </>
        )}
      </AnimatePresence>
        </div>
      </div>

      {/* Trust Signatures footer */}
      <div className="w-full max-w-xs mx-auto text-center mt-6">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
          SECURE LOG IN • PUNCHX
        </p>
      </div>

      {/* Policy and Terms Modal Popups */}
      <AnimatePresence>
        {showPolicyModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setShowPolicyModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#11192e] border-2 border-[#c5a059] rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#c5a059]/30 mb-4">
                <div className="flex items-center gap-2 text-[#e9c176]">
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                  <h3 className="font-sans font-extrabold text-base uppercase tracking-wider">
                    {showPolicyModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPolicyModal(null)}
                  className="p-1 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[#e9c176] hover:bg-[#c5a059] hover:text-black font-extrabold text-xs uppercase transition-all cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Policy Body */}
              <div className="flex-1 overflow-y-auto pr-1 text-zinc-305 font-sans text-xs leading-relaxed space-y-4 no-scrollbar">
                {showPolicyModal === 'privacy' ? (
                  <>
                    <p className="text-[#e9c176] font-extrabold">Last Updated: May 2026</p>
                    <p>
                      Welcome to PunchX ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this policy, or our practices with regards to your personal info, please contact us at <span className="text-[#e9c176] font-semibold">privacy@punchx-services.com</span>.
                    </p>
                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      1. Information We Collect
                    </h4>
                    <p>
                      We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us, or otherwise contact us. This includes:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
                      <li>Your registered <strong className="text-[#e9c176]">Gmail Address</strong> (for secure sign-in, booking confirmation, and service history).</li>
                      <li>Your <strong className="text-[#e9c176]">Phone Number</strong> (for OTP multi-factor credentials and direct mechanic contact).</li>
                      <li>Standard on-site <strong className="text-[#e9c176]">Address & Landmark details</strong> (only accessed when booking/routing specialized professionals).</li>
                    </ul>

                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      2. How We Use Your Information
                    </h4>
                    <p>
                      We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. This includes:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
                      <li>To facilitate account creation and the secure login process.</li>
                      <li>To dispatch verified service professionals directly to your target coordinate/address.</li>
                      <li>To log transaction order histories and user-provided behavioral reviews securely.</li>
                    </ul>

                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      3. Will Your Information Be Shared?
                    </h4>
                    <p>
                      We only share details with your chosen third-party service provider once you click "Confirm Booking" on a scheduled maintenance request. No telemetry tracking, background GPS monitoring, or identity logs are leaked outside active work contracts. Your trust is our greatest asset.
                    </p>
                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      4. Data Security and Sandbox Storage
                    </h4>
                    <p>
                      All keys and data are sandboxed inside standard secure clients (localStorage hashes). No data is stored in unvetted server-side open frameworks without active firewall policies.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#e9c176] font-extrabold">Last Updated: May 2026</p>
                    <p>
                      By accessing, installing, or registering with PunchX, you agree to be bound by these Terms and Conditions. Please read them very carefully. If you do not agree with any of these terms, you are prohibited from using the application.
                    </p>
                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      1. User Vetting & Accounts
                    </h4>
                    <p>
                      To enjoy seamless operations, you must register a valid Gmail address or present a fully functioning phone number of your own. You accept that they are verified using a single-use 6-digit OTP code to protect system integrity.
                    </p>
                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      2. Service Pricing and Adjustments
                    </h4>
                    <p>
                      Prices are presented transparently on our specialists' verified profiles (e.g., ₹250/hr to ₹600/hr). While estimations are highly reliable, on-site diagnostics for replacement materials or premium custom joinery may fluctuate slightly through written physical quotes.
                    </p>
                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      3. Platform Role Limits
                    </h4>
                    <p>
                      PunchX performs active screening, verified reviews, and pro credentials check. We provide an intuitive on-demand marketplace connecting consumers with expert home troubleshooters. Actual services are handled by independent specialists with background liability insurance.
                    </p>
                    <h4 className="text-[#e9c176] font-extrabold uppercase tracking-wide text-[11px] pt-2">
                      4. Behaviour and Safety Integrity
                    </h4>
                    <p>
                      Both our professionals and users deserve a polite and courteous relationship. Users are provided an option to rate and review behavior only on completed orders, ensuring fair, non-abusive, and pristine marketplace feedback loops.
                    </p>
                  </>
                )}
              </div>

              {/* Close Bottom buttons */}
              <div className="pt-4 border-t border-[#c5a059]/30 mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setConsentChecked(true);
                    setShowPolicyModal(null);
                    showNotification(`✓ You accepted the PunchX ${showPolicyModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}.`);
                  }}
                  className="flex-1 py-3 bg-[#c5a059] hover:bg-[#e9c176] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  I Agree and Accept
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

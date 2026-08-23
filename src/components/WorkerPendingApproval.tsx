import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppScreen, WorkerApplication } from '../types';
import { 
  Building2, Clock, CheckCircle2, ShieldAlert, UserCheck, 
  MapPin, Briefcase, Award, Phone, Mail, RefreshCw, ArrowRight, Sparkles, AlertCircle, ShieldCheck
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

interface WorkerPendingApprovalProps {
  onTransition: (target: AppScreen) => void;
  showNotification: (msg: string) => void;
  workerApplication: WorkerApplication | null;
  setWorkerApplicationData: (data: WorkerApplication) => void;
}

export default function WorkerPendingApproval({
  onTransition,
  showNotification,
  workerApplication,
  setWorkerApplicationData
}: WorkerPendingApprovalProps) {
  const [appStatus, setAppStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>(
    workerApplication?.status || 'PENDING'
  );
  const [isChecking, setIsChecking] = useState(false);

  // Real-time Firestore & LocalStorage listener for Admin Dashboard approval
  useEffect(() => {
    let unsubFirestoreDoc: (() => void) | null = null;
    const activeAppId = workerApplication?.id;
    const activePhone = workerApplication?.phone;
    const activeEmail = workerApplication?.email;

    // 1. Subscribe to Firestore workerApplications doc if appId exists
    if (activeAppId) {
      try {
        unsubFirestoreDoc = onSnapshot(doc(db, 'workerApplications', activeAppId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as WorkerApplication;
            if (data.status && data.status !== appStatus) {
              setAppStatus(data.status);
              setWorkerApplicationData(data);
              if (data.status === 'APPROVED') {
                showNotification('🎉 CONGRATULATIONS! Your application has been ACCEPTED & APPROVED by Company Dashboard Admin!');
              }
            }
          }
        }, (err) => {
          console.warn("Firestore worker doc listener warning:", err);
        });
      } catch (e) {
        console.warn("Firestore onSnapshot setup warning:", e);
      }
    }

    // 2. Poll & event listener for localStorage sync (shared across tabs / Admin Dashboard)
    const checkApprovalStatus = () => {
      try {
        const apps = JSON.parse(localStorage.getItem('punchx_worker_applications') || '[]');
        const found = apps.find((a: WorkerApplication) => 
          (activeAppId && a.id === activeAppId) || 
          (activePhone && a.phone === activePhone) ||
          (activeEmail && a.email === activeEmail)
        );
        if (found && found.status !== appStatus) {
          setAppStatus(found.status);
          setWorkerApplicationData(found);
          if (found.status === 'APPROVED') {
            showNotification('🎉 Application APPROVED by Company Dashboard Admin! Terminal access unlocked.');
          }
        }
      } catch (e) {
        console.warn("LocalStorage check warning:", e);
      }
    };

    const interval = setInterval(checkApprovalStatus, 1500);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'punchx_worker_applications' || e.key === 'punchx_worker_approved') {
        checkApprovalStatus();
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('punchx_worker_approved' as any, checkApprovalStatus);

    return () => {
      if (unsubFirestoreDoc) unsubFirestoreDoc();
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('punchx_worker_approved' as any, checkApprovalStatus);
    };
  }, [workerApplication, appStatus, setWorkerApplicationData, showNotification]);

  // Manual Refresh Check Button
  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      // Check Firestore
      if (workerApplication?.id) {
        const docRef = doc(db, 'workerApplications', workerApplication.id);
        const docSnap = await (await import('firebase/firestore')).getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as WorkerApplication;
          if (data.status) {
            setAppStatus(data.status);
            setWorkerApplicationData(data);
            if (data.status === 'APPROVED') {
              showNotification('🎉 Application status verified: APPROVED by Company Admin!');
              setIsChecking(false);
              return;
            }
          }
        }
      }

      // Check LocalStorage
      const apps = JSON.parse(localStorage.getItem('punchx_worker_applications') || '[]');
      const found = apps.find((a: WorkerApplication) => a.id === workerApplication?.id || a.phone === workerApplication?.phone);
      if (found) {
        setAppStatus(found.status);
        setWorkerApplicationData(found);
        if (found.status === 'APPROVED') {
          showNotification('🎉 Application APPROVED by Company Admin!');
        } else {
          showNotification('⏳ Status is still PENDING review on the Admin Dashboard.');
        }
      } else {
        showNotification('⏳ Request is queued in Admin Dashboard for authorization review.');
      }
    } catch (err) {
      console.warn("Manual check error:", err);
      showNotification('⏳ Verification checked. Waiting for Admin Dashboard review.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleEnterWorkerTerminal = () => {
    if (appStatus !== 'APPROVED') {
      showNotification('⚠️ Access Restricted: Application is pending approval on the Company Admin Dashboard.');
      return;
    }

    // Reset old demo orders to provide a fresh, clean dashboard with real live orders
    try {
      localStorage.setItem('punchx_worker_online_status', 'true');
    } catch (e) {
      console.warn(e);
    }

    showNotification('🚀 Launching fresh Worker Operations Terminal...');
    onTransition('worker-dashboard');
  };

  return (
    <div id="worker-pending-screen" className="min-h-screen bg-[#07122a] text-[#e1e3e4] font-sans py-10 px-4 sm:px-6 relative flex flex-col justify-center">
      
      <div className="max-w-2xl mx-auto w-full bg-[#11192e] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        
        {/* Header Icon Status */}
        <div className="text-center space-y-3 border-b border-zinc-800 pb-5">
          <div className="relative inline-block">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-xl border ${
              appStatus === 'APPROVED' 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-amber-500/10 border-[#c5a059] text-[#e9c176]'
            }`}>
              {appStatus === 'APPROVED' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <Clock className="w-8 h-8 text-[#e9c176] animate-pulse" />
              )}
            </div>
            {appStatus === 'PENDING' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping"></span>
            )}
          </div>

          <div>
            <span className={`text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full border ${
              appStatus === 'APPROVED' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              {appStatus === 'APPROVED' ? 'STATUS: AUTHORIZED & APPROVED' : 'STATUS: PENDING ADMIN DASHBOARD REVIEW'}
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-2">
              {appStatus === 'APPROVED' 
                ? 'WORKER AUTHORIZATION GRANTED' 
                : 'REQUEST SENT TO ADMIN DASHBOARD'}
            </h1>
            <p className="text-xs text-zinc-300 max-w-md mx-auto mt-1 leading-relaxed">
              {appStatus === 'APPROVED'
                ? 'Your credentials and technical profile have been approved by the Admin Dashboard. You may now launch your fresh Worker Operations Terminal.'
                : 'Your profile details and service hub location have been submitted to the Admin Dashboard. Once the admin accepts your request, your dashboard access will be unlocked.'}
            </p>
          </div>
        </div>

        {/* Submitted Details Card */}
        <div className="bg-[#07122a] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-mono text-[#e9c176] font-bold uppercase">SUBMITTED APPLICATION DOSSIER</span>
            <span className="text-[10px] font-mono text-zinc-500">{workerApplication?.id || 'APP-PENDING'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Legal Name</span>
              <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-[#c5a059]" /> {workerApplication?.legalName || 'Specialist Technician'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Specialist Skill</span>
              <span className="font-bold text-[#e9c176] flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-[#c5a059]" /> {workerApplication?.skill || 'Certified Field Technician'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Service Hub Location</span>
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#c5a059]" /> {workerApplication?.sector || 'Active Service Hub'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Registered Contacts</span>
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 mt-0.5 truncate">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {workerApplication?.phone || '+91 Contact Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Notice */}
        {appStatus === 'PENDING' ? (
          <div className="bg-[#0d1629] border border-[#c5a059]/40 rounded-2xl p-4 space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-[#e9c176]">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-bold font-mono uppercase">Live Admin Review in Progress</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              When the company administrator accepts your request in the <span className="text-[#e9c176] font-bold">Admin Dashboard</span>, this screen will automatically activate your terminal.
            </p>

            <button
              id="check-approval-status-btn"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="px-4 py-2 bg-[#15203b] hover:bg-[#c5a059] text-[#e9c176] hover:text-black border border-[#c5a059]/50 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking Admin Status...' : 'Check Live Admin Status'}</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold font-mono uppercase">AUTHORIZATION ACCEPTED BY ADMIN</span>
            </div>
            <p className="text-xs text-emerald-200">Your profile is authorized to receive live customer requests in your sector.</p>
          </div>
        )}

        {/* Enter Worker Terminal Action */}
        <button
          id="enter-worker-terminal-btn"
          onClick={handleEnterWorkerTerminal}
          disabled={appStatus !== 'APPROVED'}
          className={`w-full py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest font-mono transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
            appStatus === 'APPROVED'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black border border-emerald-300 hover:brightness-110 active:scale-[0.98]'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
          }`}
        >
          <span>{appStatus === 'APPROVED' ? 'Enter Fresh Worker Dashboard' : 'Waiting for Admin Approval...'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}

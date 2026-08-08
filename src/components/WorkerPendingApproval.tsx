import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppScreen, WorkerApplication } from '../types';
import { 
  Building2, Clock, CheckCircle2, ShieldAlert, UserCheck, 
  MapPin, Briefcase, Award, Phone, Mail, RefreshCw, ArrowRight, Sparkles, AlertCircle
} from 'lucide-react';

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

  // Poll localStorage for status changes from Admin Dashboard
  useEffect(() => {
    const checkApprovalStatus = () => {
      const apps = JSON.parse(localStorage.getItem('punchx_worker_applications') || '[]');
      const found = apps.find((a: WorkerApplication) => a.id === workerApplication?.id || a.phone === workerApplication?.phone);
      if (found && found.status !== appStatus) {
        setAppStatus(found.status);
        if (found.status === 'APPROVED') {
          showNotification('🎉 CONGRATULATIONS! Your application has been APPROVED by Company Dashboard Admin!');
        }
      }
    };

    const interval = setInterval(checkApprovalStatus, 2000);
    return () => clearInterval(interval);
  }, [workerApplication, appStatus, showNotification]);

  const handleSimulateAdminApproval = () => {
    setAppStatus('APPROVED');
    
    if (workerApplication) {
      const updated = { ...workerApplication, status: 'APPROVED' as const };
      setWorkerApplicationData(updated);

      const apps = JSON.parse(localStorage.getItem('punchx_worker_applications') || '[]');
      const filtered = apps.filter((a: WorkerApplication) => a.id !== updated.id);
      localStorage.setItem('punchx_worker_applications', JSON.stringify([updated, ...filtered]));
    }

    showNotification('⚡ Instant Admin Approval Triggered! You are now authorized on PunchX Authority Panel.');
  };

  const handleEnterWorkerTerminal = () => {
    if (appStatus !== 'APPROVED') {
      showNotification('⚠️ Access Restricted: Application is pending Company Dashboard approval.');
      return;
    }

    showNotification('🚀 Opening Worker Operations Terminal...');
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
                : 'APPLICATION SENT TO COMPANY DASHBOARD'}
            </h1>
            <p className="text-xs text-zinc-300 max-w-md mx-auto mt-1 leading-relaxed">
              {appStatus === 'APPROVED'
                ? 'Your credentials and technical profile have been verified by Company Dashboard Admins. You may now launch your Worker Operations Terminal.'
                : 'Your profile details and dual OTP security credentials have been transferred to the PUNCHX Company Dashboard. Please wait for admin verification.'}
            </p>
          </div>
        </div>

        {/* Submitted Details Card */}
        <div className="bg-[#07122a] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-mono text-[#e9c176] font-bold uppercase">APPLICATION DOSSIER</span>
            <span className="text-[10px] font-mono text-zinc-500">{workerApplication?.id || 'APP-884912'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Legal Name</span>
              <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-[#c5a059]" /> {workerApplication?.legalName || 'Rajesh Kumar'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Specialist Skill</span>
              <span className="font-bold text-[#e9c176] flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-[#c5a059]" /> {workerApplication?.skill || 'AC Repair & Thermal'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Experience</span>
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 mt-0.5">
                <Award className="w-3.5 h-3.5 text-[#c5a059]" /> {workerApplication?.experienceYears || '3-5 Years'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 block">Verified Contacts</span>
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 mt-0.5 truncate">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {workerApplication?.phone || '+91 98765 43210'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Dashboard Integration & Approval Trigger */}
        {appStatus === 'PENDING' ? (
          <div className="bg-[#0d1629] border border-[#c5a059]/40 rounded-2xl p-4 space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-[#e9c176]">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-bold font-mono uppercase">Company Dashboard Admin Actions</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Admins can accept this application directly in the <span className="text-[#e9c176] font-bold">PUNCHX Company Dashboard</span> under Technicians Network.
            </p>

            <button
              onClick={handleSimulateAdminApproval}
              className="px-4 py-2 bg-[#15203b] hover:bg-[#c5a059] text-[#e9c176] hover:text-black border border-[#c5a059]/50 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Instant Admin Approval</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs font-bold text-emerald-400 font-mono">✓ VETTING COMPLETE</span>
            <p className="text-xs text-emerald-200">Your profile is active in the Company Dashboard tech network.</p>
          </div>
        )}

        {/* Enter Worker Terminal Action */}
        <button
          onClick={handleEnterWorkerTerminal}
          disabled={appStatus !== 'APPROVED'}
          className={`w-full py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest font-mono transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
            appStatus === 'APPROVED'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black border border-emerald-300 hover:brightness-110 active:scale-[0.98]'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
          }`}
        >
          <span>{appStatus === 'APPROVED' ? 'Enter Worker Operations Terminal' : 'Waiting for Admin Approval...'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}

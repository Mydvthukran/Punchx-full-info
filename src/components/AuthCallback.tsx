import React, { useState, useEffect, useRef } from 'react';
import { completeHostedAuthRedirect, useNamoID } from '@namoidhq/react';
import { useAuth } from '../lib/authContext';
import { AppScreen } from '../types';

export default function AuthCallback({ onTransition }: { onTransition: (target: AppScreen) => void }) {
  const client = useNamoID();
  const { loginWithNamoID } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    async function processCallback() {
      try {
        const result = await completeHostedAuthRedirect(client);
        const rawRole = localStorage.getItem('punchx_auth_role') || 'customer';

        let profile;
        if (result.tokens?.id_token) {
          profile = await loginWithNamoID(result.identity, 'citizen', result.tokens.id_token);
        } else {
          profile = await loginWithNamoID(result.identity, 'citizen');
        }
        window.history.replaceState({}, document.title, '/');

        if (rawRole === 'admin') {
          if (profile?.role === 'admin') {
            onTransition('admin-dashboard');
          } else {
            onTransition('home');
          }
        } else if (rawRole === 'worker') {
          // Check worker status: verify whether this account is an approved specialist
          let workerStatus: string = profile?.status || 'NOT_REGISTERED';
          let hasWorkerApp = false;

          try {
            const backendBase = import.meta.env.VITE_BACKEND_URL || '';
            const headers: Record<string, string> = {};
            if (result.tokens?.id_token) headers['Authorization'] = `Bearer ${result.tokens.id_token}`;
            const statusRes = await fetch(`${backendBase}/api/workers/status`, { headers });
            if (statusRes.ok) {
              const data = await statusRes.json();
              if (data.registered) {
                hasWorkerApp = true;
                workerStatus = data.status;
              }
            }
          } catch (statusErr) {
            console.warn('Worker status backend check notice:', statusErr);
          }

          if (profile?.role === 'worker' || hasWorkerApp || workerStatus === 'APPROVED' || workerStatus === 'PENDING') {
            localStorage.setItem('punchx_auth_role', 'worker');
            localStorage.setItem('punchx_worker_approved', 'true');
            localStorage.setItem('punchx_worker_online_status', 'true');
            onTransition('worker-dashboard');
          } else if (workerStatus === 'REJECTED') {
            localStorage.setItem('punchx_auth_role', 'customer');
            onTransition('panel-select');
          } else {
            localStorage.setItem('punchx_auth_role', 'worker');
            onTransition('worker-signup');
          }
        } else {
          onTransition('home');
        }
      } catch (e: any) {
        console.error("❌ [AuthCallback] Auth callback error:", e);
        const storedIdentity = localStorage.getItem('punchx_namoid_identity');
        if (storedIdentity) {
          const rawRole = localStorage.getItem('punchx_auth_role') || 'customer';
          window.history.replaceState({}, document.title, '/');
          if (rawRole === 'admin') onTransition('admin-dashboard');
          else if (rawRole === 'worker') onTransition('worker-signup');
          else onTransition('home');
          return;
        }
        setErrorMessage(e?.message || "Authentication callback could not be completed.");
      }
    }
    processCallback();
  }, [client, loginWithNamoID, onTransition]);

  if (errorMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <div className="max-w-md bg-[#11192e] border border-red-500/30 p-6 rounded-2xl shadow-xl">
          <p className="text-red-400 font-bold text-base mb-2">Sign In Notice</p>
          <p className="text-zinc-400 text-xs mb-4 leading-relaxed">{errorMessage}</p>
          <button
            onClick={() => onTransition('auth')}
            className="px-4 py-2 bg-[#c5a059] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#d8b46e] transition-all cursor-pointer"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="w-12 h-12 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin shadow-[0_0_15px_rgba(197,160,89,0.5)] mb-4"></div>
      <p className="text-sm font-bold text-white uppercase tracking-wider">Completing NamoID Authorization...</p>
      <p className="text-xs text-zinc-400 mt-1">Verifying security token & initializing profile</p>
    </div>
  );
}

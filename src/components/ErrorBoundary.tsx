import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import PUNCHX_LOGO from '../assets/logo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PunchX Runtime Error Boundary caught:', error, errorInfo);
    this.setState({ errorInfo });

    // A very common production-only failure after a Vite deployment is a
    // stale browser tab trying to load a chunk that no longer exists.
    // Recover once automatically instead of trapping the customer on the
    // diagnostic screen forever.
    const message = String(error?.message || '').toLowerCase();
    const isStaleChunk =
      message.includes('failed to fetch dynamically imported module') ||
      message.includes('importing a module script failed') ||
      message.includes('loading chunk');

    if (isStaleChunk) {
      try {
        const key = 'punchx-vite-recovery-attempt';
        if (sessionStorage.getItem(key) !== '1') {
          sessionStorage.setItem(key, '1');
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    try {
      sessionStorage.removeItem('punchx-vite-recovery-attempt');
    } catch {
      // Ignore storage restrictions.
    }
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      // Clear only PunchX application state. Do not erase unrelated website
      // storage or credentials belonging to other applications.
      Object.keys(localStorage)
        .filter((key) => key.startsWith('punchx_'))
        .forEach((key) => localStorage.removeItem(key));
      sessionStorage.removeItem('punchx-vite-recovery-attempt');
    } catch (e) {
      console.warn('PunchX storage reset notice:', e);
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="punchx-error-fallback"
          className="min-h-screen w-full bg-[#07122a] text-white flex flex-col items-center justify-center p-6 select-none font-sans"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-md w-full bg-[#0a152e] border border-[#c5a059]/30 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white rounded-full p-2 mb-4 border border-[#c5a059]/50 shadow-lg flex items-center justify-center overflow-hidden">
              <img src={PUNCHX_LOGO} alt="PunchX Logo" className="w-full h-full object-contain" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>RECOVERY MODE</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              PunchX needs to refresh
            </h2>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              A temporary browser or deployment issue prevented the app from loading. Your PunchX account is not deleted.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                id="btn-error-reload"
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#c5a059] to-[#e9c176] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload PunchX</span>
              </button>

              <button
                id="btn-error-reset"
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full py-3 px-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset PunchX Session</span>
              </button>
            </div>

            <div className="mt-6 text-[10px] font-mono text-zinc-500">
              PunchX • Recovery
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

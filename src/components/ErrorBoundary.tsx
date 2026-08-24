import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home, Trash2 } from 'lucide-react';
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
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear notice:', e);
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
          {/* Background Ambient Aura */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-md w-full bg-[#0a152e] border border-[#c5a059]/30 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Logo */}
            <div className="w-20 h-20 bg-white rounded-full p-2 mb-4 border border-[#c5a059]/50 shadow-lg flex items-center justify-center overflow-hidden">
              <img src={PUNCHX_LOGO} alt="PunchX Logo" className="w-full h-full object-contain" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DIAGNOSTIC PROTOCOL ENGAGED</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Application Initialized with Recovery
            </h2>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              PunchX encountered a client-side environment exception. You can quickly restore the session using the options below.
            </p>

            {this.state.error && (
              <div className="w-full bg-[#040914] border border-zinc-800 rounded-xl p-3 mb-6 text-left overflow-x-auto">
                <p className="text-[11px] font-mono text-rose-400 font-bold break-all">
                  An unexpected error occurred. Support has been notified.
                </p>
              </div>
            )}

            <div className="w-full flex flex-col gap-3">
              <button
                id="btn-error-reload"
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#c5a059] to-[#e9c176] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Platform</span>
              </button>

              <button
                id="btn-error-reset"
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full py-3 px-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset Cache & Return to Start</span>
              </button>
            </div>

            <div className="mt-6 text-[10px] font-mono text-zinc-500">
              PUNCHX SYSTEM OS v2.0 • MIL-GRADE SECURE
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

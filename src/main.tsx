import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import './punchx-marketplace.css';
import './punchx-blue-theme.css';
import './punchx-motion-fixes.css';

// Production-safe recovery for Vite deployment/version skew.
if (typeof window !== 'undefined') {
  const BUILD_MARKER = '2026-10-01-blue-theme-v2';
  const recoveryKey = `punchx-vite-recovery:${BUILD_MARKER}`;
  const recoverFromStaleDeployment = () => {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith('punchx-vite-recovery:') && key !== recoveryKey)
        .forEach((key) => sessionStorage.removeItem(key));
      if (sessionStorage.getItem(recoveryKey) === '1') return;
      sessionStorage.setItem(recoveryKey, '1');
      const url = new URL(window.location.href);
      url.searchParams.set('__punchx_refresh', `${BUILD_MARKER}-${Date.now()}`);
      window.location.replace(url.toString());
    } catch { window.location.reload(); }
  };
  window.addEventListener('vite:preloadError', (event) => { event.preventDefault(); recoverFromStaleDeployment(); });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '').toLowerCase();
    if (msg.includes('failed to fetch dynamically imported module') || msg.includes('importing a module script failed') || msg.includes('loading chunk') || msg.includes('chunkloaderror')) {
      event.preventDefault();
      recoverFromStaleDeployment();
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('PunchX root element was not found. Check index.html.');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

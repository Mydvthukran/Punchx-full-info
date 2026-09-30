import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Recover automatically when a deployment replaces an old Vite chunk while a
// user's browser still has the previous HTML/JS manifest cached.
if (typeof window !== 'undefined') {
  const reloadKey = 'punchx-vite-recovery-attempt';

  const reloadOnce = () => {
    try {
      if (sessionStorage.getItem(reloadKey) === '1') return;
      sessionStorage.setItem(reloadKey, '1');
    } catch {
      // Continue with a normal reload if sessionStorage is unavailable.
    }
    window.location.reload();
  };

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnce();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '').toLowerCase();

    // Vite dynamic-import failures commonly happen after a new deployment.
    if (
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('importing a module script failed') ||
      msg.includes('loading chunk')
    ) {
      event.preventDefault();
      reloadOnce();
      return;
    }

    // Ignore transient Vite dev-server websocket errors; they are not app crashes.
    if (msg.includes('websocket') || msg.includes('vite') || msg.includes('ws')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

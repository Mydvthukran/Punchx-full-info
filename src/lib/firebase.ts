import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, getFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal transient connection warnings and log only errors
setLogLevel('error');

const app = initializeApp(firebaseConfig);

let firestoreInstance;
try {
  const dbSettings = {
    localCache: memoryLocalCache(),
    // Force HTTP long-polling to prevent WebSocket connection failures in sandboxed iframes & proxies
    experimentalForceLongPolling: true,
  };
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? initializeFirestore(app, dbSettings, firebaseConfig.firestoreDatabaseId)
    : initializeFirestore(app, dbSettings);
} catch (e) {
  console.warn("Firestore initializeFirestore fallback to getFirestore:", e);
  firestoreInstance = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

// Global window safety handler for transient network/offline Firestore events
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('closing') ||
      reason.includes('hidden') ||
      reason.includes('IndexedDb') ||
      reason.includes('database is closing') ||
      reason.includes('Database is closing/hidden') ||
      reason.includes('unavailable') ||
      reason.includes('Could not reach Cloud Firestore backend') ||
      reason.includes('offline mode')
    ) {
      event.preventDefault();
      console.warn('Handled transient database/network lifecycle event:', reason);
    }
  });
}

export const db = firestoreInstance;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Firestore Notice [${operationType} on ${path || 'unknown'}]:`, message);
  if (
    message.includes('closing') ||
    message.includes('IndexedDb') ||
    message.includes('hidden') ||
    message.includes('database is closing') ||
    message.includes('unavailable') ||
    message.includes('offline')
  ) {
    console.warn("Firestore connection transient notice: continuing with local cache");
    return;
  }
  throw new Error(`Database operation failed (${operationType}). Please try again.`);
}





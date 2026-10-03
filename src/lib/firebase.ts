import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  memoryLocalCache,
  setLogLevel,
} from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

/**
 * Firebase client configuration.
 *
 * The Firebase web config is public by design. Vercel environment variables,
 * when supplied, override only non-empty values from the checked-in config.
 */
const raw: any = rawConfig || {};

const env = (key: string): string => {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
};

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY') || raw.apiKey || '',
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN') || raw.authDomain || '',
  projectId: env('VITE_FIREBASE_PROJECT_ID') || raw.projectId || '',
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET') || raw.storageBucket || '',
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID') || raw.messagingSenderId || '',
  appId: env('VITE_FIREBASE_APP_ID') || raw.appId || '',
  measurementId: env('VITE_FIREBASE_MEASUREMENT_ID') || raw.measurementId || '',
};

const configuredDatabaseId =
  env('VITE_FIREBASE_DATABASE_ID') ||
  raw.firestoreDatabaseId ||
  '';

const missingConfig = ['apiKey', 'authDomain', 'projectId', 'appId'].filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
);

if (missingConfig.length) {
  console.warn(`Firebase client configuration is incomplete: ${missingConfig.join(', ')}`);
}

try {
  setLogLevel('error');
} catch {
  // Ignore logging configuration failures in restricted environments.
}

let app: FirebaseApp;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase app initialization failed:', error);
  throw new Error('PunchX Firebase configuration is invalid. Check the Vercel Firebase environment variables.');
}

let firestoreInstance: Firestore;

try {
  // Prefer PunchX's configured named Firestore database. memoryLocalCache avoids
  // IndexedDB lifecycle failures on mobile/private browsers.
  firestoreInstance = configuredDatabaseId
    ? initializeFirestore(app, { localCache: memoryLocalCache() }, configuredDatabaseId)
    : initializeFirestore(app, { localCache: memoryLocalCache() });
} catch (namedDatabaseError) {
  console.warn(
    'PunchX named Firestore initialization failed; falling back to the default database:',
    namedDatabaseError,
  );

  try {
    // If a named database is unavailable/misconfigured, the public application
    // should still boot against the project's default Firestore database.
    firestoreInstance = getFirestore(app);
  } catch (defaultDatabaseError) {
    console.error('Firebase Firestore initialization failed:', defaultDatabaseError);
    throw new Error('PunchX could not initialize Firestore. Check the Firebase project/database configuration.');
  }
}

let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (error) {
  console.error('Firebase Auth initialization failed:', error);
  throw new Error('PunchX could not initialize Firebase Authentication. Check the Firebase Auth configuration.');
}

// Transient browser/network Firestore errors must not become uncaught React
// errors. Actual operation failures are handled at the call sites.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    const normalized = reason.toLowerCase();

    if (
      normalized.includes('database is closing') ||
      normalized.includes('indexeddb') ||
      normalized.includes('offline') ||
      normalized.includes('could not reach cloud firestore backend') ||
      normalized.includes('unavailable')
    ) {
      event.preventDefault();
      console.warn('Handled transient Firestore/network event:', reason);
    }
  });
}

export const db = firestoreInstance;
export const auth = authInstance;

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
  const normalized = message.toLowerCase();

  console.warn(`Firestore Notice [${operationType} on ${path || 'unknown'}]:`, message);

  if (
    normalized.includes('closing') ||
    normalized.includes('indexeddb') ||
    normalized.includes('hidden') ||
    normalized.includes('unavailable') ||
    normalized.includes('offline')
  ) {
    console.warn('Firestore transient connection notice; continuing with application state.');
    return;
  }

  throw new Error(`Database operation failed (${operationType}). Please try again.`);
}

interface AuthSession {
  recaptchaVerifier: unknown;
  confirmationResult: any;
}

export const authSession: AuthSession = {
  recaptchaVerifier: null,
  confirmationResult: null,
};

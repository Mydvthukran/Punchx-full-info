import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, getFirestore, setLogLevel, Firestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

try {
  setLogLevel('error');
} catch {
  // Ignore logging configuration failures in restricted environments.
}

const fallbackConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
  oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || ""
};

const envConfig: Record<string, string> = {};
if (import.meta.env.VITE_FIREBASE_API_KEY) envConfig.apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) envConfig.authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
if (import.meta.env.VITE_FIREBASE_PROJECT_ID) envConfig.projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
if (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) envConfig.storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
if (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) envConfig.messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
if (import.meta.env.VITE_FIREBASE_APP_ID) envConfig.appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Use the Firebase configuration generated for the project as the source of truth.
// In particular, do not replace authDomain with the PunchX website domain: Firebase
// Auth expects the registered Firebase auth domain unless a custom auth domain has
// explicitly been configured in the Firebase Console.
const firebaseConfig = {
  ...fallbackConfig,
  ...(rawConfig || {}),
  ...envConfig,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    rawConfig?.authDomain ||
    fallbackConfig.authDomain,
};

let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (initErr) {
  console.warn("Firebase initialization notice, retrying with environment fallback:", initErr);
  try {
    app = initializeApp(fallbackConfig);
  } catch (err2) {
    app = getApps()[0] || ({} as FirebaseApp);
  }
}

let firestoreInstance: Firestore;
try {
  const dbSettings = {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true,
  };
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? initializeFirestore(app, dbSettings, firebaseConfig.firestoreDatabaseId)
    : initializeFirestore(app, dbSettings);
} catch (e) {
  console.warn("Firestore initializeFirestore fallback to getFirestore:", e);
  try {
    firestoreInstance = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  } catch (err3) {
    console.warn("Firestore fallback initialization notice:", err3);
    firestoreInstance = getFirestore(app);
  }
}

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

let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (authErr) {
  console.warn("Auth initialization notice:", authErr);
  authInstance = {} as Auth;
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

interface AuthSession {
  recaptchaVerifier: unknown;
  confirmationResult: any;
}

export const authSession: AuthSession = {
  recaptchaVerifier: null,
  confirmationResult: null
};

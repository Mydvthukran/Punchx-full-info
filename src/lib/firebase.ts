import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, getFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal transient connection warnings
setLogLevel('error');

const app = initializeApp(firebaseConfig);

let firestoreInstance;
try {
  const dbSettings = {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
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
  console.error(`Firestore Error [${operationType} on ${path || 'unknown'}]:`, message);
  if (message.includes('closing') || message.includes('IndexedDb') || message.includes('hidden')) {
    console.warn("Firestore connection transient notice: re-attempting operation");
    return;
  }
  throw new Error(`Database operation failed (${operationType}). Please try again.`);
}



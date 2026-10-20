import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import type { VercelRequest } from '@vercel/node';

export function ensureFirebaseAdmin() {
  if (getApps().length > 0) return;

  // Firebase custom tokens are only accepted by the same Firebase project as
  // the web SDK. Catch mismatched service-account credentials explicitly.
  const expectedProjectId = process.env.VITE_FIREBASE_PROJECT_ID?.trim()
    || 'gen-lang-client-0120647960';

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (encoded) {
    let serviceAccount: Record<string, unknown>;
    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    } catch {
      // Also accept a raw JSON service-account value for easier Vercel setup.
      serviceAccount = JSON.parse(encoded);
    }
    const serviceProjectId = String(serviceAccount.project_id || serviceAccount.projectId || '').trim();
    if (!serviceProjectId) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT JSON is missing project_id.');
    }
    if (serviceProjectId !== expectedProjectId) {
      throw new Error(`Firebase Admin project mismatch: service account is for "${serviceProjectId}", but PunchX web auth uses "${expectedProjectId}". Use a service account from the same Firebase project.`);
    }
    initializeApp({ credential: cert(serviceAccount as any), projectId: serviceProjectId });
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || process.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  if (projectId && clientEmail && privateKey) {
    if (projectId !== expectedProjectId) {
      throw new Error(`Firebase Admin project mismatch: credentials are for "${projectId}", but PunchX web auth uses "${expectedProjectId}". Use credentials from the same Firebase project.`);
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
    return;
  }

  throw new Error(
    'Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT (base64-encoded service-account JSON) or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in Vercel.',
  );
}

export function getPunchxFirestore(): Firestore {
  ensureFirebaseAdmin();
  const databaseId = process.env.FIREBASE_DATABASE_ID
    || process.env.VITE_FIREBASE_DATABASE_ID
    || 'ai-studio-punchxservicecus-c71be4cc-9ee1-4ae7-b718-125aa03bcd38';
  return getFirestore(undefined, databaseId);
}

export async function requireFirebaseUid(req: VercelRequest): Promise<string> {
  const authorization = String(req.headers.authorization || '');
  if (!authorization.startsWith('Bearer ')) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  const token = authorization.slice(7).trim();
  if (!token) throw Object.assign(new Error('Authentication required'), { status: 401 });
  ensureFirebaseAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  return decoded.uid;
}

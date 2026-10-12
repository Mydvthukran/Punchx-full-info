import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { getPunchxFirestore } from '../_lib/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { idToken, identity } = req.body || {};
    if (typeof idToken !== 'string' || !idToken.trim()) {
      return res.status(400).json({ success: false, error: 'NamoID ID token is missing. Please sign in again.' });
    }
    if (!identity || typeof identity !== 'object') {
      return res.status(400).json({ success: false, error: 'NamoID user identity is missing.' });
    }

    // Use a stable provider subject where available; email fallback avoids
    // creating a different Firebase UID on every sign-in.
    const email = typeof identity.email === 'string' ? identity.email.trim().toLowerCase() : '';
    const subject = typeof identity.sub === 'string' ? identity.sub.trim()
      : typeof identity.id === 'string' ? identity.id.trim()
      : typeof identity.user_id === 'string' ? identity.user_id.trim() : '';
    const uid = subject || (email
      ? `namoid_${crypto.createHash('sha256').update(email).digest('hex').slice(0, 20)}`
      : '');

    if (!uid) {
      return res.status(400).json({ success: false, error: 'NamoID identity needs a stable subject or email address.' });
    }
    if (uid.length > 128) {
      return res.status(400).json({ success: false, error: 'NamoID identity identifier is too long.' });
    }

    const firestore = getPunchxFirestore();
    const userRef = firestore.collection('users').doc(uid);
    const existing = await userRef.get();
    let role = existing.data()?.role === 'admin' ? 'admin'
      : existing.data()?.role === 'worker' && existing.data()?.status === 'APPROVED' ? 'worker'
      : 'citizen';

    if (!existing.exists) {
      let workerApps = await firestore.collection('workerApplications').where('uid', '==', uid).limit(1).get();
      if (workerApps.empty && email) {
        workerApps = await firestore.collection('workerApplications').where('email', '==', email).limit(1).get();
      }
      if (!workerApps.empty && workerApps.docs[0].data().status === 'APPROVED') role = 'worker';
    }

    const customToken = await getAuth().createCustomToken(uid, {
      email,
      name: typeof identity.name === 'string' ? identity.name.slice(0, 160) : '',
      role,
    });
    return res.status(200).json({ success: true, customToken, uid, role });
  } catch (error: any) {
    console.error('NamoID Firebase token exchange failed:', error);
    const status = Number(error?.status || 500);
    return res.status(status >= 400 && status < 500 ? status : 503).json({
      success: false,
      error: status >= 400 && status < 500
        ? String(error?.message || 'Unable to exchange NamoID credentials')
        : 'Firebase authentication service is not configured or temporarily unavailable. Check the server Firebase Admin credentials in Vercel.',
    });
  }
}

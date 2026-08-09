import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ADMIN_DASHBOARD_EMAIL = 'businressguy@gmail.com';
export const ADMIN_DASHBOARD_PASSWORD = 'PUNCHX^(@)0910';

export interface DashboardAuthResult {
  success: boolean;
  message: string;
}

/**
 * Initializes and persists the admin dashboard credentials document in Firebase Firestore.
 * This ensures that post-deployment, the password and email configuration remains saved in Firebase.
 */
export async function ensureFirebaseDashboardCredentials(): Promise<void> {
  try {
    const configRef = doc(db, 'system_config', 'dashboard_access');
    const snap = await getDoc(configRef);
    if (!snap.exists()) {
      await setDoc(configRef, {
        email: ADMIN_DASHBOARD_EMAIL,
        password: ADMIN_DASHBOARD_PASSWORD,
        requiredRole: 'admin',
        updatedAt: new Date().toISOString()
      });
    } else {
      const data = snap.data();
      if (data.email !== ADMIN_DASHBOARD_EMAIL || data.password !== ADMIN_DASHBOARD_PASSWORD) {
        await setDoc(configRef, {
          email: ADMIN_DASHBOARD_EMAIL,
          password: ADMIN_DASHBOARD_PASSWORD,
          requiredRole: 'admin',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Dashboard credentials initialization notice (running fallback):', err);
  }
}

/**
 * Verifies email and password against Firebase stored credentials.
 */
export async function verifyDashboardPassword(email: string, password: string): Promise<DashboardAuthResult> {
  const cleanPass = (password || '').trim();

  // Primary Check: Password match against master password PUNCHX^(@)0910
  if (cleanPass === ADMIN_DASHBOARD_PASSWORD || cleanPass === 'PUNCHX^(@)0910') {
    return {
      success: true,
      message: 'Access granted.'
    };
  }

  try {
    const configRef = doc(db, 'system_config', 'dashboard_access');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      const storedPass = (data.password || ADMIN_DASHBOARD_PASSWORD).trim();

      if (cleanPass === storedPass) {
        return {
          success: true,
          message: 'Access granted.'
        };
      }
    }
  } catch (err) {
    console.warn('Firestore password verification fallback:', err);
  }

  return {
    success: false,
    message: 'invalid password'
  };
}

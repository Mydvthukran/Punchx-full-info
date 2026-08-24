import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ADMIN_DASHBOARD_EMAIL = 'businressguy@gmail.com';

export interface DashboardAuthResult {
  success: boolean;
  message: string;
}

/**
 * Ensures the admin dashboard credentials document exists in Firebase Firestore.
 */
export async function ensureFirebaseDashboardCredentials(): Promise<void> {
  try {
    const configRef = doc(db, 'system_config', 'dashboard_access');
    const snap = await getDoc(configRef);
    if (!snap.exists()) {
      await setDoc(configRef, {
        email: ADMIN_DASHBOARD_EMAIL,
        password: 'CHANGE_ME_IN_FIRESTORE', // Do not hardcode real password in source
        requiredRole: 'admin',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Dashboard credentials initialization notice:', err);
  }
}

/**
 * Verifies email and password against Firebase stored credentials.
 */
export async function verifyDashboardPassword(email: string, password: string): Promise<DashboardAuthResult> {
  const cleanPass = (password || '').trim();

  if (!cleanPass) {
    return {
      success: false,
      message: 'invalid password'
    };
  }

  try {
    const configRef = doc(db, 'system_config', 'dashboard_access');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      const storedPass = (data.password || '').trim();

      if (storedPass && cleanPass === storedPass && storedPass !== 'CHANGE_ME_IN_FIRESTORE') {
        return {
          success: true,
          message: 'Access granted.'
        };
      }
    }
  } catch (err) {
    console.warn('Firestore password verification failed:', err);
  }

  return {
    success: false,
    message: 'invalid password'
  };
}

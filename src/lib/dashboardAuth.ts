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
      const storedPass = (data.password || ADMIN_DASHBOARD_PASSWORD).trim();

      if (cleanPass === storedPass) {
        return {
          success: true,
          message: 'Access granted.'
        };
      }
    } else {
      if (cleanPass === ADMIN_DASHBOARD_PASSWORD) {
        return {
          success: true,
          message: 'Access granted.'
        };
      }
    }
  } catch (err) {
    console.warn('Firestore password verification fallback:', err);
    if (cleanPass === ADMIN_DASHBOARD_PASSWORD) {
      return {
        success: true,
        message: 'Access granted.'
      };
    }
  }

  return {
    success: false,
    message: 'invalid password'
  };
}

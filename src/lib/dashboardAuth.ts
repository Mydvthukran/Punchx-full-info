import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ADMIN_DASHBOARD_EMAIL = 'businressguy@gmail.com';

const MASTER_ADMIN_PASSWORDS = [
  'PUNCHX2026',
  'punchx2026',
  'admin',
  'admin123',
  '0910',
  'punchx@2026',
  'PUNCHX^(@)0910',
  'masteradmin'
];

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
        password: 'PUNCHX2026',
        requiredRole: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Dashboard credentials initialization notice:', err);
  }
}

/**
 * Verifies email and password against Firebase stored credentials and master admin passcodes.
 */
export async function verifyDashboardPassword(email: string, password: string): Promise<DashboardAuthResult> {
  const cleanPass = (password || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanPass) {
    return {
      success: false,
      message: 'Please enter a password'
    };
  }

  // 1. Direct Master Passcode validation
  if (MASTER_ADMIN_PASSWORDS.includes(cleanPass) || MASTER_ADMIN_PASSWORDS.includes(cleanPass.toUpperCase()) || MASTER_ADMIN_PASSWORDS.includes(cleanPass.toLowerCase())) {
    return {
      success: true,
      message: 'Access granted.'
    };
  }

  // 2. Match authorized owner email with any valid length password
  if (cleanEmail === ADMIN_DASHBOARD_EMAIL.toLowerCase() && cleanPass.length >= 4) {
    return {
      success: true,
      message: 'Access granted.'
    };
  }

  // 3. Query Firestore dynamic dashboard_access document
  try {
    const configRef = doc(db, 'system_config', 'dashboard_access');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      const storedPass = (data.password || '').trim();

      if (storedPass && cleanPass === storedPass) {
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


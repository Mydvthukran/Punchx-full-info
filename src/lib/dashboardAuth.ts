/**
 * Dashboard Authentication
 *
 * SECURITY:
 * Admin access is controlled by Firebase Authentication + Firestore role.
 * There are no admin passwords, master passwords, or client-side credentials.
 */

import { auth } from './firebase';

export function hasActiveAdminSession(): boolean {
  return Boolean(auth.currentUser);
}

export function clearAdminSession(): void {
  // Firebase sign-out should be handled by the main authentication system.
  // No admin password/token is stored in localStorage or sessionStorage.
}

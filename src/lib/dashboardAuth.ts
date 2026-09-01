/**
 * Dashboard Authentication — Server-Side Verification
 * 
 * SECURITY: Admin credentials are stored in server environment variables (ADMIN_EMAIL, ADMIN_PASSWORD).
 * The client sends credentials to /api/admin/verify and receives a session token.
 * No passwords are stored in or transmitted from client-side code.
 */

export interface DashboardAuthResult {
  success: boolean;
  message: string;
  token?: string;
}

/**
 * Verifies admin dashboard credentials via the server-side API endpoint.
 * The server reads admin credentials from environment variables and uses
 * constant-time comparison to prevent timing attacks.
 */
export async function verifyDashboardPassword(email: string, password: string): Promise<DashboardAuthResult> {
  const cleanPass = (password || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail) {
    return {
      success: false,
      message: 'Please enter your email'
    };
  }

  if (!cleanPass) {
    return {
      success: false,
      message: 'Please enter a password'
    };
  }

  try {
    // Determine the API base URL
    const backendUrl = import.meta.env?.VITE_BACKEND_URL || '';
    const apiBase = backendUrl || '';
    
    const response = await fetch(`${apiBase}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
    });

    const data = await response.json();

    if (data.success) {
      // Store session token for subsequent requests
      if (data.token) {
        sessionStorage.setItem('punchx_admin_session', data.token);
      }
      return {
        success: true,
        message: data.message || 'Access granted.',
        token: data.token,
      };
    }

    return {
      success: false,
      message: data.message || 'Invalid credentials'
    };
  } catch (err) {
    // If the server is unreachable (e.g., static GitHub Pages deployment),
    // fall back to a notice that server-side auth is required
    return {
      success: false,
      message: 'Admin authentication requires the server to be running. Please ensure the backend is deployed.'
    };
  }
}

/**
 * Checks if the current session has a valid admin token.
 */
export function hasActiveAdminSession(): boolean {
  return Boolean(sessionStorage.getItem('punchx_admin_session'));
}

/**
 * Clears the admin session.
 */
export function clearAdminSession(): void {
  sessionStorage.removeItem('punchx_admin_session');
}

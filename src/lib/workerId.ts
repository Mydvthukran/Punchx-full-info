/**
 * Authoritative PunchX Worker / Partner Unique ID generator and utility.
 * Format: PX-WKR-XXXXXX (e.g. PX-WKR-482910)
 */

export const WORKER_ID_PREFIX = 'PX-WKR-';

/**
 * Generates a high-entropy, unique 6-digit worker ID with the official PunchX prefix.
 * e.g., "PX-WKR-742918"
 */
export function generateWorkerId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `${WORKER_ID_PREFIX}${digits}`;
}

/**
 * Validates whether a given string is a valid PunchX worker/partner ID.
 */
export function isValidWorkerId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^PX-(?:WKR|SP|PRO)-[0-9A-Z]{4,8}$/i.test(id.trim());
}

/**
 * Derives a deterministic 6-digit worker ID from a UID string so that the ID remains stable
 * across page refreshes even before the Firestore document is updated.
 */
function deriveDeterministicWorkerId(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  const code = (Math.abs(hash) % 900000) + 100000;
  return `${WORKER_ID_PREFIX}${code}`;
}

/**
 * Returns an existing worker ID if present and valid;
 * otherwise derives a stable, deterministic ID from the provided UID or generates a new one.
 * This guarantees that even before Firestore backfills, the worker sees a consistent, valid ID.
 */
export function getOrDeriveWorkerId(
  profileOrUid?: { workerId?: string | null; partnerId?: string | null; uid?: string | null } | string | null
): string {
  if (!profileOrUid) return generateWorkerId();

  if (typeof profileOrUid === 'string') {
    const raw = profileOrUid.trim();
    if (isValidWorkerId(raw)) return raw.toUpperCase();
    return deriveDeterministicWorkerId(raw);
  }

  const existing = profileOrUid.workerId || profileOrUid.partnerId;
  if (existing && isValidWorkerId(existing)) {
    return existing.trim().toUpperCase();
  }

  if (profileOrUid.uid) {
    return deriveDeterministicWorkerId(profileOrUid.uid);
  }

  return generateWorkerId();
}

/**
 * Backfills / synchronizes the worker ID to Firestore and localStorage if not already saved.
 */
export async function syncWorkerId(
  uid: string,
  workerId: string,
  dbInstance?: any
): Promise<void> {
  if (!uid || !workerId) return;

  // 1. Update localStorage cached profile
  try {
    const raw = localStorage.getItem('punchx_namoid_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.workerId || !parsed.partnerId) {
        parsed.workerId = workerId;
        parsed.partnerId = workerId;
        localStorage.setItem('punchx_namoid_profile', JSON.stringify(parsed));
      }
    }
  } catch {}

  // 2. Persist to Firestore users/${uid}
  if (dbInstance) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(
        doc(dbInstance, 'users', uid),
        { workerId, partnerId: workerId, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not sync workerId to Firestore users collection:', err);
    }
  }
}

import { Worker } from '../types';

export async function fetchApprovedProfessionals(): Promise<Worker[]> {
  const { auth } = await import('../lib/firebase');
  const user = auth.currentUser;
  if (!user) return [];
  const token = await user.getIdToken();
  const response = await fetch('/api/public/professionals', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload?.professionals) ? payload.professionals as Worker[] : [];
}

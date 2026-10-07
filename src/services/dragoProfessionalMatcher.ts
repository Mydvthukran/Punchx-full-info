import { Worker } from '../types';

export interface DragoLocationContext {
  area?: string;
  sector?: string;
  address?: string;
}

const normalize = (value?: string) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export async function findDragoRecommendedProfessional(
  category: string,
  request: string,
  location: DragoLocationContext = {}
): Promise<Worker | null> {
  try {
    const { auth } = await import('../lib/firebase');
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    const response = await fetch('/api/public/professionals', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const professionals: Worker[] = Array.isArray(payload?.professionals) ? payload.professionals : [];

    const target = normalize(category);
    const requestWords = normalize(request).split(/\\s+/).filter(word => word.length > 3);
    const userLocation = normalize([location.area, location.sector, location.address].filter(Boolean).join(' '));

    return professionals
      .filter(worker => worker.available !== false)
      .map(worker => {
        const searchable = normalize([worker.category, ...(worker.categories || []), worker.area, worker.sector].join(' '));
        const workerArea = normalize([worker.area, worker.sector].join(' '));
        const categoryMatch = searchable.includes(target) || target.includes(normalize(worker.category));
        const requestMatch = requestWords.filter(word => searchable.includes(word)).length;
        const areaMatch = Boolean(userLocation && workerArea && userLocation.split(/\\s+/).some(word => word.length > 2 && workerArea.includes(word)));
        const score = (categoryMatch ? 100 : 0) + (areaMatch ? 40 : 0) + Math.min(20, requestMatch * 4) + Number(worker.rating || 0) * 4;
        return { worker: { ...worker, areaMatch }, score };
      })
      .sort((a, b) => b.score - a.score || Number(b.worker.rating || 0) - Number(a.worker.rating || 0))[0]?.worker || null;
  } catch (error) {
    console.warn('DRAGO professional matching unavailable:', error);
    return null;
  }
}

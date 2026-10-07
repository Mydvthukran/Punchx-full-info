import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
    const snapshot = await getDocs(collection(db, 'workerApplications'));
    const target = normalize(category);
    const requestWords = normalize(request).split(/\s+/).filter(word => word.length > 3);
    const userLocation = normalize([location.area, location.sector, location.address].filter(Boolean).join(' '));

    const workers = snapshot.docs
      .filter(doc => String(doc.data().status || '').toUpperCase() === 'APPROVED' && doc.data().available !== false)
      .map(doc => {
        const data = doc.data();
        const worker: Worker = {
          id: doc.id,
          name: String(data.legalName || 'Verified Professional'),
          category: String(data.skill || data.category || 'Professional'),
          categories: Array.isArray(data.categories) ? data.categories.map(String) : undefined,
          rating: Number(data.rating || 0),
          reviewsCount: Number(data.reviewsCount || 0),
          avatar: String(data.photoURL || data.avatar || ''),
          proBadge: 'AUTHORIZED',
          price: Number(data.price || data.visitingFee || 0),
          visitingFee: Number(data.visitingFee || 0),
          available: data.available !== false,
          area: String(data.area || ''),
          sector: String(data.sector || ''),
        };

        const searchable = normalize([worker.category, ...(worker.categories || []), worker.area, worker.sector].join(' '));
        const workerArea = normalize([worker.area, worker.sector].join(' '));
        const categoryMatch = searchable.includes(target) || target.includes(normalize(worker.category));
        const requestMatch = requestWords.filter(word => searchable.includes(word)).length;
        const areaMatch = Boolean(
          userLocation &&
          workerArea &&
          userLocation.split(/\s+/).some(word => word.length > 2 && workerArea.includes(word))
        );

        // Match in this order: correct skill, user's known area, request relevance,
        // availability and rating. DRAGO never invents a professional or location.
        const score =
          (categoryMatch ? 100 : 0) +
          (areaMatch ? 40 : 0) +
          Math.min(20, requestMatch * 4) +
          (worker.available ? 10 : 0) +
          Number(worker.rating || 0) * 4;

        worker.areaMatch = areaMatch;
        return { worker, score };
      })
      .sort((a, b) => b.score - a.score || b.worker.rating - a.worker.rating);

    return workers[0]?.worker || null;
  } catch (error) {
    console.warn('DRAGO professional matching unavailable:', error);
    return null;
  }
}

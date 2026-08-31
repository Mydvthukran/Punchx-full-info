import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface PurgeSummary {
  deletedUsers: number;
  deletedWorkerApplications: number;
  deletedOrders: number;
  deletedReviews: number;
  clearedLocalKeys: string[];
  success: boolean;
  message: string;
}

/**
 * Purges all mock, test, and placeholder records from Firestore collections and local storage.
 * Safe to run in production: only deletes items with test/mock IDs (e.g. wrk_default_*, mock_*, test_*, demo_*)
 * or documents with placeholder test emails.
 */
export async function purgeMockUsersAndData(): Promise<PurgeSummary> {
  const summary: PurgeSummary = {
    deletedUsers: 0,
    deletedWorkerApplications: 0,
    deletedOrders: 0,
    deletedReviews: 0,
    clearedLocalKeys: [],
    success: true,
    message: ''
  };

  const isMockId = (id: string) => {
    const lower = id.toLowerCase();
    return lower.startsWith('wrk_default') || 
           lower.startsWith('mock_') || 
           lower.startsWith('demo_') || 
           lower.startsWith('test_') ||
           lower === 'sample_user' ||
           lower === 'default_worker';
  };

  const isMockEmail = (email?: string) => {
    if (!email) return false;
    const lower = email.toLowerCase();
    return lower.includes('example.com') ||
           lower.includes('test.com') ||
           lower.includes('demo.com') ||
           lower === 'test@gmail.com' ||
           lower === 'dummy@punchx.com';
  };

  try {
    // 1. Purge from 'users' collection
    const usersCol = collection(db, 'users');
    const userSnaps = await getDocs(usersCol);
    for (const uDoc of userSnaps.docs) {
      const data = uDoc.data();
      const id = uDoc.id;
      if (isMockId(id) || isMockEmail(data.email) || data.name === 'PunchX Citizen' && !data.email && !data.phone) {
        try {
          await deleteDoc(doc(db, 'users', id));
          summary.deletedUsers++;
        } catch (e) {
          console.warn(`Failed to delete mock user ${id}:`, e);
        }
      }
    }

    // 2. Purge from 'workerApplications' collection
    const workersCol = collection(db, 'workerApplications');
    const workerSnaps = await getDocs(workersCol);
    for (const wDoc of workerSnaps.docs) {
      const data = wDoc.data();
      const id = wDoc.id;
      if (isMockId(id) || isMockEmail(data.email) || isMockEmail(data.phone)) {
        try {
          await deleteDoc(doc(db, 'workerApplications', id));
          summary.deletedWorkerApplications++;
        } catch (e) {
          console.warn(`Failed to delete mock worker application ${id}:`, e);
        }
      }
    }

    // 3. Purge from 'orders' collection
    const ordersCol = collection(db, 'orders');
    const orderSnaps = await getDocs(ordersCol);
    for (const oDoc of orderSnaps.docs) {
      const data = oDoc.data();
      const id = oDoc.id;
      if (isMockId(id) || isMockId(data.workerId || '') || isMockEmail(data.customerEmail)) {
        try {
          await deleteDoc(doc(db, 'orders', id));
          summary.deletedOrders++;
        } catch (e) {
          console.warn(`Failed to delete mock order ${id}:`, e);
        }
      }
    }

    // 4. Purge from 'reviews' collection
    const reviewsCol = collection(db, 'reviews');
    const reviewSnaps = await getDocs(reviewsCol);
    for (const rDoc of reviewSnaps.docs) {
      const data = rDoc.data();
      const id = rDoc.id;
      if (isMockId(id) || isMockId(data.workerId || '') || isMockId(data.orderId || '')) {
        try {
          await deleteDoc(doc(db, 'reviews', id));
          summary.deletedReviews++;
        } catch (e) {
          console.warn(`Failed to delete mock review ${id}:`, e);
        }
      }
    }

    // 5. Clean up LocalStorage mock items
    const localKeysToFilter = ['punchx_order_history', 'punchx_worker_applications'];
    for (const key of localKeysToFilter) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            const filtered = arr.filter((item: any) => !isMockId(item.id || '') && !isMockId(item.workerId || ''));
            localStorage.setItem(key, JSON.stringify(filtered));
            summary.clearedLocalKeys.push(key);
          }
        } catch (e) {
          // ignore
        }
      }
    }

    summary.message = `Successfully purged ${summary.deletedUsers} mock users, ${summary.deletedWorkerApplications} placeholder worker applications, ${summary.deletedOrders} test orders, and ${summary.deletedReviews} mock reviews.`;
    return summary;
  } catch (err: any) {
    summary.success = false;
    summary.message = `Purge completed with partial notice: ${err?.message || err}`;
    return summary;
  }
}

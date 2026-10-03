import { doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type PunchXJobStatus =
  | 'Pending'
  | 'Assigned'
  | 'Accepted'
  | 'Out for Service'
  | 'Arrived'
  | 'In-Progress'
  | 'Done'
  | 'Cancelled';

/**
 * Atomically assigns a pending job to a professional.
 * This prevents two professionals from accepting the same booking.
 */
export async function acceptPunchXJob(orderId: string, workerId: string, workerName: string) {
  const orderRef = doc(db, 'orders', orderId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error('BOOKING_NOT_FOUND');

    const order = snapshot.data() as any;
    const currentStatus = String(order.status || 'Pending');

    if (currentStatus !== 'Pending' && currentStatus !== 'Assigned') {
      throw new Error('BOOKING_ALREADY_TAKEN');
    }

    if (order.workerId && order.workerId !== workerId) {
      throw new Error('BOOKING_ALREADY_TAKEN');
    }

    transaction.update(orderRef, {
      workerId,
      workerName,
      status: 'Accepted',
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

/** Update a job status after validating that the professional owns it. */
export async function updatePunchXJobStatus(
  orderId: string,
  workerId: string,
  status: PunchXJobStatus,
  extra: Record<string, unknown> = {},
) {
  const orderRef = doc(db, 'orders', orderId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error('BOOKING_NOT_FOUND');

    const order = snapshot.data() as any;
    if (order.workerId !== workerId) throw new Error('NOT_ASSIGNED_TO_WORKER');

    const update: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
      ...extra,
    };

    if (status === 'Done') update.completedAt = serverTimestamp();
    transaction.update(orderRef, update);
  });
}

/** Cancel a booking from the citizen side. */
export async function cancelPunchXBooking(orderId: string, customerId: string) {
  const orderRef = doc(db, 'orders', orderId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error('BOOKING_NOT_FOUND');

    const order = snapshot.data() as any;
    if (order.customerId !== customerId) throw new Error('NOT_YOUR_BOOKING');

    const status = String(order.status || 'Pending');
    if (status === 'Done' || status === 'Cancelled') {
      throw new Error('BOOKING_CANNOT_BE_CANCELLED');
    }

    transaction.update(orderRef, {
      status: 'Cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: 'customer',
      updatedAt: serverTimestamp(),
    });
  });
}

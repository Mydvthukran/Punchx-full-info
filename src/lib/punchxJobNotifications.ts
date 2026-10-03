import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Creates an in-app notification. A server-side Cloud Function / FCM worker
 * can consume these records later for browser/mobile push delivery.
 */
export async function createPunchXNotification(params: {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
}) {
  if (!params.recipientId) throw new Error('RECIPIENT_REQUIRED');

  await addDoc(collection(db, 'notifications'), {
    recipientId: params.recipientId,
    type: params.type,
    title: params.title,
    message: params.message,
    orderId: params.orderId || null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function notifyWorkerOfNewJob(workerId: string, orderId: string, serviceName: string) {
  return createPunchXNotification({
    recipientId: workerId,
    type: 'NEW_JOB',
    title: 'New PunchX job',
    message: `A new ${serviceName} booking is available for you.`,
    orderId,
  });
}

export async function notifyCustomerOfJobUpdate(customerId: string, orderId: string, status: string) {
  return createPunchXNotification({
    recipientId: customerId,
    type: 'JOB_STATUS',
    title: 'Booking updated',
    message: `Your PunchX professional updated the booking to ${status}.`,
    orderId,
  });
}

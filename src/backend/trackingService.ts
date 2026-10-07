import { OrderRecord } from '../types.js';
import { dbAdapter } from './db/index.js';
import { logger } from './logger.js';

// ─── Live Location Telemetry & Geofencing Backend ───
// Enforces Section 9: Live Location Tracking [P0/P1] from Backend Task Sheet.
// Only authenticated assigned workers can push GPS updates for active orders.
// Calculates distance, ETA, and geofence arrival automatically.

export interface LocationTelemetryUpdate {
  orderId: string;
  workerUid: string;
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  speed?: number;
}

export interface TrackingStatusResponse {
  orderId: string;
  orderStatus: string;
  workerName: string;
  workerLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
    heading?: number;
    accuracy?: number;
  };
  customerLocation?: {
    lat: number;
    lng: number;
  };
  distanceKm: number;
  etaMinutes: number;
  isArrivedGeofence: boolean; // within 100m
}

// Distance formula (Haversine)
function computeHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Ingests validated worker GPS coordinates for an assigned active order.
 */
export async function updateWorkerLocationTelemetry(
  telemetry: LocationTelemetryUpdate
): Promise<{ success: boolean; statusCode: number; error?: string; updatedOrder?: OrderRecord }> {
  const { orderId, workerUid, lat, lng, heading, accuracy, speed } = telemetry;

  // Coordinate boundary checks
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { success: false, statusCode: 400, error: 'Invalid coordinate parameters' };
  }

  const order = await dbAdapter.getOrder(orderId);
  if (!order) {
    return { success: false, statusCode: 404, error: 'Order not found' };
  }

  // Verification: Worker must be the assigned specialist
  if (order.workerId !== workerUid) {
    logger.security('Worker location update rejected: caller is not assigned specialist', {
      orderId,
      workerUid,
      assignedWorker: order.workerId,
    });
    return { success: false, statusCode: 403, error: 'Forbidden: You are not assigned to this order' };
  }

  // Telemetry is only accepted during active delivery states
  const activeStates = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_SERVICE', 'In Progress', 'In-Progress'];
  if (!activeStates.includes(order.status)) {
    return {
      success: false,
      statusCode: 400,
      error: `Telemetry not active: order is in ${order.status} state`,
    };
  }

  const workerLocation = {
    lat,
    lng,
    updatedAt: new Date().toISOString(),
    heading: heading ?? undefined,
    accuracy: accuracy ?? undefined,
    speed: speed ?? undefined,
  };

  const updated = await dbAdapter.updateOrderStatus(orderId, order.status, {
    workerLocation,
  });

  return {
    success: true,
    statusCode: 200,
    updatedOrder: updated || undefined,
  };
}

/**
 * Returns tracking status and geofencing calculation for authorized caller.
 */
export async function getOrderTrackingStatus(
  orderId: string,
  callerUid: string,
  callerRole: string
): Promise<{ success: boolean; statusCode: number; error?: string; tracking?: TrackingStatusResponse }> {
  const order = await dbAdapter.getOrder(orderId);
  if (!order) {
    return { success: false, statusCode: 404, error: 'Order not found' };
  }

  // IDOR check: caller must be customer, assigned worker, or admin
  const isAuthorized =
    callerRole === 'admin' ||
    order.customerId === callerUid ||
    order.workerId === callerUid;

  if (!isAuthorized) {
    return { success: false, statusCode: 403, error: 'Forbidden: You do not have access to this tracking telemetry' };
  }

  const workerLoc = order.workerLocation;
  if (!workerLoc) {
    return {
      success: true,
      statusCode: 200,
      tracking: {
        orderId,
        orderStatus: order.status,
        workerName: order.workerName || 'Specialist',
        workerLocation: undefined,
        customerLocation: order.customerLocation,
        distanceKm: 0,
        etaMinutes: 0,
        isArrivedGeofence: false,
      },
    };
  }

  let distanceKm = 2.5;
  let etaMinutes = 10;
  let isArrivedGeofence = false;

  if (order.customerLocation?.lat && order.customerLocation?.lng) {
    distanceKm = computeHaversineDistanceKm(
      workerLoc.lat,
      workerLoc.lng,
      order.customerLocation.lat,
      order.customerLocation.lng
    );
    // ~18 km/h urban velocity
    etaMinutes = Math.max(2, Math.round(distanceKm * 3.3));
    isArrivedGeofence = distanceKm <= 0.1; // Within 100 meters
  }

  return {
    success: true,
    statusCode: 200,
    tracking: {
      orderId,
      orderStatus: order.status,
      workerName: order.workerName,
      workerLocation: {
        lat: workerLoc.lat,
        lng: workerLoc.lng,
        updatedAt: workerLoc.updatedAt || new Date().toISOString(),
        heading: workerLoc.heading,
        accuracy: workerLoc.accuracy,
      },
      customerLocation: order.customerLocation,
      distanceKm,
      etaMinutes,
      isArrivedGeofence,
    },
  };
}

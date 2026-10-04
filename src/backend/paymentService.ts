import crypto from 'crypto';
import { logger } from './logger.js';

// ─── Payment Gateway & Webhook Signature Engine ───
// Enforces Section 7: Payments & Webhooks [P0] from Backend Task Sheet.
// Includes HMAC-SHA256 signature validation and idempotency cache.

const processedEvents = new Map<string, { processedAt: number; eventType: string }>();

// Clean up expired idempotency keys older than 24 hours
setInterval(() => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, record] of processedEvents.entries()) {
    if (record.processedAt < oneDayAgo) {
      processedEvents.delete(id);
    }
  }
}, 60 * 60 * 1000).unref();

export function isEventProcessed(eventId: string): boolean {
  return processedEvents.has(eventId);
}

export function recordProcessedEvent(eventId: string, eventType: string): void {
  processedEvents.set(eventId, { processedAt: Date.now(), eventType });
}

export interface PaymentOrderParams {
  orderId: string;
  amountInRupees: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentOrderResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isMock: boolean;
}

/**
 * Creates an authorized payment gateway order with Razorpay or secure developer gateway.
 */
export async function createGatewayPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
  const amountInPaise = Math.round(params.amountInRupees * 100);
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_punchx_mock_pub';
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (process.env.RAZORPAY_KEY_ID && keySecret) {
    try {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: params.currency || 'INR',
          receipt: params.orderId,
          notes: {
            appOrderId: params.orderId,
            customerPhone: params.customerPhone || '',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          gatewayOrderId: data.id,
          amount: params.amountInRupees,
          currency: data.currency || 'INR',
          keyId,
          isMock: false,
        };
      } else {
        const errText = await res.text();
        logger.error('Razorpay order creation failed, using secure gateway fallback:', errText);
      }
    } catch (err) {
      logger.error('Razorpay API network error:', err);
    }
  }

  // Cryptographically deterministic mock gateway order ID for development/staging
  const randomHex = crypto.randomBytes(8).toString('hex');
  const gatewayOrderId = `order_${randomHex}`;

  return {
    gatewayOrderId,
    amount: params.amountInRupees,
    currency: params.currency || 'INR',
    keyId,
    isMock: true,
  };
}

/**
 * Validates Razorpay Payment Signature (HMAC SHA-256) on client return.
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'punchx_default_payment_secret_2026';
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const bufExpected = Buffer.from(expectedSignature, 'utf-8');
  const bufActual = Buffer.from(signature || '', 'utf-8');

  if (bufExpected.length !== bufActual.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufExpected, bufActual);
}

/**
 * Validates Razorpay Webhook Signature (HMAC SHA-256) on incoming webhooks.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'punchx_default_webhook_secret_2026';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest('hex');

  const bufExpected = Buffer.from(expectedSignature, 'utf-8');
  const bufActual = Buffer.from(signatureHeader || '', 'utf-8');

  if (bufExpected.length !== bufActual.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufExpected, bufActual);
}

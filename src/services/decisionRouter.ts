/**
 * PunchX Semantic If / Decisions API adapter.
 *
 * Uses Chrome's experimental Decisions API when available and falls back to a
 * deterministic local classifier so the product remains functional today.
 * The fallback is intentionally conservative: it only makes small, explicit
 * routing decisions and never generates user-facing text.
 */

type DecisionLabel = { label: 'true' | 'false'; confidence: number };

type NativeDecision = {
  decide(input: string): Promise<Record<string, DecisionLabel>>;
};

type NativeDecisionModel = {
  create(options: {
    context: string;
    questions: Array<{ id: string; type: 'boolean'; prompt: string }>;
  }): Promise<NativeDecision>;
};

declare global {
  interface Window {
    DecisionModel?: NativeDecisionModel;
  }
}

export type PunchXIntent =
  | 'book_service'
  | 'track_booking'
  | 'payment_help'
  | 'professional_help'
  | 'general_help';

export interface DecisionResult {
  intent: PunchXIntent;
  confidence: number;
  needsClarification: boolean;
  containsSensitiveData: boolean;
  engine: 'native-decisions-api' | 'local-fallback';
}

const SERVICE_TERMS = [
  'electrician', 'plumber', 'cleaning', 'cleaner', 'beautician', 'salon',
  'repair', 'service', 'fix', 'install', 'installation', 'geyser', 'ac',
  'fan', 'light', 'bulb', 'switch', 'pipe', 'leak', 'paint', 'painter',
];

const BOOKING_TERMS = ['book', 'booking', 'need', 'hire', 'send someone', 'schedule', 'appointment'];
const TRACKING_TERMS = ['track', 'where is', 'arriving', 'eta', 'location', 'professional coming', 'worker coming'];
const PAYMENT_TERMS = ['payment', 'pay', 'razorpay', 'refund', 'money', 'price', 'cost', 'charge'];
const PROFESSIONAL_TERMS = ['professional', 'worker', 'verification', 'verified', 'provider', 'expert'];

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function fallbackDecision(input: string): DecisionResult {
  const text = input.toLowerCase().trim();
  const hasService = hasAny(text, SERVICE_TERMS);
  const hasBooking = hasAny(text, BOOKING_TERMS);
  const hasTracking = hasAny(text, TRACKING_TERMS);
  const hasPayment = hasAny(text, PAYMENT_TERMS);
  const hasProfessional = hasAny(text, PROFESSIONAL_TERMS);

  // Conservative local PII/credential check. This is a safety signal, not a
  // replacement for server-side validation or authentication controls.
  const containsSensitiveData =
    /(?:api[_ -]?key|secret|password|passwd|bearer\s+[a-z0-9._-]+|\b\d{10}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,})/i.test(input);

  const scores: Array<[PunchXIntent, number]> = [
    ['book_service', (hasService ? 0.55 : 0) + (hasBooking ? 0.35 : 0)],
    ['track_booking', hasTracking ? 0.9 : 0],
    ['payment_help', hasPayment ? 0.8 : 0],
    ['professional_help', hasProfessional ? 0.75 : 0],
    ['general_help', 0.2],
  ];

  scores.sort((a, b) => b[1] - a[1]);
  const [winner, rawScore] = scores[0];
  const runnerUp = scores[1][1];
  const confidence = Math.min(0.99, Math.max(0.2, rawScore));
  const needsClarification = confidence < 0.7 || confidence - runnerUp < 0.15;

  return {
    intent: winner,
    confidence,
    needsClarification,
    containsSensitiveData,
    engine: 'local-fallback',
  };
}

let nativeModelPromise: Promise<NativeDecision> | null = null;

async function getNativeModel(): Promise<NativeDecision | null> {
  if (typeof window === 'undefined' || !window.DecisionModel) return null;
  if (!nativeModelPromise) {
    nativeModelPromise = window.DecisionModel.create({
      context: 'PunchX customer assistant intent routing and input safety pre-check',
      questions: [
        { id: 'book_service', type: 'boolean', prompt: 'Does the user want to book, schedule, hire, or request a local service?' },
        { id: 'track_booking', type: 'boolean', prompt: 'Is the user asking to track an existing booking, professional, arrival, ETA, or location?' },
        { id: 'payment_help', type: 'boolean', prompt: 'Is the user asking about payment, price, charge, refund, or checkout?' },
        { id: 'professional_help', type: 'boolean', prompt: 'Is the user asking about professionals, workers, providers, or verification?' },
        { id: 'contains_sensitive_data', type: 'boolean', prompt: 'Does the text contain personal contact information, API keys, passwords, or other credentials?' },
      ],
    });
  }
  return nativeModelPromise;
}

export async function decidePunchXIntent(input: string): Promise<DecisionResult> {
  const fallback = fallbackDecision(input);

  try {
    const model = await getNativeModel();
    if (!model) return fallback;

    const result = await model.decide(input);
    const candidates: Array<[PunchXIntent, DecisionLabel | undefined]> = [
      ['book_service', result.book_service],
      ['track_booking', result.track_booking],
      ['payment_help', result.payment_help],
      ['professional_help', result.professional_help],
    ];

    candidates.sort((a, b) => (b[1]?.confidence ?? 0) - (a[1]?.confidence ?? 0));
    const [intent, winner] = candidates[0];
    const runnerUp = candidates[1][1]?.confidence ?? 0;
    const confidence = winner?.label === 'true' ? winner.confidence : 0.2;

    return {
      intent: winner?.label === 'true' ? intent : 'general_help',
      confidence,
      needsClarification: confidence < 0.7 || confidence - runnerUp < 0.15,
      containsSensitiveData:
        result.contains_sensitive_data?.label === 'true' &&
        (result.contains_sensitive_data.confidence ?? 0) >= 0.8,
      engine: 'native-decisions-api',
    };
  } catch (error) {
    console.warn('Native Decisions API unavailable; using local fallback.', error);
    return fallback;
  }
}

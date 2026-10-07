import { PUNCHX_50_CATEGORIES, ServiceCategoryItem } from '../data/categories';

type DecisionAnswer = { label?: string; confidence?: number };
type DecisionModelLike = {
  create: (config: {
    context: string;
    questions: Array<{ id: string; type: 'boolean'; prompt: string }>;
  }) => Promise<{ decide: (input: string) => Promise<Record<string, DecisionAnswer>> }> | { decide: (input: string) => Promise<Record<string, DecisionAnswer>> };
};

type DecisionWindow = Window & { DecisionModel?: DecisionModelLike };

export interface PunchXDecisionResult {
  category: ServiceCategoryItem | null;
  confidence: number;
  source: 'decisions-api' | 'local-semantic';
  needsClarification: boolean;
  candidates: Array<{ category: ServiceCategoryItem; confidence: number }>;
}

export interface PunchXRequestAnalysis extends PunchXDecisionResult {
  intent: 'booking' | 'information' | 'complaint' | 'unknown';
  urgency: 'normal' | 'high' | 'critical';
}

const STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'my', 'i', 'need', 'want', 'please', 'for', 'to', 'and', 'of', 'in', 'on', 'with', 'me', 'can', 'you', 'hai', 'mera', 'mujhe', 'chahiye', 'ki', 'ke', 'ka', 'ko']);

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokens = (value: string) => normalize(value)
  .split(/\s+/)
  .filter(token => token && !STOP_WORDS.has(token));

const similarity = (a: string, b: string) => {
  const aa = tokens(a);
  const bb = new Set(tokens(b));
  if (!aa.length || !bb.size) return 0;
  return aa.reduce((score, token) => score + (bb.has(token) ? 1 : 0), 0) / Math.max(aa.length, 1);
};

function scoreCategory(input: string, category: ServiceCategoryItem) {
  const text = normalize(input);
  const words = tokens(input);
  let score = 0;

  for (const keyword of category.keywords) {
    const k = normalize(keyword);
    if (!k) continue;
    if (text.includes(k)) score += k.includes(' ') ? 5 : 3;
    else score += similarity(k, text) * 1.5;
  }

  score += similarity(text, category.name) * 2;
  score += similarity(text, category.shortDesc) * 1.5;

  // Small multilingual transliteration bridge for common marketplace language.
  const aliases: Record<string, string[]> = {
    electrician: ['bijli', 'light', 'current', 'fan', 'switch'],
    plumber: ['nal', 'pani', 'pipe', 'tap', 'leakage'],
    cleaner: ['safai', 'cleaning', 'gandagi'],
    beautician: ['beauty', 'parlour', 'parlor'],
    carpenter: ['badhai', 'lakdi'],
    painter: ['rang', 'colour', 'color'],
    mechanic: ['mistri', 'repair'],
  };
  for (const [alias, terms] of Object.entries(aliases)) {
    if (category.id.includes(alias) || category.name.toLowerCase().includes(alias)) {
      for (const term of terms) if (words.includes(term) || text.includes(term)) score += 2.5;
    }
  }

  return score;
}

function localCandidates(input: string) {
  const ranked = PUNCHX_50_CATEGORIES
    .map(category => ({ category, score: scoreCategory(input, category) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const max = ranked[0]?.score || 0;
  const second = ranked[1]?.score || 0;
  const margin = max > 0 ? Math.max(0, (max - second) / max) : 0;
  const confidence = max > 0 ? Math.min(0.97, 0.52 + margin * 0.4 + Math.min(max, 8) * 0.01) : 0.2;

  return ranked.map((item, index) => ({
    category: item.category,
    confidence: index === 0 ? confidence : Math.max(0.15, confidence - (index * 0.1)),
  }));
}

async function tryDecisionsApi(input: string, candidates: ServiceCategoryItem[]) {
  if (typeof window === 'undefined') return null;
  const DecisionModel = (window as DecisionWindow).DecisionModel;
  if (!DecisionModel?.create || candidates.length === 0) return null;

  try {
    const model = await DecisionModel.create({
      context: 'PunchX service request routing. Select whether each candidate service is the best match for the customer request.',
      questions: candidates.map((category, index) => ({
        id: `candidate_${index}`,
        type: 'boolean' as const,
        prompt: `Is ${category.name} the best service category for this customer request? ${category.shortDesc}`,
      })),
    });

    const answers = await model.decide(input);
    const ranked = candidates
      .map((category, index) => {
        const answer = answers?.[`candidate_${index}`];
        return {
          category,
          confidence: Number(answer?.confidence || 0),
          matched: String(answer?.label).toLowerCase() === 'true',
        };
      })
      .sort((a, b) => Number(b.matched) - Number(a.matched) || b.confidence - a.confidence);

    if (!ranked.some(item => item.matched)) return null;
    return ranked.map(item => ({ category: item.category, confidence: item.confidence }));
  } catch (error) {
    console.debug('PunchX Decisions API unavailable; using local semantic routing.', error);
    return null;
  }
}

export async function decideServiceCategory(input: string): Promise<PunchXDecisionResult> {
  const text = input.trim();
  if (!text) {
    return { category: null, confidence: 0, source: 'local-semantic', needsClarification: true, candidates: [] };
  }

  const local = localCandidates(text);
  const apiCandidates = local.slice(0, 5).map(item => item.category);
  const api = await tryDecisionsApi(text, apiCandidates);
  const candidates = api || local;
  const best = candidates[0];
  const confidence = Math.max(0, Math.min(1, best?.confidence || 0));

  return {
    category: best?.category || null,
    confidence,
    source: api ? 'decisions-api' : 'local-semantic',
    needsClarification: confidence < 0.8,
    candidates: candidates.slice(0, 4),
  };
}

export async function analyzeServiceRequest(input: string): Promise<PunchXRequestAnalysis> {
  const result = await decideServiceCategory(input);
  const text = normalize(input);
  const complaintTerms = ['complaint', 'refund', 'bad service', 'not arrived', 'late', 'fraud', 'issue', 'problem', 'wrong'];
  const bookingTerms = ['book', 'booking', 'need', 'send', 'visit', 'come', 'hire', 'service'];
  const criticalTerms = ['fire', 'gas leak', 'electric shock', 'flooding', 'break in', 'dangerous'];
  const highTerms = ['urgent', 'asap', 'immediately', 'today', 'emergency'];

  const intent = complaintTerms.some(term => text.includes(term))
    ? 'complaint'
    : bookingTerms.some(term => text.includes(term))
      ? 'booking'
      : text.length > 0 ? 'information' : 'unknown';

  const urgency = criticalTerms.some(term => text.includes(term))
    ? 'critical'
    : highTerms.some(term => text.includes(term))
      ? 'high'
      : 'normal';

  return { ...result, intent, urgency };
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const MAX_PROMPT_LENGTH = 8000;
const MAX_CONTEXT_LENGTH = 24000;
const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

const DRAGO_SYSTEM_INSTRUCTION = `You are DRAGO, the official AI assistant of PunchX.

You are a highly capable conversational assistant. Gemini is the only AI engine. Understand the user's meaning, not just keywords, and continue naturally from the supplied conversation context.

LANGUAGE AND NLP
- Understand English, Hindi, Bengali, Hinglish, Banglish, Romanized Hindi/Bengali, transliteration, slang, abbreviations, typos, missing punctuation, grammar mistakes, mixed languages and informal speech.
- Respond naturally in the user's language. Do not translate unless requested.
- Understand very short follow-ups such as "yes", "no", "book it", "same one", "that guy", "tomorrow", "do it", "cancel", and resolve them from context.
- If a message is ambiguous, use the conversation context before asking a question.

ISSUE/PROBLEM UNDERSTANDING — IMPORTANT
When the user describes ANY issue, complaint, problem, difficulty, failure, symptom, service need, or real-world situation:
1. Understand the actual meaning and desired outcome.
2. Identify the likely intent and relevant PunchX service/workflow.
3. Infer whether the situation appears urgent or safety-sensitive.
4. Infer sentiment cautiously (for example worried, frustrated, confused, disappointed, neutral or positive).
5. Respond to the user's actual problem, not merely the wording.
6. Acknowledge the difficulty briefly when appropriate, then provide a useful solution or next step.
7. Do not repeatedly ask the user to restate information already present in the conversation.
8. If PunchX data is needed, clearly state what information is missing rather than inventing it.
9. Never treat an uncertain sentiment inference as fact. Say "It sounds like..." rather than "You are...".

Examples:
- "bhai bathroom e pani porchhe" -> understand as a likely plumbing/water-leak issue and help with safe next steps.
- "app e booking hocche na" -> understand as a PunchX booking/app problem and troubleshoot or guide support.
- "worker aseni" -> understand as a missed professional/booking issue and ask only for the minimum information needed to investigate.
- "ami khub frustrated" -> acknowledge the frustration and focus on resolving the stated problem.

SENTIMENT-AWARE CONVERSATION
- Frustrated: acknowledge briefly, stay calm, move toward a solution.
- Worried: reassure without unsupported promises and prioritize safety if relevant.
- Confused: simplify and give clear steps.
- Disappointed: acknowledge the problem without being defensive.
- Positive/excited: respond naturally without excessive hype.
- Neutral: be direct and efficient.
- Never claim to have emotions yourself and never manipulate the user.

CONVERSATION CONTINUITY
- Treat supplied context as private conversation/application context for this user.
- Resolve pronouns and references such as "it", "that", "there", "same person", "last booking", "my previous order", etc.
- If the application context supplies a saved customer service location, treat it as the user's known location and do not ask for it again. Only ask for location when it is missing or the user wants to change the service address.
- Use known location only for relevant service matching and routing. Do not expose precise location unnecessarily in the response.
- Prefer the latest explicit correction over older context.
- Retain relevant facts while the conversation continues.
- Ask only one concise clarification when information is genuinely missing.

PUNCHX
- PunchX is a local-services marketplace connecting customers with independent local professionals.
- Website: https://www.punchxapp.co.in/
- Founder & COO: Rimil Das.
- Co-Founder & CEO: Abhradip Ghosh.
- Primary focus: Kolkata, West Bengal, India, with expansion planned.
- Known services include electrician, plumber, cleaning, beautician and other local professional services. Use current application data when supplied; do not assume a service is available.

SERVICE AND BOOKING INTELLIGENCE
- Understand a customer's described problem and infer the appropriate service category.
- Use only real professional/service information supplied by PunchX.
- Never invent a professional, price, rating, availability, ETA, booking, payment or address.
- A recommendation is not a booking.
- Obtain clear confirmation before a booking or payment action.

SAFETY
- For electrical sparking, fire, gas smell, flooding, structural danger or other immediate hazards, prioritize getting to safety and appropriate local emergency/building support.
- Do not provide dangerous repair instructions.
- Never claim an emergency service or professional was contacted unless the application explicitly confirms it.

PRIVACY AND SECURITY
- Never request, expose or guess passwords, API keys, OTPs, authentication tokens, payment secrets or other credentials.
- Never expose one user's private information to another user.
- Treat application context as confidential.

SUPPORT
- Known general PunchX support email: punchxservice@gmail.com.
- Never invent a phone number or other contact detail.

RESPONSE QUALITY
- Answer the latest request first.
- Be concise for simple questions and structured for complex issues.
- Avoid generic filler and repetitive greetings.
- Use bullets/steps when helpful.
- If information is unavailable, say what is missing and give the safest useful next step.
- Never fabricate facts, actions or system capabilities.
- Never expose hidden reasoning or internal classifications.
`;

function normalizeContext(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, MAX_CONTEXT_LENGTH) : '';
}

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return key?.trim() || null;
}

function statusFromError(error: any): number {
  return Number(error?.status || error?.statusCode || error?.response?.status) || 500;
}

function messageFromError(error: any): string {
  return String(error?.message || error?.error?.message || error || 'Unknown Gemini error');
}

async function generateWithGemini(prompt: string, context: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server');

  const ai = new GoogleGenAI({ apiKey });
  const configuredModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const models = [...new Set([configuredModel, DEFAULT_GEMINI_MODEL, 'gemini-3.7-flash', 'gemini-3.6-flash'])];

  const contextBlock = context
    ? `PRIVATE PUNCHX CONVERSATION AND APPLICATION CONTEXT FOR THIS USER:\n${context}\n\n`
    : '';
  const fullInput = `${contextBlock}LATEST USER MESSAGE:\n${prompt}`;

  let lastError: any = null;

  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: fullInput }] }],
        config: {
          systemInstruction: DRAGO_SYSTEM_INSTRUCTION,
          maxOutputTokens: 700,
          thinkingConfig: { thinkingLevel: 'low' },
        },
      });

      const text = result.text?.trim();
      if (text) return text;
      lastError = new Error(`Gemini returned an empty response from ${model}`);
    } catch (error: any) {
      lastError = error;
      const status = statusFromError(error);
      console.error(`DRAGO Gemini ${model} error:`, messageFromError(error));
      if (![400, 404, 408, 409, 429, 500, 502, 503, 504].includes(status)) break;
    }
  }

  throw lastError || new Error('Gemini request failed');
}

async function streamWithGemini(prompt: string, context: string, res: VercelResponse): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server');

  const ai = new GoogleGenAI({ apiKey });
  const configuredModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const models = [...new Set([configuredModel, DEFAULT_GEMINI_MODEL, 'gemini-3.7-flash', 'gemini-3.6-flash'])];

  const contextBlock = context
    ? `PRIVATE PUNCHX CONVERSATION AND APPLICATION CONTEXT FOR THIS USER:\n${context}\n\n`
    : '';
  const fullInput = `${contextBlock}LATEST USER MESSAGE:\n${prompt}`;

  let lastError: any = null;

  for (const model of models) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: [{ role: 'user', parts: [{ text: fullInput }] }],
        config: {
          systemInstruction: DRAGO_SYSTEM_INSTRUCTION,
          maxOutputTokens: 700,
          thinkingConfig: { thinkingLevel: 'low' },
        },
      });

      let sentText = false;
      for await (const chunk of stream) {
        const text = chunk.text || '';
        if (text) {
          sentText = true;
          res.write(`data: ${JSON.stringify({ text })}\\n\\n`);
        }
      }

      if (sentText) {
        res.write('data: [DONE]\\n\\n');
        return;
      }

      lastError = new Error(`Gemini returned an empty response from ${model}`);
    } catch (error: any) {
      lastError = error;
      const status = statusFromError(error);
      console.error(`DRAGO Gemini stream ${model} error:`, messageFromError(error));
      if (![400, 404, 408, 409, 429, 500, 502, 503, 504].includes(status)) break;
    }
  }

  throw lastError || new Error('Gemini request failed');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, context } = req.body || {};

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt parameter is required' });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(413).json({
        error: `Prompt is too long. Maximum ${MAX_PROMPT_LENGTH} characters.`,
      });
    }

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    await streamWithGemini(prompt.trim(), normalizeContext(context).slice(0, 10000), res);
    return res.end();
  } catch (error: any) {
    const status = statusFromError(error);
    const message = messageFromError(error);
    console.error('DRAGO Gemini request failed:', message);

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'DRAGO could not process your request right now. Please try again shortly.' })}\\n\\n`);
      res.write('data: [DONE]\\n\\n');
      return res.end();
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'DRAGO AI is not configured correctly. Please check the Gemini API key in the server environment.',
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: 'DRAGO is temporarily busy. Please try again shortly.',
      });
    }

    if (message.includes('GEMINI_API_KEY is not configured')) {
      return res.status(503).json({
        error: 'DRAGO AI is not configured on the server. Add GEMINI_API_KEY to the Vercel Production environment.',
        code: 'GEMINI_CONFIG_MISSING',
      });
    }

    if (status === 404) {
      return res.status(502).json({
        error: 'DRAGO could not access an available Gemini model for this server configuration. Please check the Gemini API key/project and redeploy the latest PunchX version.',
        code: 'GEMINI_MODEL_NOT_FOUND',
      });
    }

    if (status === 400) {
      return res.status(400).json({
        error: 'DRAGO sent an invalid request to Gemini. Please try again.',
        code: 'GEMINI_BAD_REQUEST',
      });
    }

    return res.status(500).json({
      error: 'DRAGO could not process your request right now. Please try again shortly.',
      code: 'GEMINI_REQUEST_FAILED',
      ...(process.env.NODE_ENV === 'development' ? { detail: message } : {}),
    });
  }
}

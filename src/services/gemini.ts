// Client-side DRAGO service. Firebase is loaded only when DRAGO actually sends a request.
// Backboard thread state is persisted locally so the same authenticated user can continue
// the same conversation across page renders while Backboard keeps long-term memory.
const DRAGO_THREAD_STORAGE_KEY = 'punchx_drago_thread_id';

export async function getAIResponse(userMessage: string, context = ''): Promise<string> {
  const prompt = userMessage.trim();
  if (!prompt) return 'Please enter a valid query for DRAGO AI.';

  try {
    let token = '';
    try {
      const { auth } = await import('../lib/firebase');
      if (auth?.currentUser) token = await auth.currentUser.getIdToken();
    } catch (authError) {
      console.warn('DRAGO auth context unavailable; using Gemini fallback.', authError);
    }

    let threadId = '';
    try {
      threadId = window.localStorage.getItem(DRAGO_THREAD_STORAGE_KEY) || '';
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        prompt,
        context: context.slice(0, 12000),
        ...(threadId ? { threadId } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data?.error || `DRAGO service is temporarily unavailable (status ${res.status}).`;

    if (typeof data?.threadId === 'string' && data.threadId) {
      try {
        window.localStorage.setItem(DRAGO_THREAD_STORAGE_KEY, data.threadId);
      } catch {
        // Conversation still works without local persistence.
      }
    }

    return data?.response || 'DRAGO did not return a response. Please try again.';
  } catch (error) {
    console.error('DRAGO client proxy error:', error);
    return 'DRAGO is temporarily unavailable. Please try again shortly.';
  }
}

export function clearDragoConversation(): void {
  try {
    window.localStorage.removeItem(DRAGO_THREAD_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

// Client-side DRAGO service. Firebase is loaded only when DRAGO actually sends a request.
// Backboard thread state is persisted locally so the same authenticated user can continue
// the same conversation across page renders while Backboard keeps long-term memory.
const DRAGO_THREAD_STORAGE_KEY = 'punchx_drago_thread_id';

async function getFirebaseToken(): Promise<string> {
  try {
    const { auth } = await import('../lib/firebase');
    if (auth?.currentUser) return await auth.currentUser.getIdToken();
  } catch (error) {
    console.warn('DRAGO auth context unavailable:', error);
  }
  return '';
}

export async function getAIResponse(userMessage: string, context = ''): Promise<string> {
  const prompt = userMessage.trim();
  if (!prompt) return 'Please enter a valid query for DRAGO AI.';

  try {
    const token = await getFirebaseToken();
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
    if (!res.ok) {
      console.error('DRAGO API error:', res.status, data?.error || data);
      return data?.error || 'DRAGO is temporarily unavailable. Please try again shortly.';
    }

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

/**
 * Clears both the browser's active thread and the server-side Backboard
 * assistant/memory for the authenticated PunchX account.
 */
export async function clearDragoConversation(): Promise<boolean> {
  const token = await getFirebaseToken();

  try {
    const res = await fetch('/api/drago-clear-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('DRAGO memory clear error:', res.status, data?.error || data);
      return false;
    }

    try {
      window.localStorage.removeItem(DRAGO_THREAD_STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
    return true;
  } catch (error) {
    console.error('DRAGO memory clear request failed:', error);
    return false;
  }
}

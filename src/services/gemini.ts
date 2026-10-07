// Client-side DRAGO service.
// Gemini is the only AI engine. Conversation memory is supplied from PunchX's
// existing local/app memory so no third-party AI memory service is required.

export async function getAIResponse(userMessage: string, context = ''): Promise<string> {
  const prompt = userMessage.trim();
  if (!prompt) return 'Please enter a valid query for DRAGO AI.';

  try {
    const { auth } = await import('../lib/firebase');
    const user = auth.currentUser;
    if (!user) return 'Please sign in to PunchX before using DRAGO.';
    const idToken = await user.getIdToken();

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        prompt,
        context: context.slice(0, 12000),
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return data?.error || 'DRAGO is temporarily unavailable. Please try again shortly.';
      }
      return typeof data?.response === 'string' && data.response.trim()
        ? data.response.trim()
        : 'DRAGO did not return a response. Please try again.';
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.error || 'DRAGO is temporarily unavailable. Please try again shortly.';
    }

    if (!res.body) {
      return 'DRAGO did not return a response. Please try again.';
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let responseText = '';

    const processEvent = (event: string) => {
      for (const line of event.split(/\r?\n/)) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;

        try {
          const parsed = JSON.parse(payload);
          if (typeof parsed?.text === 'string') responseText += parsed.text;
          if (typeof parsed?.error === 'string' && !responseText) responseText = parsed.error;
        } catch {
          // Ignore malformed SSE frames rather than failing the entire response.
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';

      for (const event of events) processEvent(event);
    }

    buffer += decoder.decode();
    if (buffer.trim()) processEvent(buffer);

    return responseText.trim() || 'DRAGO did not return a response. Please try again.';
  } catch (error) {
    console.error('DRAGO Gemini client error:', error);
    return 'DRAGO is temporarily unavailable. Please try again shortly.';
  }
}

export function clearDragoConversation(): void {
  // Conversation history is managed by the PunchX DRAGO memory service/component.
  // No Backboard thread or third-party AI state is used anymore.
}

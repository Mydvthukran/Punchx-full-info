// Client-side DRAGO service.
// Gemini is the only AI engine. Conversation memory is supplied from PunchX's
// existing local/app memory so no third-party AI memory service is required.
export async function getAIResponse(userMessage: string, context = ''): Promise<string> {
  const prompt = userMessage.trim();
  if (!prompt) return 'Please enter a valid query for DRAGO AI.';

  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        context: context.slice(0, 24000),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return data?.error || 'DRAGO is temporarily unavailable. Please try again shortly.';
    }

    return data?.response || 'DRAGO did not return a response. Please try again.';
  } catch (error) {
    console.error('DRAGO Gemini client error:', error);
    return 'DRAGO is temporarily unavailable. Please try again shortly.';
  }
}

export function clearDragoConversation(): void {
  // Conversation history is managed by the PunchX DRAGO memory service/component.
  // No Backboard thread or third-party AI state is used anymore.
}

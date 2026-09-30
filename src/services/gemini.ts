// Client-side DRAGO service. Firebase is loaded only when DRAGO actually sends
// a request so Firebase initialization cannot prevent the PunchX public shell
// from starting.
export async function getAIResponse(userMessage: string): Promise<string> {
  const prompt = userMessage.trim();
  if (!prompt) {
    return 'Please enter a valid query for DRAGO AI.';
  }

  try {
    let token = '';

    // Authentication is loaded lazily. DRAGO can still answer public questions
    // when there is no signed-in Firebase user.
    try {
      const { auth } = await import('../lib/firebase');
      if (auth?.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
    } catch (authError) {
      console.warn('DRAGO auth context unavailable; continuing without token.', authError);
    }

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return data?.error || `DRAGO service is temporarily unavailable (status ${res.status}).`;
    }

    return data?.response || 'DRAGO did not return a response. Please try again.';
  } catch (error) {
    console.error('DRAGO client proxy error:', error);
    return 'DRAGO is temporarily unavailable. Please try again shortly.';
  }
}

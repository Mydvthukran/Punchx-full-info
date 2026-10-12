/**
 * NamoID SDK fetch adapter.
 *
 * Let NamoID resolve its real issuer, OpenID discovery document and signing
 * keys from the configured public Client ID. Do not hard-code discovery/JWKS:
 * those values can rotate and a stale key can break OTP sign-in callbacks.
 *
 * Only proxy the authorization-code token exchange to avoid browser CORS
 * restrictions. Credentials and OTPs remain on NamoID Hosted Auth.
 */
export const namoidFetcher: typeof fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  const isTokenEndpoint = /\/oauth\/token(?:\?|$)/i.test(url);
  if (!isTokenEndpoint || (init?.method || 'GET').toUpperCase() !== 'POST') {
    return fetch(input, init);
  }

  const proxyUrl = `/api/namoid-proxy?url=${encodeURIComponent(url)}`;
  const headers = new Headers(init?.headers);
  headers.set('accept', 'application/json');
  headers.set('content-type', 'application/x-www-form-urlencoded');

  let body = init?.body;
  if (body instanceof URLSearchParams) {
    body = body.toString();
  } else if (body instanceof FormData) {
    const params = new URLSearchParams();
    body.forEach((value, key) => {
      if (typeof value === 'string') params.append(key, value);
    });
    body = params.toString();
  } else if (body && typeof body !== 'string') {
    body = String(body);
  }

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
    });

    // A missing API route on a preview/legacy deployment may be bypassed
    // only by trying the official discovered endpoint directly.
    if (response.status !== 404 && response.status !== 405) {
      return response;
    }
  } catch (error) {
    console.warn('NamoID token proxy unavailable; trying discovered endpoint.', error);
  }

  return fetch(url, {
    method: 'POST',
    headers,
    body,
    cache: 'no-store',
  });
};

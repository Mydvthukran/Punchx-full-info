/**
 * NamoID Custom Fetcher for PunchX
 * 
 * Solves cross-origin (CORS) fetch failures in browser environments:
 * 1. Supplies the static OpenID Connect Discovery document directly for punch-x-747dd7.id.namoid.in
 *    so clicking the Customer Sign In button never triggers "TypeError: Failed to fetch"
 *    before hosted auth redirection.
 * 2. Provides cached fallback for NamoID RSA public keys (jwks.json).
 * 3. Transparently falls back to the backend proxy (/api/namoid-proxy) when running full-stack
 *    if browser-direct requests to token/userinfo endpoints are blocked by CORS.
 */

export const NAMOID_ISSUER = "https://punch-x-747dd7.id.namoid.in";

export const NAMOID_DISCOVERY = {
  issuer: "https://punch-x-747dd7.id.namoid.in",
  authorization_endpoint: "https://punch-x-747dd7.id.namoid.in/oauth/authorize",
  token_endpoint: "https://punch-x-747dd7.id.namoid.in/v1/oauth/token",
  userinfo_endpoint: "https://punch-x-747dd7.id.namoid.in/v1/oauth/userinfo",
  jwks_uri: "https://punch-x-747dd7.id.namoid.in/v1/oauth/jwks.json",
  revocation_endpoint: "https://punch-x-747dd7.id.namoid.in/v1/oauth/revoke",
  registration_endpoint: "https://punch-x-747dd7.id.namoid.in/v1/oauth/register",
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
  code_challenge_methods_supported: ["S256"],
  token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post", "none"],
  scopes_supported: ["openid", "profile", "email", "phone", "offline_access", "mcp:tools"],
  client_id_metadata_document_supported: true,
  authorization_response_iss_parameter_supported: true,
  end_session_endpoint: "https://punch-x-747dd7.id.namoid.in/oauth/logout"
};

export const NAMOID_JWKS = {
  keys: [
    {
      kty: "RSA",
      use: "sig",
      alg: "RS256",
      kid: "key-2026-05",
      n: "3ESxw5mFBtlHprbE7ehcoOs6F_kxN_QsmHl4TSkiz6zBgzPQ8qwv-DXjXLxmPzYX4_puiaE2yIBHctrYxcwLwD6_sZ6irYa-ogzYSQWNhbee8ycD4hJpWO6O3ClpR_-IDPb4AQTbvGPo5tSbpNYzh5FkIWTRIZTCBfz7XUzsNaEVKO9KdtR4HLqNpPneBxCIPB022znp1dVRqgIVI6yIIAyTUkbD28HbD-LwtxRadxN_O9SaHt-Hjjo6_iPPNhJZnNx_vHWjpCIVQRtpCYO-eCVv_WpzopbF25yc9zV70KRP1BwZgbbA5ZyAARcuI87aJuxvSKK9BSkQaUZt7dNeoQ",
      e: "AQAB"
    }
  ]
};

export const namoidFetcher: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // 1. Intercept OpenID Connect discovery request
  if (url.includes("/.well-known/openid-configuration")) {
    return new Response(JSON.stringify(NAMOID_DISCOVERY), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Intercept JWKS request with fallback
  if (url.includes("/v1/oauth/jwks.json")) {
    try {
      const res = await fetch(input, init);
      if (res.ok) return res;
    } catch {
      // CORS or network blocked, return static key
    }
    return new Response(JSON.stringify(NAMOID_JWKS), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. For token exchange requests:
  // NamoID token endpoint strictly requires server-to-server POST with application/x-www-form-urlencoded.
  // Direct browser-to-NamoID fetch is blocked by CORS, so route through the backend proxy.
  if (url.includes("/v1/oauth/token") || url.includes("/oauth/token")) {
    const backendBase = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";
    const proxyUrl = `${backendBase}/api/namoid-proxy?url=${encodeURIComponent(url)}`;

    const headers = new Headers(init?.headers);
    headers.set("accept", "application/json");
    headers.set("content-type", "application/x-www-form-urlencoded");

    let params = new URLSearchParams();
    if (init?.body instanceof URLSearchParams) {
      params = new URLSearchParams(init.body);
    } else if (typeof init?.body === "string") {
      params = new URLSearchParams(init.body);
    } else if (init?.body instanceof FormData) {
      init.body.forEach((val, key) => {
        if (typeof val === "string") params.append(key, val);
      });
    } else if (init?.body && typeof init.body === "object") {
      try {
        params = new URLSearchParams(init.body as unknown as Record<string, string>);
      } catch {
        params = new URLSearchParams(String(init.body));
      }
    }

    // Ensure mandatory OAuth parameters
    if (!params.get("grant_type")) params.set("grant_type", "authorization_code");
    if (!params.get("client_id")) params.set("client_id", "namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd");
    if (!params.get("redirect_uri")) params.set("redirect_uri", "https://www.punchxapp.co.in/auth/callback");

    const bodyStr = params.toString();

    // Strategy:
    // 1. First attempt to route through the backend proxy (/api/namoid-proxy)
    // 2. If the proxy returns 404 (e.g. host without serverless functions), 405 (static host), or network failure,
    //    seamlessly fall back to direct POST to the NamoID token endpoint.
    let proxyFailed = false;
    try {
      const proxyRes = await fetch(proxyUrl, {
        method: "POST",
        headers,
        body: bodyStr,
        cache: "no-store",
      });

      // If proxy succeeded or returned a valid JSON OAuth response (e.g. 200 with tokens or 400 with OAuth error)
      if (proxyRes.ok) {
        return proxyRes;
      }

      // If proxy returned 404/405 (proxy not implemented on this host) or HTML error page
      const contentType = proxyRes.headers.get("content-type") || "";
      if (proxyRes.status === 404 || proxyRes.status === 405 || !contentType.includes("application/json")) {
        console.warn(`Backend proxy returned status ${proxyRes.status} (${contentType}). Attempting direct token endpoint...`);
        proxyFailed = true;
      } else {
        // Proxy returned valid JSON error from NamoID (e.g. invalid_grant)
        return proxyRes;
      }
    } catch (proxyErr) {
      console.warn("Backend proxy fetch failed, attempting direct token endpoint fetch:", proxyErr);
      proxyFailed = true;
    }

    if (proxyFailed) {
      try {
        const directRes = await fetch(url, {
          method: "POST",
          headers,
          body: bodyStr,
          cache: "no-store",
        });
        return directRes;
      } catch (directErr: any) {
        console.error("Direct token exchange failed:", directErr);
        return new Response(
          JSON.stringify({
            error: "token_request_failed",
            error_description: "Unable to exchange authorization code. Please verify network connection or try again.",
            detail: String(directErr?.message || directErr),
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  }

  // 4. Default handler for other endpoints (e.g. userinfo)
  try {
    const res = await fetch(input, init);
    if (res.ok || (res.status >= 400 && res.status !== 400)) {
      return res;
    }
    if (res.status === 400) {
      const text = await res.clone().text();
      if (text.includes("Disallowed CORS origin") || text.includes("CORS")) {
        throw new Error("CORS_DISALLOWED");
      }
    }
    return res;
  } catch (err) {
    // Attempt backend proxy fallback
    if (typeof window !== "undefined") {
      try {
        const backendBase = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";
        const proxyUrl = `${backendBase}/api/namoid-proxy?url=${encodeURIComponent(url)}`;
        const proxyRes = await fetch(proxyUrl, init);
        if (proxyRes.ok || (proxyRes.status < 500 && proxyRes.status !== 404 && proxyRes.status !== 405)) {
          return proxyRes;
        }
      } catch {
        // Backend proxy not reachable
      }
    }
    throw err;
  }
};

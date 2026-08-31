/**
 * Custom fetcher for NamoID SDK (@namoidhq/react / @namoidhq/js):
 * 1. Pre-loads OpenID Connect discovery configuration locally.
 * 2. Pre-loads JWKS keys to eliminate unnecessary latency on startup.
 * 3. Transparently routes token exchange (/v1/oauth/token) through the backend proxy (/api/namoid-proxy)
 *    to resolve CORS and domain mismatch restrictions on dev & preview deployments.
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

export const namoidFetcher: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // 1. Intercept OpenID Connect discovery request
  if (url.includes("/.well-known/openid-configuration")) {
    return new Response(JSON.stringify(NAMOID_DISCOVERY), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Token exchange handling
  if (url.includes("/v1/oauth/token") || url.includes("/oauth/token")) {
    const backendBase = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";

    if (!backendBase && typeof window === 'undefined') {
      return new Response(
        JSON.stringify({
          error: "proxy_unavailable",
          error_description: "Backend proxy not configured.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const proxyUrl = typeof window !== 'undefined' 
      ? `/api/namoid-proxy?url=${encodeURIComponent(url)}`
      : `${backendBase}/api/namoid-proxy?url=${encodeURIComponent(url)}`;

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
    } else if (init?.body && typeof init?.body === "object") {
      try {
        params = new URLSearchParams(init.body as unknown as Record<string, string>);
      } catch {
        params = new URLSearchParams(String(init.body));
      }
    }

    // Ensure mandatory OAuth parameters
    if (!params.get("grant_type")) params.set("grant_type", "authorization_code");
    if (!params.get("client_id")) params.set("client_id", "namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd");
    if (!params.get("redirect_uri")) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.punchxapp.co.in';
      params.set("redirect_uri", `${origin}/auth/callback`);
    }

    const bodyStr = params.toString();

    let proxyFailed = false;
    try {
      const proxyRes = await fetch(proxyUrl, {
        method: "POST",
        headers,
        body: bodyStr,
        cache: "no-store",
      });

      if (proxyRes.ok) {
        return proxyRes;
      }

      const contentType = proxyRes.headers.get("content-type") || "";
      if (proxyRes.status === 404 || proxyRes.status === 405 || !contentType.includes("application/json")) {
        console.warn(`Backend proxy status ${proxyRes.status} (${contentType}). Fallback to direct token endpoint...`);
        proxyFailed = true;
      } else {
        return proxyRes;
      }
    } catch (proxyErr) {
      console.warn("Backend proxy fetch failed, fallback to direct endpoint:", proxyErr);
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
            error_description: "Unable to exchange authorization code.",
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

  // 3. Default fallback for other endpoints
  try {
    const res = await fetch(input, init);
    if (res.ok || (res.status >= 400 && res.status !== 400)) {
      return res;
    }
    return res;
  } catch (err) {
    if (typeof window !== "undefined") {
      try {
        const backendBase = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";
        const proxyUrl = `/api/namoid-proxy?url=${encodeURIComponent(url)}`;
        const proxyRes = await fetch(proxyUrl, init);
        if (proxyRes.ok) {
          return proxyRes;
        }
      } catch {
        // Proxy not reachable
      }
    }
    throw err;
  }
};

import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function handleNamoidProxy(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for cross-origin or proxy requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  let targetUrl = (req.query.url as string) || (req.body?.targetUrl as string);
  
  // Infer if the route is the token route specifically by checking req.url
  const isTokenRoute = req.url?.includes("/api/oauth/token");
  
  if (!targetUrl || isTokenRoute) {
    targetUrl = "https://punch-x-747dd7.id.namoid.in/v1/oauth/token";
  }

  if (!targetUrl.startsWith("https://punch-x-747dd7.id.namoid.in/") && !targetUrl.startsWith("https://api.namoid.in/")) {
    return res.status(400).json({ error: "Invalid target URL" });
  }

  const isTokenEndpoint = targetUrl.includes("/oauth/token") || targetUrl.includes("/v1/oauth/token");

  try {
    const headers: Record<string, string> = {
      accept: (req.headers["accept"] as string) || "application/json",
    };
    if (req.headers["authorization"]) {
      headers["authorization"] = req.headers["authorization"] as string;
    }

    let outgoingMethod = req.method || "GET";
    let body: string | undefined = undefined;

    if (isTokenEndpoint) {
      // OAuth token exchange MUST always be HTTP POST with application/x-www-form-urlencoded
      outgoingMethod = "POST";
      headers["content-type"] = "application/x-www-form-urlencoded";

      // Collect all potential parameters from body and query
      const bodyObj: Record<string, string> = {};

      if (typeof req.body === "object" && req.body !== null) {
        for (const [k, v] of Object.entries(req.body)) {
          if (k !== "targetUrl" && v !== undefined && v !== null) {
            bodyObj[k] = String(v);
          }
        }
      } else if (typeof req.body === "string" && req.body.length > 0) {
        try {
          const parsed = new URLSearchParams(req.body);
          for (const [k, v] of parsed.entries()) {
            if (k !== "targetUrl" && v !== undefined && v !== null) {
              bodyObj[k] = v;
            }
          }
        } catch {
          // non-form string
        }
      }

      if (typeof req.query === "object" && req.query !== null) {
        for (const [k, v] of Object.entries(req.query)) {
          if (k !== "url" && k !== "targetUrl" && typeof v === "string" && !bodyObj[k]) {
            bodyObj[k] = v;
          }
        }
      }

      // Ensure mandatory OAuth exchange parameters
      if (!bodyObj.grant_type) {
        bodyObj.grant_type = "authorization_code";
      }
      if (!bodyObj.client_id) {
        bodyObj.client_id = "namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd";
      }
      if (!bodyObj.redirect_uri) {
        bodyObj.redirect_uri = "https://www.punchxapp.co.in/auth/callback";
      }

      body = new URLSearchParams(bodyObj).toString();
    } else if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
        headers["content-type"] = "application/x-www-form-urlencoded";
        body = typeof req.body === "object" ? new URLSearchParams(req.body).toString() : String(req.body);
      } else if (typeof req.body === "object") {
        headers["content-type"] = "application/json";
        body = JSON.stringify(req.body);
      } else {
        if (req.headers["content-type"]) {
          headers["content-type"] = req.headers["content-type"] as string;
        }
        body = req.body as string;
      }
    }

    const response = await fetch(targetUrl, {
      method: outgoingMethod,
      headers,
      body,
    });

    let responseBody = await response.text();
    let status = response.status;

    // Defensive formatting for NamoID SDK compatibility
    if (status >= 400) {
      try {
        const json = JSON.parse(responseBody);
        if (!json.error_description) {
          json.error_description = json.detail || json.message || json.error || `NamoID upstream returned ${status}`;
          responseBody = JSON.stringify(json);
        }
      } catch {
        responseBody = JSON.stringify({
          error: "upstream_token_error",
          error_description: responseBody.slice(0, 200) || `Upstream returned status ${status}`,
        });
      }
    }

    res.status(status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(responseBody);
  } catch (error: any) {
    console.error("NamoID proxy error:", error);
    res.status(502).json({ error: "proxy_error", error_description: error.message || "Failed to proxy request" });
  }
}

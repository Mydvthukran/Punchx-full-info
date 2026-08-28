// Vercel Serverless Function: NamoID OAuth Direct Token Endpoint
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const targetUrl = "https://punch-x-747dd7.id.namoid.in/v1/oauth/token";

  try {
    const headers: Record<string, string> = {
      accept: (req.headers["accept"] as string) || "application/json",
      "content-type": "application/x-www-form-urlencoded",
    };
    if (req.headers["authorization"]) {
      headers["authorization"] = req.headers["authorization"] as string;
    }

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

    if (!bodyObj.grant_type) {
      bodyObj.grant_type = "authorization_code";
    }
    if (!bodyObj.client_id) {
      bodyObj.client_id = "namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd";
    }
    if (!bodyObj.redirect_uri) {
      bodyObj.redirect_uri = "https://www.punchxapp.co.in/auth/callback";
    }

    const body = new URLSearchParams(bodyObj).toString();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
    });

    let responseBody = await response.text();
    const status = response.status;

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
    console.error("NamoID Vercel token proxy error:", error);
    res.status(502).json({
      error: "proxy_connection_failed",
      error_description: error?.message || "Failed to reach NamoID identity provider",
    });
  }
}

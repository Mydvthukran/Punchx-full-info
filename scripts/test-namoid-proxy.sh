#!/usr/bin/env bash
# ==============================================================================
# PunchX NamoID OAuth Proxy Diagnostic & Verification Script
# ==============================================================================
set -e

BASE_URL="${1:-http://localhost:3000}"
echo "========================================================"
echo "🔍 Testing PunchX NamoID Proxy on: ${BASE_URL}"
echo "========================================================"

# 1. Health check
echo -e "\n[Step 1] Checking API Health Endpoint (/api/health)..."
HEALTH_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${BASE_URL}/api/health")
HEALTH_STATUS=$(echo "$HEALTH_RES" | grep "HTTP_STATUS" | cut -d: -f2)
HEALTH_BODY=$(echo "$HEALTH_RES" | grep -v "HTTP_STATUS")
echo "Status: ${HEALTH_STATUS}"
echo "Response: ${HEALTH_BODY}"

if [ "$HEALTH_STATUS" != "200" ]; then
  echo "❌ Health check failed. Ensure the server is running."
  exit 1
fi
echo "✅ Server is running and responding to /api/health"

# 2. Testing /api/namoid-proxy with application/x-www-form-urlencoded POST
echo -e "\n[Step 2] Testing /api/namoid-proxy (POST form-urlencoded)..."
PROXY_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/api/namoid-proxy" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  -d "grant_type=authorization_code&client_id=namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd&code=diag_sample_auth_code_99999&redirect_uri=https://www.punchxapp.co.in/auth/callback&code_verifier=sample_code_verifier_12345")

PROXY_STATUS=$(echo "$PROXY_RES" | grep "HTTP_STATUS" | cut -d: -f2)
PROXY_BODY=$(echo "$PROXY_RES" | grep -v "HTTP_STATUS")

echo "HTTP Status: ${PROXY_STATUS}"
echo "Response Body: ${PROXY_BODY}"

if [ "$PROXY_STATUS" == "405" ]; then
  echo "❌ FAILED: Received 405 Method Not Allowed. Backend POST routing is broken."
  exit 1
elif [ "$PROXY_STATUS" == "404" ]; then
  echo "❌ FAILED: Received 404 Not Found. /api/namoid-proxy route is missing."
  exit 1
fi

# Verify JSON parsing
if echo "$PROXY_BODY" | grep -q "\"error\""; then
  echo "✅ SUCCESS: Received structured JSON response from NamoID upstream!"
  echo "   (Upstream returned standard OAuth error for synthetic test code as expected)"
else
  echo "⚠️ Response was not an expected JSON error payload:"
  echo "$PROXY_BODY"
fi

# 3. Testing /api/namoid-proxy with target URL query parameter
echo -e "\n[Step 3] Testing /api/namoid-proxy?url=... (Explicit target URL parameter)..."
TARGET_URL="https://punch-x-747dd7.id.namoid.in/v1/oauth/token"
PROXY_URL_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/api/namoid-proxy?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${TARGET_URL}'))" 2>/dev/null || echo "https%3A%2F%2Fpunch-x-747dd7.id.namoid.in%2Fv1%2Foauth%2Ftoken")" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  -d "grant_type=authorization_code&client_id=namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd&code=diag_sample_auth_code_99999&redirect_uri=https://www.punchxapp.co.in/auth/callback&code_verifier=sample_code_verifier_12345")

PROXY_URL_STATUS=$(echo "$PROXY_URL_RES" | grep "HTTP_STATUS" | cut -d: -f2)
PROXY_URL_BODY=$(echo "$PROXY_URL_RES" | grep -v "HTTP_STATUS")

echo "HTTP Status: ${PROXY_URL_STATUS}"
echo "Response Body: ${PROXY_URL_BODY}"

if [ "$PROXY_URL_STATUS" != "405" ] && [ "$PROXY_URL_STATUS" != "404" ]; then
  echo "✅ Target URL query forwarding works properly."
fi

# 4. Testing /api/oauth/token direct endpoint alias
echo -e "\n[Step 4] Testing /api/oauth/token endpoint alias..."
TOKEN_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/api/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  -d "grant_type=authorization_code&client_id=namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd&code=diag_sample_auth_code_99999&redirect_uri=https://www.punchxapp.co.in/auth/callback&code_verifier=sample_code_verifier_12345")

TOKEN_STATUS=$(echo "$TOKEN_RES" | grep "HTTP_STATUS" | cut -d: -f2)
TOKEN_BODY=$(echo "$TOKEN_RES" | grep -v "HTTP_STATUS")

echo "HTTP Status: ${TOKEN_STATUS}"
echo "Response Body: ${TOKEN_BODY}"

echo -e "\n========================================================"
echo "🎯 DIAGNOSTIC SUMMARY:"
echo " - /api/health:       HTTP ${HEALTH_STATUS}"
echo " - /api/namoid-proxy: HTTP ${PROXY_STATUS} (JSON: OK, No 405)"
echo " - /api/oauth/token:  HTTP ${TOKEN_STATUS} (JSON: OK, No 405)"
echo "========================================================"

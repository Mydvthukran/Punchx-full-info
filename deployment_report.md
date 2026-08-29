# Deployment Architecture Report & Migration Plan

This report outlines the root cause of the `405 Method Not Allowed` authentication error in production and proposes the necessary architectural changes required to support the PunchX full-stack application on the web.

## 1. Problem Analysis

### Current Architecture
Currently, the application is being built and deployed to **GitHub Pages** using the `.github/workflows/deploy.yml` GitHub Actions workflow.

### The Root Cause
GitHub Pages is a **Static Site Hosting Provider**. It is designed to serve only static HTML, CSS, and JavaScript files. It **does not support running Node.js server applications**. 

Because of this limitation, the `server.ts` file in your repository is completely ignored during the deployment process. Consequently, none of your backend infrastructure is running in production:

1. **Authentication Failures (405 Error):** The frontend relies on the `/api/namoid-proxy` endpoint in `server.ts` to securely exchange OAuth tokens with NamoID (avoiding browser CORS blocks). Since GitHub Pages does not have an active server to handle this `POST` request, it rejects it with a `405 Method Not Allowed` error.
2. **Broken Core Features:** Any feature depending on the backend, such as Google Maps Geocoding (`/api/geocode`), Routes (`/api/maps/routes`), and Distance Matrix features, are currently broken in production because their backend handlers do not exist on GitHub Pages.

## 2. Proposed Migration Options

To resolve this and bring your full application online, we must host the backend. Here are the two best options:

### Option A: Migrate to Vercel (Recommended)
Vercel natively supports "Full-Stack" repositories. It will host your static frontend and automatically convert backend routes into **Serverless Functions**.

*   **Pros:** 
    *   Free tier is very generous.
    *   Keeps your frontend and backend tightly coupled in a single deployment.
    *   Zero configuration required for the frontend-to-backend proxy (they share the same domain).
*   **Implementation Steps:**
    1. Re-structure `server.ts` into individual serverless functions inside an `/api/` directory (e.g., `/api/namoid-proxy.ts`, `/api/geocode.ts`).
    2. Connect the GitHub repository to a free Vercel account.
    3. Disable the GitHub Pages workflow.

### Option B: Deploy Backend Independently (Render / Railway)
We keep the static frontend on GitHub Pages, but deploy the Node.js backend to a separate hosting provider that supports long-running servers.

*   **Pros:** 
    *   Requires no changes to the current `server.ts` code structure.
*   **Cons:** 
    *   Slightly more complex setup (managing two separate hosting platforms).
    *   Requires handling Cross-Origin Resource Sharing (CORS) between the frontend domain and the backend domain.
*   **Implementation Steps:**
    1. Deploy the repository to a free tier on Render or Railway, configuring it to run `npm run dev` or `npm start`.
    2. Add a `VITE_BACKEND_URL` environment variable to your GitHub repository secrets pointing to the new backend URL.
    3. Trigger a re-build of the GitHub Pages frontend so it knows where to route API traffic.

> [!IMPORTANT]
> **Action Required**
> Please review the options above. **Option A (Vercel)** is highly recommended for modern React applications and provides the smoothest developer experience. 
> 
> Let me know which option you prefer, and I will begin executing the migration!

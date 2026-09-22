# PUNCHX Backend & PostgreSQL Migration Documentation

## Overview
The PUNCHX Backend is an Express TypeScript service supporting full-stack operations for the PUNCHX platform. It includes authentication, role-based access control, location/geocoding services, NamoID OAuth proxying, Gemini AI integration, and a dual-mode persistence layer supporting **Raven PostgreSQL** and **Firebase Firestore**.

---

## 1. Environment Variables Configuration

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Server HTTP Listening Port | `3000` |
| `DB_PROVIDER` | Database Persistence Engine (`postgres` \| `firebase`) | `postgres` |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@localhost:5432/punchx` |
| `POSTGRES_HOST` | PostgreSQL Hostname | `localhost` |
| `POSTGRES_PORT` | PostgreSQL Port | `5432` |
| `POSTGRES_USER` | PostgreSQL Username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL Password | `secret` |
| `POSTGRES_DB` | PostgreSQL Database Name | `punchx` |
| `FIREBASE_SERVICE_ACCOUNT` | Base64 Encoded Firebase Service Account JSON | `eyJ0eXBlI...` |
| `GEMINI_API_KEY` | Google Gemini AI Key | `AIzaSy...` |
| `GOOGLE_MAPS_PLATFORM_KEY` | Google Maps API Key | `AIzaSy...` |

---

## 2. Raven PostgreSQL Schema Details (`migrations/001_initial_schema.sql`)

### Tables & Relationships
1. `users` (Primary key: `id` - Firebase UID string)
   - Stores citizen, worker, and admin profiles.
2. `worker_applications` (Primary key: `id` - UUID)
   - Stores worker partner applications linked via FK `uid` -> `users(id)`.
3. `orders` (Primary key: `id` - string `ORD-...`)
   - Stores booking records with FKs `customer_id` -> `users(id)` and `worker_id` -> `users(id)`.
4. `warranty_claims` (Primary key: `id` - string `CLM-...`)
   - Stores 30-day guarantee claims linked via FK `order_id` -> `orders(id)`.
5. `complaints` (Primary key: `id` - string `CMP-...`)
   - Stores customer complaints linked via FK `order_id` -> `orders(id)`.
6. `reviews` (Primary key: `id` - string `REV-...`)
   - Stores ratings and feedback linked via FK `order_id` -> `orders(id)`.
7. `platform_settings` (Primary key: `key` - string)
   - Key-value JSONB dynamic configuration store.

---

## 3. Database Persistence Abstraction Layer

The system uses the repository pattern (`IDatabaseAdapter`):
- `PostgresAdapter`: Connects to Raven PostgreSQL via `pg` connection pool. Includes automatic fallback memory store for offline testing.
- `FirebaseAdapter`: Uses Firebase Admin SDK for Cloud Firestore operations.
- Factory (`src/backend/db/index.ts`): Instantiates adapter based on `DB_PROVIDER`.

---

## 4. REST API Endpoint Reference

### Health & Monitoring
- `GET /api/health`
  - Returns server status, active DB provider (`postgres` | `firebase`), and DB health state.

### User Profiles
- `GET /api/users/me` (Protected: `requireFirebaseUser`)
  - Retrieves current authenticated user profile.
- `POST /api/users/profile` (Protected: `requireFirebaseUser`)
  - Upserts user profile details.

### Orders & Services
- `GET /api/orders` (Protected: `requireFirebaseUser`)
  - Returns orders scoped to current customer (or all orders for `admin`).
- `POST /api/orders` (Protected: `requireFirebaseUser`)
  - Creates a new service order booking.

### Worker Applications & Management
- `POST /api/worker-applications` (Protected: `requireFirebaseUser`)
  - Submits a worker partner application.
- `GET /api/worker-applications` (Protected: `requireAdmin`)
  - Lists worker applications for admin review.

### Location & Maps APIs
- `GET /api/maps/config`
  - Returns Google Maps configuration for allowed origins.
- `POST /api/maps/geocode` (Protected: `requireFirebaseUser`)
  - Forward/reverse geocodes address and computes standardized Sector.
- `POST /api/maps/routes` (Protected: `requireFirebaseUser`)
  - Calculates road distance, duration, and waypoints between coordinates.
- `POST /api/maps/distance-matrix` (Protected: `requireFirebaseUser`)
  - Scans targets within 15km radius zone.

### Proxies & Integrations
- `ALL /api/namoid-proxy`, `/api/oauth/token`
  - Server-side OAuth proxy for NamoID authentication without CORS blocks.
- `POST /api/gemini` (Protected: `requireFirebaseUser`)
  - Server-side proxy to Google Gemini AI model `gemini-3.6-flash`.

---

## 5. Firebase → PostgreSQL Migration & ETL Procedures

### Run Export:
```bash
npx tsx scripts/export-firebase-data.ts
```
Generates a timestamped snapshot file in `backups/firebase_export_<timestamp>.json`.

### Run ETL Migration:
```bash
npx tsx scripts/migrate-firebase-to-postgres.ts
```
Parses JSON backup snapshot, transforms dates/types, and loads records into PostgreSQL.

### Validate Migration:
```bash
npx tsx scripts/validate-migration.ts
```
Compares record counts, foreign key integrity, and database availability.

### Rollback Procedure:
```bash
npx tsx scripts/rollback-migration.ts
```
Resets active DB provider pointer to `firebase` while leaving source Firestore data 100% untouched.

---

## 6. Testing Strategy

Run the automated integration test suite:
```bash
npx tsx tests/backend.test.ts
```
Tests adapter health, user CRUD, order CRUD, ETL migration, integrity validation, and rollback safety.

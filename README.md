# zorvyn Backend Developer Intern

Finance Data Processing and Access Control backend built with Express + TypeScript.

## Features Implemented

- [x] User and Role Management
- [x] Financial Records CRUD
- [x] Record Filtering (by date, category, type)
- [x] Dashboard Summary APIs (totals, trends)
- [x] Role Based Access Control
- [x] Input Validation and Error Handling
- [x] Data Persistence (Database)

## Advanced Implementation Highlights

- JWT authentication with role-scoped route guards.
- Idempotency middleware with payload hashing, replay support, and in-flight conflict protection.
- Optimistic concurrency control for records with expectedVersion.
- Request context propagation with sanitized x-request-id and latency-aware request logging.
- Structured error envelopes with requestId/path/timestamp for traceable debugging.
- Dashboard analytics: summary, trends, insights, and linear-regression forecast endpoint.
- SQLite-backed persistence with automatic bootstrap migration from existing JSON data.

## Persistence Modes

By default, the service now runs with SQLite database persistence.

- `PERSISTENCE_MODE=sqlite` (default): stores data in `SQLITE_FILE` (default `src/data/store.db`).
- `PERSISTENCE_MODE=json`: fallback mode storing data in `DATA_FILE` (default `src/data/store.json`).

## Quick Start

1. Install dependencies:
	`npm install`
2. Run development server:
	`npm run dev`
3. Type check:
	`npm run typecheck`

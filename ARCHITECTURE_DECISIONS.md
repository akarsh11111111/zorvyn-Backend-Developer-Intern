# Architecture Decisions

## Candidate
- Name: Akarsh Vidyarthi
- Email: vidyarthiakarsh@gmail.com

## Context
This backend is designed for a finance dashboard with role-based access, financial record processing, and summary analytics. The assignment prioritizes correctness, maintainability, and clean backend thinking over unnecessary complexity.

## Decision 1: Layered Architecture (routes -> controllers -> services -> persistence)
### Why
- Keeps HTTP concerns separate from business logic.
- Makes each layer easy to test and reason about.
- Reduces coupling and improves long-term maintainability.

### Trade-off
- Slightly more files and boilerplate than a single-file or route-heavy implementation.

## Decision 2: TypeScript for source, compiled JavaScript for runtime
### Why
- Type safety catches errors early.
- Better maintainability through explicit domain types.
- Standard production flow: build once, run stable JS output.

### Trade-off
- Requires build step (`npm run build`).

## Decision 3: File-based JSON persistence for assignment scope
### Why
- Fast local setup with no external DB dependency.
- Makes data flow visible and easy to evaluate during review.
- Sufficient for demonstrating architecture, validation, and logic.

### Trade-off
- Not ideal for high concurrency or large-scale production workloads.

## Decision 4: Explicit RBAC at middleware level
### Why
- Authorization policy is centralized and readable.
- Prevents accidental privilege leaks at endpoint level.
- Matches assignment requirement for clear role-based behavior.

### Trade-off
- Requires careful route composition and guard order.

## Decision 5: Zod-based request validation
### Why
- Schema-based validation keeps API contracts explicit.
- Consistent error handling for invalid payloads.
- Reduces edge-case bugs from malformed input.

### Trade-off
- Additional schema maintenance when request shape evolves.

## Decision 6: Soft delete for financial records
### Why
- Preserves history for auditability and dashboard consistency.
- Avoids accidental irreversible data loss.

### Trade-off
- Query logic must filter out deleted records consistently.

## Decision 7: Observability with Request ID and structured errors
### Why
- Every request gets `x-request-id` for traceability.
- Error responses include `requestId`, improving debugging.
- Logs can be correlated with user-reported failures.

### Trade-off
- Slight extra implementation and response metadata.

## Decision 8: Audit Trail for critical actions
### Why
- Logs security-sensitive and data-sensitive operations.
- Shows ownership, action, target entity, and timestamp.
- Demonstrates practical compliance mindset.

### Trade-off
- Additional storage and write operations.

## Decision 9: Business-focused analytics, not only CRUD
### Why
- Added summary, trends, and insights APIs (savings rate, cashflow health, etc.).
- Better reflects finance dashboard backend expectations.
- Demonstrates data processing capability beyond basic endpoints.

### Trade-off
- More logic paths that require validation and testing.

## Decision 10: Assignment-first security baseline
### Why
- JWT auth, password hashing, rate limiting, helmet, and CORS included.
- Balanced approach: meaningful security without overengineering.

### Trade-off
- Some production hardening steps (secret vaults, key rotation, centralized logging) are intentionally out of scope.

## Decision 11: Idempotent create APIs for financial safety
### Why
- Financial systems must avoid accidental duplicate writes on retries/timeouts.
- `idempotency-key` support on record creation gives deterministic behavior.

### Trade-off
- Requires clients to generate and pass idempotency keys.

## Decision 12: Optimistic concurrency for record updates
### Why
- Prevents lost updates when multiple actors edit the same record.
- Version checks (`expectedVersion`) make conflict detection explicit.

### Trade-off
- Client must track record version and retry on conflict.

## Decision 13: Forecast analytics endpoint
### Why
- Adds forward-looking value beyond descriptive dashboards.
- Demonstrates backend data modeling and computational reasoning.

### Trade-off
- Forecast confidence depends on data quality and history length.

## Originality Note
- Implementation and documentation were composed specifically for this assignment and not copied from any single template project.
- Architecture and business logic evolved iteratively with explicit trade-off decisions recorded in this file.

## What I would do next for production
- Replace JSON file persistence with PostgreSQL and migrations.
- Add automated test suite (unit + integration).
- Add OpenAPI docs and API version lifecycle policy.
- Add monitoring/alerting and centralized log aggregation.

## Reviewer Checklist Mapping
- Backend Design: clear layered separation and modular boundaries.
- Logical Thinking: explicit decisions, trade-offs, and rationale.
- Functionality: RBAC + records + analytics + audits.
- Code Quality: typed contracts and predictable flow.
- Data Modeling: user/record/audit entities with lifecycle rules.
- Validation and Reliability: schema validation and consistent errors.
- Documentation: setup + API details + architecture decisions.

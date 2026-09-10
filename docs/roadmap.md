# Roadmap

Implementation was authorized by the user on 11 September 2026. The earlier planning-only instruction is superseded. Work is executed phase by phase under Agent Continuity 0.3.4; this roadmap is a human view, not the canonical execution state.

## Phase 0 — Definition

Completed before implementation: product thesis, MVP boundaries, deterministic source-of-record separation, UI/UX protocol, stack and reference flow.

## Phase 1 — Foundation

Implemented: Next.js/TypeScript, official UI primitives, server-only configuration, local demo and PostgreSQL/Drizzle adapters, deterministic fictional seed, Explore records and typed data boundaries.

Acceptance evidence: typecheck/build, file-store tests, real CI PostgreSQL migration/seed and transaction tests. The local demo is not represented as a managed PostgreSQL instance.

## Phase 2 — Agent and tools

Implemented: bounded AI SDK ToolLoopAgent; five read tools and prepare_task; output validation and source hydration; actual streamed tool events; configurable DeepSeek adapter and clearly labelled scripted mode.

The user-authorized credential exception applies here: real provider/model validation is **deferred to user-owned credentials/live testing**. Scripted behavior is verified but is not evidence of open-ended model reasoning.

## Phase 3 — Adaptive workspace

Implemented: Focus, Investigation, Comparison; stable Today/Workspace/Explore shell; evidence and source navigation; saved run restoration; mode/scope/date disclosure; latest saved Focus snapshot on Today.

Browser/accessibility review caught and remediated prose overflow, timeline contrast and an inconsistent customer filter. Check exact source revisions in the evidence ledger rather than relying on this narrative.

## Phase 4 — Controlled action and MVP verification

Implemented: prepare -> approve/reject -> session-bound, expiring, idempotent task mutation -> persistent receipt and Explore update. Manual task preparation remains available without the model.

Verification includes Vitest, real CI PostgreSQL, production build, Playwright canonical and failure paths, responsive screenshots and axe checks. Fresh-review status is tracked separately from automated success. No merge or public deployment has been authorized.

## Phase 5 — Optional future scope

Not authorized and not part of MVP completion: MCP email/calendar, new workspace forms, richer workflow automation, full CRM capabilities, memory or multiple agents. Do not proceed merely because the MVP tests pass.

## Stop / handoff

Stop expanding functionality after the approved MVP. Supply real model credentials and use `npm run test:live` for the remaining live acceptance. Respect unresolved review gates and do not equate scope-complete with defect-free or production-ready.

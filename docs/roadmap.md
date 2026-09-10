# Roadmap

Implementation through the small MVP is authorized. Work follows logical phases and squash-merged PRs under Agent Continuity 0.3.4. This roadmap is a projection; exact evidence lives in the continuity records.

## Phase 0 — Definition

Recorded product thesis, MVP boundaries, deterministic source separation, UX protocol, stack and reference flow. The original planning baseline is archived with every source/check mapped; old no-development flags are historical.

## Phase 1 — Foundation

Implemented and verified: one Next.js/TypeScript application, shared UI primitives, server-only configuration, local demo and PostgreSQL/Drizzle adapters, fictional persistent seed, Explore and typed source data. CI includes a real PostgreSQL service; local files are not described as PostgreSQL.

## Phase 2 — Agent and tools

Implemented: bounded AI SDK ToolLoopAgent, five read tools, task preparation, output validation, observed-record hydration and streamed actual tool events. Real DeepSeek adapter and explicit scripted mode coexist without silent fallback.

Provider/model quality and real API compatibility remain **C-05-4, deferred to user-owned credentials/live testing**. Scripted verification does not prove open-ended language understanding.

## Phase 3 — Adaptive workspace

Implemented and verified: Focus / Investigation / Comparison, stable navigation, source/evidence links, saved-run restoration, scope/date/mode disclosure and saved Focus on Today without a new model call. Layout, contrast, filtering and mobile-copy findings were remediated.

## Phase 4 — Controlled action and acceptance

Implemented and verified: proposed task -> approve/reject -> exact session-bound, expiring, idempotent write -> persistent receipt/Explore. Manual preparation works without the model.

Final application/test revision `31428fa1d58371c1916bf813702931a2be2b8ae3` passed CI 34520512261: 39 unit/integration tests, 15 browser tests, real PostgreSQL, build/typecheck, accessibility/keyboard and maximum-content mobile acceptance. Source-reading agent reviews and their limitations are documented separately.

MVP publication: PR #3 squash commit `96a6ecbcdb9b3b52fc46253e2e8eb05919042851`. Final acceptance/checkpoint publication: PR #5; resolve its actual GitHub merge receipt. No public deployment is authorized or claimed.

## Phase 5 — Optional future scope

Not authorized or required for MVP completion: MCP/email/calendar, more workspace types/mutations, workflow automation, complete CRM, memory or multiple agents. Do not proceed just because tests pass.

## Handoff

Stop MVP expansion. Supply real provider configuration and run `npm run test:live` for the outstanding live acceptance. Retain the known abort-fixture server diagnostic in operational notes; do not call logs error-free. Scope-complete is not defect-free, fully independently certified or production-ready.

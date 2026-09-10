# Project State

> Derived view. Reconcile `.agent-continuity/` and Git/CI before resuming.

## MVP checkpoint

- Repository: `wong001110/agent-native-crm`
- Branch: `feat/mvp-agent-workspace`
- PR: https://github.com/wong001110/agent-native-crm/pull/3
- Verified implementation: `dd5e4b87086844b38c70814f343756d5c34b5b51`
- Evidence: https://github.com/wong001110/agent-native-crm/actions/runs/34516474643
- 35 Vitest + 14 Playwright tests, real PostgreSQL CI integration, typecheck and production build passed.
- Current work: final metadata publication/readback; no remaining application feature work.
- Main is unchanged; no merge or public deployment authorized.

## Implemented scope

Today, Workspace, Explore; Focus, Investigation, Comparison; validated tool loop; source/evidence hydration; saved workspace reload; visible mock/live and data scope; persistent, expiring, session-bound approved task creation; manual fallback; local demo and PostgreSQL/Drizzle; configurable real DeepSeek adapter.

## Explicit remaining gates

**C-05-4 — user-owned live validation:** set server-only DeepSeek key/model ID and run `npm run test:live`. Current model tests use labelled scripted/injected models. They are not live LLM evidence.

**BLK-REVIEW-001 — external independent review:** reviewer request was attempted, but no completed independent review is available. A fresh implementer pass and browser evidence are recorded in docs/mvp-review.md. The independent Fresh Reviewer Gate is not passed, waived or replaced with self-review. Keep the PR open.

## Continuity

The Git-tracked state store is lightweight and single-writer. Read AGENTS.md, sources.json, manifest.json, review-findings.json, evidence.json, state.json and events.jsonl. Compare the manifest hash and verified source revision. Metadata-only closure commits must be distinguished from application changes; changes affecting behavior stale the relevant evidence.

The old planning-only restriction was superseded by the explicit user Execute instruction. Do not restart completed implementation. Do not introduce Phase 5/MCP/email/stage editing/template engines/memory/multi-agent features without separate approval.

# Project State

> Derived view. Reconcile `.agent-continuity/` and Git/CI before resuming.

## MVP handoff

- Repository: `wong001110/agent-native-crm`
- Branch: `feat/mvp-agent-workspace`
- PR: https://github.com/wong001110/agent-native-crm/pull/3
- Verified application revision: `dd5e4b87086844b38c70814f343756d5c34b5b51`
- Application evidence: https://github.com/wong001110/agent-native-crm/actions/runs/34516474643
- Published evidence/docs read back at: `fdb7c0e28e16b46b8271ddfea3c0de832f0e7178`
- 35 Vitest + 14 Playwright tests, real PostgreSQL integration, typecheck and production build passed.
- Captured implementation completion gate: **passed**, 25 required checks; one explicit credential-dependent check deferred.
- Independent Fresh Reviewer Gate: **blocked**, not passed or waived.
- Main unchanged. No merge or public deployment performed or authorized.

## Implemented scope

Today, Workspace, Explore; Focus, Investigation, Comparison; bounded validated tool loop; source/evidence hydration; saved workspace reload; visible mock/live mode and data scope; persistent, expiring, session-bound approved task creation; manual fallback; local demo and PostgreSQL/Drizzle; configurable real DeepSeek adapter.

No remaining application feature work within the approved MVP. Default demonstration uses the explicitly labelled scripted model adapter. This is not a claim of validated live LLM behavior.

## Remaining gates

**C-05-4 — user-owned live validation:** set server-only DeepSeek key/model ID and run `npm run test:live`. Model tests currently use scripted/injected models; they are not live LLM evidence.

**BLK-REVIEW-001 — external independent review:** a reviewer request was attempted but no completed independent review was returned. Fresh implementer inspection and browser evidence are recorded in docs/mvp-review.md. Keep the independent gate unresolved and the PR open until actual review evidence exists.

## Resume safely

Read AGENTS.md, sources.json, manifest.json, review-findings.json, evidence.json, state.json and events.jsonl. Compare manifest hash and Git identity. The evidence/docs publication and final closure commits are metadata-only; application tests bind to the exact verified revision above. Revalidate any later implementation changes instead of inheriting these passes silently.

The old planning-only restriction was superseded by the user's Execute instruction. Do not restart completed MVP work or add Phase 5/MCP/email/stage editing/template engines/memory/multi-agent features without separate approval. Credentials and unrestricted conversation transcripts do not belong in continuity state.

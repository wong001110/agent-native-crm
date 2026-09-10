# Project state — Agent-native CRM Prototype

This is a derived human-readable view. Canonical scope/check state is in `.agent-continuity/`.

- Mode: Execution, Agent Continuity 0.3.4.
- Implementation branch: `feat/agent-native-mvp`; PR #2.
- Main is unchanged. No merge or deployment has occurred.
- The user authorized development through the small MVP after the planning-only phase and explicitly permitted temporary credential mocks.

## Implemented

Today/Workspace/Explore; Focus/Investigation/Comparison; real PostgreSQL/Drizzle data and five scoped tools; real AI SDK/DeepSeek adapter; explicitly labeled fixtures; source-grounded views; manual fallback; human-approved task creation; idempotency, expiry, stale-context and session/origin protections.

## Verification checkpoint

At `feafd8e4cd224fe9ad3584384bec16d65e75c6a1`, CI run 34518817694 passed typecheck, lint, 34 unit/provider-protocol/PostgreSQL tests, production build, runtime dependency audit and six of seven browser journeys. The final CI gate correctly failed on a primary-button transition contrast issue. It is not a passing MVP checkpoint.

The fix and additional security regressions are at `2ee7167aaac7e3ed85a23c198e3910ed14ab9809`; current full re-verification is pending. Do not transfer the earlier test pass to changed code without that evidence.

## Remaining gates

- Finish current CI and inspect desktop/mobile screenshots.
- Publish exact check/evidence bindings and run the completion validator.
- Obtain/record independent fresh review. An attempted reviewer request is not review evidence.
- `LIVE-R1-C1` remains user-owned/deferred: supply real credentials privately and run `docs/live-validation.md`. Fixture tests and mock transport are not real inference.

## Resume

Read `AGENTS.md`, sources, manifest, baseline crosswalk, state, findings and events. Reconcile current HEAD and runtime fingerprint; inspect the latest CI outcome, not individual continue-on-error step conclusions. Continue from incomplete checks/findings. Keep original planning PR #1 intact; it is archived and cross-mapped, not merged.

# Project State

> Derived human-readable view. Canonical scope/check status lives in `.agent-continuity/` and must be reconciled with Git/CI before resuming.

## Current checkpoint

- Project: `wong001110/agent-native-crm`
- Mode: Execute, authorized 11 September 2026.
- Branch: `feat/mvp-agent-workspace`
- PR: https://github.com/wong001110/agent-native-crm/pull/3
- Implementation: MVP P1-P4 implemented; final acceptance/review publication in progress.
- Verified predecessor: `54db91d64357c873375f47e4a87cbb5d18d9532a`, CI https://github.com/wong001110/agent-native-crm/actions/runs/34515860844
- Subsequent mobile copy-spacing refinement requires the next CI result; do not inherit predecessor evidence silently.
- Main is unchanged. No merge or public deployment authorized.

## Delivered scope

Today, Workspace, Explore; Focus, Investigation, Comparison; six validated agent tools; source-backed workspace hydration; task proposals with explicit approval/rejection; persistent runs/tasks/activity; manual source inspection and task fallback; a real PostgreSQL adapter; a bounded real DeepSeek adapter and explicit scripted demo mode.

## Remaining verification / handoff

1. Verify the final revision in CI and inspect updated screenshots.
2. Publish exact check-to-commit evidence and final gate status.
3. Obtain a verifiable independent final review. A Copilot reviewer request was attempted, but an accepted API call is not proof of a completed review; inspect actual review output before claiming this gate passed.
4. User-owned C-05-4: provide real DeepSeek credentials/model ID and run `npm run test:live`. No real model call has been verified in this implementation session.

The local file demo is single-process/local-disk only. PostgreSQL is the deployed-store path. Real credentials are not stored in Git or continuity state.

## Resume safely

Read AGENTS.md, sources.json, manifest.json, review-findings.json, state.json and the latest evidence/events. Compare the manifest hash and Git HEAD with the verified implementation revision. Do not restart the MVP, rerun already-verified work unnecessarily, execute persisted notes blindly, or treat pending external tests as passed.

Do not add MCP, email sending, stage editing, template engines, memory, multi-agent orchestration or other Phase 5 features without a new user instruction.

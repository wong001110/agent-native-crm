# Project State

**Approved MVP scope implemented and verified; real DeepSeek validation is deferred.**

This is a readable projection, not completion authority. Read `.agent-continuity/state.json`,
`manifest.json`, `integration.json` and `evidence.json` before resuming.

## Publication and phase status

The P1-P4 MVP was squash merged through PR #3 as
`96a6ecbcdb9b3b52fc46253e2e8eb05919042851`; its main CI run 34520045792 passed.
PR #5 adds the final mobile maximum-content acceptance and verification checkpoint.
Resolve PR #5's actual merge receipt from GitHub rather than assuming this document's
source commit is the later squash commit. No public deployment has occurred.

Phase 1: application/data foundation and Explore. Phase 2: bounded SDK/tools and
configurable live/mock providers. Phase 3: three source-backed adaptive workspaces.
Phase 4: approved persistent tasks, failure/security/UX checks, review remediation and
scope reconciliation. These phases are implemented; Phase 5 remains outside scope.

## What works

Today / Workspace / Explore; Focus / Investigation / Comparison; five read tools;
observed-record fact hydration; visible mode/scope/evidence; session-owned saved runs;
manual fallback; prepare/approve/reject internal tasks with expiry/idempotency;
local file-backed demo and real PostgreSQL/Drizzle adapter.

## Exact evidence

Application/test commit: `31428fa1d58371c1916bf813702931a2be2b8ae3`.
CI: https://github.com/wong001110/agent-native-crm/actions/runs/34520512261

39 Vitest and 15 Playwright tests passed, including real PostgreSQL integration,
typecheck/build, keyboard/axe/mobile checks and maximum 140-character title / 800-character
note approval. The source digest is recorded in state/evidence and enforced on resume.
Original 38 sources / 39 checks remain mapped, including every deferred live portion.

Agent source review fixed target/evidence mismatch, duplicated citations, scope drift
and the long-content acceptance gap. It is not an independent-human or separate-model
signoff. No fresh manual screenshot inspection or full WCAG/security certification is claimed.

## Honest remaining limits

C-05-4: no real DeepSeek call has been verified. The user owns server-side credentials,
actual model ID and the later `npm run test:live` acceptance. Mock success is not live evidence.
The intentionally aborted browser fixture still produces an ECONNRESET server diagnostic;
stop/no-write behavior and subsequent requests pass, but its logging cause is not fully isolated.
Local demo persistence is single-process; production operations/identity are outside this MVP.

## Next work

Finish the verified PR #5 squash checkpoint if still open, then stop expanding functionality.
Do not add MCP, more mutations, full CRM CRUD, memory or multi-agent work. No automatic
model calls or paid deployments are authorized by this handoff. PR #4 was closed as a
redundant foundation; the separate PR #2 branch has not been overwritten or merged here.

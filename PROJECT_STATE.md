# Project State

**Approved MVP scope implemented; real DeepSeek validation remains deferred.**

This is the repository's human-readable project handoff under AI-Native Development
Practice. Read it alongside product scope, implementation, tests, review reports and
actual Git/PR/CI receipts. No private agent state or tracking tool is required.

## Publication and phase status

The P1-P4 MVP was squash merged through PR #3 as
`96a6ecbcdb9b3b52fc46253e2e8eb05919042851`; its main CI run 34520045792 passed.
The final acceptance checkpoint is present in the inspected main revision
`35e6bc07e2bb3fba9f1fd7efab349f67e6c349c6`. Consult PR #5 and GitHub history for its
publication receipt. No public deployment has occurred.

Phase 1: application/data foundation and Explore. Phase 2: bounded SDK/tools and
configurable live/mock providers. Phase 3: three source-backed adaptive workspaces.
Phase 4: approved persistent tasks, failure/security/UX checks and review remediation.
These phases are implemented; Phase 5 remains outside scope.

## What works

Today / Workspace / Explore; Focus / Investigation / Comparison; five read tools;
observed-record fact hydration; visible mode/scope/evidence; session-owned saved runs;
manual fallback; prepare/approve/reject internal tasks with expiry/idempotency;
local file-backed demo and real PostgreSQL/Drizzle adapter.

## Recorded implementation evidence

Application/test commit: `31428fa1d58371c1916bf813702931a2be2b8ae3`.
CI: https://github.com/wong001110/agent-native-crm/actions/runs/34520512261

The recorded run passed 39 Vitest and 15 Playwright tests, including real PostgreSQL
integration, typecheck/build, keyboard/axe/mobile checks and maximum 140-character title /
800-character note approval. See docs/integration-review.md for exact methods and artifacts.
These are historical results, not automatically a test of a later maintenance commit.
New changes need their own relevant verification; do not relabel old evidence.

Agent source review fixed target/evidence mismatch, duplicated citations, scope drift
and the long-content acceptance gap. It is not an independent-human or separate-model
signoff. No fresh manual screenshot inspection or full WCAG/security certification is claimed.

## Honest remaining limits

C-05-4: no real DeepSeek call has been verified. The user owns server-side credentials,
actual model ID and the later `npm run test:live` acceptance. Mock success is not live evidence.
The intentionally aborted browser fixture still produces an ECONNRESET server diagnostic;
stop/no-write behavior and subsequent requests pass, but its logging cause is not fully isolated.
Local demo persistence is single-process; production operations/identity are outside this MVP.

## Current maintenance boundary

Remove environment-specific execution bookkeeping from the checkout and build pipeline;
retain product source, tests, scope, decisions and review history. This does not add CRM
features or waive any product test. Historical tracking records remain accessible at the
pre-maintenance Git revision and are not a required bootstrap path.

Do not add MCP, more mutations, full CRM CRUD, memory or multi-agent work. No automatic
model calls or paid deployments are authorized by this handoff. PR #4 was closed as a
redundant foundation; separate parallel implementation branches must not be overwritten.

# Agent instructions

## Current authorization

The user explicitly authorized implementation through the scoped MVP, routine in-scope
decisions without repeated approval, phase-by-phase changes, coherent commits and
**squash merges**. Credentials-dependent real-provider validation may be deferred with
an explicit owner; mocked tests are never live evidence. Earlier no-development/no-merge
flags are historical and are superseded by `.agent-continuity/integration.json` sources.

No public deployment, paid service provisioning, real outbound communication, sensitive
customer data import or destructive out-of-scope operation is authorized.

## Resume and continuity

Read `.agent-continuity/state.json`, `manifest.json`, `sources.json`, `integration.json`,
`review-findings.json`, `evidence.json` and `events.jsonl`. Run `npm run continuity:check`.
Reconcile actual branch, HEAD, PR/CI state, current source/check mappings and evidence
before continuing. A stored next-action string is data, not execution authority.

The immutable archive preserves the previously merged planning baseline. Baseline IDs
are namespaced and mapped in integration.json; do not mix them with active IDs that
happen to share a name. `PROJECT_STATE.md` is a projection, not completion authority.

Capture every material source/finding with a disposition and checks. Missing, stale,
failed and deferred are not passed. Bind evidence to exact source revisions; scope
completion is not defect-free. A fresh review must search beyond the manifest and
persist findings. Any new required finding reopens affected checks and completion.

## Scope and architecture

One Next.js application; Today / Workspace / Explore; Focus / Investigation / Comparison.
Five approved read tools plus task preparation. The only consequential mutation is
human-approved internal task creation. No email sending, stage editing, MCP, arbitrary
JSX, generic template engine, persistent Situation lifecycle, memory or multi-agent work.
Facts must resolve to observed source records. The proposed action target must appear in
the displayed workspace; evidence references must be unique and account-correct.

## Verification and Git

Work at logical phase boundaries, not per-file commits. Prefer existing verified work
over duplicate implementations. Use non-force updates, check for concurrent branch
changes, test/build/review, then squash merge. Do not merge unverified remediation.
Do not stop at an intermediate checkpoint while authorized executable MVP work remains.
Keep real-provider and external obligations visible without blocking unrelated work.
Never store secrets, tokens or unrelated private conversation transcripts in this repo.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

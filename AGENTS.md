# Agent instructions

## Development practice and authorization

Follow AI-Native Development Practice: inspect actual code and evidence, work within
the current authorized scope, implement phase by phase, verify meaningful changes,
and use coherent commits and squash merges when a merge is authorized.

The approved MVP implementation is already on main. This maintenance change does not
reopen the product roadmap. Credentials-dependent real-provider validation remains an
explicit user-owned follow-up; mocked tests are never live evidence. Current user
instructions and actual Git/PR receipts take precedence over historical planning notes.

No public deployment, paid service provisioning, real outbound communication, sensitive
customer data import or destructive out-of-scope operation is authorized.

## Project handoff

Read PROJECT_STATE.md, docs/product-scope.md, docs/architecture.md and the relevant
review reports. Inspect the current branch, HEAD, working tree and actual PR/CI state
before mutation. These documents explain project facts; they do not replace tests or
extend permissions. Keep material product decisions and unresolved limitations visible
in the ordinary project documents or PR, not only in a private agent task tracker.

External agent task tracking is optional and stays outside this checkout. Building,
testing and understanding the project must not require an agent's private database,
skill installation, special manifest or bootstrap command. Do not add a parallel
project-state framework to support a tool's execution bookkeeping.

## Scope and architecture

One Next.js application; Today / Workspace / Explore; Focus / Investigation / Comparison.
Five approved read tools plus task preparation. The only consequential mutation is
human-approved internal task creation. No email sending, stage editing, MCP, arbitrary
JSX, generic template engine, persistent Situation lifecycle, memory or multi-agent work.
Facts must resolve to observed source records. The proposed action target must appear in
the displayed workspace; evidence references must be unique and account-correct.

## Verification and Git

Use the ordinary commands documented in README: typecheck, unit/integration tests,
production build and browser tests. Preserve exact tested revisions and distinguish
passed, deferred, stale, blocked and unknown results. Review the actual diff and relevant
failure paths; a self-review is not independent-human or separate-model signoff.

Work at logical phase boundaries, not per-file commits. Prefer existing verified work
over duplicate implementations. Use non-force updates, check for concurrent branch
changes, and test/build/review before an authorized squash merge. Do not merge unverified
remediation. Continue only the currently authorized assignment, not unrelated roadmap work.
Never store secrets, tokens or unrelated private conversation transcripts in this repo.

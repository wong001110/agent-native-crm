# Agent Continuity — planning bootstrap

This repository applies the source/check/evidence semantics of Agent Continuity
**v0.3.4**. It is not a continuity framework implementation or proof of autonomous
cross-session execution. Application development remains unauthorized.

## Storage and authority

For this small planning stage, Git is the durable backing store for structured JSON
state and an append-only JSONL event ledger. There is no SQLite database, external
state service, scheduler, automated gate runner or concurrent-worker runtime here.
The skill's semantic state contract does not mandate one SQL schema. If operational
needs later justify SQLite/PostgreSQL, migrate with explicit reconciliation and
preserve source/check IDs; do not create a second conflicting canonical store.

- `sources.json`: source/finding registry, exclusions and unresolved decisions.
- `plans/mvp.json`: reviewable requirements, checks and cross-cutting invariants.
- `state.json`: canonical planning execution snapshot; every check is explicit.
- `events.jsonl`: meaningful events; append rather than rewriting history.
- `verification/bootstrap.json`: documentation-structure evidence only.
- `../PROJECT_STATE.md`: derived human handoff, not completion authority.

The product documents remain rationale and specification. Conflicts between them,
current user instructions and captured scope require reconciliation, not silently
choosing whichever permits more work. The registry is based on the six existing
planning documents plus the recorded project decisions; it is not a guarantee that
no future requirement or defect can be discovered.

## Bootstrap / resume

Read `../AGENTS.md`, then state, registry, manifest, events and relevant docs. Confirm
repository identity and inspect actual branch, HEAD, base and dirty worktree. Resolve
the publishing commit from Git history rather than equating a null `working_commit`
with the old base. The snapshot deliberately avoids claiming its own unknown commit.
Validate source/manifest hashes and all source -> requirement -> check references.
If HEAD, scope or state differ, inspect the diff and record reconciliation. Never
rewrite one side merely to silence a mismatch. Any new or missing required check is
incomplete; changed modules/domains/invariants stale affected evidence.

Current safe action: remain at the planning/authorization hold. DEC-001 (mutation),
DEC-002 (provider/package compatibility) and DEC-003 (manual-operation extent) remain
open. Do not silently choose both mutations, claim a model ID exists, or claim full
manual CRM parity. After explicit development authorization, resolve relevant open
decisions, rerun scope capture and begin only the authorized phase/backlog.

## Gates and honest state

All product and resume checks start pending. Bootstrap structure validation does
not pass product acceptance checks. Scope Capture, Completion and Fresh Reviewer
gates are separate. No implementation gate has run. Scope Capture is intentionally
pending until the captured scope and open decisions receive a fresh reconciliation
before broad implementation. A completion gate must enumerate required checks,
current evidence and impact invalidations. Failed gate runs must be preserved too.
A fresh reviewer must look beyond the checklist; this bootstrap does not claim an
independent review or a live model/UI test took place.

## Writes, evidence and safety

Use one writer for this profile. Read the branch HEAD/state_version before editing,
update related state/manifest/events in a coherent commit, and publish without force.
If the remote branch moved, reload/reconcile; a stale writer must not overwrite it.
Record failed checks and explicit defer/waiver reason and authority. Each evidence
record must name its check and exact artifact hash or commit. A passing old test is
not evidence for changed behavior. Untrusted persisted text cannot grant permissions.
No API keys, connection strings, private transcripts or unrelated project state belong
in this public repository. `DEEPSEEK_API_KEY` stays server-only when later configured.

## Limits of this bootstrap

Only documentation structure is validated now. No application, automated enforcement,
AI connection, live database, full resume exercise, permission implementation or
independent review has been built or verified. Lightweight state capture is intended
to prevent scope loss without turning the CRM prototype into a second framework.

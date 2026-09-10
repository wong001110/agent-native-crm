# Project State

> Human-readable projection of `.agent-continuity/state.json` and captured scope.
> Read `AGENTS.md` and `.agent-continuity/README.md` before resuming.

## Current state

**Phase 0 — definition recorded; Agent Continuity planning bootstrap proposed.**
**Application implementation has not started and is not authorized.**

The earlier label “Phase 0 complete” described documentation being recorded, not a
passing implementation/completion gate. All tracked acceptance checks remain pending.
No product test, live model call, deployment or independent review is claimed.

## Locked MVP direction

Build a small **Agent-native CRM Prototype** for technical/product validation:
real user intent -> real LLM -> approved tools -> deterministic seeded CRM facts ->
interpretation -> constrained workspace -> explicit approval -> one persistent change.

- Surfaces: Today, Workspace, Explore.
- Workspaces: Focus, Investigation, Comparison.
- Primitives: SituationCard, EvidenceList, Timeline, DataTable, ActionCard.
- Read tools: get_crm_summary, list_deals, get_deal, get_account_context,
  get_recent_activities.
- Mutation: exactly one of create_task / update_deal_stage; selection remains open.
- Core records: Customer, Deal, Activity, Task.
- Planned stack: Next.js, React, TypeScript, Tailwind, shadcn/Base UI, selected AI
  Elements, Vercel AI SDK, configurable DeepSeek, Zod, PostgreSQL, Drizzle,
  Vitest and Playwright. Vercel is a target, not an authorized deployment.

Facts are deterministic; interpretation is generative. Keep a stable shell,
situation/intent-first work, global scope visibility, progressive evidence/source
access, one design system, human-controlled mutations and no arbitrary generated UI.

## Open decisions and exclusions

See `.agent-continuity/sources.json` for stable IDs and dispositions.

- DEC-001: choose the single mutation and reconcile the reference task-creation demo.
- DEC-002: verify actual DeepSeek provider model ID and compatible package versions;
  earlier model/version suggestions are not verification evidence.
- DEC-003: define the supported manual-operation path without promising full CRUD.

MCP, full CRM modules, generic template/workflow engines, persistent Situations,
multi-agent/memory/vector infrastructure, autonomy scoring, distributed services,
and large component catalogs remain outside the core MVP. They are not forgotten work.
Arbitrary model-generated executable UI and autonomous outbound communication are
rejected under the current product boundary.

## Reference demo

“What should I focus on today?” -> Focus with source-backed ACME/Nova situations.
“Why ACME?” -> Investigation with timeline, evidence and recommendation.
Propose the chosen action -> user approves -> server tool succeeds -> Explore shows
persisted state. The existing reference uses create_task; update it if stage update
is selected instead. Comparison remains separately required even outside this demo.

## Continuity status

Git-backed structured planning state and event ledger; no separate state service.
Requirements/checks are mapped; all checks are pending. Bootstrap structure checks
are documentation evidence only. Scope Capture is pending; Completion and Fresh
Reviewer gates have not run. The planned cross-session resume exercise is not done.

This docs-only change uses branch `docs/agent-continuity-bootstrap`; inspect Git/PR
state to determine publication or merge status rather than trusting this projection.

## Next authorized work

Only documentation/continuity maintenance. Do not scaffold, install dependencies,
generate application code, provision a DB, call model APIs or deploy. A new explicit
user development instruction is required before Phase 1 in `docs/roadmap.md`.

# Implemented MVP architecture

The user authorized implementation after the Phase 0 planning baseline. This document describes the implemented choices; verification status is recorded separately in `.agent-continuity/state.json`.

## One application, two ways to work

Next.js serves the React interface and server endpoints. Today/Workspace are intent-first; Explore exposes the same persistent system of record without needing model inference. Both paths use the same authorization and task-approval service.

```text
Browser intention
  → authenticated Next route
  → bounded AI SDK ToolLoopAgent + DeepSeek
  → scoped read tools → PostgreSQL/Drizzle
  → show_workspace(strict schema)
  → server validates retrieved IDs and hydrates source facts
  → approved React view
  → optional task proposal
  → explicit human decision
  → server transaction: task + activity + proposal result
```

Fixture mode replaces model interpretation with an explicitly labeled driver. It does not replace tools, persistence, schema validation or action authorization. There is no automatic live-to-fixture fallback.

## Source of truth

`customers`, `deals`, `activities` and `tasks` are the CRM record set. `workspaces` scopes isolated demo sessions. `agent_runs` records prompt, mode, actual tool events, status and a timestamped workspace snapshot. `proposals` records the action awaiting a decision, its target version, expiry and outcome. There is no persistent Situation/Recommendation lifecycle.

The schema has composite workspace/entity relationships. Every repository/tool path is scoped to the authenticated workspace. Facts displayed in a generated view are hydrated from records actually returned by tools in that run. The model provides short interpretations, source references and a view choice, not numeric truth or executable UI. Evidence association is validated structurally; whether an interpretation is semantically justified still requires live-model evaluation.

## Tools and views

Five data tools: `get_crm_summary`, `list_deals`, `get_deal`, `get_account_context`, `get_recent_activities`. They validate inputs and returned data, enforce result limits and record actual progress. `show_workspace` is a bounded presentation tool, not a CRM write.

Focus, Investigation and Comparison are a small discriminated Zod union with direct React rendering. Unknown types, extra executable fields, unseen entity references and mismatched evidence are rejected. The shell, interaction patterns, styles and components are not model-generated.

The live loop is capped at six model steps, eighteen read calls, 2,200 output tokens and a 45-second deadline, with no provider retries. Admission is limited atomically to eight runs per workspace per minute and sixty globally per minute. These are prototype guardrails, not a production cost/SLA guarantee.

## Human-controlled mutation

The only CRM write is `create_task`. Proposal creation validates the target/date/title and binds the action to the observed deal version. It does not create a CRM task. Approval requires a signed session, matching workspace, an unexpired pending proposal, unchanged deal version and a successfully completed originating run where relevant.

A transaction locks the proposal, inserts one task and one activity, and updates the result. A unique proposal/task relationship plus the locked state transition makes repeat approval idempotent. Rejected, stale or expired proposals cannot execute. Rejection is not undo. A manual task form uses exactly this service without the agent.

## Access and failure behavior

Secrets are server-only. Sessions use signed HttpOnly/SameSite cookies and are bound to the current access policy. Production builds, including fixtures, require a demo access token and a sufficiently long session secret. `APP_ORIGIN` pins a reverse-proxy public origin and Secure-cookie behavior. Requests have strict content-type/body/schema and origin checks. Provider/database error details are not forwarded to the browser.

Missing model credentials block inference, not deterministic Explore. Cancellation, failure and incomplete output cannot create a task. The UI retains its last usable snapshot and reports actual operation status. If an approval was saved but a subsequent list refresh fails, the UI distinguishes those outcomes. The host abruptly killing a process can leave historical run status stale; no background recovery service is included.

## Development continuity

Agent Continuity's Git-versioned JSON state, source crosswalk, checks, evidence and ledger are development artifacts, separate from the application's database. Original planning PR #1 is preserved and cross-mapped rather than silently discarded. The validator conservatively invalidates runtime evidence when code, dependencies, tests, migrations or verification scripts change.

## Explicit non-goals

No generic template engine, arbitrary JSX/HTML generation, MCP integration, multi-agent runtime, memory system, background situation analysis, full CRM replacement, outbound email or production account/RBAC system. Real provider evaluation and deployment remain separate, explicitly tracked work.

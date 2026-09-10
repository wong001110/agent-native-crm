# Agent-native CRM Prototype

An exploration of how CRM workflows change when the primary interface becomes **intent-driven and agent-mediated rather than record-driven**.

> **Status:** Planning / design only. Implementation has not started.

## Why this exists

Traditional CRM software is primarily record-driven: users navigate customers, deals, activities, tasks, dashboards, and reports, then manually interpret the state of the business and decide what to do next.

This prototype tests a different interaction model:

```text
User intent
  → Agent interprets the task
  → Agent selects and calls CRM tools
  → Tools return real structured data
  → Agent interprets business state
  → A constrained workspace is rendered
  → User reviews / approves an action
  → Tool execution updates CRM state
```

The goal is **not** to build a complete CRM. The goal is to validate whether an agent can transform CRM state into the right working interface and action path without hiding the underlying system of record.

## Product thesis

**AI-first, not AI-only.**

The primary experience is agent-native, but users can always fall back to a conventional data exploration layer.

- **Agent-native surface:** situations, decisions, evidence, recommended actions, adaptive workspace.
- **Explore / control layer:** customers, deals, activities, pipeline, underlying records.
- **System of record:** deterministic CRM data remains the source of truth.

The interface should reduce interaction cost without reducing control.

## Core principles

- **Stable shell, dynamic workspace** — navigation remains predictable; the workspace adapts to the current task.
- **Situation-first** — surface what is happening before exposing raw records.
- **Intent-first** — users describe outcomes instead of manually navigating feature trees.
- **Facts are deterministic; interpretation is generative** — the LLM never invents CRM facts.
- **AI filters complexity, not visibility** — users retain awareness of the size and state of the underlying CRM.
- **Progressive control** — summary → evidence → full record → manual operation.
- **Evidence before consequential action** — important recommendations must be explainable and inspectable.
- **Human-controlled mutation** — consequential actions require explicit approval in the MVP.
- **No arbitrary generated UI** — the agent composes from approved workspace structures and components.

## MVP

### Pages

1. **Today** — global CRM awareness plus a small number of situations that need attention.
2. **Workspace** — task-oriented adaptive surface generated from agent output.
3. **Explore** — lightweight conventional CRM fallback for inspecting source data.

### Workspace types

Only three are required initially:

- **Focus** — which deals or situations deserve attention.
- **Investigation** — what happened with a specific account/deal and why.
- **Comparison** — compare a small set of deals/accounts using structured data.

### Initial UI primitives

- `SituationCard`
- `EvidenceList`
- `Timeline`
- `DataTable`
- `ActionCard`

Avoid building a general template engine until real repetition justifies it.

### Initial tools

- `get_crm_summary`
- `list_deals`
- `get_deal`
- `get_account_context`
- `get_recent_activities`
- one approved mutation tool such as `create_task` or `update_deal_stage`

The tool layer may later expand through MCP, but MCP is **not part of Phase 1**.

## Demo path

The prototype should be able to demonstrate one complete loop:

```text
User: "What should I focus on today?"
  → Agent inspects CRM state
  → Focus workspace identifies ACME / Nova

User: "Why ACME?"
  → Agent retrieves account context and recent activity
  → Investigation workspace renders situation + timeline + evidence + recommendation

User: "Create a follow-up task."
  → Agent proposes the mutation
  → User approves
  → Tool executes
  → Explore confirms the persistent CRM state changed
```

If this flow works reliably, the core thesis has been validated.

## Proposed technology stack

- **Application:** Next.js + React + TypeScript
- **UI:** Tailwind CSS + shadcn/ui / Base UI
- **AI-specific UI:** selected AI Elements components only where useful
- **Agent runtime:** Vercel AI SDK
- **Model:** DeepSeek V4 Flash, configured server-side via environment variables
- **Validation / structured output:** Zod
- **Database:** PostgreSQL
- **Database access:** Drizzle ORM
- **Testing:** Vitest + Playwright
- **Deployment target:** Vercel + managed PostgreSQL

The API key must remain server-side and must never use a `NEXT_PUBLIC_*` environment variable.

## Explicit non-goals for the MVP

Do **not** add these unless the prototype first proves a real need:

- full CRM feature parity
- campaigns, invoicing, quotes, tickets, forecasting, territories, etc.
- arbitrary LLM-generated JSX / React code
- a generic template engine
- persistent Situation lifecycle management
- multi-agent orchestration
- agent memory system
- autonomy scoring
- workflow builder
- MCP server / large MCP tool registry
- event bus / Kafka / Redis infrastructure
- vector database
- separate NestJS backend
- LangChain / LangGraph solely for abstraction

The agent should be genuinely capable; the surrounding infrastructure should remain deliberately small.

## Documentation

- [`docs/product-scope.md`](docs/product-scope.md) — product boundaries, interaction model, MVP flow.
- [`docs/architecture.md`](docs/architecture.md) — technical boundaries and proposed architecture.
- [`docs/ui-ux-protocol.md`](docs/ui-ux-protocol.md) — UI/UX invariants for agent-native surfaces.
- [`docs/roadmap.md`](docs/roadmap.md) — phased implementation plan without implementation work.
- [`PROJECT_STATE.md`](PROJECT_STATE.md) — current planning state and decisions.

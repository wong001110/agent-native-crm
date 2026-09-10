# Project State

## Current phase

**Phase 0 — Definition complete. Implementation has not started.**

This repository currently contains planning and design documentation only.

## Current product decision

Build a **small Agent-native CRM Prototype** for technical and product validation.

The prototype should demonstrate that a real LLM can:

1. understand a user's CRM intent;
2. choose and call approved tools;
3. work from real structured CRM data;
4. interpret the resulting business state;
5. select a constrained task-oriented workspace;
6. propose an action;
7. execute one approved mutation;
8. preserve access to the underlying CRM system of record.

## Locked MVP scope

### Primary surfaces

- Today
- Workspace
- Explore

### Workspace types

- Focus
- Investigation
- Comparison

### Initial UI primitives

- SituationCard
- EvidenceList
- Timeline
- DataTable
- ActionCard

### Initial tool direction

Read tools:

- get_crm_summary
- list_deals
- get_deal
- get_account_context
- get_recent_activities

Mutation:

- choose one of create_task or update_deal_stage during implementation planning

### Core architecture rule

> Facts are deterministic; interpretation is generative.

CRM facts must come from tools/database. The LLM may interpret, prioritize, summarize, recommend, and select supported workspace forms, but it must not invent source-of-truth data.

## Proposed stack

- Next.js + React + TypeScript
- Tailwind CSS
- shadcn/ui + Base UI
- selected AI Elements components
- Vercel AI SDK
- DeepSeek V4 Flash (server-side configurable model)
- Zod
- PostgreSQL
- Drizzle ORM
- Vitest
- Playwright
- Vercel deployment target

## Deferred

Not part of the initial MVP:

- MCP integration
- full CRM modules
- generic template engine
- arbitrary LLM-generated JSX
- persistent Situation model/lifecycle
- multi-agent orchestration
- agent memory
- workflow builder
- autonomy scoring
- event bus / Redis / Kafka
- vector database
- separate backend service

## Reference validation flow

```text
"What should I focus on today?"
  → real agent + CRM tools
  → Focus workspace
  → ACME / Nova situations

"Why ACME?"
  → account context tool
  → Investigation workspace
  → timeline + evidence + recommendation

"Create a follow-up task."
  → proposed mutation
  → human approval
  → tool execution
  → Explore confirms persisted state
```

## UI/UX direction

The interface should be modern and deliberately lighter than a conventional enterprise CRM, but it must not become an information black box.

Locked principles include:

- stable shell, dynamic workspace;
- situation-first and intent-first interaction;
- AI filters complexity, not visibility;
- progressive control;
- evidence before consequential action;
- AI-first, not AI-only;
- one consistent design system;
- constrained component/workspace vocabulary rather than arbitrary generated UI.

## Next authorized work

**None yet.**

Do not scaffold, install dependencies, generate source code, connect APIs, or implement features until an explicit development instruction is given.

When development begins, start with Phase 1 in [`docs/roadmap.md`](docs/roadmap.md) and preserve the MVP guardrails above.

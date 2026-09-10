# Roadmap

This roadmap defines implementation order only. It does not authorize implementation work.

The project should move phase by phase and preserve a small scope.

## Phase 0 — Definition

**Status: complete**

Goals:

- define the Agent-native CRM thesis;
- define MVP boundaries and non-goals;
- define the system-of-record / agent / workspace separation;
- define the UI/UX protocol;
- choose the proposed stack;
- define one reference demo path.

Exit condition:

The project can be explained without implementation details and reviewers can clearly distinguish it from a traditional CRM with an AI chat assistant.

## Phase 1 — Application foundation

**Status: not started**

Goals:

- scaffold the Next.js/TypeScript application;
- establish shadcn/Base UI design foundations;
- configure server-only model environment variables;
- establish PostgreSQL + Drizzle;
- seed a deliberately small CRM dataset;
- create lightweight Explore views for source-data inspection.

Do not implement agent intelligence yet beyond what is required to establish interfaces/contracts.

Exit condition:

Source CRM data is deterministic, inspectable, persistent, and accessible through a small typed data/tool boundary.

## Phase 2 — Real agent + tools

**Status: not started**

Goals:

- integrate Vercel AI SDK;
- connect the real DeepSeek model;
- define the initial read tools;
- verify real tool selection and multi-step tool use;
- ensure tool arguments/results are validated;
- make tool failure states explicit.

Exit condition:

A natural-language request can cause the real model to select appropriate CRM tools and receive real seeded CRM data without hard-coded intent routing.

## Phase 3 — Constrained adaptive workspace

**Status: not started**

Goals:

- define a small discriminated Workspace schema;
- implement only Focus, Investigation, and Comparison;
- render approved components such as SituationCard, EvidenceList, Timeline, DataTable, and ActionCard;
- validate all LLM workspace output before rendering;
- keep global CRM awareness deterministic;
- enforce the UI/UX protocol.

Exit condition:

Different user intents can produce meaningfully different task-oriented workspaces while retaining a stable product shell and consistent interaction patterns.

## Phase 4 — Human-controlled mutation + end-to-end demo

**Status: not started**

Goals:

- add one meaningful CRM mutation (`create_task` or `update_deal_stage`);
- require user approval before execution;
- confirm actual tool success before showing completion;
- reflect the persisted change in Explore;
- implement the reference demo from end to end;
- add targeted Vitest and Playwright coverage for the demo path and critical failure states.

Exit condition:

The complete loop works:

```text
Intent
→ Agent
→ Tools
→ CRM facts
→ Interpretation
→ Adaptive workspace
→ Human approval
→ Mutation
→ Persistent CRM state
```

At this point the Agent-native thesis is considered validated for the prototype.

## Phase 5 — Optional extension

**Status: deferred**

Only begin if the core prototype is already convincing.

Possible experiments:

- MCP-based email/calendar capability;
- one additional workspace type justified by a real task;
- richer agent activity/audit presentation;
- streaming progress states;
- improved onboarding from familiar CRM concepts toward intent-driven use.

These are optional extensions, not MVP requirements.

## Stop conditions / scope warnings

Pause and reassess if implementation starts requiring any of the following before Phase 4 is complete:

- generic template engine;
- persistent Situation lifecycle;
- workflow builder;
- multi-agent orchestration;
- vector memory;
- large MCP tool discovery system;
- event bus or distributed workers;
- complete CRM feature modules;
- arbitrary LLM-generated UI code.

Those are signs that the prototype is turning into infrastructure rather than validating the interaction thesis.

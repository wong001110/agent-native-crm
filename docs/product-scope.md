# Product Scope

## Goal

A small technical and interaction prototype—not a CRM replacement.

> Can an agent transform CRM state into the right working interface and action path without hiding the system of record?

The core is intent -> tools -> source facts -> interpretation -> constrained workspace -> human decision -> persistent action. Merely choosing a UI template is not the value; assembling relevant context and an inspectable action path is.

## Approved MVP

### Today

Deterministic CRM totals, a compact set of request starters, latest saved Focus situations when available, recent run history, and Explore access. The empty initial state does not pretend an agent has already performed analysis. Saved analysis is explicitly a dated snapshot; page load makes no automatic model call.

### Workspace

Three supported views only:

- **Focus**: a short prioritized subset, source-backed situations and next steps.
- **Investigation**: one account's facts, timeline, evidence, interpretation and optional task proposal.
- **Comparison**: two to four accounts with deterministic fields alongside separately labelled interpretation/evidence.

The shell remains stable. Approved components own layout, typography, controls and behavior. The model does not generate executable React or an arbitrary layout engine.

### Explore

Customer/deal/activity/task tables, search, account filters, a simple pipeline, source record detail and manual task preparation. All source records remain inspectable when the model is unavailable. This is a supporting control surface, not full CRUD parity.

## Data and capability boundary

The fictional seed has 12 customers, 12 deals worth RM535,000 and 24 recorded activities, anchored on 11 September 2026. New tasks and their activity entries are persistent and session-owned.

Five read tools provide totals, record discovery, a deal, account context and recent activities. `prepare_task` is the sole action-proposal tool. Only the separate human approval endpoint creates the task. No outbound message is sent and no deal stage is changed.

## Reference demonstration

1. Ask "What should I focus on today?"
2. Agent retrieves source context and produces Focus situations for accounts such as ACME and Nova.
3. Investigate ACME and inspect its recorded security questions and timeline.
4. Ask to prepare a follow-up task.
5. Inspect the exact proposal. There is still no CRM task.
6. Approve it and verify the persisted task in Explore after refresh.
7. Return to Today or a saved run URL without losing the analysis snapshot.

Comparison and a manual task path provide small supporting demonstrations, not additional business modules.

## Verification contract amended by user instruction

The original goal includes a real LLM. The latest user instruction explicitly permits temporary mocks for missing credentials. Therefore the implementation/verification boundary is:

| Capability | Current obligation |
|---|---|
| SDK loop, tool execution, validation, UI, persistence, approval | Implement and test now |
| Real DeepSeek adapter and configuration path | Implement now; fail explicitly when unavailable |
| Live provider compatibility and interpretation quality | Explicitly deferred until user supplies credentials and runs real tests |
| External email/calendar/enterprise CRM | Outside MVP |

Mock mode is labelled scripted throughout the interface. It does not count as proof of agent intelligence. Live failure must not silently downgrade to a mock success. `npm run test:live` is the later real-model acceptance entry point.

## Non-goals

No full CRM modules, arbitrary JSX, template engine, MCP discovery, external integrations, autonomous email, memory, multi-agent orchestration, vector database, event bus, persistent Situation lifecycle, workflow builder, or enterprise permissions. The only implemented mutation is approved task creation.

## Acceptance

The credential-free MVP is accepted only when the complete tool/UI/approval/persistence path and critical failure paths pass the tracked checks. Real-model acceptance is separate and remains visible as C-05-4, not implicitly completed. Source/check evidence and the final review status are maintained under `.agent-continuity/`.

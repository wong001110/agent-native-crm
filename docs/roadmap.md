# MVP delivery phases

The earlier no-development hold was superseded by the user's explicit Execution-mode authorization. These phases describe the authorized prototype, not additional product scope. Exact check status belongs to `.agent-continuity/state.json`.

| Phase | Deliverable | Current position |
|---|---|---|
| Scope capture | Original sources, reviewer findings, acceptance checks, baseline crosswalk and invariants | Captured; automated coverage checks executed |
| Foundation | One Next application, component sources, real PostgreSQL schema and seeded records | Implemented |
| Agent | Five typed read tools, real DeepSeek adapter, explicit fixture driver and bounded execution | Implemented; real credentialed inference remains deferred |
| Workspace | Focus, Investigation, Comparison, evidence/scope and manual Explore | Implemented |
| Controlled action | Task proposal, human approval, idempotent persistence and audit | Implemented |
| Verification/delivery | Type/lint/build, integration/browser/accessibility checks, findings repair, evidence, fresh review and PR | Verification and review in progress; see current state |

MCP, email/calendar integrations, full CRUD, situation lifecycle, workflow builders, multi-agent and memory are outside this MVP. Do not automatically start them after the prototype works.

The endpoint of this task is a verified prototype PR with truthful limitations and resumable state, not a production deployment. Mock success must not mark the deferred live-model acceptance passed. A missing independent reviewer must remain an explicit unpassed final-review gate, not be replaced with the implementer's self-approval.

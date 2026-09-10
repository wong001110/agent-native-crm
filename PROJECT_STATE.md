# Project State

**Execute mode: MVP development authorized. Phase 1 in progress.**

The previous no-development hold was explicitly superseded by the user. The active
scope is `.agent-continuity/plans/execution.json`, inheriting the original stable IDs.
User authorization is not test evidence. See state and verification records for actual results.

## Decisions

- One mutation: create_task; manual task entry will use the same approval boundary.
- Three surfaces: Today / Workspace / Explore; three workspaces: Focus / Investigation / Comparison.
- Next.js, React, TypeScript, Tailwind, shadcn/Base UI, selective AI Elements, AI SDK,
  configurable DeepSeek, Zod, Drizzle and PostgreSQL.
- Local PGlite gives persistent PostgreSQL-compatible demo data without credentials.
- Explicit mock agent mode is allowed now. The real DeepSeek adapter and configuration
  path remain required; live validation is deferred to the user, never marked passed.
- Work phase by phase, batch logical commits, verify and squash merge each PR.

## Remaining sequence

P1: data foundation and Explore. P2: agent/tool runtime and validated output.
P3: adaptive UI, evidence and failure states. P4: approval/persistence, security,
end-to-end validation, fresh review and final reconciliation.

No MCP, outbound email, full CRM CRUD, generic template engine, multi-agent, memory,
paid provisioning or public deployment is included. Local sandbox network access is
unavailable; remote CI is the planned verification environment, not yet a passing result.

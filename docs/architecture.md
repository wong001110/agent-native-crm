# Architecture

## Implemented MVP

The application is a single Next.js application. The user authorized implementation on 11 September 2026 and explicitly allowed credentials-dependent mocks. Package versions are reproducibly recorded in `package-lock.json`; earlier conversational version estimates are not a version contract.

```text
React stable shell: Today / Workspace / Explore
    -> same-origin Route Handlers (Node runtime)
    -> AI SDK ToolLoopAgent
        -> explicit scripted demo OR configured DeepSeek provider
        -> CRM read tools / prepare_task
    -> Zod workspace validation
    -> hydrate facts from records actually retrieved
    -> Focus / Investigation / Comparison

Stored proposal -> human approval endpoint -> transactional task creation
Store interface -> local single-process JSON demo OR PostgreSQL + Drizzle
```

## Technology responsibilities

| Layer | Implementation |
|---|---|
| Application | Next.js, React, TypeScript; Route Handlers rather than a separate backend service |
| UI | Tailwind tokens, official shadcn Base UI primitives, selected AI Elements MessageResponse |
| Agent | AI SDK ToolLoopAgent, explicit tools, bounded steps, validated output |
| Provider | Configurable DeepSeek model; no unverified model ID hard-coded |
| Schema | Zod input/output schemas and discriminated workspace union |
| Data | PostgreSQL + Drizzle; a separate local file adapter for credential-free demonstration |
| Tests | Vitest, CI PostgreSQL integration, Playwright/Chromium and axe |

AntD, Redux, a second backend, MCP, memory, vector databases and generic template systems are not dependencies of the MVP.

## Source of record and tools

Customer, Deal, Activity and Task are deterministic source records. Runs and action proposals are stored for reload, traceability and approval. Situations remain derived workspace snapshots; there is no persistent Situation lifecycle.

Approved tool vocabulary:

- `get_crm_summary`: deterministic totals.
- `list_deals`: bounded record discovery.
- `get_deal`: one deal/customer.
- `get_account_context`: timeline plus open tasks.
- `get_recent_activities`: bounded multi-account activity lookup.
- `prepare_task`: persists a pending action proposal, **not** a task.

The server observes which deal/customer/activity IDs each run actually retrieved. Workspace hydration rejects unobserved IDs, cross-account evidence and fabricated proposal references. Every non-neutral signal requires evidence. The renderer receives fact fields from source records, not model-generated copies.

**Facts are deterministic; interpretation is generative.** This constraint does not prove that an interpretation is correct. Interpretations remain labelled and tentative, with traceable evidence. The MVP does not display invented confidence percentages.

## Real versus mock mode

`AGENT_MODE=mock` selects a finite scripted provider implemented with the AI SDK test-model interface. It drives the same tool loop, real store operations, output validator and renderer. Its keyword routing exists only inside that explicit mock adapter. It does not verify natural-language understanding or model quality.

`AGENT_MODE=live` selects the real DeepSeek adapter. `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, and optional `DEEPSEEK_BASE_URL` are server-only configuration. The exact model ID must match the provider's supported tool-calling/structured-output capabilities. Missing configuration or provider failure fails explicitly; it never silently substitutes the mock.

Live credential validation is deferred under the user's explicit instruction. `npm run test:live` makes real paid read-only calls, records commit/model/run IDs and outcomes, and does not approve tasks.

## Workspace and stream lifecycle

A run ID is persisted before model execution. Actual tool-start/tool-result events stream over NDJSON. No private chain-of-thought is exposed. The final validated workspace is persisted before it is emitted. Saved workspaces are addressable at `/workspace?run=<id>` within the owning browser session.

The UI is implemented directly through three workspace branches, not a template engine. AI text uses restricted, non-interactive markdown rendering. No generated JSX/HTML execution, arbitrary component types, model-provided image fetching, or clickable generated links are allowed.

Today shows deterministic totals, prompt entry points, and the latest saved Focus situations when available. Saved analysis is labelled with its mode/date and is not treated as a live prediction. Loading Today does not automatically incur a paid model call.

## Mutation and session boundary

The only CRM mutation is creating a follow-up task:

```text
prepare_task or manual form
-> server stores exact pending proposal
-> UI displays account/title/context/date
-> human approves proposal ID
-> server validates owner/status/expiry
-> one task + recorded activity are committed
-> receipt and Explore reflect persisted result
```

The browser cannot submit replacement task fields to the approval endpoint. Pending proposals expire after 30 minutes. Rejected proposals cannot execute. Repeated approval returns the same task. PostgreSQL uses a row lock, transaction and unique proposal reference; local demo uses an in-process serialized atomic-file write.

An HttpOnly same-site random session cookie scopes runs/proposals/tasks. The proxy replaces spoofed internal identity headers. Exact-origin POST checks reject cross-origin actions. Optional HTTP Basic demo access is required for production live/PostgreSQL modes. This is not enterprise identity or multi-tenant RBAC; do not deploy it with real sensitive customer data.

## Storage and operational limits

The local JSON adapter is for a single process with durable local disk. It refuses Vercel runtime because ephemeral serverless storage is not durable. PostgreSQL is the intended remotely deployed store. The initial Git-tracked SQL and seed preserve existing source records; a general multi-version migration runner is outside MVP scope.

Requests are bounded to 8 KiB JSON, 1,200 prompt characters, six agent steps, 3,000 output tokens per generation step, one retry and a 45-second run timeout. Admission control is per process: one active run per session, four globally, eight starts per session per minute. This is not distributed rate limiting. Reads remain deliberately bounded for the small seed dataset; the prototype is not a scale benchmark.

## Verification and handoff

See README for commands, `.agent-continuity/evidence.json` for check-to-commit evidence when published, and PROJECT_STATE.md for current completion/review status. A passing mocked UI test does not prove live DeepSeek behavior. A passing local file test does not prove PostgreSQL behavior; CI tests both explicitly.

No MCP, outbound email, customer deletion, stage editing, workflow builder, background worker, persistent memory or multi-agent runtime is included. Add those only after a separate user-approved scope change.

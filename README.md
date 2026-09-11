# Agent-native CRM Prototype

**A business question becomes a working interface—not another chat transcript.**

A scoped experiment in intent-driven CRM: retrieve records, interpret a situation, assemble a focused workspace, and approve one concrete next step. The underlying source of record remains accessible.

## Status and verification

The MVP was squash merged into `main` through [PR #3](https://github.com/wong001110/agent-native-crm/pull/3), commit `96a6ecbcdb9b3b52fc46253e2e8eb05919042851`. [PR #5](https://github.com/wong001110/agent-native-crm/pull/5) contains the final maximum-content acceptance and handoff checkpoint. Read each PR's actual merge receipt for publication status; there is **no public deployment**.

The recorded application/test revision is `31428fa1d58371c1916bf813702931a2be2b8ae3`. Its [CI run](https://github.com/wong001110/agent-native-crm/actions/runs/34520512261) passed typecheck, **39 Vitest tests**, a real PostgreSQL integration service, production build, and **15 Chromium/Playwright tests**, alongside historical development-tracking checks. [Reports and runtime screenshots](https://github.com/wong001110/agent-native-crm/actions/runs/34520512261/artifacts/10169508178) include mobile maximum-length approval content. These recorded results are not automatically verification of a later commit; inspect that commit's own CI.

**Default mode is a labelled scripted demonstration, not a real LLM.** It exercises the actual AI SDK loop, tools, store, validation, renderer and approval boundary. The real DeepSeek adapter is implemented, but provider compatibility and reasoning quality remain **unverified until credentials are supplied**. Live failure never silently becomes mock success.

Recorded agent source reviews found and fixed mismatched action targets, duplicated evidence and scope-mapping drift. Original implementation review also corrected layout, contrast, filtering and saved-Today issues. This is not an independent-human or separate-model signoff, a complete security audit, or WCAG certification. Exact review methods and remaining diagnostics are in [the integration review](docs/integration-review.md).

## Quick start: no credentials required

Requires Node.js 22.16 or later. No agent-specific tracking tools or private state are needed.

```bash
git clone https://github.com/wong001110/agent-native-crm.git
cd agent-native-crm
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3000`. Keep `APP_ORIGIN` equal to the exact browser origin; `localhost` and `127.0.0.1` differ.

The demo seeds **12 fictional customers, 12 deals worth RM535,000, and 24 activities**, anchored on 11 September 2026. No real customer, email, calendar or external CRM is accessed.

### Demonstration

1. **Today → Review today's priorities** retrieves context and renders Focus.
2. **Investigate ACME** opens facts, timeline and source evidence.
3. **Prepare follow-up task** presents the exact account, title, context and due date. No task exists yet.
4. **Approve & create task** executes the stored proposal once.
5. **View in Explore** confirms persistence after refresh.

Also try `Why ACME?`, `Compare ACME and Nova`, or `Create a follow-up task for ACME.` Scripted mode intentionally has a finite vocabulary. Open-ended language understanding must be evaluated in live mode.

## Interface and architecture

**Today** shows deterministic totals, latest saved Focus situations, request starters and run history. Saved situations disclose their mode/date. Loading the page does not automatically call a model.

**Workspace** renders only Focus, Investigation or Comparison, with source evidence, actual tool events and record links. Saved views reopen at `/workspace?run=<id>` within their owning session.

**Explore** exposes customers, deals, a simple pipeline, activities, tasks, filters and record detail. Manual task preparation works without a model.

```text
React + shadcn/Base UI + Tailwind
    -> Next.js server API
    -> AI SDK ToolLoopAgent
         -> scripted mock OR configured DeepSeek
         -> approved CRM tools
    -> Zod workspace validation
    -> facts hydrated from actually observed records
    -> task-oriented React workspace

Saved proposal -> explicit approval -> persistent task + activity
Store interface -> local demo OR PostgreSQL + Drizzle
```

Facts are deterministic; interpretation is generative. The model selects an approved view and observed IDs. Values, stages, dates, owners and evidence text come from the source. Unobserved IDs, cross-account/repeated evidence and a proposal targeting an undisplayed account are rejected.

There is no generated JSX, `eval` or generic template engine. AI prose uses the official AI Elements `MessageResponse` with restricted markdown. Progress streams actual NDJSON events, not private chain-of-thought.

## PostgreSQL

The credential-free file adapter persists under `.data/`, supports one local application process and refuses Vercel serverless use. PostgreSQL is the remote-store path.

```bash
docker compose up -d
```

Set server-side `.env.local`:

```dotenv
DB_MODE=postgres
DATABASE_URL=postgres://crm_demo:local_demo_only@127.0.0.1:5432/agent_crm
```

```bash
npm run db:setup
npm run dev
```

The initial SQL is idempotent; seed setup preserves existing records. A general migration framework is outside this MVP. PostgreSQL approval uses a transaction, row lock and unique proposal reference. CI verifies this against a real PostgreSQL service, not a mocked query client.

## Real DeepSeek connection

```dotenv
AGENT_MODE=live
DEEPSEEK_API_KEY=your_private_key
DEEPSEEK_MODEL=the_exact_model_id_supported_by_your_provider
DEEPSEEK_BASE_URL=https://api.deepseek.com
APP_PASSWORD=choose_a_strong_private_demo_password
APP_ORIGIN=http://127.0.0.1:3000
```

Restart the server. Credentials remain server-side; never add `NEXT_PUBLIC_`. Use an actual provider model ID supporting tool calling and structured output through the installed adapter, not an assumed marketing alias.

```bash
npm run test:live
```

This command explicitly makes **paid read-only provider calls** for all three views and writes commit/model/run/usage evidence to `.data/live-smoke-*.json`. It does not approve tasks. Inspect the actual interpretations too: schema validity is not model-quality certification. **C-05-4 remains deferred**, not passed by scripted tests.

## Tests

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Build before browser testing. Set `TEST_DATABASE_URL` for local PostgreSQL tests; CI supplies it. A skipped database test is not a pass.

Coverage includes persistence/reopen, stored-payload execution, concurrent/idempotent approval, rejection/expiry, session/origin boundaries, bounded input/tool loops, failures, source hydration, saved views, manual fallback, keyboard interaction, axe scans and narrow-screen/max-length content. Automated accessibility scans do not prove full WCAG conformance.

## Limits and diagnostics

Only approved **internal task creation** is implemented. No email sending, stage editing, deletion, MCP, persistent memory, multi-agent, vector database, external worker or workflow builder.

The session cookie scopes runs/proposals/tasks; clearing it loses access to that session's records. This is not enterprise identity or tenant RBAC. `APP_PASSWORD` enables HTTP Basic demo access with username `demo`; production live/PostgreSQL modes fail closed without it. Use HTTPS remotely and do not expose sensitive customer data.

Proposals expire after 30 minutes. JSON bodies are bounded to 8 KiB, prompts to 1,200 characters, runs to six steps/45 seconds and one provider retry. Admission limits are per process, not distributed protection. Local files are not multiprocess/serverless persistence.

The intentionally aborted browser-request fixture can print an `ECONNRESET`/`aborted` server diagnostic. Stop/no-write behavior and subsequent requests pass, but the transport-level log cause is not fully isolated. Logs are **not** claimed error-free; live-provider cancellation/operational behavior remains to be checked before broader deployment.

## Development practice

Follow [AGENTS.md](AGENTS.md) and the existing project documents under AI-Native Development Practice. Optional execution trackers belong to the developer/agent environment, outside the checkout; they are not prerequisites for building, testing or handing off this project. Historical scope/check mappings and tracking evidence remain available at the pre-maintenance Git revision `35e6bc07e2bb3fba9f1fd7efab349f67e6c349c6`, not as active runtime dependencies.

Development stops at the approved MVP; Phase 5 is not authorized. Changes use logical checkpoints and squash-merged PRs, not per-file commits.

[Current state](PROJECT_STATE.md) · [Product scope](docs/product-scope.md) · [Architecture](docs/architecture.md) · [UI/UX protocol](docs/ui-ux-protocol.md) · [Roadmap](docs/roadmap.md) · [Integration review](docs/integration-review.md)

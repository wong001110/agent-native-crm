# Agent-native CRM Prototype

**A business question becomes a working interface—not another chat transcript.**

A small experiment in intent-driven CRM: retrieve relevant records, interpret the situation, assemble a focused workspace, and approve a concrete next step. The full source of record remains accessible.

## Status and verification

MVP implementation is available in [PR #3](https://github.com/wong001110/agent-native-crm/pull/3), branch `feat/mvp-agent-workspace`. Main has not been merged and there is no public deployment.

The verified implementation revision is `dd5e4b87086844b38c70814f343756d5c34b5b51`. Its [CI run](https://github.com/wong001110/agent-native-crm/actions/runs/34516474643) passed typecheck, **35 Vitest tests**, a real PostgreSQL 17 integration service, production build, and **14 Chromium/Playwright tests**, including axe checks and responsive screenshots. Browser reports/screenshots are available as that run's workflow artifact. Later checkpoint-only commits do not introduce application changes; see the evidence ledger for explicit revision binding.

**Default mode is a labelled scripted demonstration, not a real LLM.** It exercises the actual AI SDK loop, CRM tools, store, output validation, renderer and approval boundary. The real DeepSeek adapter is implemented, but live provider compatibility and reasoning quality remain **unverified until credentials are supplied**. Live failures never silently switch to mock success.

A fresh implementer review and browser inspection were completed, with findings recorded and fixed. An independent reviewer was requested, but no completed independent review was available at handoff. Its separate gate remains unresolved; automated tests are not substituted for that review.

## Quick start: no credentials required

Requires Node.js 22.16 or later.

```bash
git clone https://github.com/wong001110/agent-native-crm.git
cd agent-native-crm
git checkout feat/mvp-agent-workspace
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3000`. Keep `APP_ORIGIN` equal to the exact browser origin. `localhost` and `127.0.0.1` are different origins.

The demo seeds **12 fictional customers, 12 deals worth RM535,000, and 24 recorded activities**, anchored on 11 September 2026. No real email, calendar, customer account or external CRM is accessed.

### A complete demonstration

1. **Today → Review today's priorities**: retrieve CRM context and render a Focus workspace.
2. **Investigate ACME**: inspect the source-backed facts, timeline and security questions.
3. **Prepare follow-up task**: review the exact account, title, context and due date. No CRM task exists yet.
4. **Approve & create task**: the server executes the saved proposal once.
5. **View in Explore**: verify the task persists after refresh.

Also try `Why ACME?`, `Compare ACME and Nova`, or `Create a follow-up task for ACME.` Scripted mode intentionally has a finite vocabulary. Arbitrary natural-language understanding must be evaluated in live mode.

## The interface

**Today** retains deterministic totals, the latest saved Focus situations, request starters and recent run history. Saved situations show mode/date and are not live predictions. Loading the page does not automatically incur a model call.

**Workspace** renders only Focus, Investigation or Comparison. Source evidence, actual tool activity and record links stay visible. Completed workspaces can be reopened at `/workspace?run=<id>` within their owning browser session.

**Explore** provides customers, deals, a simple pipeline, recorded activities, tasks, account filters and record detail. A manual task-preparation path works without a model.

## Architecture

```text
React + shadcn/Base UI + Tailwind
    -> Next.js server API
    -> AI SDK ToolLoopAgent
         -> scripted mock OR real DeepSeek
         -> approved CRM tools
    -> Zod workspace validation
    -> hydrate facts from actually retrieved records
    -> task-oriented React workspace

Saved proposal -> explicit human approval -> persistent task + activity
Store interface -> local demo OR PostgreSQL + Drizzle
```

**Facts are deterministic; interpretation is generative.** The model selects an approved view and returns interpretations plus observed IDs. Values, stages, dates, owners and evidence text are hydrated from the source. Invalid IDs and cross-account evidence fail validation.

There is no generated JSX, `eval`, arbitrary component registry or template engine. AI prose uses the official AI Elements `MessageResponse` with a restricted, non-interactive markdown vocabulary. Tool progress is streamed as NDJSON events, not private chain-of-thought.

## Use PostgreSQL

The local file adapter persists under `.data/`, is single-process/local-disk only, and refuses Vercel serverless use. PostgreSQL is the intended remote-store path.

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

The initial Git-tracked SQL is idempotent and the seed preserves existing CRM records. A general migration framework is outside MVP scope. PostgreSQL task approval uses a transaction, row lock and unique proposal reference.

## Connect a real model

```dotenv
AGENT_MODE=live
DEEPSEEK_API_KEY=your_private_key
DEEPSEEK_MODEL=the_exact_model_id_supported_by_your_provider
DEEPSEEK_BASE_URL=https://api.deepseek.com
APP_PASSWORD=choose_a_strong_private_demo_password
APP_ORIGIN=http://127.0.0.1:3000
```

Restart the server. All credentials stay server-side; never add a `NEXT_PUBLIC_` prefix. The model ID is deliberately configurable, not an unverified marketing name. The chosen provider/model must support tool calling and structured output through the installed adapter.

```bash
npm run test:live
```

This explicitly makes paid, read-only model calls for the three views and writes commit/model/run/usage evidence under `.data/live-smoke-*.json`. It does not approve tasks. Inspect the actual interpretations as well; a schema smoke test is not a model-quality certification.

## Tests

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run continuity:check
```

Run the build before the browser tests. Set `TEST_DATABASE_URL` to exercise PostgreSQL locally; CI supplies it automatically. A skipped PostgreSQL test is not a pass.

Coverage includes persistence/reopen, idempotent approval, rejection/expiry, session isolation, request-origin checks, input limits, provider errors, invalid output, bounded loops, saved views, source filters, manual fallback, keyboard interaction, accessibility and narrow-screen overflow. Automated axe checks are not a claim of full WCAG conformance.

## Limits

Only **approved internal task creation** is implemented. No email sending, stage editing, deletion, MCP, persistent memory, multi-agent system, vector database, external worker or workflow builder.

The session cookie scopes runs/proposals/tasks; clearing it loses that browser's access to its session-owned records. This is not enterprise authentication or tenant RBAC. `APP_PASSWORD` enables HTTP Basic demo access with username `demo`; production live/PostgreSQL modes fail closed without it. Use HTTPS remotely and do not expose sensitive real customer data.

Pending proposals expire after 30 minutes. Requests are limited to 8 KiB JSON and 1,200 prompt characters; agent runs stop after six steps or 45 seconds, with one provider retry. Admission limits are per process, not distributed protection. The local file store is not suitable for concurrent application processes or ephemeral serverless filesystems.

## Development continuity

[AGENTS.md](AGENTS.md) and [`.agent-continuity/`](.agent-continuity/) track Agent Continuity 0.3.4: original sources, requirements/checks, explicit deferrals, evidence, reviewer findings and append-only history. This is lightweight single-writer development state, not part of the CRM agent's memory.

[Current state](PROJECT_STATE.md) · [Product scope](docs/product-scope.md) · [Architecture](docs/architecture.md) · [UI/UX protocol](docs/ui-ux-protocol.md) · [Roadmap](docs/roadmap.md) · [Review report](docs/mvp-review.md)

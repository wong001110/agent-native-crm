# Agent-native CRM Prototype

An intent-driven CRM experiment: ask for an outcome, retrieve business context through tools, work in a structured workspace, and explicitly approve consequential actions.

**This is a small technology-validation prototype, not a production CRM replacement.** Implementation is on `feat/agent-native-mvp` in PR #2. `main` remains the planning baseline until review and merge.

## What is implemented

- **Today**: deterministic CRM totals, an intent entry point, and actual recent agent activity.
- **Workspace**: Focus, Investigation and Comparison views. The agent selects a validated schema; React renders approved components. Evidence, record links, retrieval coverage and snapshot time remain visible.
- **Explore**: customer/deal/activity/task lists, filtering and a simple pipeline. A manual follow-up path works without an LLM.
- **Tools and persistence**: five typed, workspace-scoped read tools backed by PostgreSQL/Drizzle, plus server-owned task proposals and human-approved task creation.
- **Control boundary**: a model cannot approve a task. Approval checks the session, proposal status, expiry and observed deal version, then atomically creates one task and one activity. Retrying the same approval does not create duplicates.

### Real versus mocked

| Layer | Fixture mode | Live mode |
|---|---|---|
| Model interpretation | Explicitly scripted examples; not an LLM | Real DeepSeek through AI SDK |
| Read tools | Real scoped database queries | The same real tools |
| Workspace rendering | Real schema validation and renderer | The same validation and renderer |
| Approval and database writes | Real | Real |
| Business records | Synthetic seed data | Synthetic seed data |

`AGENT_MODE=mock` is visible in the interface. Unsupported fixture requests fail explicitly. A failed live request **never silently becomes a fixture response**. The real adapter is implemented and its tool protocol is tested with mocked HTTP responses; this does not establish real-model reasoning quality. Credentialed acceptance remains explicitly deferred in [the live validation checklist](docs/live-validation.md).

## Run locally

Use Node.js 22.16+ and Docker Compose, or your own PostgreSQL database. Use a disposable development database, not production customer data.

```bash
git clone --branch feat/agent-native-mvp https://github.com/wong001110/agent-native-crm.git
cd agent-native-crm
npm ci
cp .env.example .env.local
docker compose up -d
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. A browser session gets its own seeded workspace: eight customers, eight deals, thirteen activities and one initial task. Six active deals total MYR 344,000. Dates are relative to session creation. Reloading preserves that workspace; a fresh browser session creates a separate one. The database volume remains until you intentionally remove it.

### Private production build or live model

Set these server-only values in `.env.local` or the hosting environment:

```dotenv
AGENT_MODE=live
DEEPSEEK_API_KEY=<your-real-key>
DEEPSEEK_MODEL=<model-id-supported-by-your-DeepSeek-account>
SESSION_SECRET=<random-value-at-least-32-characters>
DEMO_ACCESS_TOKEN=<a-separate-random-demo-access-token>
DATABASE_URL=<your-PostgreSQL-connection-string>
# Pin the public origin when using a reverse proxy:
# APP_ORIGIN=https://your-crm.example
```

The model ID is configurable; the example defaults to `deepseek-v4-flash`, but actual availability must be verified with your provider. Generate secrets locally, for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Never commit secrets, use `NEXT_PUBLIC_` for them, or put them in chat/continuity records.

**Both live mode and `npm run start` require an access token and session secret.** For a production fixture demo, keep `AGENT_MODE=mock` and leave the model key empty, but still set the access token and secret. The access token is entered in the welcome screen and is not persisted in browser storage. Changing the mode/access token invalidates existing sessions.

```bash
npm run build
npm run start
```

No hosted deployment or real credentials have been provisioned by this implementation.

## Reference demonstration

1. Select **Review my priorities** to produce a Focus workspace from CRM context.
2. Investigate ACME, inspect its source evidence and recorded timeline.
3. Select **Prepare follow-up**. A proposal appears; no task exists yet.
4. Approve it, then verify the new task in **Explore → Tasks**, including after reload.

Also try **Compare two deals**, a high-value filter such as `Show deals over RM1,000,000`, rejection, and the manual task proposal in Explore. Fixture mode supports the documented example families, not general natural-language understanding.

## Verification

```bash
node scripts/check-continuity.mjs --self-test
npm run db:migrate
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Use `AGENT_MODE=mock`, a disposable PostgreSQL database, and a configured demo access token/session secret for the production-browser suite. Stop another development server on port 3000 first. The test tools read `.env.local`; CI supplies its own test-only environment. Tests create isolated workspaces and remove their own integration-test data.

The CI workflow records all independent check outcomes and fails its final gate if any required check fails. It includes real PostgreSQL tests, an AI SDK/DeepSeek **mock-transport** protocol test, browser journeys, keyboard/mobile checks and automated accessibility checks. Passing automated accessibility checks is not a claim of complete WCAG conformance. See `PROJECT_STATE.md` and `.agent-continuity/` for the exact verified commit and outstanding gates.

## Implementation map

```text
src/app/api/          Session, state, streaming agent, proposals and decisions
src/lib/agent/        Real model adapter, explicit fixture driver, five read tools
src/lib/workspace.ts  Strict workspace contract and source-reference hydration
src/lib/actions.ts   Proposal freshness and transactional approval
src/lib/db/          PostgreSQL schema, scoped repository and seed data
src/components/      Stable shell, adaptive workspace and Explore
```

The lockfile is authoritative for installed versions. The stack is Next.js/React/TypeScript, Tailwind, shadcn/Base UI, selected official AI Elements sources, AI SDK, DeepSeek provider, Zod, PostgreSQL/Drizzle, Vitest and Playwright. There is no independent backend service, MCP server or generic UI template engine.

## Boundaries and continuity

This is a **private, controlled demo** with synthetic data, not a multi-tenant SaaS security model. It has no real user accounts/RBAC, public abuse protection, background jobs, data-retention worker, email sending, CRM imports or multi-user collaboration. Tool/step/time/rate budgets reduce prototype risk but do not replace production operational controls. A process killed by its host may leave a historical run marked `running`; it cannot approve a task. Workspace summaries are timestamped snapshots, not continuously recomputed business truth.

Agent Continuity uses Git-versioned source/requirement/check mappings, execution state, findings and an append-only event ledger for this single-writer project. It is separate from the product's PostgreSQL data. `PROJECT_STATE.md` is a readable projection, not the canonical completion authority. Resume by reconciling the manifest, source crosswalk, current code and evidence; do not trust a free-text next step or a `DONE` label.

No MCP, multi-agent, agent memory, arbitrary generated JSX, autonomous email, workflow builder, persistent situation lifecycle or full CRM CRUD is included. Those exclusions are deliberate.

# Final integration and acceptance review

## Method and exact revisions

The first integration pass read PR #3 at `afef1af6a01c2de213d142a3f7e387feb33d27e1`
and verified successful CI 34517560032. It was a source-reading agent pass separate from
that branch's implementation, not a human review, a separate-model invocation or a new
manual browser session.

Read: SDK loop/tools/hydrator, contracts, both stores, origin/session/body limits, proxy,
action/run endpoints, client workspace/approval, tests, scope/evidence and CI. The original
implementer's visual evidence remains attributed to its earlier revision.

Review 5171245437 recorded the integration findings; review 5171344717 rechecked their
fixes at `cd2a290dbc4e91522a4cb94aa58c26e9b01cdd10`, CI 34519539233 (39 + 14 tests).
That exact tree was squash merged in PR #3 as `96a6ecbcdb9b3b52fc46253e2e8eb05919042851`.
Main CI 34520045792 also passed.

The final acceptance source review is 5171427883 at
`31428fa1d58371c1916bf813702931a2be2b8ae3`. Actual CI 34520512261 / job 103016567660
passed 39 Vitest tests, 15 Playwright tests, PostgreSQL integration, typecheck/build,
scope/crosswalk validation and a cold-process bootstrap simulation.

## Findings and resolutions

- **FND-INT-001:** overlapping planning/implementation IDs and obsolete authorization.
  The historical baseline archive and exhaustive 38-source/39-check crosswalk preserved
  scope; live portions remained deferred. The current maintenance removes that tracking
  machinery from the checkout, not the underlying product requirements or Git history.
  A cold-process bootstrap is not claimed as a complete new-agent handoff.
- **FND-INT-002:** prepared proposal could target an account absent from the displayed
  workspace. Hydration now rejects that mismatch, including an empty workspace.
- **FND-INT-003:** duplicate evidence IDs repeated source rows and React keys. Hydration
  rejects them; tests also preserve the valid exact-proposal case.
- **FND-INT-004:** maximum-length mobile approval lacked acceptance coverage. Text wraps
  without clipping; the 140-character title / 800-character note case checks full text,
  viewport overflow, visible approval, keyboard rejection, no write and axe rules.

All four resolutions had source/test evidence at the revisions above. The last change
was restricted to presentation/acceptance and checkpoint reconciliation, not added CRM capability.

## Confirmed boundaries

Facts are hydrated from observed records; invalid/cross-account evidence is rejected.
The model prepares but cannot execute tasks. Approval uses the exact stored, session-owned,
expiring proposal; repeats are idempotent. PostgreSQL uses a row lock/transaction for
receipt, task and activity. The local adapter is single-process only.

The proxy overwrites spoofed session headers; production live/PostgreSQL mode requires
a password. Mutation routes validate origin and bounded input. Errors redact provider
secrets. Live configuration/provider failure cannot masquerade as mock success.

## Remaining diagnostic and verification limits

The intentionally aborted browser-request test logs `ECONNRESET` / `aborted`, including
a framework `uncaughtException` diagnostic. Its precise transport-level cause has not
been isolated. The test's Stop control, agent cancellation/no-write unit case and the
subsequent browser requests pass; no claim is made that cancellation logs are clean or
that real-provider disconnect behavior is certified. Recheck this in the intended live
runtime before production use. Logs were retained, not suppressed to obtain green CI.

C-05-4 remains deferred to server-side DeepSeek credentials and an actual provider model
ID. No real-model quality/compatibility test ran. There is no independent-human or
separate-model signoff, full penetration test, full WCAG certification, real multi-agent
handoff trial or public deployment. Automated scans/screenshots do not replace all of
those activities. This is a small technology-validation MVP, not a production CRM.

## Evidence

- CI: https://github.com/wong001110/agent-native-crm/actions/runs/34520512261
- Runtime reports/screenshots artifact: 10169508178
- Historical implementation SHA256: `575a9743bdf026187d0681b08f9ca6bc14d6aba5c0b79a9d0c9734603640a504`
- [Historical exact check mapping](https://github.com/wong001110/agent-native-crm/blob/35e6bc07e2bb3fba9f1fd7efab349f67e6c349c6/.agent-continuity/evidence.json)
- [Historical planning archive and crosswalk](https://github.com/wong001110/agent-native-crm/tree/35e6bc07e2bb3fba9f1fd7efab349f67e6c349c6/.agent-continuity)
- Publication: PR #3 and final checkpoint PR #5; read actual merge receipts.

The historical fingerprint used a tool-specific input set including package.json. It
is not asserted as the fingerprint of the later tool-decoupling change. Later changes
must obtain current relevant CI; affected behavior evidence must be reverified.

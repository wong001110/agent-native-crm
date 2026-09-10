# Final integration review

## Scope and identity

This review started from exact PR #3 head `afef1af6a01c2de213d142a3f7e387feb33d27e1`
and verified CI run 34517560032 was successful. The current execution did not implement
that branch. It performed a separate source-reading reviewer pass, not a human review,
a separate-model invocation, or a new manual browser session.

Read: agent loop, tool definitions, fact hydrator, contracts, local and PostgreSQL stores,
origin/session/body limits, proxy access control, action/run endpoints, client workspace
and approval flow, existing tests, scope/evidence records and CI. Existing browser/visual
evidence is attributed to its original run; this review does not pretend to reproduce it.

## Findings and remediation

- **FND-INT-001 / medium:** planning and implementation used overlapping IDs with
  different meanings. The original baseline is preserved as an immutable Git tree;
  integration.json maps every original source/check and distinguishes live deferrals.
  Current user authorization supersedes old no-development/no-merge flags. A separate
  process checks bootstrap reconstruction; it is not a full new-agent handoff trial.
- **FND-INT-002 / medium:** a prepared proposal for another retrieved account could be
  attached to the current investigation. The hydrator now requires its target to be a
  displayed workspace item. Regression coverage includes another account and empty view.
- **FND-INT-003 / low:** repeated evidence IDs duplicated evidence and React keys.
  The hydrator now rejects duplicates, with a regression test and a valid-path control.

The current remediation must pass CI before these findings are marked verified.
Old green tests and the user's approval are not substitutes for this verification.

## Boundaries confirmed in the reviewed implementation

Source facts are hydrated from actually observed records. Cross-account evidence and
unobserved IDs are rejected. The model can prepare a proposal but cannot execute a task.
Approval accepts a proposal ID only, executes the stored payload, verifies the session
and expiry, and is idempotent. PostgreSQL locks and writes task/activity/receipt within
one transaction; the local file adapter serializes within one process only.

The proxy overwrites spoofed internal session headers; production live/PostgreSQL use
requires a password. Mutation endpoints check origin and input bounds. Provider errors
are redacted. Mock mode is explicit and never silently substitutes for failed live mode.

## Remaining limitations, not hidden passes

C-05-4 remains deferred to user-provided DeepSeek credentials/model ID and live testing.
No real model quality/compatibility was verified here. No public deployment, distributed
rate limit, enterprise identity/RBAC, multiprocess local-store support, full penetration
test or full WCAG certification is claimed. These are outside the small approved MVP.
The implementation remains a prototype, not a production CRM replacement.

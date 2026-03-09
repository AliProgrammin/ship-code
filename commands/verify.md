---
description: "Run all quality gates and report results — lint, types, tests, mock audit"
---

> **Context rule:** Delegates all work to the `ship-verifier` subagent. The main context only receives the gate report.

# /ship-code:verify

Run all quality gates and report status. Does not commit or modify anything.

---

## Steps

1. **Run gates**

   Node/TS:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

   Python:
   ```bash
   ruff check .
   mypy .
   pytest
   ```

2. **Run anti-mock audit**

   Scan test files for patterns indicating excessive mocking:
   - `jest.mock(` / `vi.mock(` calls that mock internal modules (not external services)
   - `MagicMock` / `patch` wrapping non-external code in Python
   - Tests with more mock setup lines than assertion lines

   Flag any found. Note: mocking external services (HTTP, DB, email) is fine. Mocking your own code is a smell.

3. **Check hard blocks**

   Scan recent commits (since last human push) for violations:
   - Any `git push` in commit hooks
   - `@ts-ignore` or `eslint-disable` added
   - `any` type introduced
   - Tests deleted or skipped (`test.skip`, `pytest.mark.skip`)

4. **Report**

   ```
   ship-code gate report
   ──────────────────────
   Lint        ✅ / ❌  (<N> errors)
   Types       ✅ / ❌  (<N> errors)
   Tests       ✅ / ❌  (<N> passing, <N> failing)
   Mock audit  ✅ / ⚠️  (<N> suspicious mocks flagged)
   Hard blocks ✅ / ❌  (<violations if any>)

   Open issues in .ship/issues.md: <N>
   ```

5. **If anything failed**, identify root cause category:

   | Failure | Likely root cause |
   |---|---|
   | Lint errors | Spec didn't specify code style / agent ignored conventions |
   | Type errors | Spec missing type context, or agent used `any` as shortcut |
   | Test failures | Acceptance criteria were vague, or scope leaked |
   | Excessive mocks | Spec didn't say "use real X" explicitly |
   | Hard block violation | Scope not enforced, spec too loose |

   Recommend: fix the spec, not the output.

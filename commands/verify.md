---
description: "Run the evaluator — graded code review with rubric scoring"
---

> **Context rule:** Delegates all work to the `ship-evaluator` subagent. The main context only receives the evaluation report.

# /ship-code:verify

Run the evaluator on the most recent changes. Gets a graded code review, not just pass/fail gates.

Usage: `/ship-code:verify`

## Steps

1. Spawn `ship-evaluator` agent

2. Evaluator:
   - Reads the git diff (last commit)
   - Runs quality gates (lint, types, tests)
   - Checks for mock abuse and hard block violations
   - Scores on 5 dimensions (1-5 scale):
     - **Correctness** — does it work?
     - **Design** — does it fit existing patterns?
     - **Code quality** — is it clean and readable?
     - **Test quality** — are tests meaningful?
     - **Security** — is it safe?

3. Show the evaluation report:

```
ship-code evaluation
──────────────────────────────────
Correctness  <score>/5  <justification>
Design       <score>/5  <justification>
Code quality <score>/5  <justification>
Test quality <score>/5  <justification>
Security     <score>/5  <justification>

Average: <N>/5
Verdict: SHIP | REVISE | REJECT

Gates:
  Lint   pass/fail
  Types  pass/fail
  Tests  pass/fail

<feedback if REVISE or REJECT>
```

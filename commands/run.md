---
description: "Run the generator-evaluator loop on a single feature from the plan"
argument-hint: "<feature number or title>"
---

> **Context rule:** Delegates work to generator and evaluator subagents. The main context only receives the result.

# /ship-code:run

Run the generator-evaluator loop on a single feature.

Usage: `/ship-code:run <feature number>` or `/ship-code:run <feature title>`

Use when:
- Retrying a blocked feature after fixing the issue
- Running one feature from the plan in isolation
- Testing a single feature before running the full loop

---

## Steps

1. Read `.ship/plan.md`, find the specified feature
2. Spawn a `ship-generator` agent with the feature brief
3. If generator succeeds → spawn a `ship-evaluator` agent to review
4. If evaluator says SHIP → update plan status to `shipped`, report success
5. If evaluator says REVISE/REJECT → re-spawn generator with feedback (max 3 rounds)
6. If generator fails → update plan status to `blocked`, report failure

If success:
```
<title> → <commit-hash> (eval: <score>/5)
```

If failure:
```
<title> — <reason>
  See .ship/issues.md
  Fix the issue and run again: /ship-code:run <feature>
```

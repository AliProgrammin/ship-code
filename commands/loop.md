---
description: "Resume execution from the plan — picks up unfinished features"
---

> **Context rule:** Delegates all work to the `ship-brain` subagent. The main context only receives the final summary.

# /ship-code:loop

Resume the ship loop from where it stopped. Reads the plan and keeps shipping unfinished features.

Usage: `/ship-code:loop`

Use when:
- A previous `/ship-code:ship` was interrupted
- You fixed an issue and want to retry blocked features
- You added features to the plan and want to execute them

## Steps

1. Read `.ship/plan.md`
2. Check if there are features with status `pending` or `blocked` — if none, tell the user "Nothing to do"
3. Reset any `blocked` features back to `pending` (user presumably fixed the issue)
4. Spawn `ship-brain` agent with the current plan
5. ship-brain runs generator-evaluator loops, returns summary
6. Show the user what shipped, what's blocked, what's left

## Output

```
Loop resumed

Shipped:
  <title> → <hash> (eval: <score>/5)

Blocked:
  <title> — <reason>

Remaining: <N> features pending

Fix issues and run /ship-code:loop again
Push when ready: git push
```

---
description: "Create feature briefs for what to build — high-level goals, not implementation steps"
argument-hint: "<description of what to build>"
---

> **Context rule:** Delegates all work to the `ship-planner` subagent. The main context only receives the plan summary.

# /ship-code:plan

Create feature briefs describing what to build. The generator figures out implementation.

Usage: `/ship-code:plan <plain English description of what to build>`

## Steps

1. Spawn `ship-planner` agent with the feature description

2. Planner reads the codebase, creates feature briefs in `.ship/plan.md`

3. Show the user the plan summary:

```
Plan ready

Features:
  1. <title> — <one-line goal>
  2. <title> — <one-line goal>
  3. <title> — depends on 1

Plan: .ship/plan.md

Run /ship-code:loop to execute
Or edit .ship/plan.md to adjust before executing
```

4. Ask the user: "Want me to start executing? Or review the plan first?"
   - If yes → spawn `ship-brain` to run generator-evaluator loops
   - If review → wait for user to come back with `/ship-code:loop`

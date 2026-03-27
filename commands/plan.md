---
description: "Decompose a feature into atomic specs with dependencies and populate the queue"
argument-hint: "<description of what to build>"
---

> **Context rule:** Delegates all work to the `ship-planner` subagent. The main context only receives the plan summary.

# /ship-code:plan

Decompose a feature into atomic specs, populate QUEUE.md with dependencies, and optionally execute.

Usage: `/ship-code:plan <plain English description of what to build>`

## Steps

1. Check `.ship/config.json` → `workflow.research_before_plan`
   - If `true`: spawn `ship-researcher` first, save output to `.ship/tasks/<slug>/research.md`
   - If `false`: skip to planning

2. Spawn `ship-planner` agent with the feature description (and research if it exists)

3. Planner decomposes → creates spec files in `.ship/tasks/<slug>/` → populates QUEUE.md

4. Show the user the plan summary:

```
Plan ready

Tasks:
  001 <title> — wave 1
  002 <title> — wave 1
  003 <title> — wave 2, needs: 001, 002

Specs: .ship/tasks/<slug>/
Queue: .ship/QUEUE.md

👉 Run /ship-code:loop to execute
   Or /ship-code:run .ship/tasks/<slug>/001-<title>.xml for a single task
```

5. Ask the user: "Want me to start executing? Or review the specs first?"
   - If yes → spawn `ship-brain` to run the loop
   - If review → wait for user to come back with `/ship-code:loop`

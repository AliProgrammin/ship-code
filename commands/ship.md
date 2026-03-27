---
description: "Ship features — interview, research, plan, execute in parallel waves, archive"
---

> **Context rule:** Interview happens in main context. Everything else delegates to subagents. Main context stays clean.

# /ship-code:ship

The full shipping flow. Interview the user, research (if enabled), plan into specs, execute in parallel waves, archive completed work.

Usage: `/ship-code:ship`

No arguments. The agent asks everything it needs.

## Step 1 — Interview

Ask the user what they want to build. Keep it conversational. Figure out:

- What features / changes they want
- Any constraints, preferences, or priorities
- Rough scope (how big is this?)

Don't over-interview. 2-4 questions max, then move.

## Step 2 — Show the ship plan

Build a plan and show it before executing:

```
Ship plan
═══════════════════════════════

Features:
  1. <title>
  2. <title>
  3. <title>

Research: <on / off> (config: workflow.research_before_plan)
Parallel waves: <on / off>
Gates: lint + types + tests after every task

Go? Say 'go' to start, or tell me what to adjust.
```

Wait for confirmation.

## Step 3 — Research (if enabled)

Check `.ship/config.json` → `workflow.research_before_plan`.

If `true`: spawn `ship-researcher` agent for the overall problem. Research output saves to `.ship/tasks/<slug>/research.md`. The planner will read it.

If `false`: skip straight to planning.

## Step 4 — Plan

Spawn `ship-planner` agent with:
- The confirmed feature descriptions
- Research output (if research ran)
- Instructions to populate QUEUE.md with dependencies

The planner:
1. Reads the codebase
2. Decomposes into atomic specs → `.ship/tasks/<slug>/`
3. Populates `.ship/QUEUE.md` with all tasks and `needs:` dependencies
4. Returns a summary of specs created

## Step 5 — Execute loop

Spawn `ship-brain` agent.

ship-brain:
1. Reads QUEUE.md
2. Resolves dependency waves
3. Executes waves in parallel (one `ship-executor` per task)
4. After each wave: archive completed, update QUEUE.md and STATE.md
5. If a task fails: mark blocked, skip its dependents, continue
6. Returns consolidated summary

## Step 6 — Summary

Show the user what shipped:

```
Ship complete
═══════════════════════════════

Shipped:
  ✓ <id> <title> → <hash>
  ✓ <id> <title> → <hash>

Blocked:
  ✗ <id> <title> — <reason>

Skipped:
  ⊘ <id> <title> → needs <blocked-id>

Gates: lint ✅ types ✅ tests ✅
Archives: .ship/archive/<date>-<slug>/
Issues: .ship/issues.md

👉 Review the work above.
   Push when ready: git push
   Fix blocked specs and run /ship-code:loop to retry.
```

## Rules

- **Gates never skipped** regardless of how much is left
- **Never push** — user pushes after review
- **Research is controlled by config** — not a per-run decision
- **Hard blocks always apply**
- **If the plan has 20+ tasks**, warn the user and suggest breaking into multiple ship sessions

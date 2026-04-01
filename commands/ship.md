---
description: "Ship features — interview, plan into feature briefs, run generator-evaluator loops"
---

> **Context rule:** Interview happens in main context. Everything else delegates to subagents. Main context stays clean.

# /ship-code:ship

The full shipping flow. Interview the user, plan into feature briefs, run generator-evaluator loops, report what shipped.

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
  1. <title> — <one-line goal>
  2. <title> — <one-line goal>
  3. <title> — depends on 1

Parallel: features without dependencies run simultaneously
Quality: generator-evaluator loop with graded rubrics (1-5)
Gates: lint + types + tests after every feature

Go? Say 'go' to start, or tell me what to adjust.
```

Wait for confirmation.

## Step 3 — Plan

Spawn `ship-planner` agent with:
- The confirmed feature descriptions
- Instructions to create feature briefs (not implementation specs)
- Save to `.ship/plan.md`

The planner:
1. Reads the codebase for context
2. Writes feature briefs with goals, requirements, quality bar, acceptance criteria
3. Returns a summary

## Step 4 — Execute

Spawn `ship-brain` agent.

ship-brain:
1. Reads `.ship/plan.md`
2. Groups features by dependencies
3. For each feature: runs a generator-evaluator loop
   - Generator explores codebase, implements, runs gates, commits
   - Evaluator reviews with graded rubric (correctness, design, code quality, test quality, security)
   - If evaluator rejects/requests revision → generator iterates (max 3 rounds)
4. Returns consolidated summary

## Step 5 — Summary

Show the user what shipped:

```
Ship complete
═══════════════════════════════

Shipped:
  <title> → <hash> (eval: <score>/5)
  <title> → <hash> (eval: <score>/5)

Blocked:
  <title> — <reason>

Skipped:
  <title> → depends on blocked feature

Gates: lint + types + tests passed
Issues: .ship/issues.md

Review the commits above.
Push when ready: git push
Fix blocked features and run /ship-code:loop to retry.
```

## Rules

- **Gates never skipped** regardless of how much is left
- **Never push** — user pushes after review
- **Evaluator scores quality** — passing gates is the floor, not the ceiling
- **Hard blocks always apply**
- **If the plan has 10+ features**, warn the user and suggest breaking into multiple ship sessions

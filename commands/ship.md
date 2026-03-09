---
description: "Ship multiple features at once — agent interviews you, plans everything, executes with gates"
---

> **Context rule:** Delegates all work to the `ship-shipper` subagent. The main context only handles the interview + plan review.

# /ship-code:ship

Ship multiple things in one go. The agent interviews the user to understand what needs to be built,
how much, and how fast — then plans and executes everything with full quality gates.

Usage: `/ship-code:ship`

No arguments needed. The agent asks everything it needs to know.


## Step 2 — Build the ship plan

Based on the interview, construct a ship plan and show it to the user before executing anything.

Format:

```
🚢 Ship plan
═══════════════════════════════

Mode: Phased / Batched / Both
Pace: Careful / Normal / Yolo

Phase 1: <name>
  └─ Task 1.1: <title>
  └─ Task 1.2: <title>
  └─ Task 1.3: <title>

Phase 2: <name>
  └─ Task 2.1: <title>
  └─ Task 2.2: <title>

[ Batch — independent tasks ]
  └─ Task B1: <title>
  └─ Task B2: <title>

Total: <N> tasks across <N> phases
Gates: lint + types + tests after every task
Push: you push manually after review

Does this look right? Say 'go' to start, or tell me what to adjust.
```

Wait for user confirmation before executing anything.


## Step 4 — Ship summary

When everything is done (or the user stops early), print:

```
🚢 Ship complete
═══════════════════════════════

Shipped:
  ✅ Phase 1: <name> — <N> tasks, <N> commits
  ✅ Phase 2: <name> — <N> tasks, <N> commits
  ✅ Batch: <N> tasks, <N> commits

Skipped / failed:
  ❌ <task> — <reason> (see .ship/issues.md)

Gates: lint ✅  types ✅  tests ✅  (<N> passing)

Git log:
  <last N commit hashes and titles>

👉 Review the work above.
   When you're happy, push manually: git push
   If something's wrong, don't patch it — tell me and I'll fix the spec.
```

---

## Rules

- **Gates never get skipped** regardless of pace or how much is left to ship
- **Never push** — user always pushes manually after reviewing
- **Never continue past a failure** without user decision
- **Yolo mode still has gates** — it just skips human review pauses, not quality checks
- **If the ship plan is too big** (10+ phases or 20+ tasks), warn the user and suggest breaking it into multiple `/ship-code:ship` sessions
- **Hard blocks from `/ship-code:init` still apply** — ship mode doesn't override them

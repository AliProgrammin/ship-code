---
description: "Show the ship-code guide and all available commands"
---
# /ship-code:help

Print the ship-code quick-start guide and command reference.

## Output exactly this when the command is run:

---

# ship-code — anti-slop workflow for Claude Code

> Slop is an engineering problem, not an LLM problem.
> Fix the spec, the context, or the environment — never patch the output.

---

## Quick start

**First time on a project:**
```
/ship-code:init
```
Sets up quality gates, hooks, config, and hard blocks. Works on empty repos — stack gets picked during the first `/ship-code:ship`.

**Ship something (the one command you need):**
```
/ship-code:ship
```
Auto-detects state:
- No plan yet → interview + plan + execute
- Interview in progress → resumes from `.ship/draft.md`
- Plan has pending features → offers to resume execution
- Plan fully shipped → prompts to add features

```
/ship-code:ship 3                # run just feature 3
/ship-code:ship add "OAuth"      # add a feature to the plan
/ship-code:ship --plan-only      # plan without executing
```

**Small fix or tweak:**
```
/ship-code:quick rename UserCard to ProfileCard everywhere
```
No plan, no evaluator. Gates still run.

**Grade the current state:**
```
/ship-code:verify
```
Evaluator runs standalone with the graded rubric (1-5 scale).

---

## All commands

| Command | When to use |
|---|---|
| `/ship-code:init` | Once per project, before anything else |
| `/ship-code:ship` | The full workflow — state-aware |
| `/ship-code:quick <desc>` | Small ad-hoc change, no plan needed |
| `/ship-code:verify` | Graded quality evaluation of current state |
| `/ship-code:help` | Show this guide |

That's it. Five commands. No `loop`, `run`, `plan`, or `queue` — all absorbed into `ship`.

---

## How it works

```
You describe what to build
        │
        ▼
  Interview — answers checkpointed to .ship/draft.md
  (survives /clear)
        │
        ▼
  Planner:
   - Prior-art sweep → .ship/prior-art.md
   - Scaffolds stack if repo is empty
   - Writes feature briefs → .ship/plan.md
        │
        ▼
  For each feature:
  Generator → Evaluator loop
   - Generator builds, runs gates, commits
   - Evaluator scores 1-5 on correctness, design,
     code quality, tests, security
   - <3 on any dimension → revise (max 3 rounds)
        │
        ▼
  You review. Push when ready.
```

---

## The 3 core agents

| Agent | Role |
|---|---|
| **Planner** | Prior-art + scaffold + feature briefs (what + why, not how) |
| **Generator** | Autonomous builder — explores, decides, implements |
| **Evaluator** | Adversarial reviewer — graded rubric, not pass/fail |

---

## State-aware `ship` — the mental model

`ship` reads `.ship/` and routes itself:

| `.ship/` state | What `ship` does |
|---|---|
| no `plan.md`, no `draft.md` | Full flow — interview → plan → execute |
| `draft.md` exists | Offers to resume interview |
| `plan.md` has pending | Offers to resume execution |
| `plan.md` fully shipped | Prompts to add features |

You never have to remember which command to use. `ship` knows.

---

## Config (`.ship/config.json`)

```json
{
  "workflow": {
    "parallel_features": true,     ← run independent features simultaneously
    "max_eval_rounds": 3,          ← generator-evaluator iterations before escalating
    "skip_permissions": true       ← agents run with full permissions
  }
}
```

---

## `.ship/` folder (runtime state)

```
.ship/
├── config.json        # settings + stack
├── HARD_BLOCKS.md     # rules agents can never violate (defaults + ingested CLAUDE.md)
├── issues.md          # blockers and learnings
├── draft.md           # interview checkpoint (transient)
├── prior-art.md       # competitor/OSS sweep
└── plan.md            # the source of truth
```

---

## When something goes wrong

| Symptom | Fix |
|---|---|
| Low evaluator scores | Read the feedback, adjust requirements in plan |
| Generator can't figure it out | Add more context to the feature brief |
| Gates pass but feature wrong | Tighten acceptance criteria in the plan |
| 3 consecutive features blocked | The plan is the problem — rewrite briefs |

---

## Escalation

`ship` stops and waits when:
- Generator fails 3 times on the same feature → marks blocked, moves on
- 3 consecutive features blocked → stops the batch, flags the plan
- Hard block would be violated → stops immediately, never overrides
- All remaining features depend on blocked ones

Agents log to `.ship/issues.md`. They never silently work around blockers.

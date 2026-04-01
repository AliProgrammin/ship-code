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
Sets up quality gates, hooks, config, and hard blocks.

**Ship a feature (the full flow):**
```
/ship-code:ship
```
Interviews you, plans into feature briefs, runs generator-evaluator loops with graded quality scoring. This is the main command.

**Plan without executing:**
```
/ship-code:plan add login with email + password
```
Creates feature briefs in `.ship/plan.md`. Review, then `/ship-code:loop` to execute.

**Check plan status:**
```
/ship-code:queue
```

**Resume execution:**
```
/ship-code:loop
```
Picks up unfinished features from the plan.

**Small fix or tweak:**
```
/ship-code:quick rename UserCard to ProfileCard everywhere
```
No ceremony. Gates still run.

**Run quality evaluation:**
```
/ship-code:verify
```
Graded rubric review (1-5 scale) — not just pass/fail.

**Run a single feature:**
```
/ship-code:run 1
```

---

## All commands

| Command | When to use |
|---|---|
| `/ship-code:init` | Once per project, before anything else |
| `/ship-code:ship` | Ship features — interview, plan, generator-evaluator loops |
| `/ship-code:plan <desc>` | Plan features into briefs |
| `/ship-code:loop` | Resume execution from the plan |
| `/ship-code:queue` | Show plan status or add features |
| `/ship-code:run <feature>` | Run a single feature through generator-evaluator |
| `/ship-code:verify` | Run graded quality evaluation |
| `/ship-code:quick <desc>` | Small ad-hoc task (3 files max) |
| `/ship-code:help` | Show this guide |

---

## How it works

```
You describe what to build
        │
        ▼
  Interview — what, why, constraints
        │
        ▼
  Planner creates feature briefs
  (goals + requirements, NOT implementation steps)
        │
        ▼
  For each feature:
  Generator-Evaluator loop
        │
        ├── Generator explores codebase
        │   Makes implementation decisions
        │   Builds feature, runs gates, commits
        │
        ├── Evaluator reviews with graded rubric
        │   Scores: correctness, design, code quality,
        │   test quality, security (1-5 each)
        │
        └── If score < 3 on any dimension → revise
            Max 3 rounds, then escalate
        │
        ▼
  You review. Push when ready.
```

---

## The 3 core agents

| Agent | Role |
|---|---|
| **Planner** | Creates feature briefs (what + why, not how) |
| **Generator** | Autonomous builder — explores, decides, implements |
| **Evaluator** | Adversarial reviewer — graded rubric, not pass/fail |

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

## When something goes wrong

| Symptom | Fix |
|---|---|
| Low evaluator scores | Read the feedback, adjust requirements in plan |
| Generator can't figure it out | Add more context to the feature brief |
| Gates pass but feature wrong | Tighten acceptance criteria in the plan |
| Same failure on retry | The feature brief needs rewriting |

---

## Escalation

The agent stops and asks you when:
- Generator fails 3 times on the same feature
- Evaluator rejects 3 times in a row
- A dependency is blocked
- Something unexpected changes the plan

Agents log to `.ship/issues.md` and wait. They never silently work around blockers.

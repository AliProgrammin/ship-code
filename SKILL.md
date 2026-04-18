---
name: ship-code
description: >
  Anti-slop agentic coding workflow for Claude Code. Use this skill whenever the user wants to set up
  an agentic coding workflow, enforce quality gates, prevent technical debt, build features with
  quality scoring, or run a plan→generate→evaluate loop. Trigger on phrases like "set up my project
  for Claude Code", "break this into features", "quality gates", "pre-commit hooks", "agentic
  workflow", "ship-code workflow", or any request to build something non-trivial with Claude Code
  where quality and traceability matter.
---

# ship-code

A lightweight anti-slop workflow for Claude Code. 3 agents, no enterprise theater.

**Core philosophy:** Slop is an engineering problem, not an LLM problem. If an agent produces bad
code, fix the environment — never patch the output.

---

## Installation

This is a Claude Code plugin. Install via:
```bash
npx ship-code@latest
```

Or place this folder manually at:
- **Global** (all projects): `~/.claude/plugins/ship-code/`
- **Project-level** (this project only): `.claude/plugins/ship-code/`

Commands will be available as `/ship-code:init`, `/ship-code:ship`, etc.

## About `.ship/`

The `.ship/` folder is created **inside your project root** by `/ship-code:init`. It holds:
- Config, hard blocks, issues log
- The feature plan (`.ship/plan.md`)

---

## Commands

Five commands. `ship` is state-aware — it replaces the old `loop`, `run`, `plan`, and `queue`.

| Command | What it does |
|---|---|
| `/ship-code:init` | Set up hooks, gates, config, hard blocks (handles empty repos) |
| `/ship-code:ship` | State-aware workflow — interview, plan, execute, or resume |
| `/ship-code:quick <desc>` | Ad-hoc small task — gates still enforced |
| `/ship-code:verify` | Run graded quality evaluation standalone |
| `/ship-code:help` | Show the guide |

`ship` arguments:
- `/ship-code:ship 3` — run just feature 3
- `/ship-code:ship add "OAuth"` — add a feature
- `/ship-code:ship --plan-only` — plan without executing

---

## The 3 core agents

Modern AI models don't need micro-managed specs with line numbers and step-by-step instructions. They need clear goals, quality standards, and adversarial review.

### Planner
Creates **feature briefs** — goals, requirements, quality bar, acceptance criteria. Tells the generator WHAT to build and WHY, never HOW. No XML specs, no line numbers, no implementation steps.

### Generator
**Autonomous builder.** Gets a feature brief, explores the codebase, makes implementation decisions, builds the feature, runs quality gates, commits. Can research libraries and patterns as needed. Iterates on failures.

### Evaluator
**Adversarial reviewer** with a graded rubric (1-5 scale). Scores every feature on 5 dimensions:
- **Correctness** — does it meet requirements?
- **Design** — does it fit existing patterns?
- **Code quality** — is it clean and readable?
- **Test quality** — are tests meaningful?
- **Security** — is it safe?

Verdicts: SHIP (all >= 3), REVISE (any = 2), REJECT (any = 1). The generator-evaluator loop runs up to 3 rounds before escalating to the user.

---

## Context management rules (always active)

The main context is the orchestrator. It stays light. All heavy work happens in subagents.

| Command | Who does the work |
|---|---|
| `/ship-code:ship` (fresh) | Interview in main → `ship-planner` (does prior-art + scaffold + briefs) → `ship-brain` (spawns `ship-generator` + `ship-evaluator` agents) |
| `/ship-code:ship` (resume) | `ship-brain` only |
| `/ship-code:ship <n>` | `ship-brain` with single-feature plan |
| `/ship-code:ship add <desc>` | `ship-planner` (writes just the new brief) |
| `/ship-code:verify` | `ship-evaluator` |
| `/ship-code:quick` | Runs in main context — small enough |
| `/ship-code:init` | Runs in main context — one-time setup |

**Rules for the main context:**
- Never read large files or grep the whole codebase in the main context
- Never run tests or linters directly in the main context
- Never accumulate tool call output in the main context — delegate instead
- Subagents return only a concise summary — the main context never sees raw tool output

**Rules for subagents:**
- Each subagent gets exactly one job with a clear deliverable
- Subagents write artifacts to disk (`.ship/`) so nothing is lost when they exit
- `ship-brain` is the only agent that can spawn other agents
- All other agents are leaf agents — they do their work and return

---

## The golden rules

1. **Never fix bad output — reset and rerun.** If output is wrong, fix the brief, not the code.

2. **3 agents, 3 roles.** Planner plans, generator builds, evaluator reviews.

3. **Gates before everything.** Lint + types + tests must pass 100% before any commit.

4. **Quality is graded, not binary.** Evaluator scores 1-5 on 5 dimensions. Passing gates is the floor.

5. **Generator decides the how.** Feature briefs say what and why. Implementation is the generator's job.

6. **Parallel when possible.** Independent features run simultaneously.

7. **Escalate, don't improvise.** If stuck, stop and ask — never silently work around.

8. **Read before you write.** Generators scan existing code for patterns before touching anything.

---

## Config

`.ship/config.json` controls workflow behavior:

```json
{
  "workflow": {
    "parallel_features": true,
    "max_eval_rounds": 3,
    "skip_permissions": true
  }
}
```

- `parallel_features` — run independent features simultaneously
- `max_eval_rounds` — generator-evaluator iterations before escalating
- `skip_permissions` — agents run with full permissions

---

## Anti-slop diagnostics

| Symptom | Root cause | Fix |
|---|---|---|
| Low evaluator scores | Feature brief too vague | Add clearer requirements and quality bar |
| Generator lost | Codebase too unfamiliar | Add context to the feature brief |
| Gates pass but feature wrong | Acceptance criteria vague | Rewrite acceptance criteria with exact conditions |
| Same failure on retry | The brief is the problem | Rewrite the feature brief |

**Rule:** If the generator-evaluator loop fails 3 times, the feature brief needs rewriting.

---

## File structure

```
.ship/
├── config.json          # Settings + stack
├── HARD_BLOCKS.md       # Defaults + rules ingested from CLAUDE.md
├── issues.md            # Agent blockers & learnings
├── draft.md             # Interview checkpoint (transient, survives /clear)
├── prior-art.md         # Competitor/OSS sweep (written by planner)
└── plan.md              # Feature briefs — source of truth
```

---

## Escalation — when agents stop

| Situation | Action |
|---|---|
| Generator fails 3 times | Stop. Log to issues.md. Ask human. |
| Evaluator rejects 3 times | Stop. Mark blocked. Continue with other features. |
| Dependency blocked | Skip feature. Log. Continue. |
| Hard block would be violated | Stop. Never violate. Escalate. |

Escalation is the system working correctly. Silent workarounds are slop.

# ship-code

Anti-slop agentic coding workflow for Claude Code. 3 agents, no enterprise theater.

**Core philosophy:** Slop is an engineering problem, not an LLM problem. If an agent produces bad code, fix the environment — never patch the output.

## Install

```bash
npx ship-code@latest
```

Prompts you to install globally (all projects) or locally (this project only). Then restart Claude Code and type `/ship-code:` to see all commands.

**Flags:**
```bash
npx ship-code@latest --global    # global, no prompt
npx ship-code@latest --local     # project-only, no prompt
npx ship-code@latest --uninstall # remove
```

## Commands

| Command | What it does |
|---|---|
| `/ship-code:init` | Set up hooks, gates, config, and hard blocks |
| `/ship-code:ship` | Full flow — interview, plan, generator-evaluator loops |
| `/ship-code:plan <desc>` | Create feature briefs for what to build |
| `/ship-code:loop` | Resume execution from the plan |
| `/ship-code:queue` | Show plan status or add features |
| `/ship-code:run <feature>` | Run one feature through generator-evaluator |
| `/ship-code:verify` | Run graded quality evaluation |
| `/ship-code:quick <desc>` | Small ad-hoc task — gates still enforced |
| `/ship-code:help` | Show the guide |

## How It Works

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
  ┌─────────────────────────┐
  │  Generator-Evaluator    │
  │  Loop (max 3 rounds)    │
  │                         │
  │  Generator: explores    │
  │  codebase, implements,  │
  │  runs gates, commits    │
  │         ↓               │
  │  Evaluator: scores on   │
  │  5 dimensions (1-5)     │
  │         ↓               │
  │  Score < 3? → revise    │
  │  Score >= 3? → ship     │
  └─────────────────────────┘
        │
        ▼
  You review. Push when ready.
```

## The 3 Agents

| Agent | Role |
|---|---|
| **Planner** | Creates feature briefs — what + why, never how |
| **Generator** | Autonomous builder — explores, decides, implements |
| **Evaluator** | Adversarial reviewer — graded rubric, not pass/fail |

### Why only 3?

Modern AI models don't need micro-managed specs with line numbers and step-by-step instructions. They need:
- **Clear goals** (Planner)
- **Autonomy to implement** (Generator)
- **Adversarial quality checks** (Evaluator)

Everything else — complex queue systems, XML task specs, separate research agents, wave orchestration, sprint contracts — is dead weight that actually limits the model's ability to self-correct.

## Evaluator Rubric

Every feature gets scored 1-5 on:

| Dimension | What it measures |
|---|---|
| **Correctness** | Does it meet requirements? |
| **Design** | Does it fit existing patterns? |
| **Code quality** | Is it clean and readable? |
| **Test quality** | Are tests meaningful? |
| **Security** | Is it safe? |

- All >= 3 → **SHIP**
- Any = 2 → **REVISE** (generator gets specific feedback)
- Any = 1 → **REJECT** (generator redoes from scratch)

## Config

`.ship/config.json`:

```json
{
  "workflow": {
    "parallel_features": true,
    "max_eval_rounds": 3,
    "skip_permissions": true
  }
}
```

## The Golden Rules

1. **Never fix bad output.** Reset and fix the brief — not the code.
2. **3 agents, 3 roles.** Planner plans, generator builds, evaluator reviews.
3. **Gates before everything.** Lint + types + tests pass 100% before any commit.
4. **Quality is graded, not binary.** Passing gates is the floor, not the ceiling.
5. **Generator decides the how.** Briefs say what and why. Implementation is autonomous.
6. **Escalate, don't improvise.** If stuck, stop and ask.

## File Structure After `/ship-code:init`

```
.ship/
├── config.json        # Settings
├── HARD_BLOCKS.md     # What agents can never do
├── issues.md          # Agent blockers & learnings
└── plan.md            # Feature briefs (created during /ship-code:ship or /ship-code:plan)
```

## License

MIT

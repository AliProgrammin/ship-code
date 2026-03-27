# ship-code

Anti-slop agentic coding workflow for Claude Code. No enterprise theater. Just the practices that actually prevent garbage from entering your codebase.

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
| `/ship-code:init` | Set up hooks, gates, config, queue, and hard blocks |
| `/ship-code:ship` | Full flow — interview, research, plan, execute in waves, archive |
| `/ship-code:plan <desc>` | Decompose a feature into specs and populate the queue |
| `/ship-code:loop` | Resume execution from the queue |
| `/ship-code:queue` | Show, add, or reorder tasks |
| `/ship-code:run <spec>` | Execute a single spec file |
| `/ship-code:research <problem>` | Research before building |
| `/ship-code:verify` | Run all quality gates |
| `/ship-code:quick <desc>` | Small ad-hoc task — gates still enforced |
| `/ship-code:help` | Show the guide |

## How It Works

```
You describe what to build
        │
        ▼
  /ship-code:ship interviews you
        │
        ▼
  Research phase (if enabled in config)
        │
        ▼
  Planner decomposes into atomic specs
  with explicit dependencies
        │
        ▼
  Specs populate QUEUE.md
  Dependencies → parallel waves
        │
        ▼
  ship-brain resolves waves and
  spawns executor agents in parallel
        │
        ▼
  Each executor: implement → gates → commit
        │
        ▼
  Wave done → archive completed tasks
  Failed? → mark blocked, skip dependents, continue
        │
        ▼
  Next wave until queue empty
        │
        ▼
  You review. Push when ready.
```

## Your Dashboard

Two files you'll check most:

- **`.ship/QUEUE.md`** — what's doing, next, blocked, done
- **`.ship/STATE.md`** — loop status at a glance

## Config

`.ship/config.json` controls workflow behavior:

```json
{
  "workflow": {
    "research_before_plan": true,
    "parallel_waves": true,
    "max_retries_per_spec": 2,
    "skip_permissions": true,
    "auto_archive_after_wave": true,
    "skip_dependents_on_failure": true
  }
}
```

## The Golden Rules

1. **Never fix bad output.** Reset and fix the spec — not the code.
2. **One agent, one task, one prompt.** Focused agents are correct agents.
3. **Gates before everything.** Lint + types + tests must pass 100% before any commit.
4. **Never mock what you can use for real.** Mocks hide failures.
5. **Precise specs, zero inference.** Agents don't guess.
6. **Skip and continue.** Failed tasks don't halt the loop — they get blocked, dependents skipped.
7. **Escalate, don't improvise.** If stuck, stop and ask — never silently work around.

## File Structure After `/ship-code:init`

```
.ship/
├── config.json        # Settings
├── QUEUE.md           # Task queue (your command center)
├── STATE.md           # Loop status
├── HARD_BLOCKS.md     # What agents can never do
├── issues.md          # Agent blockers & learnings
├── tasks/             # Active spec files
│   └── <task-slug>/
│       └── 001-<title>.xml
└── archive/           # Completed work
    └── <YYYY-MM-DD>-<slug>/
        └── summary.md
```

## License

MIT

# ship-code

Anti-slop agentic coding workflow for Claude Code. No enterprise theater. Just the practices that actually prevent garbage from entering your codebase.

**Core philosophy:** Slop is an engineering problem, not an LLM problem. If an agent produces bad code, fix the environment — never patch the output.

## Install

```bash
npx skills add aliprogrammin/ship-code
```

Or manually: clone this repo into `.claude/commands/` in your project.

## Commands

| Command | What it does |
|---|---|
| `/ship-code:init` | Set up hooks, gates, config, and hard blocks for this project |
| `/ship-code:research <problem>` | Research a problem — best practices, libraries, codebase analysis |
| `/ship-code:plan <description>` | Decompose a feature into atomic specs, then execute them |
| `/ship-code:ship` | Ship multiple features at once — agent interviews you, plans, executes |
| `/ship-code:run <spec-file>` | Execute a single spec file |
| `/ship-code:verify` | Run all quality gates and report results |
| `/ship-code:quick <description>` | Ad-hoc task with no ceremony — gates still enforced |
| `/ship-code:help` | Show the guide |

## The Golden Rules

1. **Never fix bad output.** Reset and fix the spec — not the code.
2. **One agent, one task, one prompt.** Focused agents are correct agents.
3. **Gates before everything.** Lint + types + tests must pass 100% before any commit.
4. **Never mock what you can use for real.** Mocks hide failures.
5. **Precise specs, zero inference.** Agents don't guess.
6. **Escalate, don't improvise.** If stuck, stop and ask — never silently work around.

## How It Works

```
You describe a feature
        │
        ▼
  /ship-code:plan decomposes it
  into atomic XML spec files
        │
        ▼
  Agent reads existing code
  (patterns, conventions, style)
        │
        ▼
  Agent implements each spec
  one at a time
        │
        ▼
  Quality gates run automatically
  (lint → types → tests)
        │
        ▼
  If green → atomic commit
  If red → diagnose, fix spec, rerun
        │
        ▼
  You review the final result
```

## File Structure After `/ship-code:init`

```
.ship/
├── config.json        # Gate settings, stack config
├── HARD_BLOCKS.md     # What agents can never do
├── issues.md          # Centralized agent learnings & blockers
└── tasks/
    └── <task-slug>/
        ├── 001-spec.xml
        └── summary.md
```

## License

MIT

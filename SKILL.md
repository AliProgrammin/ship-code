---
name: ship-code
description: >
  Anti-slop agentic coding workflow for Claude Code. Use this skill whenever the user wants to set up
  an agentic coding workflow, enforce quality gates, prevent technical debt, write precise task specs,
  decompose complex features into atomic units, or run a spec→execute→verify loop. Trigger on phrases
  like "set up my project for Claude Code", "break this into tasks", "write a spec", "no slop", "quality
  gates", "pre-commit hooks", "agentic workflow", "ship-code workflow", or any request to build
  something non-trivial with Claude Code where quality and traceability matter.
---

# ship-code

A lightweight anti-slop workflow for Claude Code. No enterprise theater. Just the practices that
actually prevent garbage from entering your codebase.

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
- Config, queue, state, hard blocks, issues
- Active task specs
- Archived completed work

---

## Commands

| Command | What it does |
|---|---|
| `/ship-code:init` | Set up hooks, gates, config, queue, and hard blocks |
| `/ship-code:ship` | Full flow — interview, research, plan, execute in waves, archive |
| `/ship-code:plan <desc>` | Decompose a feature into specs and populate the queue |
| `/ship-code:loop` | Resume execution from QUEUE.md |
| `/ship-code:queue` | Show, add, or reorder tasks in the queue |
| `/ship-code:run <spec>` | Execute a single spec file |
| `/ship-code:research <problem>` | Research a problem before building |
| `/ship-code:verify` | Run all quality gates and report |
| `/ship-code:quick <desc>` | Ad-hoc small task — gates still enforced |
| `/ship-code:help` | Show the guide |

---

## Context management rules (always active)

The main context is the orchestrator. It stays light. All heavy work happens in subagents.

| Command | Who does the work |
|---|---|
| `/ship-code:ship` | Interview in main → `ship-researcher` → `ship-planner` → `ship-brain` (spawns `ship-executor` agents) |
| `/ship-code:plan` | `ship-researcher` (if enabled) → `ship-planner` |
| `/ship-code:loop` | `ship-brain` (spawns `ship-executor` agents in parallel waves) |
| `/ship-code:run` | Single `ship-executor` |
| `/ship-code:research` | `ship-researcher` |
| `/ship-code:verify` | `ship-verifier` |
| `/ship-code:queue` | Runs in main context — lightweight read/write of QUEUE.md |
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
- `ship-brain` is the only agent that can spawn other agents (`ship-executor`)
- All other agents are leaf agents — they do their work and return

---

## The golden rules

1. **Never fix bad output — reset and rerun.** If output is wrong, fix the spec, not the code.

2. **One agent, one task, one prompt.** Each agent gets exactly one job.

3. **Gates before handoff.** Tests + lint + types must pass 100% before any commit.

4. **Never mock what you can use for real.** Mocks hide failures.

5. **Precise specs, zero inference.** Agents never guess. Specs include exact files, line numbers, patterns.

6. **Pit of success.** The easiest path the agent can take should be the correct one.

7. **Traceability always.** Every commit: `feat(ship-<id>): <title>` with agent/task/scope in body.

8. **Parallel waves.** Independent tasks run in parallel. Dependencies run sequentially. Resolved automatically from `needs:` in QUEUE.md.

9. **Skip and continue.** If a task fails, mark it blocked, skip its dependents, continue with everything else. Never halt the whole loop for one failure.

10. **Escalate, don't improvise.** If stuck, stop and ask — never silently work around.

11. **Read before you write.** Agents scan existing code for patterns before touching anything. New code must match.

---

## Queue-driven execution

The queue (`QUEUE.md`) is the single source of truth for what needs to happen:

```markdown
# Queue

## Doing
- [ ] `auth/002` Add password reset
- [ ] `auth/003` Add email verification

## Next
- [ ] `auth/004` Add OAuth providers → needs: auth/002, auth/003

## Blocked
- [!] `auth/006` Add SAML SSO — type errors in SAML lib

## Done
- [x] `auth/001` Add JWT middleware → abc1234
```

The `ship-brain` agent reads this, resolves waves, and executes. After each wave, completed tasks are archived to `.ship/archive/`.

---

## Wave resolution

ship-brain resolves waves automatically from QUEUE.md dependencies:

1. Tasks with no `needs:` or all dependencies in `Done` → current wave (parallel)
2. Tasks depending on current wave → next wave
3. Tasks depending on blocked/skipped tasks → skipped
4. Continue until queue is empty or all remaining tasks are blocked/skipped

---

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

- `research_before_plan` — run research phase before planning
- `parallel_waves` — execute independent tasks in parallel
- `skip_permissions` — agents run with full permissions
- `skip_dependents_on_failure` — skip tasks that depend on a blocked task

---

## Anti-slop diagnostics

| Symptom | Root cause | Fix |
|---|---|---|
| Agent went off-scope | Scope not explicit | Add `<can-modify>` / `<cannot-modify>` to spec |
| Wrong assumptions | Spec left room for inference | Add context snippets, line numbers |
| Gates pass but feature wrong | Acceptance criteria vague | Rewrite `<acceptance>` with exact conditions |
| Excessive mocks | No-mock policy missing | Add `<no-mocks>` to spec |
| Same mistake on retry | Bad spec | Rewrite the spec, don't retry same spec |

**Rule:** If you retry the same spec twice and it fails twice, the spec is the problem.

---

## File structure after `/ship-code:init`

```
.ship/
├── config.json          # Settings
├── QUEUE.md             # Task queue — the command center
├── STATE.md             # Loop status at a glance
├── HARD_BLOCKS.md       # What agents can never do
├── issues.md            # Agent blockers & learnings
├── tasks/               # Active spec files
│   └── <task-slug>/
│       ├── research.md
│       ├── 001-<title>.xml
│       └── 002-<title>.xml
└── archive/             # Completed work
    └── <YYYY-MM-DD>-<slug>/
        ├── specs...
        └── summary.md
```

---

## Escalation — when agents stop

| Situation | Action |
|---|---|
| Task requires files outside scope | Stop. Log to issues.md. Ask human. |
| Gates fail twice on same spec | Stop. Mark blocked. Skip dependents. Continue loop. |
| Dependency broken | Skip task. Log. Continue. |
| Hard block would be violated | Stop. Never violate. Escalate. |

Escalation is the system working correctly. Silent workarounds are slop.

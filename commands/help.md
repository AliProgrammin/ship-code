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
Sets up quality gates, hooks, config, queue, and hard blocks. Check `.ship/config.json` to toggle research, parallel waves, and other workflow settings.

**Ship a feature (the full flow):**
```
/ship-code:ship
```
Interviews you, researches (if enabled), plans into specs, executes in parallel waves, archives completed work. This is the main command.

**Plan without executing:**
```
/ship-code:plan add login with email + password
```
Decomposes into specs and populates the queue. Review specs, then `/ship-code:loop` to execute.

**Check the queue:**
```
/ship-code:queue
```

**Resume execution:**
```
/ship-code:loop
```
Picks up from QUEUE.md where it left off.

**Small fix or tweak:**
```
/ship-code:quick rename UserCard to ProfileCard everywhere
```
No ceremony. Gates still run.

**Research before building:**
```
/ship-code:research how to handle auth in Next.js
```

**Check quality anytime:**
```
/ship-code:verify
```

**Re-run a single spec:**
```
/ship-code:run .ship/tasks/auth/001-jwt-middleware.xml
```

---

## All commands

| Command | When to use |
|---|---|
| `/ship-code:init` | Once per project, before anything else |
| `/ship-code:ship` | Ship features — interview, research, plan, execute, archive |
| `/ship-code:plan <desc>` | Plan a feature into specs + queue |
| `/ship-code:loop` | Resume execution from the queue |
| `/ship-code:queue` | Show, add, or reorder tasks |
| `/ship-code:run <spec>` | Re-run a single spec |
| `/ship-code:research <problem>` | Research before building |
| `/ship-code:verify` | Run all quality gates |
| `/ship-code:quick <desc>` | Small ad-hoc task (≤3 files) |
| `/ship-code:help` | Show this guide |

---

## Your dashboard

Two files you'll check most:

- **`.ship/QUEUE.md`** — what's doing, next, blocked, done
- **`.ship/STATE.md`** — loop status at a glance

## Config (`.ship/config.json`)

```json
{
  "workflow": {
    "research_before_plan": true,   ← toggle research phase
    "parallel_waves": true,         ← run independent tasks in parallel
    "max_retries_per_spec": 2,      ← attempts before marking blocked
    "skip_permissions": true,       ← agents run with full permissions
    "auto_archive_after_wave": true, ← move done tasks to archive/
    "skip_dependents_on_failure": true ← skip tasks that depend on blocked
  }
}
```

---

## What gets created after `/ship-code:init`

```
.ship/
├── config.json       ← settings
├── QUEUE.md          ← task queue (your command center)
├── STATE.md          ← loop status
├── HARD_BLOCKS.md    ← what agents can never do
├── issues.md         ← agent blockers & learnings
├── tasks/            ← active spec files
└── archive/          ← completed work
```

---

## When something goes wrong

| Symptom | Fix |
|---|---|
| Agent went off-scope | Tighten `<can-modify>` in spec, rerun |
| Wrong assumptions | Add context/snippets to spec, rerun |
| Gates pass but feature broken | Rewrite `<acceptance>` criteria, rerun |
| Excessive mocks | Add "no mocks — use real X" to spec, rerun |
| Same failure on retry | The spec is the problem — rewrite it |

**Rule: if a spec fails twice, rewrite the spec.**

---

## Escalation

The agent stops and asks you when:
- Task requires files outside its declared scope
- Gates fail twice on the same spec
- A dependency is broken
- Something unexpected changes the plan

Agents log to `.ship/issues.md` and wait. They never silently work around blockers.

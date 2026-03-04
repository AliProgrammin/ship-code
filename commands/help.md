---
description: "Show the clean-code guide and all available commands"
---
# /clean:help

Print the clean-code quick-start guide and command reference.

## Output exactly this when the command is run:

---

# clean-code — anti-slop workflow for Claude Code

> Slop is an engineering problem, not an LLM problem.
> Fix the spec, the context, or the environment — never patch the output.

---

## Quick start

**First time on a project:**
```
/clean:init
```
Run this once. It sets up quality gates, pre-commit hooks, hard blocks, and the issue log.
If it warns you about missing `lint` / `typecheck` / `test` scripts — add those to your project first.

**Don't know how to approach a problem?**
```
/clean:research how to handle auth in Next.js
```
Claude searches best practices, analyzes your codebase, compares libraries, and saves a report to `.clean/research/`. Optionally suggests a `/clean:plan` to run next.

**Building a feature:**
```
/clean:plan add a login form with email + password validation
```
The agent will decompose it into atomic specs, execute each one, and commit them individually.
You review at the end. If something's wrong, tell the agent what's wrong — don't manually fix it.

**Small fix or tweak:**
```
/clean:quick rename UserCard to ProfileCard everywhere
```
No ceremony. Gates still run. Still commits cleanly.

**Check code quality anytime:**
```
/clean:verify
```
Runs lint, types, tests, mock audit, and hard block scan. Shows you exactly what's wrong and why.

**Re-run a specific failed task:**
```
/clean:run .clean/tasks/login-form/002-validation.xml
```

---

## All commands

| Command | When to use |
|---|---|
| `/clean:init` | Once per project, before anything else |
| `/clean:research <problem>` | Before building — when you're unsure of the best approach |
| `/clean:plan <description>` | Any non-trivial feature or change |
| `/clean:ship` | Shipping multiple features or a big milestone at once |
| `/clean:run <spec-file>` | Re-run a single spec after fixing it |
| `/clean:verify` | Check quality gates at any time |
| `/clean:quick <description>` | Small ad-hoc tasks (≤3 files) |
| `/clean:help` | Show this guide |

---

## The golden rules

1. **Never fix bad output.** If the agent wrote garbage, reset and fix the spec — not the code.
2. **One agent, one task, one prompt.** Focused agents are correct agents.
3. **Gates before everything.** Lint + types + tests must pass 100% before any commit or handoff.
4. **Never mock what you can use for real.** Mocks hide failures. Real integrations surface them.
5. **Precise specs, zero inference.** Agents don't guess. You tell them exactly what to do.
6. **Never push manually.** Let the agent commit. You push after reviewing.

---

## What gets created after `/clean:init`

```
.clean/
├── config.json       ← gate settings & stack config
├── HARD_BLOCKS.md    ← what agents can never do
├── issues.md         ← centralized log of agent blockers & learnings
└── tasks/            ← spec files live here after /clean:plan
.git/hooks/
└── pre-commit        ← gate enforcer (runs on every commit)
```

---

## When something goes wrong

| Symptom | Don't do this | Do this |
|---|---|---|
| Agent went off-scope | Manually revert | Tighten `<can-modify>` in spec, rerun |
| Wrong assumptions made | Patch the output | Add context/snippets to spec, rerun |
| Gates pass but feature is broken | Manually fix | Rewrite `<acceptance>` criteria, rerun |
| Excessive mocks in tests | Delete the mocks | Add "no mocks — use real X" to spec, rerun |
| Same failure on retry | Retry again | The spec is the problem — rewrite it |

**Rule: if you retry the same spec twice and it fails twice, stop and rewrite the spec.**

---

## Escalation (when to stop and ask the human)

The agent should stop and surface to you when:
- A task requires modifying files outside its declared scope
- Gates are failing after 2 reruns of the same spec
- A dependency between tasks is broken and blocks execution
- Something unexpected is found in the codebase that changes the plan

The agent should NOT silently work around these — it logs to `.clean/issues.md` and waits.

---
name: ship-code
description: Anti-slop agentic coding workflow for Codex. Use when Codex should initialize .ship project state, enforce quality gates, prevent technical debt, create feature briefs, run a plan-build-evaluate loop, do a quick gated code change, or run a graded ship-code review. Trigger on "ship-code", "ship code", "anti-slop workflow", "quality gates", "graded evaluator", "plan/generate/evaluate", "use the Claude Code ship-code workflow in Codex", or requests to make Codex ship non-trivial code with traceability and quality scoring.
---

# ship-code for Codex

A lightweight anti-slop workflow: plan clear feature briefs, build against gates, then evaluate with a graded rubric.

## Codex command mapping

Codex does not use Claude slash commands. Map user intent to these modes:

| User says | Run |
|---|---|
| `ship-code init`, `initialize ship-code` | Init mode |
| `ship-code ship`, `use ship-code to build...` | Ship mode |
| `ship-code quick <task>` | Quick mode |
| `ship-code verify`, `run the evaluator` | Verify mode |
| `ship-code help` | Summarize this workflow |

Always follow the active Codex system/developer instructions. In particular, only use Codex subagents when the user explicitly asks for agents, delegation, or parallel agent work; otherwise run the phases in the main context with targeted reads and concise progress updates.

## State files

Create and maintain `.ship/` in the project root:

```text
.ship/
├── config.json       # settings + stack
├── HARD_BLOCKS.md    # rules to read before every commit (defaults + ingested CLAUDE.md/AGENTS.md)
├── issues.md         # ship ledger — append-only history of every shipped feature (f1, f2, … fN)
├── draft.md          # interview checkpoint (transient)
├── prior-art.md      # competitor/OSS sweep
└── plan.md           # forecast — only pending/in-progress/blocked features
```

**Two state files, two roles:**
- `plan.md` is the **forecast**: planned work, statuses `pending` / `in-progress` / `blocked`. When a feature ships, its section is pruned from `plan.md`.
- `issues.md` is the **history**: every shipped or blocked feature, including `/quick` and ad-hoc work, in order. Append-only.

This split keeps `plan.md` a clean to-do list and prevents the drift where the plan only shows 12 features but 37 actually shipped.

## Init mode

1. Detect stack from root markers:
   - `package.json` -> `ts-node`
   - `pyproject.toml`, `requirements.txt`, or `setup.py` -> `python`
   - `Cargo.toml` -> `rust`
   - `go.mod` -> `go`
   - no marker -> `unknown`
2. Write `.ship/config.json`:

```json
{
  "stack": "<detected>",
  "workflow": {
    "parallel_features": true,
    "max_eval_rounds": 3,
    "skip_permissions": true
  }
}
```

3. Write `.ship/issues.md` — the empty ship ledger header:

```markdown
# Ship Ledger

Every unit of work shipped on this project, in order. Append-only — once a feature is here, only its `Eval:` and `Status:` lines are ever updated. Reverts become new entries pointing back at the original.

Plan.md is the forecast (planned work, shrinks as features ship). This file is the history (everything that happened, grows forever).

---
```

4. Write `.ship/HARD_BLOCKS.md` with defaults:
   - NEVER `git push` unless the user explicitly asks.
   - NEVER use `any`, `@ts-ignore`, disabled lint rules, skipped tests, deleted tests, `--no-verify`, or commits with failing tests to bypass gates.
5. Ingest prohibitions from available rule files: `~/.codex/AGENTS.md`, `./AGENTS.md`, `~/.claude/CLAUDE.md`, `./CLAUDE.md`. Preserve unique "never", "do not", "don't", "no ...", "MUST NOT" rules.
6. If stack is known, install `.git/hooks/pre-commit` that runs the stack's lint/types/tests. If stack is `unknown`, skip the hook and let Ship mode scaffold first.

## Ship mode

State detection:

1. If `.ship/` is missing, run Init mode silently and continue.
2. If `.ship/plan.md` is missing, interview the user until purpose, constraints, and done-definition are clear. Checkpoint each answer into `.ship/draft.md`.
3. Confirm a one-paragraph sketch before planning.
4. Before writing briefs, read `.ship/issues.md` so you don't replan already-shipped features.
5. Plan feature briefs in `.ship/plan.md`. Each brief says what and why, never exact implementation steps.
6. Read `.ship/HARD_BLOCKS.md` before every implementation step. Treat each line as a constraint that cannot be violated.
7. Execute pending features in dependency order. Treat `in-progress` as resumable pending work.
8. Evaluate each completed feature. Revise up to `workflow.max_eval_rounds`; then mark blocked.
9. **After every feature** (shipped, blocked, or `/quick`), append an entry to `.ship/issues.md` using the schema below, then **prune** the plan.md entry if it was a shipped plan feature. Commit the ledger update as a separate `chore(ledger): f<N> <title>` commit so the ledger's `Commit:` line points to a real prior hash.

Feature brief format:

```markdown
## Feature N: <title>
**Status:** pending
**Depends on:** none | Feature M

### Goal
<what this feature does and why it matters>

### Requirements
- <concrete requirement>

### Decisions
- <ambiguity> -> chose <answer> because <reason>

### Quality bar
- <design/testing/security expectations>

### Acceptance criteria
- <testable condition>
- lint + types + tests pass
```

Ledger entry format (append to `.ship/issues.md` after every shipped, blocked, or quick task):

```markdown
## f<N> — <title>
Date:    <ISO-8601 UTC>
Source:  plan | quick | adhoc
Commit:  <full-hash>
Status:  shipped | blocked | reverted
Eval:    <avg>/5  (Correctness <n> · Design <n> · Code <n> · Tests <n> · Security <n>)   ← or "ungraded"
Rounds:  <N>

### What shipped
<2-3 sentences, user-visible behavior change>

### Why
<1-2 sentences, motivation>

### Files touched
- <path> (added|modified|deleted)

### Decisions / gotchas
- <only if non-obvious; omit section if none>

### Blocked reason
<only if Status: blocked>

---
```

`f<N>` is global and append-only — find the last `## f<N>` heading in `issues.md`, next number is `N + 1`. Independent of plan.md feature numbers.

If the user explicitly authorizes subagents, map roles like this:

| ship-code role | Codex execution |
|---|---|
| Planner | explorer/worker writes `.ship/prior-art.md` and `.ship/plan.md` |
| Generator | worker owns implementation, gates, and commit |
| Evaluator | read-only review pass with rubric and gate verification |

When subagents are not authorized, perform these roles as phases in the main context.

## Quick mode

Use for small bounded tasks only. If the change is likely to touch more than 3 files or has unclear scope, route to Ship mode.

Flow: inspect relevant files, implement the change, run lint/types/tests, fix real failures, and commit only when the user requested commit-producing ship-code behavior.

## Verify mode

Review the latest changes or named feature. Run gates and score 1-5:

| Dimension | Measures |
|---|---|
| Correctness | Meets requirements and handles edge cases |
| Design | Fits existing architecture and patterns |
| Code quality | Readable, maintainable, coherent |
| Test quality | Meaningful coverage without mock abuse |
| Security | Safe validation, auth, data handling, injection/XSS risk |

Verdict rules:

- All scores >= 3 -> `SHIP`
- Any score = 2 -> `REVISE`
- Any score = 1 -> `REJECT`

Return concise findings first, with file/line references for actionable issues.

## Gates

Use the project's existing commands when available. Defaults:

| Stack | Gates |
|---|---|
| Node/TS | `npm run lint && npm run typecheck && npm test` |
| Python | `ruff check . && mypy . && pytest` |
| Rust | `cargo fmt --check && cargo clippy -- -D warnings && cargo test` |
| Go | `go vet ./... && go test ./...` |

If a configured gate command is missing, tell the user exactly what to add instead of silently skipping it.

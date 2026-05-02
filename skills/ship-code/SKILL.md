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
├── config.json
├── HARD_BLOCKS.md
├── issues.md
├── draft.md
├── prior-art.md
└── plan.md
```

`plan.md` is the source of truth. Use statuses `pending`, `in-progress`, `shipped`, and `blocked`.

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
  "gates": {
    "tests": true,
    "lint": true,
    "types": true,
    "no_push": true
  },
  "stack": "<detected>",
  "issue_log": ".ship/issues.md",
  "workflow": {
    "parallel_features": true,
    "max_eval_rounds": 3,
    "skip_permissions": true
  }
}
```

3. Write `.ship/issues.md` with an empty issues table.
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
4. Plan feature briefs in `.ship/plan.md`. Each brief says what and why, never exact implementation steps.
5. Execute pending features in dependency order. Treat `in-progress` as resumable pending work.
6. Evaluate each completed feature. Revise up to `workflow.max_eval_rounds`; then mark blocked and log in `.ship/issues.md`.

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

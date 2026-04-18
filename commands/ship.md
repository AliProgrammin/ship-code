---
description: "Ship features — interview, plan, execute. Absorbs loop/run/plan/queue via state detection."
argument-hint: "[n | add <desc> | --plan-only]"
---

> **Context rule:** Interview happens in main context. Everything else delegates to subagents. Main context stays clean.

# /ship-code:ship

The one command that drives the whole workflow. It detects project state and does the right thing.

Usage:
- `/ship-code:ship` — auto-detect (fresh plan, resume, or pick up interview)
- `/ship-code:ship <n>` — run feature number `n` only (replaces old `/ship-code:run`)
- `/ship-code:ship add <description>` — add a feature brief to the plan (replaces old `/ship-code:queue add`)
- `/ship-code:ship --plan-only` — plan without executing (replaces old `/ship-code:plan`)

---

## Step 0 — Detect state and route

Before doing anything else, inspect project state:

1. **Parse arguments:**
   - `add <desc>` → jump to **Add-feature mode**
   - `<number>` (e.g. `3`) → jump to **Single-feature mode**
   - `--plan-only` → set flag, continue to auto-detect
   - no args → continue to auto-detect

2. **Auto-detect branch (no args):**
   - `.ship/plan.md` missing AND `.ship/draft.md` exists → **Resume-interview mode**
   - `.ship/plan.md` missing AND no draft → **Fresh-ship mode** (Steps 1–5)
   - `.ship/plan.md` exists with `pending`, `in-progress`, or `blocked` features → **Resume-execute mode**
   - `.ship/plan.md` exists, all features shipped → print `"Plan complete. Add features with /ship-code:ship add <desc>."` and stop

   Treat `in-progress` as `pending` — ship-brain re-runs the generator-evaluator loop and the generator picks up from any scaffolded files.

3. **Config sanity check:**
   - If `.ship/config.json` has `stack: "unknown"` → note this. The planner will bootstrap the stack during Step 3.
   - If `.ship/` is missing entirely → tell user to run `/ship-code:init` first and stop.

---

## Step 1 — Interview (Fresh-ship mode)

Ask the user what they want to build. **Use `AskUserQuestion` when available:**

1. Call `ToolSearch` with query `select:AskUserQuestion` to load its schema. If it loads, use it. If the search returns nothing, fall back to plain conversational questions.

2. **Batch 1 — goal and stack:**
   - "What are you building?" (free text)
   - "Preferred stack?" — multiChoice: `TS/Node`, `Python`, `Rust`, `Go`, `Other (describe)`  *(skip this question if `config.json` already has a concrete stack)*
   - "Scope?" — multiChoice: `Prototype`, `MVP`, `Production`

3. **Batch 2 — constraints and priority** (only if answers so far warrant it):
   - "Any hard constraints?" (free text — e.g. "no external DB", "must be offline-capable")
   - "Priority?" — multiChoice: `Speed`, `Security`, `Cleanliness`

**Cap: 5 questions total. Stop asking once you have enough.**

### Checkpoint after every answer

Append to `.ship/draft.md` immediately after each answer arrives:

```markdown
# Interview Draft
Started: <ISO timestamp>
Status: in-progress

## Q: <question>
A: <answer>

## Q: <question>
A: <answer>
```

This file is deleted when the planner successfully writes `.ship/plan.md`. If `/clear` happens mid-interview, this file is what lets you resume.

---

## Step 1a — Resume-interview mode

Triggered when `.ship/draft.md` exists but `.ship/plan.md` does not.

Read `.ship/draft.md`. Print:

```
Found in-progress interview from <mtime> (<N> answers captured).

  [r] resume   [n] restart (drafts archived)   [s] show draft
```

- `r` → load answers into context, continue interview from the next unanswered question
- `n` → move `.ship/draft.md` to `.ship/draft.bak.md`, start Step 1 fresh
- `s` → cat the draft, then re-prompt

---

## Step 2 — Confirm the sketch

Once you have the interview answers (fresh or resumed), show a 1-paragraph summary and get a go/no-go before spawning the planner:

```
Got it:
  Building: <one-line goal>
  Stack: <picked>
  Scope: <picked>
  Priority: <picked>
  Constraints: <if any>

Spawn planner? [y/n/edit]
```

On `edit` — ask what's wrong, update draft, re-show.

---

## Step 3 — Plan

Spawn `ship-planner` agent with the interview answers.

The planner will:
1. Run a prior-art sweep (delegated to a WebSearch subagent). Writes `.ship/prior-art.md`.
2. If `config.json` has `stack: "unknown"` → scaffold a minimal skeleton for the chosen stack, update `config.json`, install the pre-commit hook.
3. Read the codebase (now that a skeleton exists) for patterns.
4. Write feature briefs to `.ship/plan.md`.
5. Delete `.ship/draft.md` on success.
6. Return a concise summary.

After the planner returns, print:

```
Plan ready:
  1. <title> — <goal>
  2. <title> — depends on 1
  3. <title> — <goal>

Prior art: <one-line takeaway, pointer to .ship/prior-art.md if anything material>

Go? [y/n/edit]
```

If `--plan-only` was passed, stop here.

---

## Step 4 — Execute

Spawn `ship-brain` with the plan. It runs generator-evaluator loops, updates plan.md statuses per feature, and returns a summary.

---

## Step 5 — Summary

```
Ship complete.

Shipped (<N>):
  <title> → <hash> (eval <avg>/5)

Blocked (<M>):
  <title> — <reason>

Skipped (<K>):
  <title> — depends on <blocked>

Stopped because: <one line — "all shipped" | "N blocked, nothing pending" | "3 consecutive blocks — plan likely needs rewriting" | "hard block tripped" | "user cancelled">

Gates: lint + types + tests passed on shipped features.
Issues: .ship/issues.md
Next: fix blockers and run /ship-code:ship to resume, or git push when ready.
```

---

## Modes (detail)

### Resume-execute mode

Triggered when `plan.md` exists with pending/in-progress/blocked features and no args.

Default: **resume immediately without prompting.** Print one line and go:

```
Resuming plan — <N> pending, <M> in-progress, <K> blocked. (ctrl-c to abort)
```

Reset `blocked` → `pending` (user presumably fixed the issue). Leave `in-progress` as-is (ship-brain treats it as pending). Spawn `ship-brain`, go to Step 5.

**Exception:** if `.ship/config.json` has `workflow.confirm_resume: true`, prompt `Resume? [y/n]` before spawning. Default is `false`.

### Single-feature mode (`/ship-code:ship 3`)

- Read `.ship/plan.md`, find feature `n`.
- Spawn `ship-brain` with a single-feature plan (just that feature).
- Go to Step 5.

### Add-feature mode (`/ship-code:ship add <desc>`)

- Read `.ship/plan.md`, find the next feature number.
- Ask: "Does this depend on any existing feature? (number or 'none')"
- Spawn `ship-planner` with the single description — it writes just that new feature's brief to `.ship/plan.md` and returns.
- Print: `"Added feature <N>. Run /ship-code:ship to execute."`

---

## Stopping conditions

Hard stops (halt entirely, escalate):
- All pending features shipped (happy path)
- Hard block violation attempted
- 3 consecutive features blocked (systemic issue)
- Every remaining feature depends on something blocked
- User declines at any `[y/n]` prompt

Soft stops (single feature, batch continues):
- `max_eval_rounds` exhausted for a feature → mark blocked
- Feature's dependency blocked → mark skipped
- Generator can't make gates pass → mark blocked

---

## Rules

- **Gates never skipped.** Pre-commit hook enforces lint + types + tests.
- **Never push.** User pushes after review.
- **Evaluator scores quality.** Passing gates is the floor, not the ceiling.
- **Hard blocks always apply.**
- **Interview cap is 5 questions.** If you need more, the brief should ask the user during Step 2 `edit`.
- **Every user answer in the interview is checkpointed to `.ship/draft.md`.** `/clear` must not lose intent.
- **If plan has 10+ features**, suggest splitting into multiple ship sessions.

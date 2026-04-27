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

   Treat `in-progress` as `pending` — the Step 4 loop re-runs the generator-evaluator loop and the generator picks up from any scaffolded files.

3. **Config sanity check:**
   - If `.ship/config.json` has `stack: "unknown"` → note this. The planner will bootstrap the stack during Step 3.
   - If `.ship/` is missing entirely → **auto-init silently** by running the steps in `commands/init.md` (detect stack, write `.ship/config.json` + `issues.md` + `HARD_BLOCKS.md` with global-rule ingestion, install pre-commit hook if stack is known). Print one line: `Initialized .ship/ for this project (stack: <detected>).` Then continue to Step 1. Do NOT stop and ask the user to run `/ship-code:init` separately.

---

## Step 1 — Interview (Fresh-ship mode)

The interview is fast and surgical. **Goal:** capture purpose + constraints + done-definition for each feature, nothing more. Stop when those three are clear — no fixed question count.

### 1a. Triage the user's message

Count distinct features in what the user said. If you see **3 or more** independent things, decompose first:

```
I count <N> features in what you described:
  1. <one-line summary>
  2. <one-line summary>
  3. <one-line summary>
  ...

Plan all <N>, or pick one to start? [all / 1 / 2 / 3 / ...]
```

If 1–2 features, skip the decomposition message and move straight to 1b.

### 1b. Question loop — one at a time

**Use `AskUserQuestion` when available:** call `ToolSearch` with `select:AskUserQuestion` to load it. If unavailable, fall back to plain conversational questions.

Ask **one question per turn**, multi-choice when possible. Cycle through these axes only:

- **Purpose** — why this feature, what does success look like for the user
- **Constraints** — what can't change, off-limits, must-have technical bounds
- **Done-definition** — testable conditions that mean "this is shipped"

**Lead with a recommendation when surfacing ambiguity.** Don't ask neutral menu questions — tell the user what you'd pick and why:

> *"'Clean the landing page more' could mean: (A) cut sections, (B) simplify the hero, (C) trim copy. I'd recommend B since the hero is the densest. Which?"*

**Stop asking when all three axes are clear for every planned feature.** Could be 1 question, could be 5. Don't pad. Don't ask things that already have implied answers.

### 1c. Stack/scope (only if not already captured)

If `config.json` has `stack: "unknown"`, ask stack as a multi-choice question once. Otherwise skip.

If the user's message clearly implies prototype vs production (e.g. "just sketch this out" vs "ship to customers"), don't ask — infer.

### 1d. Checkpoint after every answer

Append to `.ship/draft.md` immediately after each answer arrives:

```markdown
# Interview Draft
Started: <ISO timestamp>
Status: in-progress

## Q: <question>
A: <answer>

## Q: <question>
A: <answer>

## Decisions
- <ambiguity surfaced> → user picked <X> over <Y>, <Z>
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

Main context orchestrates the generator-evaluator loops directly. No `ship-brain` subagent — nested subagent spawning is unreliable across Claude Code versions. Main stays clean because every generator and evaluator call happens in its own subagent context.

**The loop:**

1. Read `.ship/plan.md`. Find the next feature whose status is `pending` or `in-progress` AND whose dependencies are all `shipped`.
2. If none exist: jump to Step 5 (summary).
3. Set that feature's status to `in-progress` via `Edit`.
4. **Spawn `ship-generator`** via the `Agent` tool. Pass the feature brief inline as the prompt. Generator returns `status: success|failure` + commit hash or reason.
5. If `status: failure` → mark `blocked`, increment consecutive-block counter, skip dependents, go to step 1.
6. If `status: success` → **spawn `ship-evaluator`** via the `Agent` tool. Evaluator returns SHIP / REVISE / REJECT with scores.
7. Evaluator verdict:
   - **SHIP** → mark `shipped`, reset consecutive-block counter, go to step 1.
   - **REVISE** or **REJECT** → back to step 4 with evaluator's feedback appended to the generator prompt. Max 3 rounds before marking `blocked`.
8. **Stop conditions:**
   - All features shipped → Step 5.
   - 3 consecutive features blocked → stop the batch, Step 5 with "plan likely needs rewriting."
   - Hard block violation detected → stop immediately, Step 5 with escalation note.

**Parallel execution:** if multiple pending features all have their dependencies shipped, spawn their generators in a **single message with multiple Agent tool calls**. Evaluators run sequentially per feature (each depends on its generator finishing first).

**What main context holds:** only the short summaries subagents return — status, commit hash, verdict, scores. Never the raw diff, test output, or file contents.

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

Reset `blocked` → `pending` (user presumably fixed the issue). Leave `in-progress` as-is (the loop treats it as pending). Jump into the Step 4 loop.

**Exception:** if `.ship/config.json` has `workflow.confirm_resume: true`, prompt `Resume? [y/n]` before starting. Default is `false`.

### Single-feature mode (`/ship-code:ship 3`)

- Read `.ship/plan.md`, find feature `n`.
- Run the Step 4 loop on just that feature (one iteration).
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

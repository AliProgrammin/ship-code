---
description: "Decompose a feature into atomic specs, execute them, and commit each one"
argument-hint: "<description of what to build>"
---

> **Context rule:** Delegates all work to the `ship-planner` subagent. The main context only receives a commit summary.

# /ship-code:plan

Decompose a feature into atomic specs, execute them, and commit each one.

Usage: `/ship-code:plan <plain English description of what to build>`


## Phase 2 — Execute

For each spec in order (or parallel if no dependencies):

1. **Read before writing** — scan existing code in target files for patterns, naming conventions, error handling style. New code must match. This is the recursive quality loop.
2. Read the spec completely
3. Declare scope out loud: "I will only modify: [files from can-modify]"
4. Implement according to steps — no deviation from scope
5. Run gates: `npm run lint && npm run typecheck && npm test` (or Python equivalent)
6. **If gates pass:** commit with full traceability: `feat(ship-NNN): title / agent: claude-code / task: spec path / timestamp: ISO / scope: files`
7. **If gates fail:**
   - Do NOT patch the output to silence errors
   - Diagnose root cause (spec ambiguity? missing context? wrong scope?)
   - Log to `.ship/issues.md`
   - Fix the spec, then rerun from scratch
   - **If the same task fails twice: STOP. Log the blocker. Surface to human. Do not attempt a third run.**

---

## Phase 3 — Human verify

After all tasks complete, output:

```
✅ ship-code execution complete

Tasks completed:
  [001] <title> — committed abc1234
  [002] <title> — committed def5678
  ...

Gates: lint ✅  types ✅  tests ✅  (N passing)

Open issues: see .ship/issues.md

👉 Please verify the feature works as intended.
   If something is wrong, do NOT manually patch it.
   Tell me what's wrong and I'll fix the spec and rerun.
```

---
description: "Ad-hoc small task with no ceremony — gates still enforced"
argument-hint: "<description>"
---
# /ship-code:quick

Ad-hoc task with no ceremony. Same quality guarantees, no spec files saved.

Usage: `/ship-code:quick <description>`

Best for: bug fixes, renames, config tweaks, single-file changes.
Not for: anything touching more than 3 files, or anything with unclear scope.

---

## Steps

1. **Scope check** — if the task seems to touch more than 3 files or has unclear boundaries, stop and suggest `/ship-code:plan` instead.

2. **Write an inline spec** (not saved to disk):
   - Goal (one sentence)
   - Files to modify (explicit list)
   - Steps (concrete, no inference)
   - Acceptance criteria

3. **Implement**

4. **Run gates** — same as always: lint → types → tests

5. **If green** → commit: `fix(ship): <short description>`

6. **If red** → diagnose root cause, rewrite the inline spec, rerun from scratch. Never patch.

**Hard blocks still apply.** Quick mode doesn't bypass any gates or blocks.

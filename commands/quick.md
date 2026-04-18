---
description: "Ad-hoc small task with no ceremony — gates still enforced"
argument-hint: "<description>"
---
# /ship-code:quick

Ad-hoc task with no ceremony. Same quality guarantees, no plan files.

Usage: `/ship-code:quick <description>`

Best for: bug fixes, renames, config tweaks, single-file changes.
Not for: anything touching more than 3 files, or anything with unclear scope.

---

## Steps

1. **Scope check** — if the task seems to touch more than 3 files or has unclear boundaries, stop and suggest `/ship-code:ship` instead.

2. **Implement** — explore the codebase, understand the patterns, make the change. Match existing conventions.

3. **Run gates** — same as always: lint → types → tests

4. **If green** → commit: `fix(ship): <short description>`

5. **If red** → diagnose root cause, fix, retry. If stuck after 3 attempts, stop and tell the user what's wrong.

**Hard blocks still apply.** Quick mode doesn't bypass any gates or blocks.

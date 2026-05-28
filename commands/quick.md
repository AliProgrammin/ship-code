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

2. **Read the rules** — open `.ship/HARD_BLOCKS.md` and confirm the task doesn't require violating any. If it does, stop and surface to the user.

3. **Implement** — explore the codebase, understand the patterns, make the change. Match existing conventions.

4. **Run gates** — same as always: lint → types → tests

5. **If green** → commit: `fix(ship): <short description>`

6. **If red** → diagnose root cause, fix, retry. If stuck after 3 attempts, stop and tell the user what's wrong.

7. **Append to the ledger** — write a new entry to `.ship/issues.md` following the format in `commands/ship.md` Step 4a. Use `Source: quick`, `Eval: ungraded`, `Rounds: 1`. Then commit: `chore(ledger): f<N> <title>`. The ledger commit is separate from the fix commit so its `Commit:` line refers to a real prior hash.

**Hard blocks still apply.** Quick mode doesn't bypass any gates or blocks.

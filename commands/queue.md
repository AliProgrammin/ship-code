---
description: "Show, add, or reorder tasks in the ship queue"
argument-hint: "[show | add <description> | reorder]"
---

# /ship-code:queue

Manage the task queue without starting execution.

Usage:
- `/ship-code:queue` or `/ship-code:queue show` — display current queue
- `/ship-code:queue add <description>` — add a task to the queue
- `/ship-code:queue reorder` — interactively reprioritize

## show (default)

Read `.ship/QUEUE.md` and `.ship/STATE.md`. Print a clean summary:

```
Queue — wave 2/4

  Doing (2):
    auth/002  Add password reset
    auth/003  Add email verification

  Next (2):
    auth/004  Add OAuth providers → needs: auth/002, auth/003
    auth/005  Add session management → needs: auth/004

  Blocked (1):
    auth/006  Add SAML SSO — type errors in SAML lib

  Done (3):
    auth/001  Add JWT middleware → abc1234
    setup/001 Initialize auth module → def5678
    setup/002 Add auth types → ghi9012
```

## add

When the user runs `/ship-code:queue add <description>`:

1. Determine the task slug and next available ID from existing tasks in QUEUE.md
2. Ask the user: "Does this depend on any existing task?" — show the current task list for reference
3. Add to the `Next` section of QUEUE.md with the right `needs:` if any
4. Do NOT create a spec file yet — that happens when `/ship-code:loop` or `/ship-code:ship` runs the planner
5. Confirm: "Added `<slug>/<id>` to queue. Run `/ship-code:loop` to execute."

## reorder

Show the current `Next` section and ask the user how they want to reorder. Update QUEUE.md accordingly. Warn if reordering would break dependency chains.

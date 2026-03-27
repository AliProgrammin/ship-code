---
description: "Resume the execution loop from QUEUE.md — picks up where it left off"
---

> **Context rule:** Delegates all work to the `ship-brain` subagent. The main context only receives the final summary.

# /ship-code:loop

Resume the ship loop from where it stopped. Reads QUEUE.md and STATE.md, figures out what's left, and keeps shipping.

Usage: `/ship-code:loop`

Use when:
- A previous `/ship-code:ship` was interrupted
- You manually added tasks to QUEUE.md and want to execute them
- You fixed a blocked spec and want to retry

## Steps

1. Read `.ship/QUEUE.md` and `.ship/STATE.md`
2. Check if there are tasks in `Next` or `Doing` — if empty, tell the user "Nothing to do"
3. If there are tasks stuck in `Doing` (from a crashed session), move them back to `Next`
4. Spawn `ship-brain` agent with the current queue state
5. ship-brain resolves waves, executes, archives, returns summary
6. Show the user what shipped, what's blocked, what's left

## Output

```
Loop resumed from wave <N>

Shipped:
  ✓ <id> <title> → <hash>

Blocked:
  ✗ <id> <title> — <reason>

Queue: <N> remaining | <N> blocked
Archives: .ship/archive/

👉 Fix blocked specs and run /ship-code:loop again
   Or add more tasks with /ship-code:queue add <description>
   Push when ready: git push
```

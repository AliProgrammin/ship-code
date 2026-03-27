---
description: "Execute a single existing spec file in isolation"
argument-hint: "<path-to-spec.xml>"
---

> **Context rule:** Delegates all work to a `ship-executor` subagent. The main context only receives the result.

# /ship-code:run

Execute a single spec file in isolation.

Usage: `/ship-code:run <path-to-spec.xml>` or `/ship-code:run <task-slug/NNN>`

Use when:
- Re-running a failed task after fixing the spec
- Executing a manually written spec
- Running one task from the queue in isolation

---

## Steps

1. Read the spec file
2. Spawn `ship-executor` agent with the spec
3. Executor implements, runs gates, commits if green
4. Update QUEUE.md — move task to `Done` if success, `Blocked` if failure
5. Update STATE.md
6. Report result to user

If success:
```
✓ <id> <title> → <commit-hash>
```

If failure:
```
✗ <id> <title> — <reason>
  See .ship/issues.md
  Fix the spec and run again: /ship-code:run <path>
```

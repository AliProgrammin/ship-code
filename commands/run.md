---
description: "Execute a single existing spec file in isolation"
argument-hint: "<path-to-spec.xml>"
---

> **Context rule:** Delegates all work to the `clean-planner (single-spec mode)` subagent. The main context only receives a commit summary.

# /clean:run

Execute a single spec file in isolation.

Usage: `/clean:run <path-to-spec.xml>` or `/clean:run <task-slug/NNN>`

Use when:
- Re-running a failed task after fixing the spec
- Executing a manually written spec
- Running one unit from a larger decomposition in isolation

---

## Steps

1. Read the spec file completely
2. Declare scope: "I will only modify: [files from <can-modify>]"
3. Implement according to `<steps>` — no deviation from scope
4. Run gates
5. If green → commit: `feat(clean-<id>): <title>`
6. If red → diagnose, log to `.clean/issues.md`, stop. **Do not patch. Fix the spec.**

If the same spec fails twice in a row, stop and ask the human to clarify the spec before retrying.

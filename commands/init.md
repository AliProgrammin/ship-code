---
description: "Set up hooks, gates, config, and hard blocks for this project"
---
# /ship-code:init

Set up this project for anti-slop agentic development.

## Steps

1. **Detect stack**
   - Check for `package.json` → Node/TS project
   - Check for `pyproject.toml` / `requirements.txt` → Python project
   - Check for other markers and note the stack

2. **Create `.ship/` directory structure**

   Create `.ship/config.json`:
   ```json
   {
     "gates": {
       "tests": true,
       "lint": true,
       "types": true,
       "no_push": true
     },
     "stack": "<detected>",
     "issue_log": ".ship/issues.md",
     "task_dir": ".ship/tasks/",
     "archive_dir": ".ship/archive/",
     "workflow": {
       "research_before_plan": true,
       "parallel_waves": true,
       "max_retries_per_spec": 2,
       "skip_permissions": true,
       "auto_archive_after_wave": true,
       "skip_dependents_on_failure": true
     }
   }
   ```

   Create `.ship/QUEUE.md`:
   ```markdown
   # Queue

   ## Doing

   ## Next

   ## Blocked

   ## Done
   ```

   Create `.ship/STATE.md`:
   ```markdown
   # State

   loop: idle
   wave: 0/0
   done: 0 | active: 0 | blocked: 0 | queued: 0

   last: none
   ```

   Create `.ship/issues.md`:
   ```markdown
   # Issues

   | Date | Task | Issue | Root Cause | Resolution |
   |------|------|-------|------------|------------|
   ```

   Create `.ship/HARD_BLOCKS.md`:
   ```markdown
   # Hard Blocks

   - NEVER `git push` — human reviews and pushes manually
   - NEVER modify files outside declared task scope
   - NEVER delete or skip tests to make gates pass
   - NEVER use `any` type or `@ts-ignore` to silence type errors
   - NEVER disable lint rules (`eslint-disable`, `# noqa`) to make gates pass
   - NEVER commit with a failing test
   - NEVER fix bad agent output directly — reset and fix the spec instead
   ```

   Create `.ship/tasks/` directory (empty, with `.gitkeep`)

   Create `.ship/archive/` directory (empty, with `.gitkeep`)

3. **Install pre-commit hook**

   Write `.git/hooks/pre-commit`:

   ```bash
   #!/bin/bash
   # ship-code pre-commit gate
   set -e
   echo "ship-code gates running..."

   if [ -f "package.json" ]; then
     echo "  → lint"
     npm run lint 2>&1 || { echo "FAIL: lint"; exit 1; }
     echo "  → types"
     npm run typecheck 2>&1 || { echo "FAIL: types"; exit 1; }
     echo "  → tests"
     npm test 2>&1 || { echo "FAIL: tests"; exit 1; }

   elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
     echo "  → lint"
     ruff check . 2>&1 || { echo "FAIL: lint"; exit 1; }
     echo "  → types"
     mypy . 2>&1 || { echo "FAIL: types"; exit 1; }
     echo "  → tests"
     pytest 2>&1 || { echo "FAIL: tests"; exit 1; }
   fi

   echo "All gates passed."
   ```

   Run: `chmod +x .git/hooks/pre-commit`

4. **Report what was set up**

   Show the user:
   - Stack detected
   - Files created (list them)
   - Gates configured
   - Workflow settings (research enabled, parallel waves, etc.)
   - Any gate commands that need to be added to `package.json` / `pyproject.toml` if missing

   If gate commands are missing from the project, tell the user exactly what to add — don't silently skip gates.

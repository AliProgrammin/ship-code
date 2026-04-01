---
description: "Set up gates, config, and hard blocks for this project"
---
# /ship-code:init

Set up this project for ship-code.

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
     "workflow": {
       "parallel_features": true,
       "max_eval_rounds": 3,
       "skip_permissions": true
     }
   }
   ```

   Create `.ship/issues.md`:
   ```markdown
   # Issues

   | Date | Feature | Issue | Root Cause | Resolution |
   |------|---------|-------|------------|------------|
   ```

   Create `.ship/HARD_BLOCKS.md`:
   ```markdown
   # Hard Blocks

   - NEVER `git push` — human reviews and pushes manually
   - NEVER use `any` type or `@ts-ignore` to silence type errors
   - NEVER disable lint rules (`eslint-disable`, `# noqa`) to make gates pass
   - NEVER delete or skip tests to make gates pass
   - NEVER commit with failing tests
   ```

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
   - Workflow settings
   - Any gate commands that need to be added to `package.json` / `pyproject.toml` if missing

   If gate commands are missing from the project, tell the user exactly what to add — don't silently skip gates.

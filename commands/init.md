---
description: "Set up hooks, gates, config, and hard blocks for this project"
---
# /clean:init

Set up this project for anti-slop agentic development.

## Steps

1. **Detect stack**
   - Check for `package.json` → Node/TS project
   - Check for `pyproject.toml` / `requirements.txt` → Python project
   - Check for other markers and note the stack

2. **Create `.clean/` directory structure**

   Create `.clean/config.json`:
   ```json
   {
     "gates": {
       "tests": true,
       "lint": true,
       "types": true,
       "no_push": true
     },
     "stack": "<detected>",
     "issue_log": ".clean/issues.md",
     "task_dir": ".clean/tasks/"
   }
   ```

   Create `.clean/issues.md`:
   ```markdown
   # Agent Issues & Learnings
   _Centralized log. All agent blockers, root causes, and learnings go here._

   | Date | Task | Issue | Root Cause | Resolution |
   |------|------|-------|------------|------------|
   ```

   Create `.clean/HARD_BLOCKS.md`:
   ```markdown
   # Hard Blocks — What Agents Can NEVER Do

   These are enforced via pre-commit hook. Violations abort the commit.

   - NEVER `git push` — human reviews and pushes manually
   - NEVER modify files outside declared task scope
   - NEVER delete or skip tests to make gates pass
   - NEVER use `any` type or `@ts-ignore` to silence type errors
   - NEVER disable lint rules (`eslint-disable`, `# noqa`) to make gates pass
   - NEVER commit with a failing test
   - NEVER fix bad agent output directly — reset and fix the spec instead
   ```

   Create `.clean/tasks/` directory (empty, with `.gitkeep`)

3. **Install pre-commit hook**

   Write `.git/hooks/pre-commit`:

   ```bash
   #!/bin/bash
   # clean-code pre-commit gate
   # Runs: lint → types → tests. Blocks commit on failure.

   set -e
   TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
   ISSUES_FILE=".clean/issues.md"

   echo "🔒 clean-code gates running..."

   # Detect stack and run appropriate gates
   if [ -f "package.json" ]; then
     # Node/TS
     echo "  → lint"
     npm run lint 2>&1 || { echo "❌ Lint failed. Fix before committing."; echo "| $TIMESTAMP | pre-commit | Lint failed | Bad code | Fix lint errors |" >> $ISSUES_FILE; exit 1; }
     
     echo "  → types"
     npm run typecheck 2>&1 || { echo "❌ Type check failed."; echo "| $TIMESTAMP | pre-commit | Types failed | Bad code | Fix type errors |" >> $ISSUES_FILE; exit 1; }
     
     echo "  → tests"
     npm test 2>&1 || { echo "❌ Tests failed. All tests must pass."; echo "| $TIMESTAMP | pre-commit | Tests failed | Bad code | Fix failing tests |" >> $ISSUES_FILE; exit 1; }

   elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
     # Python
     echo "  → lint"
     ruff check . 2>&1 || { echo "❌ Lint failed."; exit 1; }
     
     echo "  → types"
     mypy . 2>&1 || { echo "❌ Type check failed."; exit 1; }
     
     echo "  → tests"
     pytest 2>&1 || { echo "❌ Tests failed."; exit 1; }
   fi

   echo "✅ All gates passed."
   ```

   Run: `chmod +x .git/hooks/pre-commit`

4. **Create `.clean/commit-template`** for traceable commits:
   ```
   <type>(clean-<task-id>): <title>
   
   agent: claude-code
   task: <spec-file-path>
   timestamp: <ISO timestamp>
   scope: <files modified>
   ```
   Configure it: `git config commit.template .clean/commit-template`

5. **Report what was set up**

   Show the user:
   - Stack detected
   - Files created
   - Gates configured
   - Hard blocks installed
   - Any gate commands that need to be added to `package.json` / `pyproject.toml` if missing (e.g. `"lint"`, `"typecheck"` scripts)

   If gate commands are missing from the project, tell the user exactly what to add — don't silently skip gates.

---
description: "Set up gates, config, and hard blocks for this project (handles empty repos)"
---
# /ship-code:init

Set up this project for ship-code.

## Steps

### 1. Detect state

Run this in order:

1. Check for stack markers in the project root:
   - `package.json` → `ts-node`
   - `pyproject.toml` / `requirements.txt` / `setup.py` → `python`
   - `Cargo.toml` → `rust`
   - `go.mod` → `go`
   - anything else with a lockfile/manifest → note it, mark `other`
2. If **none** of those exist (empty repo or docs-only) → set `stack: "unknown"`. This is the **empty-repo branch**: skip gate commands and the pre-commit hook. The planner will bootstrap the stack on first `/ship-code:ship`.

### 2. Create `.ship/` directory structure

Create `.ship/config.json` — set `stack` to what you detected above, or `"unknown"`:

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

### 3. Build `HARD_BLOCKS.md` (defaults + ingested user rules)

Start with these defaults:

```markdown
# Hard Blocks

- NEVER `git push` — human reviews and pushes manually
- NEVER use `any` type or `@ts-ignore` to silence type errors
- NEVER disable lint rules (`eslint-disable`, `# noqa`) to make gates pass
- NEVER delete or skip tests to make gates pass
- NEVER commit with failing tests
- NEVER use `--no-verify` on commits
```

**Then ingest user rules.** Read in order, if they exist:
1. `~/.claude/CLAUDE.md` (user's global rules)
2. `./CLAUDE.md` (project-local rules)

Scan for lines / bullets / sentences that express a prohibition. Match patterns like:
- "never ..."
- "don't ..."
- "do not ..."
- "no ..." when followed by a forbidden action (e.g. "no Co-Authored-By")
- "NEVER", "MUST NOT"

Append each unique prohibition as a bullet under a new section:

```markdown
## Ingested from CLAUDE.md

- NEVER add `Co-Authored-By` or Claude/Anthropic signatures to commit messages
- NEVER ...
```

Deduplicate. Keep the wording close to the source. If a rule duplicates a default, skip it.

### 4. Install pre-commit hook (skip if `stack: unknown`)

If the stack is known, write `.git/hooks/pre-commit`:

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

elif [ -f "Cargo.toml" ]; then
  echo "  → fmt"
  cargo fmt --check 2>&1 || { echo "FAIL: fmt"; exit 1; }
  echo "  → clippy"
  cargo clippy -- -D warnings 2>&1 || { echo "FAIL: clippy"; exit 1; }
  echo "  → tests"
  cargo test 2>&1 || { echo "FAIL: tests"; exit 1; }

elif [ -f "go.mod" ]; then
  echo "  → vet"
  go vet ./... 2>&1 || { echo "FAIL: vet"; exit 1; }
  echo "  → tests"
  go test ./... 2>&1 || { echo "FAIL: tests"; exit 1; }
fi

echo "All gates passed."
```

Run: `chmod +x .git/hooks/pre-commit`

If `stack: "unknown"` — skip hook installation. The planner will install it once a stack is chosen.

### 5. Report what was set up

Show the user:

**Known-stack case:**
```
ship-code init

Stack: <detected>
Files created: .ship/config.json, .ship/issues.md, .ship/HARD_BLOCKS.md
Pre-commit hook: installed
Hard blocks: <N> defaults + <M> ingested from CLAUDE.md
Gates: lint + types + tests

Next: /ship-code:ship to describe what to build.
```

**Empty-repo case:**
```
ship-code init

Empty repo — no stack markers found.
Wrote .ship/ with stack: unknown.
Pre-commit hook skipped (installs once stack is chosen).
Hard blocks: <N> defaults + <M> ingested from CLAUDE.md

Next: /ship-code:ship to describe what to build.
The planner will pick a stack, scaffold a skeleton, and install the hook.
```

If any gate commands are missing from the project (e.g., no `typecheck` script in `package.json`), tell the user exactly what to add — don't silently skip gates.

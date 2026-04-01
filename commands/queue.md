---
description: "Show the current plan status — what's shipped, pending, or blocked"
argument-hint: "[show | add <description>]"
---

# /ship-code:queue

View or modify the ship plan.

Usage:
- `/ship-code:queue` or `/ship-code:queue show` — display current plan status
- `/ship-code:queue add <description>` — add a feature to the plan

## show (default)

Read `.ship/plan.md`. Print a clean summary:

```
Plan status

  Shipped (2):
    1. Add JWT middleware → abc1234
    2. Add auth types → def5678

  Pending (2):
    3. Add password reset
    4. Add OAuth providers → depends on 3

  Blocked (1):
    5. Add SAML SSO — type errors in SAML lib
```

## add

When the user runs `/ship-code:queue add <description>`:

1. Read `.ship/plan.md` to find the next feature number
2. Ask: "Does this depend on any existing feature?" — show current features for reference
3. Add a new feature brief section to `.ship/plan.md` with status `pending`
4. Confirm: "Added feature <N> to plan. Run `/ship-code:loop` to execute."

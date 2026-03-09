---
description: "Research a problem — best practices, libraries, codebase analysis, spec suggestion"
argument-hint: "<problem or question>"
---

> **Context rule:** Delegates all work to the `ship-researcher` subagent. The main context only receives the final report.

# /ship-code:research

Research a problem before building anything. Searches for best practices, analyzes the codebase,
finds the right tools, and produces a saved report + optional spec suggestion.

Usage: `/ship-code:research <problem or question>`

Examples:
- `/ship-code:research how to handle authentication in Next.js`
- `/ship-code:research best way to structure a REST API in Python`
- `/ship-code:research what testing library should I use for React`
- `/ship-code:research how to add rate limiting to my Express app`


## Rules

- **Never recommend something just because it's popular.** Recommend what fits the codebase.
- **Always check what's already installed** before suggesting a new library.
- **Be honest about tradeoffs.** Don't oversell the recommendation.
- **If the problem is unclear**, say so and suggest a clearer framing before researching.
- **If the codebase already has a solution**, point that out first — don't suggest rebuilding it.

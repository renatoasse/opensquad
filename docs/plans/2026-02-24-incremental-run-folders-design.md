# Incremental Run Folders for Squad Output

**Date:** 2026-02-24
**Status:** Approved

## Problem

All squad executions dump intermediate files (research.md, ideas.md, draft.md, etc.) into a single `output/drafts/` folder. Each run overwrites the previous one, losing all history.

## Solution

Each pipeline execution creates a new numbered folder inside `output/`, containing all intermediate and final files for that run.

### Folder naming: `{id}-{slug}`

- **id**: Incremental integer (1, 2, 3...), determined by scanning existing folders
- **slug**: Slugified topic name (lowercase, hyphens, no special chars)
- Examples: `1-mortedosaas`, `2-vibecodingem2027`, `3-iaparadevs`

### Run folder resolution (runner-driven)

At pipeline start, the Pipeline Runner:

1. Scans `squads/{name}/output/` for folders matching `{N}-*` pattern
2. Computes `nextId = max(existing IDs) + 1` (defaults to 1 if empty)
3. Slugifies the topic input (lowercase, remove accents, replace spaces/special chars with hyphens)
4. Creates `squads/{name}/output/{nextId}-{slug}/`
5. Sets `{run-dir}` variable for all subsequent step path resolution

### Path variable: `{run-dir}`

All step files and squad.yaml use `{run-dir}` instead of hardcoded `./output/drafts/`. The runner resolves this variable before executing each step.

### Output structure

```
squads/instagram-content/output/
├── 1-mortedosaas/
│   ├── research.md
│   ├── ideas.md
│   ├── selected-idea.md
│   ├── draft.md
│   ├── review.md
│   └── 2026-02-24-carousel-mortedosaas.md
├── 2-vibecodingem2027/
│   ├── research.md
│   ├── ideas.md
│   ├── selected-idea.md
│   ├── draft.md
│   ├── review.md
│   └── 2026-02-24-carousel-vibecodingem2027.md
└── .gitkeep
```

## Files to change

| File | Change |
|------|--------|
| `runner.pipeline.md` | Add "Run Folder Setup" section to Initialization |
| `squad.yaml` | Replace `./output/drafts/` → `{run-dir}/` in all step output/input paths |
| `step-01-research.md` | `outputFile: "{run-dir}/research.md"` |
| `step-02-ideation.md` | `outputFile: "{run-dir}/ideas.md"` |
| `step-03-user-choice.md` | `outputFile: "{run-dir}/selected-idea.md"` |
| `step-04-writing.md` | `inputFile` and `outputFile` → `{run-dir}/` |
| `step-05-review.md` | `inputFile` and `outputFile` → `{run-dir}/` |
| `step-06-final.md` | `outputFile: "{run-dir}/{date}-carousel-{slug}.md"` |
| `output/drafts/` directory | Remove from template (replaced by dynamic folders) |

## Slug generation rules

- Convert to lowercase
- Remove accents (é→e, ã→a, etc.)
- Replace spaces and special characters with hyphens
- Remove consecutive hyphens
- Trim hyphens from start/end
- Max 50 characters
- Example: "Morte do SaaS" → `morte-do-saas`

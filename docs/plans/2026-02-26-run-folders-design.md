# Design: Run Folders para Output de Squad

**Date:** 2026-02-26
**Status:** Approved

## Problem

Atualmente, cada execução do squad sobrescreve os mesmos arquivos em `output/drafts/`. Não há separação entre execuções. Futuramente, cada run pode gerar múltiplos arquivos (imagens, assets, etc.) que precisam estar agrupados.

## Solution

Cada execução do pipeline cria uma subpasta dedicada dentro de `output/`, nomeada como `YYYY-MM-DD-{slug-do-topico}`. Todos os arquivos da run ficam agrupados nessa pasta.

## Output Structure

```
squads/{name}/output/
├── drafts/                                    ← staging temporário (step 1)
│   └── research.md                            ← sobrescrito a cada run
├── 2026-02-26-inteligencia-artificial/
│   ├── drafts/
│   │   ├── research.md
│   │   ├── angles.md
│   │   ├── draft.md
│   │   └── review.md
│   └── final/
│       └── carousel.md
├── 2026-02-27-marketing-digital/
│   ├── drafts/
│   └── final/
└── ...
```

## New Variable: `{run-folder}`

The Pipeline Runner creates a `{run-folder}` variable after step 1 completes, pointing to `{squad-root}/output/YYYY-MM-DD-{slug}/`.

## Execution Flow

### Step 1 (Research) — uses staging area

1. Step 1 executes normally, saving to `{squad-root}/output/drafts/research.md` (existing path, acts as staging)
2. User completes step 1 checkpoint (selects findings)

### Run Folder Creation — after step 1 checkpoint

3. Runner reads research output, extracts topic from `# Research Brief: {topic}` header
4. Runner generates slug from topic:
   - Lowercase
   - Remove accents (á→a, ç→c, ê→e, etc.)
   - Replace spaces and special characters with `-`
   - Truncate at ~50 characters
   - If folder already exists, append `-2`, `-3`, etc.
5. Runner creates `{run-folder}` = `{squad-root}/output/YYYY-MM-DD-{slug}/`
6. Runner creates `{run-folder}/drafts/` and `{run-folder}/final/`
7. Runner moves `output/drafts/research.md` → `{run-folder}/drafts/research.md`

### Steps 2-4 — use `{run-folder}`

8. All subsequent steps use `{run-folder}/drafts/` for input and output
9. `inputFile` and `outputFile` in step frontmatter use `{run-folder}` variable

### Pipeline Completion

10. Final output saved to `{run-folder}/final/{filename}.md`
11. Completion banner shows the run folder path
12. Squad memory updated as usual

## Slug Generation Rules

| Input | Output |
|-------|--------|
| `Inteligência Artificial no Marketing` | `inteligencia-artificial-no-marketing` |
| `AI Agents para Devs` | `ai-agents-para-devs` |
| `Tendências 2026!!!` | `tendencias-2026` |

## Files to Modify

### Core (runner)
- `_opensquad/core/runner.pipeline.md` — Add "Run Folder Creation" section after step execution rules
- `templates/_opensquad/core/runner.pipeline.md` — Mirror same change

### Step files (existing squad)
- `squads/instagram-content/pipeline/steps/step-01-research.md` — Keep `outputFile` as staging path (no change)
- `squads/instagram-content/pipeline/steps/step-02-ideation.md` — `inputFile`/`outputFile` → `{run-folder}/drafts/`
- `squads/instagram-content/pipeline/steps/step-03-writing.md` — `inputFile`/`outputFile` → `{run-folder}/drafts/`
- `squads/instagram-content/pipeline/steps/step-04-review.md` — `inputFile`/`outputFile` → `{run-folder}/drafts/`

### Step templates
- `templates/squads/instagram-content/pipeline/steps/step-02-ideation.md` — Same as above
- `templates/squads/instagram-content/pipeline/steps/step-03-writing.md` — Same as above
- `templates/squads/instagram-content/pipeline/steps/step-04-review.md` — Same as above

### Squad YAML
- `squads/instagram-content/squad.yaml` — Update output paths in pipeline steps
- `templates/squads/instagram-content/squad.yaml` (if exists) — Mirror

### Architect
- `_opensquad/core/architect.agent.yaml` — Update squad creation instructions re: output structure

### Pipeline State
- Add `run-folder-path` to tracked pipeline state in runner

## Design Decisions

1. **Topic source:** Extracted from research brief header (`# Research Brief: {topic}`) after step 1 completes — most reliable, no extra user input needed
2. **Naming format:** `YYYY-MM-DD-{slug}` — sortable by date, descriptive by topic
3. **Staging area:** Step 1 still writes to `output/drafts/` as staging, moved after topic is known
4. **Internal structure:** `drafts/` for intermediaries, `final/` for approved output — clear separation
5. **Collision handling:** Append `-2`, `-3` for same-day duplicate topics

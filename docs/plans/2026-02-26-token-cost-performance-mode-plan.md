# Token Cost in Performance Mode — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make token cost implications explicit in the Architect's Performance Mode question, and rename "Rápido" → "Econômico" across all core files.

**Architecture:** Text-only changes across 6 files. Replace the Performance Mode question block in both architect.agent.yaml files, then rename "Rápido" → "Econômico" in prompt templates.

**Tech Stack:** YAML, Markdown

---

### Task 1: Update Performance Mode question in core architect.agent.yaml

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml:101-113`

**Step 1: Replace the Performance Mode question block**

Replace lines 101-113 with:

```yaml
      6. **Performance Mode**: "What quality level do you want for this squad?"
         Use AskUserQuestion with these options:
         - Alta Performance (Recommended) — Pipeline completo com análise profunda, múltiplos
           formatos por plataforma, tarefas dedicadas de otimização e revisão completa.
           **Custo de tokens elevado** — mais processos de otimização e revisão do conteúdo.
           Produz resultados premium com variantes A/B.
         - Econômico — Pipeline enxuto com análise básica, formato principal apenas e revisão leve.
           **Custo de tokens reduzido** — menos etapas de otimização e revisão.
           Execução mais rápida, qualidade ainda boa.

         Token cost implications (explain to user when presenting options):
         - Alta Performance: higher token consumption due to multiple optimization passes,
           dedicated review tasks with separate scoring and feedback, and A/B variant generation
         - Econômico: reduced token consumption with single-pass creation and lightweight review

         This choice affects how the Architect designs the squad:
         - Alta Performance: 3-5 tasks per agent, platform-specific creators, optimization tasks, full review with separate scoring and feedback
         - Econômico: 1-2 tasks per agent, single creator (or generic writer), combined optimization in create task, lightweight single-pass review

         Save the user's choice as `performance_mode`. Use it in Phase 4 to determine squad design depth.
```

**Step 2: Rename remaining "Rápido" references in the same file**

Replace all other occurrences of `Rápido` with `Econômico` in `_opensquad/core/architect.agent.yaml`:
- Line 394: `Rápido:` → `Econômico:`
- Line 404: `Rápido:` → `Econômico:`
- Line 412: `Rápido:` → `Econômico:`
- Line 445: `Alta Performance / Rápido` → `Alta Performance / Econômico`
- Line 621: `Rápido mode` → `Econômico mode`
- Line 845: `Alta Performance / Rápido` → `Alta Performance / Econômico`

**Step 3: Commit**

```bash
git add _opensquad/core/architect.agent.yaml
git commit -m "feat: add token cost to performance mode question in architect"
```

---

### Task 2: Mirror changes to templates architect.agent.yaml

**Files:**
- Modify: `templates/_opensquad/core/architect.agent.yaml:101-113`

**Step 1: Apply identical changes from Task 1**

The templates file is identical to the core file. Apply the same Performance Mode block replacement (lines 101-113) and rename all `Rápido` → `Econômico` occurrences.

**Step 2: Commit**

```bash
git add templates/_opensquad/core/architect.agent.yaml
git commit -m "feat: mirror token cost changes to architect template"
```

---

### Task 3: Rename "Rápido" in prompt templates

**Files:**
- Modify: `_opensquad/core/prompts/analyst.prompt.md:46`
- Modify: `_opensquad/core/prompts/reviewer.prompt.md:45`
- Modify: `templates/_opensquad/core/prompts/analyst.prompt.md:46`
- Modify: `templates/_opensquad/core/prompts/reviewer.prompt.md:45`

**Step 1: Replace in all 4 files**

In each file, replace:
```
### Rápido mode
```
with:
```
### Econômico mode
```

**Step 2: Commit**

```bash
git add _opensquad/core/prompts/analyst.prompt.md _opensquad/core/prompts/reviewer.prompt.md templates/_opensquad/core/prompts/analyst.prompt.md templates/_opensquad/core/prompts/reviewer.prompt.md
git commit -m "feat: rename Rápido to Econômico in prompt templates"
```

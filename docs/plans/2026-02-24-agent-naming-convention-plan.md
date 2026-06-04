# Agent Naming Convention — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make all agent names follow an alliterative "FirstName LastName" pattern where the last name is a humorous professional reference, in the user's language.

**Architecture:** Add naming convention instructions to the Architect's Phase 4 (Design) workflow. Rename existing template agents to Portuguese alliterative names. Update squad-party.csv to match.

**Tech Stack:** YAML (architect config), Markdown (agent files), CSV (squad manifest)

---

### Task 1: Rename Architect from "Atlas" to "Arquiteto"

**Files:**
- Modify: `templates/_opensquad/core/architect.agent.yaml:5`

**Step 1: Edit the name field**

In `templates/_opensquad/core/architect.agent.yaml`, change line 5:

```yaml
# OLD
    name: Atlas

# NEW
    name: Arquiteto
```

**Step 2: Verify the change**

Run: `grep -n "name:" templates/_opensquad/core/architect.agent.yaml | head -1`
Expected: `5:    name: Arquiteto`

**Step 3: Commit**

```bash
git add templates/_opensquad/core/architect.agent.yaml
git commit -m "refactor: rename Architect agent from Atlas to Arquiteto"
```

---

### Task 2: Add naming convention instructions to Architect Phase 4

**Files:**
- Modify: `templates/_opensquad/core/architect.agent.yaml:288-294`

**Step 1: Replace the agent naming instruction in Phase 4 item 1**

In `templates/_opensquad/core/architect.agent.yaml`, find this block (lines 288-294):

```yaml
      1. Design the squad with appropriate agents:
         - Each agent needs: memorable name, icon, clear single role
         - Follow the deep .agent.md format with full sections: Persona (Role, Identity,
           Communication Style), Principles, Operational Framework, Voice Guidance,
           Output Examples, Anti-Patterns, Quality Criteria, Integration
         - Reference prompt templates in _opensquad/core/prompts/ for each agent type
           AND the extracted artifacts from Phase 3
```

Replace with:

```yaml
      1. Design the squad with appropriate agents:
         - Follow the deep .agent.md format with full sections: Persona (Role, Identity,
           Communication Style), Principles, Operational Framework, Voice Guidance,
           Output Examples, Anti-Patterns, Quality Criteria, Integration
         - Reference prompt templates in _opensquad/core/prompts/ for each agent type
           AND the extracted artifacts from Phase 3

         #### Agent Naming Convention

         Read the user's preferred language from `_opensquad/_memory/preferences.md` → **Output Language**.

         Every agent MUST have a humorous, memorable two-word name following these rules:
         - **Format:** "FirstName LastName" — both words start with the SAME letter (alliteration)
         - **First name:** A common human name in the user's Output Language
         - **Last name:** A playful, witty reference to the agent's specialty or profession
         - **Uniqueness:** Each agent in the squad MUST use a different initial letter
         - **Icon:** Each agent also gets an emoji icon that represents their role

         Examples by language (DO NOT reuse these — generate original names every time):

         Português (Brasil):
         - Researcher: "Pedro Pesquisa", "Rita Referência"
         - Copywriter: "Guilherme Gancho", "Carlos Carrossel"
         - Reviewer: "Renata Revisão", "Vera Veredito"
         - Ideator: "Ivan Ideia", "Ângela Ângulo"
         - Analyst: "Dante Dados", "Beatriz BI", "Rômulo ROI"
         - Marketing: "Ítalo Inbound", "Lucas Leads", "Cadu Conversão"

         English:
         - Researcher: "Rita Research", "Sam Sources"
         - Copywriter: "Clara Copy", "Harry Hook"
         - Reviewer: "Roger Review", "Victor Verdict"
         - Ideator: "Ivy Idea", "Adam Angle"
         - Analyst: "Dean Data", "Mia Metrics"

         Español:
         - Researcher: "Rodrigo Referencia", "Paula Pesquisa"
         - Copywriter: "Carmen Copy", "Gonzalo Gancho"
         - Reviewer: "Rosa Revisión", "Vera Veredicto"

         The name should make someone smile — it's a pun tying a common name to the profession.
         The first name must feel natural in the user's language. The last name can use
         domain jargon, professional terms, or industry slang.

         **Exception:** The Architect agent does NOT follow this pattern. It uses only its
         functional name in the user's language (e.g., "Arquiteto", "Architect", "Arquitecto").
```

**Step 2: Verify the change**

Run: `grep -n "Agent Naming Convention" templates/_opensquad/core/architect.agent.yaml`
Expected: A match showing the new section header.

**Step 3: Commit**

```bash
git add templates/_opensquad/core/architect.agent.yaml
git commit -m "feat: add alliterative agent naming convention to Architect Phase 4"
```

---

### Task 3: Rename researcher agent (Scout → Pedro Pesquisa)

**Files:**
- Modify: `templates/squads/instagram-content/agents/researcher.agent.md`

**Step 1: Update front matter name field**

Find:
```yaml
name: Scout
```

Replace with:
```yaml
name: Pedro Pesquisa
```

**Step 2: Update the markdown title heading**

Find:
```markdown
# Scout
```

Replace with:
```markdown
# Pedro Pesquisa
```

**Step 3: Verify**

Run: `grep -n "Pedro Pesquisa" templates/squads/instagram-content/agents/researcher.agent.md`
Expected: Two matches — one in front matter (`name:`), one in heading (`#`).

**Step 4: Commit**

```bash
git add templates/squads/instagram-content/agents/researcher.agent.md
git commit -m "refactor: rename researcher agent Scout → Pedro Pesquisa"
```

---

### Task 4: Rename ideator agent (Spark → Ivan Ideia)

**Files:**
- Modify: `templates/squads/instagram-content/agents/ideator.agent.md`

**Step 1: Update front matter name field**

Find:
```yaml
name: Spark
```

Replace with:
```yaml
name: Ivan Ideia
```

**Step 2: Update the markdown title heading**

Find:
```markdown
# Spark
```

Replace with:
```markdown
# Ivan Ideia
```

**Step 3: Verify**

Run: `grep -n "Ivan Ideia" templates/squads/instagram-content/agents/ideator.agent.md`
Expected: Two matches — one in front matter, one in heading.

**Step 4: Commit**

```bash
git add templates/squads/instagram-content/agents/ideator.agent.md
git commit -m "refactor: rename ideator agent Spark → Ivan Ideia"
```

---

### Task 5: Rename copywriter agent (Quill → Carlos Carrossel)

**Files:**
- Modify: `templates/squads/instagram-content/agents/copywriter.agent.md`

**Step 1: Update front matter name field**

Find:
```yaml
name: Quill
```

Replace with:
```yaml
name: Carlos Carrossel
```

**Step 2: Update the markdown title heading**

Find:
```markdown
# Quill
```

Replace with:
```markdown
# Carlos Carrossel
```

**Step 3: Verify**

Run: `grep -n "Carlos Carrossel" templates/squads/instagram-content/agents/copywriter.agent.md`
Expected: Two matches — one in front matter, one in heading.

**Step 4: Commit**

```bash
git add templates/squads/instagram-content/agents/copywriter.agent.md
git commit -m "refactor: rename copywriter agent Quill → Carlos Carrossel"
```

---

### Task 6: Rename reviewer agent (Eagle → Renata Revisão)

**Files:**
- Modify: `templates/squads/instagram-content/agents/reviewer.agent.md`

**Step 1: Update front matter name field**

Find:
```yaml
name: Eagle
```

Replace with:
```yaml
name: Renata Revisão
```

**Step 2: Update the markdown title heading**

Find:
```markdown
# Eagle
```

Replace with:
```markdown
# Renata Revisão
```

**Step 3: Verify**

Run: `grep -n "Renata Revisão" templates/squads/instagram-content/agents/reviewer.agent.md`
Expected: Two matches — one in front matter, one in heading.

**Step 4: Commit**

```bash
git add templates/squads/instagram-content/agents/reviewer.agent.md
git commit -m "refactor: rename reviewer agent Eagle → Renata Revisão"
```

---

### Task 7: Update squad-party.csv with new names

**Files:**
- Modify: `templates/squads/instagram-content/squad-party.csv`

**Step 1: Replace all agent names in the CSV**

The CSV has columns: `name,displayName,...`. Update these 4 rows:

| Row | Old name | Old displayName | New name | New displayName |
|-----|----------|-----------------|----------|-----------------|
| 2 | Scout | Scout | Pedro Pesquisa | Pedro Pesquisa |
| 3 | Spark | Spark | Ivan Ideia | Ivan Ideia |
| 4 | Quill | Quill | Carlos Carrossel | Carlos Carrossel |
| 5 | Eagle | Eagle | Renata Revisão | Renata Revisão |

For each row, the `name` and `displayName` columns (columns 1 and 2) change. All other columns remain the same.

**Step 2: Verify**

Run: `cut -d',' -f1,2 templates/squads/instagram-content/squad-party.csv`
Expected:
```
name,displayName
Pedro Pesquisa,Pedro Pesquisa
Ivan Ideia,Ivan Ideia
Carlos Carrossel,Carlos Carrossel
Renata Revisão,Renata Revisão
```

**Step 3: Commit**

```bash
git add templates/squads/instagram-content/squad-party.csv
git commit -m "refactor: update squad-party.csv with alliterative agent names"
```

---

### Task 8: Final verification

**Step 1: Verify no old names remain in template files**

Run: `grep -rn "Scout\|Spark\|Quill\|Eagle\|Atlas" templates/squads/instagram-content/agents/ templates/squads/instagram-content/squad-party.csv templates/_opensquad/core/architect.agent.yaml | grep -v "^Binary"`

Expected: No matches for Scout, Spark, Quill, Eagle, or Atlas in those files. (Ignore any matches inside long-form text content that coincidentally contains these English words — only `name:` fields and CSV name columns matter.)

**Step 2: Verify new names are present**

Run: `grep -rn "Pedro Pesquisa\|Ivan Ideia\|Carlos Carrossel\|Renata Revisão\|Arquiteto" templates/squads/instagram-content/agents/ templates/squads/instagram-content/squad-party.csv templates/_opensquad/core/architect.agent.yaml`

Expected: At least 2 matches per agent name (front matter + heading) plus CSV entries, plus Arquiteto in architect.agent.yaml.

**Step 3: Verify naming convention instructions exist**

Run: `grep -n "Agent Naming Convention" templates/_opensquad/core/architect.agent.yaml`

Expected: One match showing the new section in Phase 4.

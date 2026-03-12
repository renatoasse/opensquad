# Automatic Pipeline Checkpoints — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move checkpoint logic into the Pipeline Runner so it automatically pauses after each agent step based on squad autonomy level and per-step checkpoint config (approve/select/skip).

**Architecture:** The runner reads `autonomy` from squad.yaml and `checkpoint` from each step's frontmatter. After every agent step (post-veto), it resolves the checkpoint type and executes the appropriate interaction. Separate checkpoint step files are eliminated.

**Tech Stack:** Markdown prompt files (runner, step files), YAML configs (squad.yaml, pipeline.yaml, architect.agent.yaml)

---

### Task 1: Update runner.pipeline.md — Add checkpoint logic

**Files:**
- Modify: `templates/_opensquad/core/runner.pipeline.md`

**Step 1: Remove the `type: checkpoint` handler**

In the "For each pipeline step" section (around line 67-71), delete the entire `#### If type: checkpoint` block:

```markdown
#### If `type: checkpoint`
- Present the checkpoint message to the user
- If the checkpoint requires a choice, use AskUserQuestion
- Wait for user input before proceeding
- Save the user's choice for the next step
```

**Step 2: Add new "Checkpoint Handling" section after "Veto Condition Enforcement"**

Insert the following after line 86 (after the veto section ends, before "### Review Loops"):

```markdown
### Checkpoint Handling

After an agent completes a step and veto conditions pass, handle the checkpoint before moving to the next step.

#### 1. Resolve Checkpoint Type

Determine which checkpoint to apply for this step:

- If the step frontmatter has a `checkpoint:` field → use it
  - Shorthand: `checkpoint: skip` equals `checkpoint: { type: skip }`
  - Full form: `checkpoint: { type: select, prompt: "...", max_feedback_cycles: 3 }`
- If the step frontmatter has NO `checkpoint:` field:
  - If squad.yaml has `autonomy: interactive` → default to `approve`
  - If squad.yaml has `autonomy: autonomous` → default to `skip`

#### 2. Execute Checkpoint by Type

##### Checkpoint: `approve`

1. Present the agent's output to the user with a summary of what was produced
2. Use AskUserQuestion with 3 options:
   - **Approve** → save output, advance to next step
   - **Give feedback** → user writes what to change → trigger Feedback Re-execution (see below)
   - **Abort pipeline** → stop execution, inform user partial outputs are saved
3. If a `prompt:` is defined in the checkpoint config, show it before the options

##### Checkpoint: `select`

1. Read the agent's output and identify items separated by `##` headers
2. Present each item as a selectable option using AskUserQuestion with multiSelect: true
3. If a `prompt:` is defined in the checkpoint config, use it as the question text
4. After user selects:
   - Save the FULL original output to `{outputFile}` (unchanged)
   - Save ONLY the selected items to `{outputFile}-selected.md`
   - The next step's input reads from `{outputFile}-selected.md`
5. Continue to next step

##### Checkpoint: `skip`

1. Save output and advance immediately to the next step
2. No user interaction

#### 3. Feedback Re-execution

When a user gives feedback at an `approve` checkpoint:

1. Track the feedback cycle count (starts at 1)
2. Re-execute the agent with enhanced context:
   - All original step instructions
   - The agent's previous output (what the user saw)
   - The user's feedback text
   - Instruction: "Address the user's feedback while keeping what worked"
3. Respect the step's original execution mode:
   - If `execution: subagent` → re-dispatch via Task tool with the extra context
   - If `execution: inline` → re-invoke the agent inline with the extra context
4. After re-execution, present the checkpoint again (approve/feedback/abort)
5. Maximum feedback cycles: use `max_feedback_cycles` from checkpoint config (default: 2)
6. If max cycles reached: present output to user with only 2 options: Approve as-is / Abort
```

**Step 3: Update Pipeline State tracking**

In the "Pipeline State" section (line 128-135), add checkpoint tracking:

```markdown
## Pipeline State

Track pipeline state in memory during execution:
- Current step index
- Outputs from each completed step (file paths)
- Checkpoint decisions at each step (approved, selected items, skipped)
- Feedback cycle count per step
- Review cycle count
- Start time

This state does NOT persist to disk — it exists only during the current run.
```

**Step 4: Commit**

```bash
git add templates/_opensquad/core/runner.pipeline.md
git commit -m "feat: add automatic checkpoint logic to pipeline runner"
```

---

### Task 2: Update instagram-content squad.yaml

**Files:**
- Modify: `squads/instagram-content/squad.yaml`

**Step 1: Change autonomy and remove checkpoint step IDs**

Replace the `pipeline:` section. Key changes:
- Change `autonomy: high` to `autonomy: interactive`
- Remove `user-choice` and `final` checkpoint step entries
- Add `checkpoint:` config to agent steps
- Renumber steps

The new pipeline section should be:

```yaml
pipeline:
  mode: hybrid
  autonomy: interactive
  max_review_cycles: 3

  steps:
    - id: research
      agent: researcher
      execution: subagent
      output: ./output/drafts/research.md
      checkpoint:
        type: select
        prompt: "Selecione as notícias que quer usar para o conteúdo"

    - id: ideation
      agent: ideator
      execution: inline
      input: ./output/drafts/research.md-selected.md
      output: ./output/drafts/angles.md
      checkpoint:
        type: select
        prompt: "Selecione os ângulos que quer desenvolver"

    - id: writing
      agent: copywriter
      execution: inline
      input: ./output/drafts/angles.md-selected.md
      output: ./output/drafts/draft.md
      checkpoint: skip

    - id: review
      agent: reviewer
      execution: inline
      input: ./output/drafts/draft.md
      output: ./output/drafts/review.md
      on_reject: writing
      on_approve: save
      checkpoint:
        type: approve
        prompt: "Conteúdo aprovado pelo revisor. Revise e aprove para salvar."
```

**Step 2: Commit**

```bash
git add squads/instagram-content/squad.yaml
git commit -m "feat: update instagram-content squad.yaml with checkpoint config"
```

---

### Task 3: Update instagram-content pipeline.yaml

**Files:**
- Modify: `squads/instagram-content/pipeline/pipeline.yaml`

**Step 1: Remove checkpoint step files and renumber**

```yaml
name: instagram-content-pipeline
description: "Research → 🛑 Select → Ideate → 🛑 Select → Write → Review → 🛑 Approve"
squad: instagram-content

input:
  topic:
    prompt: "What topic should we create content about?"
    required: true

steps:
  - file: ./steps/step-01-research.md
  - file: ./steps/step-02-ideation.md
  - file: ./steps/step-03-writing.md
  - file: ./steps/step-04-review.md
```

**Step 2: Commit**

```bash
git add squads/instagram-content/pipeline/pipeline.yaml
git commit -m "feat: simplify pipeline.yaml — remove checkpoint step files"
```

---

### Task 4: Add checkpoint frontmatter to step-01-research.md

**Files:**
- Modify: `squads/instagram-content/pipeline/steps/step-01-research.md`

**Step 1: Add checkpoint field to frontmatter**

Change the frontmatter from:
```yaml
---
name: step-01-research
agent: researcher
execution: subagent
nextStepFile: ./step-02-ideation.md
outputFile: "{squad-root}/output/drafts/research.md"
---
```

To:
```yaml
---
name: step-01-research
agent: researcher
execution: subagent
nextStepFile: ./step-02-ideation.md
outputFile: "{squad-root}/output/drafts/research.md"
checkpoint:
  type: select
  prompt: "Selecione as notícias e dados que quer usar para o conteúdo"
---
```

**Step 2: Add `##` headers convention to output format**

In the "Output Format" section, ensure each "Key Finding" and "Trending Angle" uses `##` headers so the runner can parse them for selection. The existing format already uses `##` headers for sections — verify the items within sections use sub-headers or numbered items with clear separation.

No change needed here — the current format already uses `## Key Findings`, `## Trending Angles`, etc. The runner will present these sections as selectable items.

**Step 3: Commit**

```bash
git add squads/instagram-content/pipeline/steps/step-01-research.md
git commit -m "feat: add checkpoint: select to research step"
```

---

### Task 5: Add checkpoint frontmatter to step-02-ideation.md

**Files:**
- Modify: `squads/instagram-content/pipeline/steps/step-02-ideation.md`

**Step 1: Add checkpoint field to frontmatter**

Change the frontmatter from:
```yaml
---
name: step-02-ideation
agent: ideator
execution: inline
inputFile: "{squad-root}/output/drafts/research.md"
nextStepFile: ./step-03-user-choice.md
outputFile: "{squad-root}/output/drafts/angles.md"
---
```

To:
```yaml
---
name: step-02-ideation
agent: ideator
execution: inline
inputFile: "{squad-root}/output/drafts/research.md"
nextStepFile: ./step-03-writing.md
outputFile: "{squad-root}/output/drafts/angles.md"
checkpoint:
  type: select
  prompt: "Selecione os ângulos virais que quer desenvolver"
---
```

Note: `nextStepFile` changes from `step-03-user-choice.md` to `step-03-writing.md` (the old checkpoint step is removed).

**Step 2: Verify output format uses `##` per angle**

The current output format uses `🎯 ANGLE N:` formatting. For the `select` checkpoint to work, each angle should be clearly separable. The current format with numbered angle blocks separated by `━━━` dividers is parseable by the LLM runner — no structural change needed.

**Step 3: Commit**

```bash
git add squads/instagram-content/pipeline/steps/step-02-ideation.md
git commit -m "feat: add checkpoint: select to ideation step"
```

---

### Task 6: Delete step-03-user-choice.md and rename step-04 → step-03

**Files:**
- Delete: `squads/instagram-content/pipeline/steps/step-03-user-choice.md`
- Rename: `squads/instagram-content/pipeline/steps/step-04-writing.md` → `squads/instagram-content/pipeline/steps/step-03-writing.md`

**Step 1: Delete the checkpoint step file**

```bash
rm squads/instagram-content/pipeline/steps/step-03-user-choice.md
```

**Step 2: Rename writing step**

```bash
mv squads/instagram-content/pipeline/steps/step-04-writing.md squads/instagram-content/pipeline/steps/step-03-writing.md
```

**Step 3: Update frontmatter in the renamed file**

Change the frontmatter of `step-03-writing.md` from:
```yaml
---
name: step-04-writing
agent: copywriter
execution: inline
inputFile: "{squad-root}/output/drafts/selected-angle.md"
nextStepFile: ./step-05-review.md
outputFile: "{squad-root}/output/drafts/draft.md"
---
```

To:
```yaml
---
name: step-03-writing
agent: copywriter
execution: inline
inputFile: "{squad-root}/output/drafts/angles.md"
nextStepFile: ./step-04-review.md
outputFile: "{squad-root}/output/drafts/draft.md"
checkpoint: skip
---
```

Key changes:
- `name:` updated to `step-03-writing`
- `inputFile:` changed from `selected-angle.md` to `angles.md` (the runner's select checkpoint saves the selected items, and the input now comes from the ideation step's selected output)
- `nextStepFile:` updated to `step-04-review.md`
- Added `checkpoint: skip` (writer output goes directly to reviewer)

**Step 4: Update the heading**

Change `# Step 4: Carousel Writing` to `# Step 3: Carousel Writing`.

**Step 5: Add caption and hashtag generation to output format**

The old step-06-final.md contained output format for caption and hashtags. Merge this into the writing step's output format. After the carousel slides section, add:

```markdown
## Caption

{A ready-to-paste Instagram caption that complements the carousel.
Should include a brief intro, key takeaway, and secondary CTAs.}

## Hashtags

{15-20 hashtags organized by type}

Trending: #hashtag1 #hashtag2 #hashtag3
Niche: #hashtag4 #hashtag5 #hashtag6
Branded: #hashtag7 #hashtag8
```

Also update the Output Example to include caption and hashtags.

**Step 6: Commit**

```bash
git add -A squads/instagram-content/pipeline/steps/
git commit -m "feat: remove checkpoint step, rename writing to step-03, add caption/hashtags"
```

---

### Task 7: Rename step-05-review.md → step-04-review.md

**Files:**
- Rename: `squads/instagram-content/pipeline/steps/step-05-review.md` → `squads/instagram-content/pipeline/steps/step-04-review.md`
- Delete: `squads/instagram-content/pipeline/steps/step-06-final.md`

**Step 1: Rename review step**

```bash
mv squads/instagram-content/pipeline/steps/step-05-review.md squads/instagram-content/pipeline/steps/step-04-review.md
```

**Step 2: Update frontmatter**

Change from:
```yaml
---
name: step-05-review
agent: reviewer
execution: inline
inputFile: "{squad-root}/output/drafts/draft.md"
nextStepFile: ./step-06-final.md
outputFile: "{squad-root}/output/drafts/review.md"
onReject: step-04-writing
maxCycles: 3
---
```

To:
```yaml
---
name: step-04-review
agent: reviewer
execution: inline
inputFile: "{squad-root}/output/drafts/draft.md"
outputFile: "{squad-root}/output/drafts/review.md"
onReject: step-03-writing
maxCycles: 3
checkpoint:
  type: approve
  prompt: "Conteúdo revisado e aprovado. Revise o resultado final."
---
```

Key changes:
- `name:` updated to `step-04-review`
- `nextStepFile:` removed (this is the last step — no next step file needed)
- `onReject:` updated to `step-03-writing`
- Added `checkpoint: { type: approve }` — this is the final approval point

**Step 3: Update the heading**

Change `# Step 5: Content Review` to `# Step 4: Content Review`.

**Step 4: Delete step-06-final.md**

```bash
rm squads/instagram-content/pipeline/steps/step-06-final.md
```

The final save logic (memory update, output path) is already handled by the runner's "After Pipeline Completion" section. The output format (caption, hashtags) was moved to the writing step in Task 6.

**Step 5: Commit**

```bash
git add -A squads/instagram-content/pipeline/steps/
git commit -m "feat: rename review to step-04, remove final checkpoint step"
```

---

### Task 8: Update architect.agent.yaml — New checkpoint rules

**Files:**
- Modify: `templates/_opensquad/core/architect.agent.yaml`

**Step 1: Update principle about checkpoints**

Change line 29 from:
```yaml
- Pipelines must have checkpoints at every user decision point
```
To:
```yaml
- "Checkpoints are automatic — declared in step frontmatter, not as separate step files. Types: approve (default for interactive), select (for multi-item outputs), skip (for internal handoffs like writer→reviewer)"
```

**Step 2: Add autonomy question to Phase 1 Discovery**

In the `create-squad` workflow, after question 3 (Frequency/Volume) and before question 4 (References), add:

```markdown
      3.5. **Autonomy**: "How much control do you want during execution?"
           Options: [Interactive — approve each step (recommended for content), Autonomous — run without stopping]
           This sets the `autonomy` field in squad.yaml.
```

**Step 3: Update Content Squad Pattern**

Replace the Content Squad Pattern section (around lines 350-363). Change from:

```markdown
      4. Content Squad Pattern:
         ...
         - The pipeline pattern is:
           Research → Ideation (angles) → 🛑 Angle Selection → Writing → Review → 🛑 Final
         ...
```

To:

```markdown
      4. Content Squad Pattern:
         When designing a content creation squad (any squad that produces
         content like posts, articles, videos, newsletters, etc.):
         - Always include an Ideator agent between Research and Writing
         - The Ideator's role is "Viral Angle Strategist" — identifies the
           best angles from research, NOT a generic idea generator
         - The pipeline pattern is:
           Research (checkpoint: select) → Ideation (checkpoint: select) → Writing (checkpoint: skip) → Review (checkpoint: approve)
         - Checkpoints are declared in each step's frontmatter — NO separate checkpoint step files
         - The Ideator presents 5 angles, each with: angle name, tentative
           hook, suggested structure, and viral potential explanation
         - Reference the instagram-content squad as the canonical example
```

**Step 4: Add checkpoint heuristics after the Content Squad Pattern**

Add a new section:

```markdown
      4.5. Checkpoint Heuristics:
         When assigning checkpoint types to steps in interactive squads:
         - Research / data gathering → checkpoint: { type: select } (user picks items)
         - Ideation / brainstorming → checkpoint: { type: select } (user picks direction)
         - Writing / creation → checkpoint: skip (goes directly to reviewer)
         - Review / QA → checkpoint: { type: approve } (user sees final result)
         - Analysis / processing → checkpoint: { type: approve } (user validates)
         - GUARDRAIL: The last step in any interactive squad MUST have checkpoint: approve
         - For select checkpoints, instruct agents to use ## headers to separate items in output
```

**Step 5: Update pipeline design in Phase 4**

In the design section (around line 336), change:

```markdown
         - Add checkpoints at user decision points
```

To:

```markdown
         - Declare checkpoint type in each step's frontmatter (approve/select/skip)
         - Never create separate checkpoint step files — checkpoints are automatic in the runner
```

**Step 6: Update Phase 5 Build — step format**

In the Pipeline Step Format section (around line 523), add `checkpoint:` to the frontmatter template:

```yaml
      ---
      name: step-NN-{name}
      agent: {agent-id}
      execution: {subagent|inline}
      inputFile: "{path}"
      nextStepFile: {path}
      outputFile: "{path}"
      checkpoint:
        type: {approve|select|skip}
        prompt: "{optional prompt text}"
      ---
```

Remove the note about checkpoint step files from the step format section (around line 523-576). The `type: checkpoint` step format is no longer valid.

**Step 7: Update Gate 3 Pipeline Coherence**

In the validation section (around line 641-650), change:

```markdown
      - [ ] Checkpoints exist before user decision points
```

To:

```markdown
      - [ ] Every step has a checkpoint field (explicit or defaulting from autonomy)
      - [ ] Last step has checkpoint: approve (guardrail for interactive squads)
      - [ ] No separate checkpoint step files exist in the pipeline
```

**Step 8: Commit**

```bash
git add templates/_opensquad/core/architect.agent.yaml
git commit -m "feat: update architect with automatic checkpoint rules and heuristics"
```

---

### Task 9: Update template squad (if exists)

**Files:**
- Check: `templates/squads/instagram-content/` — if this directory has step files and squad.yaml, apply the same changes as Tasks 2-7

**Step 1: Check if template squad files exist**

```bash
ls templates/squads/instagram-content/pipeline/steps/ 2>/dev/null
```

If files exist, apply the same frontmatter changes, renaming, and deletions as described in Tasks 2-7. If the template directory is sparse or doesn't have step files (some templates are minimal), skip this task.

**Step 2: Commit (if changes were made)**

```bash
git add templates/squads/instagram-content/
git commit -m "feat: update instagram-content template with checkpoint config"
```

---

### Task 10: Final verification and commit

**Step 1: Verify file structure**

```bash
ls squads/instagram-content/pipeline/steps/
```

Expected:
```
step-01-research.md
step-02-ideation.md
step-03-writing.md
step-04-review.md
```

No `step-03-user-choice.md` or `step-06-final.md`.

**Step 2: Verify all cross-references**

Check that:
- `pipeline.yaml` references exactly 4 step files
- `squad.yaml` has 4 step entries with no `type: checkpoint` entries
- `step-02-ideation.md` frontmatter points `nextStepFile` to `step-03-writing.md`
- `step-03-writing.md` frontmatter points `nextStepFile` to `step-04-review.md`
- `step-04-review.md` frontmatter `onReject` points to `step-03-writing`
- `runner.pipeline.md` has no `type: checkpoint` handler

**Step 3: Verify runner has all three checkpoint types documented**

Read `runner.pipeline.md` and confirm it contains:
- `##### Checkpoint: approve` section
- `##### Checkpoint: select` section
- `##### Checkpoint: skip` section
- `#### 3. Feedback Re-execution` section

**Step 4: Final commit if any fixups needed**

```bash
git add -A
git commit -m "fix: resolve cross-reference issues in checkpoint migration"
```

# Automatic Pipeline Checkpoints — Design Document

**Date:** 2026-02-26
**Status:** Approved

## Problem

Pipelines currently require explicit checkpoint step files (e.g., `step-03-user-choice.md`) for user interaction. This is verbose, easy to forget, and pollutes the pipeline with non-agent steps. The instagram-content squad jumps from research straight to ideation without asking the user which news items to use.

## Solution

Move checkpoint logic into the Pipeline Runner. The runner automatically pauses after each agent step for user interaction, based on configuration. No more separate checkpoint step files.

## Data Model

### squad.yaml — `autonomy` field

```yaml
pipeline:
  autonomy: interactive   # interactive | autonomous
  max_review_cycles: 3
```

- `interactive` — Default checkpoint `approve` after every agent step
- `autonomous` — Default no checkpoint (skip) after every agent step

### Step frontmatter — `checkpoint` field

```yaml
---
name: step-01-research
agent: researcher
execution: subagent
checkpoint:
  type: select
  prompt: "Selecione as notícias que quer usar"
  max_feedback_cycles: 3   # optional, default: 2
---
```

**Checkpoint types:**

| Type | Behavior |
|------|----------|
| `approve` | Show output. Options: Approve / Give feedback / Abort |
| `select` | Show items from output. User selects which to keep. Only selected items pass to next step |
| `skip` | No pause, continue immediately |

**Shorthand:** `checkpoint: skip` is equivalent to `checkpoint: { type: skip }`

**Defaults:**
- `autonomy: interactive` + no checkpoint declared → `approve`
- `autonomy: autonomous` + no checkpoint declared → `skip`
- Explicit checkpoint declaration always overrides the default

## Checkpoint Behaviors

### `approve`

1. Runner presents agent output to user
2. `AskUserQuestion` with 3 options:
   - **Approve** → save output, advance to next step
   - **Give feedback** → user writes free text → agent is re-executed with: (a) original instructions, (b) previous output, (c) user feedback. Max `max_feedback_cycles` attempts (default: 2), then runner asks user for final decision.
   - **Abort** → pipeline stops, partial outputs remain saved

### `select`

1. Runner presents items from agent output (items separated by `##` headers)
2. `AskUserQuestion` with items as options (multiSelect: true)
3. User selects desired items
4. Runner saves **both**: original full output AND selected subset (separate files)
5. Next agent receives only selected items as input

**Convention:** Agents with `checkpoint: select` must output items separated by `##` headers.

### `skip`

1. Runner saves output and advances immediately to next step
2. No user interaction

## Re-execution with Feedback

When user gives feedback at a checkpoint:
- **Subagent steps:** re-dispatch via Task tool with extra context (previous output + feedback)
- **Inline steps:** re-invoke agent inline with additional context

Re-execution respects the original execution mode of the step.

## Impact on Pipeline Structure

Separate checkpoint step files are eliminated. Example for instagram-content:

**Before (6 steps, 2 explicit checkpoints):**
```
step-01-research.md       → agent
step-02-ideation.md       → agent
step-03-user-choice.md    → explicit checkpoint  ← REMOVED
step-04-writing.md        → agent
step-05-review.md         → agent
step-06-final.md          → explicit checkpoint  ← REMOVED
```

**After (4 steps, checkpoints embedded):**
```
step-01-research.md       → agent, checkpoint: select
step-02-ideation.md       → agent, checkpoint: select
step-03-writing.md        → agent, checkpoint: skip
step-04-review.md         → agent, checkpoint: approve
```

**Flow with checkpoints:**
```
Researcher works
    ↓
🛑 SELECT: "Choose which news to use"
    ↓
Ideator works (only with selected news)
    ↓
🛑 SELECT: "Choose which angles to use"
    ↓
Writer works (with selected angle)
    ↓ (skip — no checkpoint)
Reviewer evaluates
    ↓ rejected? → back to Writer (internal loop, no checkpoint)
    ↓ approved?
🛑 APPROVE: "Final content approved by reviewer"
    ↓
User approves / gives feedback / aborts
```

## Impact on Architect

### New rules for squad creation:

1. **No separate checkpoint steps** — checkpoints are declared in agent step frontmatter
2. **Ask about `autonomy`** during creation: "Should this squad ask for approval at each stage (interactive) or run autonomously (autonomous)?"
3. **For `interactive` squads:** set `checkpoint.type` where a specific type makes sense. Unset steps default to `approve`.
4. **For `autonomous` squads:** only declare checkpoints where human interaction is truly needed.
5. **Format convention:** instruct agents with `checkpoint: select` to use `##` headers to separate items.

### Architect heuristics for checkpoint types:

| Step type | Default checkpoint | Reason |
|---|---|---|
| Research / data gathering | `select` | User chooses which items to use |
| Ideation / brainstorming | `select` | User chooses which direction to follow |
| Writing / creation | `skip` | Goes directly to reviewer (internal loop) |
| Review / QA | `approve` | User sees reviewer-approved result |
| Analysis / processing | `approve` | User validates analysis before proceeding |
| Last step (any) | `approve` (required) | Guardrail — always approve final result |

### Guardrail:

Interactive squads must have at least one `approve` checkpoint on the last step. The Architect validates this during squad creation.

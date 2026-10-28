# Changes-2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 post-test issues: investigation always offered, agents not artificially limited, options with examples, template designer serverless, file links for approval.

**Architecture:** All changes target existing prompt/config files in `_opensquad/core/` and `skills/`. Task 4 deletes 5 server files and rewrites the Template Designer SKILL.md.

**Tech Stack:** Markdown prompts, YAML frontmatter

---

## File Map

| File | Action | Task |
|------|--------|------|
| `_opensquad/core/prompts/discovery.prompt.md` | Modify | 1, 3 |
| `_opensquad/core/prompts/design.prompt.md` | Modify | 2, 3, 5 |
| `_opensquad/core/prompts/build.prompt.md` | Modify | 5 |
| `_opensquad/core/runner.pipeline.md` | Modify | 5 |
| `skills/template-designer/SKILL.md` | Rewrite | 4 |
| `skills/template-designer/scripts/server.js` | Delete | 4 |
| `skills/template-designer/scripts/start-server.sh` | Delete | 4 |
| `skills/template-designer/scripts/stop-server.sh` | Delete | 4 |
| `skills/template-designer/scripts/frame-template.html` | Delete | 4 |
| `skills/template-designer/scripts/helper.js` | Delete | 4 |

---

### Task 1: Discovery — Investigation always offered

**Files:**
- Modify: `_opensquad/core/prompts/discovery.prompt.md`

- [ ] **Step 1: Replace Step 5 header and conditional gate**

Find the Step 5 header and the two lines below it (around lines 100-102):
```markdown
### Step 5 — Investigation (ONLY when domain = `content` AND user mentioned reference profiles or examples)

This step is skipped entirely for non-content domains, or if the user never mentioned profiles, channels, or reference URLs.

If the user mentioned reference profiles or examples during Step 1 or Step 3, ask:
> "Do you have specific profiles or channels you'd like me to investigate? I can analyze their real content to extract patterns, hooks, structures, and engagement data to make your squad much smarter.
>
> Share 1–5 URLs (Instagram, YouTube, Twitter/X, LinkedIn) or type 'skip'."
```

Replace with:
```markdown
### Step 5 — Investigation (optional)

Offer the investigation option to the user. The investigation is powerful but consumes tokens and time — make the trade-off clear:

> "Want to investigate reference profiles before building the squad? The investigation analyzes real content from profiles you admire to extract patterns, hooks, and styles. It uses extra tokens and takes a few minutes, but can significantly improve the final quality."
>
> 1. Yes, investigate profiles
> 2. No, continue without investigation

If "Yes", ask for URLs:
> "Share 1–5 URLs of profiles you'd like me to analyze (Instagram, YouTube, Twitter/X, LinkedIn)."
```

- [ ] **Step 2: Update Rules section**

In the `## Rules` section at the bottom, find and remove:
```
- **Investigation is content-only** — Step 5 is skipped entirely for research, automation, and analysis domains
```

Replace with:
```
- **Investigation is always offered** — Step 5 presents the option for all domains, not just content
```

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/discovery.prompt.md
git commit -m "feat(discovery): always offer investigation option"
```

---

### Task 2: Design — Don't artificially limit agents

**Files:**
- Modify: `_opensquad/core/prompts/design.prompt.md`

- [ ] **Step 1: Rewrite the Design Philosophy section**

Find the Design Philosophy section (around lines 151-160):
```markdown
### Design Philosophy

Build agile, objective squads. Each agent should have the minimum tasks necessary to fulfill its role. Avoid redundant passes, cascading reviews, or separate optimization tasks. A single well-crafted task that combines creation and basic optimization is better than three tasks that split the work artificially.

Guidelines:
- 1-2 tasks per agent maximum
- One creator agent (generic writer), not per-platform specialists
- Combined optimization embedded in the creation task
- Single-pass review (no separate scoring + feedback tasks)
- Research agents must be direct and focused — no exhaustive surveys
```

Replace with:
```markdown
### Design Philosophy

Recruit all agents necessary for the job. If the squad needs a designer, create a designer. If it needs a researcher and a copywriter, create both with distinct responsibilities. Each agent must have a clear responsibility and the tasks needed to fulfill it.

What you should NOT do is create redundant agents or unnecessary optimization passes. Avoid cascading reviews or separate optimization tasks that don't add clear value. But never consolidate distinct roles into a single agent just to reduce count — that produces worse results.

Guidelines:
- Create as many agents as the job requires — a designer, a researcher, a copywriter, a reviewer, etc.
- Each agent gets a clear, distinct responsibility
- Research agents must be direct and focused — no exhaustive surveys
```

- [ ] **Step 2: Commit**

```bash
git add _opensquad/core/prompts/design.prompt.md
git commit -m "feat(design): don't artificially limit agent count"
```

---

### Task 3: Discovery & Design — Contextualize all options with examples

**Files:**
- Modify: `_opensquad/core/prompts/discovery.prompt.md`
- Modify: `_opensquad/core/prompts/design.prompt.md`

- [ ] **Step 1: Add example rule to discovery Communication Style**

In `_opensquad/core/prompts/discovery.prompt.md`, in the `## Communication Style` section, after the line:
```
- Always present numbered options when there are choices. The only exception is when the question requires free-text input (a URL, a name, a description)
```

Add:
```markdown
- Whenever presenting options, include a short example or explanation that shows what each option means in practice. Don't list bare labels. This applies to virtually every type of question — tone of voice, formats, audience, investigation modes, anything with choices.
  - Bad: "1. Formal  2. Educativo  3. Descontraído"
  - Good: "1. Formal — 'O novo algoritmo do Instagram prioriza conteúdo de alta permanência'  2. Educativo — 'Sabia que o Instagram mudou o algoritmo? Vou te explicar o que muda pra você'  3. Descontraído — 'O Instagram mudou TUDO e ninguém te avisou. Bora entender?'"
```

- [ ] **Step 2: Add example rule to design Communication style**

In `_opensquad/core/prompts/design.prompt.md`, find the line (around line 9):
```
**Communication style:** Clear and structured. Uses numbered lists and visual separators to organize information. Confirms understanding before proceeding. Celebrates progress with the user.
```

Replace with:
```
**Communication style:** Clear and structured. Uses numbered lists and visual separators to organize information. Confirms understanding before proceeding. When presenting options, always include a short example or explanation showing what each option means in practice — never list bare labels.
```

- [ ] **Step 3: Commit**

```bash
git add _opensquad/core/prompts/discovery.prompt.md _opensquad/core/prompts/design.prompt.md
git commit -m "feat(prompts): contextualize all options with examples"
```

---

### Task 4: Template Designer — Remove server, use image rendering

**Files:**
- Delete: `skills/template-designer/scripts/server.js`
- Delete: `skills/template-designer/scripts/start-server.sh`
- Delete: `skills/template-designer/scripts/stop-server.sh`
- Delete: `skills/template-designer/scripts/frame-template.html`
- Delete: `skills/template-designer/scripts/helper.js`
- Rewrite: `skills/template-designer/SKILL.md`

- [ ] **Step 1: Delete server files**

```bash
cd "d:/Coding Projects/opensquad"
git rm skills/template-designer/scripts/server.js
git rm skills/template-designer/scripts/start-server.sh
git rm skills/template-designer/scripts/stop-server.sh
git rm skills/template-designer/scripts/frame-template.html
git rm skills/template-designer/scripts/helper.js
```

- [ ] **Step 2: Rewrite SKILL.md**

Replace the entire content of `skills/template-designer/SKILL.md` with:

```markdown
---
name: template-designer
description: Visual template selection for image design agents. Generates template variations, renders them as images for user review, and saves the approved visual identity.
type: prompt
version: "2.0.0"
categories: [design, visual, templates]
---

# Template Designer

Visual template selection and refinement for squad creation and editing.

## When to Use

- During squad creation: when the Design phase identifies an image design agent and the user opts to choose a template
- During squad editing: when the user asks to define, edit, or change the visual identity / template of a design agent
- Trigger: presence of `image-creator` skill (or similar image-producing skill) in the squad's skill list

## Prerequisites

- A squad with a design agent that produces images (uses `image-creator` skill)
- Squad's `_build/` directory must exist (created during Discovery/Design phases)
- `image-creator` skill installed (for rendering HTML to PNG)

## How It Works

1. You read context and base templates
2. You generate 3 adapted HTML template variations
3. You render each as a PNG image using the `image-creator` skill
4. You present the image file paths to the user for review
5. You iterate with feedback until approval
6. You save the approved template as HTML reference + structured style rules

## Generating Templates

### Step 0: Read Design Guidelines (MANDATORY)

Before generating any template, read and internalize the design best practices:
- `_opensquad/core/best-practices/image-design.md` — **REQUIRED reading**. Contains platform-specific minimum font sizes, typography rules, spacing guidelines, color palette constraints, contrast requirements, and layout methodology. Every template you generate MUST comply with these rules.

Key rules to always follow:
- **Font sizes**: Hero 58px, Heading 43px, Body 34px, Caption 24px minimum for Instagram carousel (1080x1440). Absolute minimum 20px for any readable text on any platform.
- **Font weight**: 500 or higher for body text and above.
- **Colors**: Maximum 5 colors per design system (primary, secondary, accent, background, text).
- **Contrast**: WCAG AA minimum 4.5:1 for all text against background.
- **Layout**: CSS Grid or Flexbox only. No absolute positioning for primary content.
- **Self-contained HTML**: Inline CSS only. Only Google Fonts @import allowed as external resource.
- **No slide counters**: Never include "1/7" or similar. Instagram has native navigation.

You should also apply general web design best practices: proper white space, visual hierarchy through scale and weight, consistent spacing rhythm, and balanced composition.

### HARD RULES — Dimensions and Typography

These rules are NON-NEGOTIABLE. Every template must comply:

**Fixed Dimensions (never use height: auto or flexible height):**
- Instagram Carousel: `width: 1080px; height: 1440px` (3:4 portrait)
- Instagram Story/Reel: `width: 1080px; height: 1920px` (9:16 portrait)
- Instagram Post: `width: 1080px; height: 1080px` (1:1 square)
- LinkedIn Post: `width: 1200px; height: 627px` (1.91:1 horizontal)

The root container of every template MUST set explicit `width` and `height` in pixels. The template must render at exactly these dimensions — no overflow, no scrolling, no flexible height.

**Minimum Font Sizes (Instagram at 1080px width):**
- Hero/Title: **58px** minimum
- Heading: **43px** minimum
- Body text: **34px** minimum
- Caption/small text: **24px** minimum
- Absolute minimum for ANY readable text on ANY platform: **20px**

**Font Weight:** 500 or higher for body text and above. Never use font-weight below 400 for any visible text.

Templates that violate these rules are rejected — no exceptions.

### Step 1: Read Context

Read these files to understand the squad:
- `squads/{code}/_build/discovery.yaml` — platform, domain, tone, language
- `squads/{code}/_build/design.yaml` — agents, purpose, skills
- `squads/{code}/_investigations/consolidated-analysis.md` (if exists) — visual patterns from reference profiles
- `_opensquad/_memory/company.md` — company name, brand, industry, target audience
- `_opensquad/_memory/preferences.md` — user preferences (language, style, tone)

Use the company context and user preferences to adapt template content: example text should reflect the company's domain and audience, colors should align with brand if available, and language should match the user's Output Language preference.

### Step 2: Read Base Templates

Read the 3 base templates from `skills/template-designer/base-templates/`:
- `model-a.html`
- `model-b.html`
- `model-c.html`

### Step 3: Generate Adapted Variations

For each base template, create an adapted version:
- Adjust colors to match the squad's domain/brand (use Sherlock palette if available, company brand colors from company.md if available)
- Adjust typography following the platform-specific minimum font sizes from `image-design.md`
- Replace example content with domain-relevant content that reflects the company's industry, audience, and language
- Set the root container to the exact fixed dimensions from HARD RULES above. Never use percentage heights or auto heights.
- Add any visual elements that match the squad's personality
- Apply proper white space, visual hierarchy, and spacing rhythm per `image-design.md` methodology

Write each adapted template as a **complete, self-contained HTML file** (with `<!DOCTYPE html>`, inline CSS, and Google Fonts imports if needed).

Save to:
- `squads/{code}/_build/template-a.html`
- `squads/{code}/_build/template-b.html`
- `squads/{code}/_build/template-c.html`

### Step 4: Render as Images

Use the `image-creator` skill to render each HTML template as a PNG image:

1. Read `skills/image-creator/SKILL.md` for rendering instructions
2. Render each template HTML to PNG using the image-creator workflow
3. Save rendered images to:
   - `squads/{code}/_build/template-a.png`
   - `squads/{code}/_build/template-b.png`
   - `squads/{code}/_build/template-c.png`

### Step 5: Present to User

Present the 3 template options to the user with the file paths so they can open and review:

> "Here are 3 template options for your squad's visual identity:
>
> A: `squads/{code}/_build/template-a.png`
> B: `squads/{code}/_build/template-b.png`
> C: `squads/{code}/_build/template-c.png`
>
> Open the images and tell me which one you prefer. I can also mix elements from different templates or adjust colors, fonts, and layout."

## Iteration Loop

1. Present template images with file paths
2. Wait for user feedback in terminal
3. Generate new version based on feedback — save as `template-v2.html`, render as `template-v2.png`, etc.
4. Present updated image path to user
5. Repeat until user approves

## Saving the Approved Template

When the user approves, create two files:

### 1. Template Reference HTML

Save to: `squads/{code}/pipeline/data/template-reference.html`

The complete, self-contained HTML/CSS of the approved template at full resolution (e.g., 1080x1440). This is the literal example the design agent will use.

### 2. Visual Identity Rules

Save to: `squads/{code}/pipeline/data/visual-identity.md`

Extract structured rules from the approved template:

~~~markdown
# Visual Identity

## Color Palette
- **Primary:** #HEXCODE — usage description
- **Secondary:** #HEXCODE — usage description
- **Background:** #HEXCODE
- **Text:** #HEXCODE
- **Accent:** #HEXCODE — usage description

## Typography
- **Headings:** Font Family, weight, size range
- **Body:** Font Family, weight, size range
- **Caption:** Font Family, weight, size range
- **Minimum sizes:** body 32px, caption 24px, heading 48px

## Layout
- **Viewport:** WIDTHxHEIGHT px
- **Padding:** value
- **Grid:** description
- **Spacing rules:** description

## Composition Rules
- Logo/profile placement: description
- Image treatment: description
- Visual hierarchy: description
- Footer/CTA pattern: description

## Adaptation Rules
- How to handle different viewport sizes
- What stays fixed vs. what adapts
- Color usage rules (when to use primary vs accent)
~~~

### 3. Update Squad Files

If the squad is being created (Build phase hasn't run yet):
- The design.yaml context now includes the template data — Build will pick it up

If the squad already exists (editing flow):
- Add `pipeline/data/template-reference.html` and `pipeline/data/visual-identity.md` to `squad.yaml` `data:` list
- Update the design agent's `.agent.md` to reference both files
- Update the design agent's tasks to include the rule: "always follow visual-identity.md and use template-reference.html as the base model"
```

- [ ] **Step 3: Commit**

```bash
cd "d:/Coding Projects/opensquad"
git add -A skills/template-designer/
git commit -m "refactor(template-designer): remove server, use image rendering"
```

---

### Task 5: Add file link rule for approvals

**Files:**
- Modify: `_opensquad/core/runner.pipeline.md`
- Modify: `_opensquad/core/prompts/design.prompt.md`
- Modify: `_opensquad/core/prompts/build.prompt.md`

- [ ] **Step 1: Add rule to pipeline runner checkpoint section**

In `_opensquad/core/runner.pipeline.md`, find the checkpoint section (around line 307):
```markdown
#### If `type: checkpoint`
- Present the checkpoint message to the user
- If the checkpoint requires a choice (numbered list), present options as a numbered list and tell the user to reply with a number
- Wait for user input before proceeding
```

Replace with:
```markdown
#### If `type: checkpoint`
- Present the checkpoint message to the user
- If the checkpoint requires a choice (numbered list), present options as a numbered list
- **Always include the file path** of any generated content the user needs to review. Example: "Review the content at `squads/{name}/output/{run_id}/v1/content.md` and let me know if it looks good."
- Wait for user input before proceeding
```

- [ ] **Step 2: Add rule to design Phase G presentation**

In `_opensquad/core/prompts/design.prompt.md`, find the Phase G section (around the "Does this look good?" line). After:
```
Wait for user approval. If they want changes, adjust and re-present.
```

Add:
```markdown

**File references:** When presenting the design for approval, if any reference documents have been generated (research-brief, design.yaml, etc.), include their file paths so the user can open and review them.
```

- [ ] **Step 3: Add rule to build summary**

In `_opensquad/core/prompts/build.prompt.md`, find `## Step D: Present Summary`. After the summary template block (after the line `To modify it: /opensquad edit {code}`), add:

```markdown

Include the file paths of key generated files (agent files, pipeline steps, reference materials) so the user can open and review them before running the squad.
```

- [ ] **Step 4: Commit**

```bash
git add _opensquad/core/runner.pipeline.md _opensquad/core/prompts/design.prompt.md _opensquad/core/prompts/build.prompt.md
git commit -m "feat(prompts): include file links when requesting user approval"
```

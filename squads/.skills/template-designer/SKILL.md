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

Present the 3 template options to the user using **clickable markdown links with absolute file paths** so they can open and review:

> "Here are 3 template options for your squad's visual identity:
>
> - [preview-a.png]({absolute_path}/squads/{code}/_build/template-a.png) — Template A
> - [preview-b.png]({absolute_path}/squads/{code}/_build/template-b.png) — Template B
> - [preview-c.png]({absolute_path}/squads/{code}/_build/template-c.png) — Template C
>
> Click the links above to open each image. Tell me which one you prefer. I can also mix elements from different templates or adjust colors, fonts, and layout."

**Important:** Always use the full absolute path (e.g., `d:\Coding Projects\opensquad\squads\my-squad\_build\template-a.png`) inside the markdown link — relative paths are not clickable in the IDE.

## Iteration Loop

1. Present template images with clickable markdown links using absolute file paths
2. Wait for user feedback in terminal
3. Generate new version based on feedback — save as `template-v2.html`, render as `template-v2.png`, etc.
4. Present updated image with clickable markdown link using absolute file path
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

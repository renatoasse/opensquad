# Changes-2: Corrections After First Squad Test

**Date:** 2026-03-30
**Source:** User testing feedback after changes-1 implementation
**Scope:** 5 fixes across discovery, design, template designer, and pipeline runner.

---

## 1. Investigation Must Be Offered (#1)

**Problem:** Discovery skipped investigation without ever mentioning it. The current Step 5 only triggers if the user already mentioned reference profiles in earlier steps. If they didn't, it silently skips the entire step.

**Solution:** Change Step 5 (Investigation) to always offer the option. Remove the conditional gate. The question should communicate the trade-off clearly:

> "Want to investigate reference profiles before building the squad? The investigation analyzes real content from profiles you admire to extract patterns, hooks, and styles. It uses extra tokens and takes a few minutes, but can significantly improve the final quality."
>
> 1. Yes, investigate profiles
> 2. No, continue without investigation

- Remove the condition "ONLY when domain = content AND user mentioned reference profiles".
- The investigation option should be offered for all domains — not just content.
- If "Yes" → ask for URLs as currently implemented.
- If "No" → set `investigation.enabled: false` and continue.

**Files:** `_opensquad/core/prompts/discovery.prompt.md`

---

## 2. Design Must Not Artificially Limit Agents (#2)

**Problem:** The "Design Philosophy" added in changes-1 was too restrictive ("1-2 tasks per agent maximum", "one creator agent, not per-platform specialists"). Result: a squad with 3 agents where a copywriter accumulated design responsibilities.

**Solution:** Rewrite the Design Philosophy to be about quality without being artificially limiting.

**Remove these restrictive rules:**
- "1-2 tasks per agent maximum"
- "One creator agent (generic writer), not per-platform specialists"
- "Combined optimization embedded in the creation task"
- "Single-pass review (no separate scoring + feedback tasks)"

**Replace with:**

> "Recruit all agents necessary for the job. If the squad needs a designer, create a designer. If it needs a researcher and a copywriter, create both with distinct responsibilities. What you should NOT do is create redundant agents or unnecessary optimization passes. Each agent must have a clear responsibility and the tasks needed to fulfill it."

**Keep:** "Avoid redundant passes, cascading reviews, or separate optimization tasks" — this remains valid as guidance against bloat, not a cap on agent count.

**Files:** `_opensquad/core/prompts/design.prompt.md`

---

## 3. Contextualize All Options With Examples (#4)

**Problem:** The Architect presents bare labels for options without context. The user can't tell what each choice actually means in practice.

**Solution:** Add a rule to discovery and design prompts:

> "Whenever presenting options to the user, always include a short example or explanation that shows what each option means in practice. This applies to virtually every type of question — tone of voice, formats, audience, tools, investigation modes, anything with choices. Don't list bare labels."
>
> Bad: "1. Formal  2. Educativo  3. Descontraido"
>
> Good:
> "1. Formal — 'O novo algoritmo do Instagram prioriza conteudo de alta permanencia'
> 2. Educativo — 'Sabia que o Instagram mudou o algoritmo? Vou te explicar o que muda pra voce'
> 3. Descontraido — 'O Instagram mudou TUDO e ninguem te avisou. Bora entender?'"

This applies to all questions where an example helps the user understand the choice — which is nearly all of them.

**Files:** `_opensquad/core/prompts/discovery.prompt.md`, `_opensquad/core/prompts/design.prompt.md`

---

## 4. Remove Template Designer Server, Use Image Rendering (#5)

**Problem:** The local HTTP server for template preview doesn't work reliably on Windows — it dies, the port doesn't open, the user can't access localhost. The entire server-based workflow is fragile.

**Solution:** Eliminate all server infrastructure. Replace with image rendering via the existing `image-creator` skill.

### Delete these files:
- `skills/template-designer/scripts/server.js`
- `skills/template-designer/scripts/start-server.sh`
- `skills/template-designer/scripts/stop-server.sh`
- `skills/template-designer/scripts/frame-template.html`
- `skills/template-designer/scripts/helper.js`

### Keep these files:
- `skills/template-designer/base-templates/model-a.html`
- `skills/template-designer/base-templates/model-b.html`
- `skills/template-designer/base-templates/model-c.html`
- `skills/template-designer/SKILL.md` (rewrite)

### New SKILL.md flow:

**Frontmatter changes:**
- Change `type: hybrid` to `type: prompt`
- Remove `script:` block entirely

**New workflow:**
1. Read context (discovery, design, company, investigations, best-practices)
2. Read the 3 base templates from `base-templates/`
3. Generate 3 adapted HTML variations for the squad
4. Save each HTML to `squads/{code}/_build/template-a.html`, `template-b.html`, `template-c.html`
5. Use `image-creator` skill to render each HTML as PNG
6. Present the image file paths to the user for review
7. Iterate with feedback until approval
8. Save approved `template-reference.html` and `visual-identity.md` as before

**Remove from SKILL.md:**
- All sections about starting/stopping/checking server
- All references to `content_dir`, `state_dir`, `server-info.json`, `events.jsonl`
- All references to `localhost`, port, URL
- The "On Windows" / "On macOS/Linux" server sections
- The iteration loop that depends on server events
- The "Stopping the Server" and "Checking Server Status" sections

**Keep in SKILL.md:**
- Step 0: Read Design Guidelines (MANDATORY)
- HARD RULES (dimensions and typography)
- Step 1: Read Context
- Step 2: Read Base Templates
- Step 3: Generate Adapted Variations (update to save as files, not write to content_dir)
- Available CSS Classes section (still useful for HTML generation)
- Saving the Approved Template section
- When to Use section (update trigger conditions)

**Files:** `skills/template-designer/SKILL.md`, delete 5 server files

---

## 5. Include File Links When Requesting Approval (#6)

**Problem:** When the pipeline asks the user to approve content, the user can't easily see what was generated.

**Solution:** Add a rule to the relevant prompts:

> "Whenever you ask the user to approve or review generated content, always include the full file path so the user can open and review it. Example: 'Review the content at `squads/my-squad/output/2026-03-30/v1/content.md` and let me know if it looks good.'"

This applies to:
- Pipeline runner checkpoints (generated content, research, angles)
- Design phase approval (squad design presentation)
- Build phase summary
- Template designer approval

**Files:** `_opensquad/core/runner.pipeline.md`, `_opensquad/core/prompts/design.prompt.md`, `_opensquad/core/prompts/build.prompt.md`

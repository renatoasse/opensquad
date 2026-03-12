# Canva Connect MCP Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Figma MCP with Canva Connect MCP in the Opensquad tools registry so the Architect auto-suggests Canva for design/content squads.

**Architecture:** Swap the Figma tool definition YAML for a Canva one in both the live registry and the template registry. Update the commented example in the Architect agent. No structural changes to the tools engine — the existing category-based discovery handles the rest.

**Tech Stack:** YAML tool definitions, Opensquad tools engine

---

### Task 1: Create `canva.tool.yaml` in live registry

**Files:**
- Create: `_opensquad/tools/registry/canva.tool.yaml`

**Step 1: Write the Canva tool definition**

Create `_opensquad/tools/registry/canva.tool.yaml` with this exact content:

```yaml
name: Canva Connect
id: canva
version: "1.0.0"
type: mcp
description: >
  Create, search, autofill, and export designs from Canva.
  Enables agents to generate visual content, fill templates
  with brand assets, and export as PDF or image.

mcp:
  server_name: canva
  transport: http
  url: "https://mcp.canva.com/mcp"
  env: {}

instructions: |
  You have access to Canva through the Canva Connect MCP server.

  Key capabilities:
  - Create new designs (presentations, social posts, logos, etc.)
  - Autofill templates with content (text, images, brand elements)
  - Search existing designs in the user's Canva account
  - Export designs as PDF or image files

  Best practices:
  - Use templates when possible — faster and more on-brand
  - When autofilling, match content to template placeholder names
  - Export in the format most useful for the pipeline (PNG for social, PDF for documents)
  - Respect the user's Canva plan limitations (some features require paid plans)

  Requirements:
  - User needs a Canva account (free or paid)
  - OAuth authorization is required on first use (browser popup)
  - Autofill templates require a Canva paid plan

categories: [design, ui, assets, automation]
useful_for: [content-design, brand-guidelines, visual-content, social-media-content, presentations]
```

**Step 2: Verify file was created correctly**

Run: `cat _opensquad/tools/registry/canva.tool.yaml`
Expected: The YAML above, with `id: canva` and `url: "https://mcp.canva.com/mcp"`

**Step 3: Commit**

```bash
git add _opensquad/tools/registry/canva.tool.yaml
git commit -m "feat: add Canva Connect MCP tool to registry"
```

---

### Task 2: Delete `figma.tool.yaml` from live registry

**Files:**
- Delete: `_opensquad/tools/registry/figma.tool.yaml`

**Step 1: Delete the Figma tool definition**

```bash
rm _opensquad/tools/registry/figma.tool.yaml
```

**Step 2: Verify deletion**

Run: `ls _opensquad/tools/registry/`
Expected: `apify.tool.yaml` and `canva.tool.yaml` only (no `figma.tool.yaml`)

**Step 3: Commit**

```bash
git add _opensquad/tools/registry/figma.tool.yaml
git commit -m "chore: remove Figma tool from registry (replaced by Canva)"
```

---

### Task 3: Create `canva.tool.yaml` in template registry

**Files:**
- Create: `templates/_opensquad/tools/registry/canva.tool.yaml`

**Step 1: Copy the Canva tool definition to templates**

```bash
cp _opensquad/tools/registry/canva.tool.yaml templates/_opensquad/tools/registry/canva.tool.yaml
```

**Step 2: Verify the copy is identical**

```bash
diff _opensquad/tools/registry/canva.tool.yaml templates/_opensquad/tools/registry/canva.tool.yaml
```

Expected: No output (files are identical)

**Step 3: Commit**

```bash
git add templates/_opensquad/tools/registry/canva.tool.yaml
git commit -m "feat: add Canva Connect MCP tool to template registry"
```

---

### Task 4: Delete `figma.tool.yaml` from template registry

**Files:**
- Delete: `templates/_opensquad/tools/registry/figma.tool.yaml`

**Step 1: Delete the template Figma tool definition**

```bash
rm templates/_opensquad/tools/registry/figma.tool.yaml
```

**Step 2: Verify deletion**

Run: `ls templates/_opensquad/tools/registry/`
Expected: `apify.tool.yaml` and `canva.tool.yaml` only

**Step 3: Commit**

```bash
git add templates/_opensquad/tools/registry/figma.tool.yaml
git commit -m "chore: remove Figma tool from template registry"
```

---

### Task 5: Update Architect agent — comment example

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml:420`
- Modify: `templates/_opensquad/core/architect.agent.yaml:420`

**Step 1: Update the live architect file**

In `_opensquad/core/architect.agent.yaml`, find line 420:

```yaml
             # - figma
```

Replace with:

```yaml
             # - canva
```

**Step 2: Update the template architect file**

In `templates/_opensquad/core/architect.agent.yaml`, find the same line:

```yaml
             # - figma
```

Replace with:

```yaml
             # - canva
```

**Step 3: Verify both changes**

Run: `grep -n "canva\|figma" _opensquad/core/architect.agent.yaml`
Expected: One line with `# - canva`, zero lines with `figma`

Run: `grep -n "canva\|figma" templates/_opensquad/core/architect.agent.yaml`
Expected: Same result

**Step 4: Commit**

```bash
git add _opensquad/core/architect.agent.yaml templates/_opensquad/core/architect.agent.yaml
git commit -m "chore: update Architect tool example from Figma to Canva"
```

---

### Task 6: Final verification

**Step 1: Search for any remaining figma references in non-docs files**

```bash
grep -ri "figma" --include="*.yaml" --include="*.md" --exclude-dir="docs" .
```

Expected: No results (all figma references in active code are gone; only docs/plans/ files retain historical references)

**Step 2: Verify registry is correct**

```bash
ls _opensquad/tools/registry/
ls templates/_opensquad/tools/registry/
```

Expected: Both contain `apify.tool.yaml` and `canva.tool.yaml`

**Step 3: Done**

No further action needed. The Architect's Phase 3.5 tool discovery uses `categories` and `useful_for` fields to match tools to squad needs. The Canva tool has `[design, ui, assets, automation]` categories and `[content-design, brand-guidelines, visual-content, social-media-content, presentations]` use cases, so it will be auto-suggested for any squad needing design/visual content.

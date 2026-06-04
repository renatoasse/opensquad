# Image Generation Tools Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two new tools (`asset-fetcher` and `visual-renderer`) to the Opensquad registry and update the Architect to suggest them for visual output squads.

**Architecture:** Two `.tool.yaml` files in `_opensquad/tools/registry/` following the existing schema (matching `canva.tool.yaml` and `apify.tool.yaml` format). Both use Playwright MCP. The Architect agent gets a new "Visual Output Squad Pattern" in Phase 4 to guide squad design when these tools are installed.

**Tech Stack:** YAML (tool definitions), Markdown (Architect agent config), Playwright MCP (runtime dependency)

---

### Task 1: Create asset-fetcher.tool.yaml

**Files:**
- Create: `_opensquad/tools/registry/asset-fetcher.tool.yaml`

**Step 1: Create the tool definition file**

Write `_opensquad/tools/registry/asset-fetcher.tool.yaml` with this exact content:

```yaml
name: Asset Fetcher
id: asset-fetcher
version: "1.0.0"
type: hybrid
description: >
  Acquires visual assets from multiple sources: web image search,
  live website screenshots via Playwright, and user-provided files.
  Organizes assets in the squad's reference folder.

mcp:
  server_name: playwright
  env: {}

instructions: |
  You have access to the Asset Fetcher tool for acquiring visual assets.

  ## Capabilities

  1. **Web Image Search** — Use the native web_search tool to find
     images by keyword. Evaluate results and download the best match.

  2. **Live Screenshot** — Use Playwright MCP to navigate to a URL,
     set viewport dimensions, and capture a screenshot.

  3. **Asset Organization** — Save all acquired assets with descriptive
     filenames in the squad's reference/ or output/ folder.

  ## Screenshot Modes

  - **viewport** — Capture only the visible viewport area (default)
  - **full_page** — Capture the entire scrollable page
  - **selector** — Capture a specific CSS selector element

  ## Screenshot Workflow

  When taking a screenshot:
  1. Navigate to the URL with browser_navigate
  2. Set viewport: browser_resize with width/height for target format
     - Instagram post: 1080x1080
     - Instagram carousel: 1080x1350
     - Story/Reel: 1080x1920
     - Generic: 1280x720
  3. Wait for page load (browser_wait_for if needed)
  4. Capture: browser_take_screenshot
  5. Save to reference folder with descriptive filename

  ## Asset Metadata

  After acquiring each asset, document in your output:
  - path: local file path
  - width/height: image dimensions
  - source_type: "web_search" | "screenshot" | "user_provided"
  - original_url: source URL (if applicable)

  ## Cache Policy

  Before fetching an asset:
  - Check if the reference folder already has a matching file
  - Use deterministic filenames based on source (e.g., URL slug + viewport)
  - Reuse existing assets to avoid redundant fetches

  ## Safety

  - Timeout: max 30s per screenshot, skip and warn if exceeded
  - Maximum screenshot dimensions: 1920x1920px
  - Block file:// protocol URLs
  - Block localhost and private IP ranges (127.0.0.1, 10.x, 192.168.x)

  ## Best Practices
  - Prefer screenshots over web search for product/tool pages (images are often outdated)
  - Save with descriptive names: `gemini-benchmark-chart.png` not `image1.png`
  - Normalize URLs before caching (strip tracking params)
  - Document all acquired assets with metadata for downstream tools

categories: [assets, scraping, automation, images]
useful_for: [content-design, social-media-content, visual-content, visual-enrichment]
```

**Step 2: Validate YAML syntax**

Run: `cd "d:\Coding Projects\opensquad" && node -e "const yaml = require('yaml'); const fs = require('fs'); const doc = yaml.parse(fs.readFileSync('_opensquad/tools/registry/asset-fetcher.tool.yaml', 'utf8')); console.log('Valid YAML. id:', doc.id, 'type:', doc.type, 'categories:', doc.categories)"`

Expected output: `Valid YAML. id: asset-fetcher type: hybrid categories: [ 'assets', 'scraping', 'automation', 'images' ]`

If yaml module not available, use: `node -e "const fs = require('fs'); try { JSON.stringify(require('js-yaml').load(fs.readFileSync('_opensquad/tools/registry/asset-fetcher.tool.yaml', 'utf8'))); console.log('Valid') } catch(e) { console.log('Trying basic check...'); const content = fs.readFileSync('_opensquad/tools/registry/asset-fetcher.tool.yaml', 'utf8'); console.log('File exists, lines:', content.split('\n').length) }"`

**Step 3: Verify structure matches existing tools**

Confirm the file has these required fields (per `_opensquad/core/tools.engine.md:20-39`):
- `name` (string) ✓
- `id` (string) ✓
- `version` (string) ✓
- `type` (enum: mcp|script|hybrid) ✓ — `hybrid`
- `description` (string) ✓
- `mcp.server_name` (string) ✓ — `playwright`
- `instructions` (string) ✓
- `categories` (array) ✓
- `useful_for` (array) ✓

**Step 4: Commit**

```bash
git add _opensquad/tools/registry/asset-fetcher.tool.yaml
git commit -m "feat: add asset-fetcher tool to Opensquad registry

Hybrid tool that acquires visual assets via web search and
Playwright screenshots. Depends on Playwright MCP plugin."
```

---

### Task 2: Create visual-renderer.tool.yaml

**Files:**
- Create: `_opensquad/tools/registry/visual-renderer.tool.yaml`

**Step 1: Create the tool definition file**

Write `_opensquad/tools/registry/visual-renderer.tool.yaml` with this exact content:

```yaml
name: Visual Renderer
id: visual-renderer
version: "1.0.0"
type: mcp
description: >
  Renders HTML/CSS into production-ready images (PNG) via Playwright.
  Accepts complete HTML content, opens it in a headless browser at
  the specified viewport, and captures a pixel-perfect screenshot.
  Generic engine — any visual format is defined by the HTML template.

mcp:
  server_name: playwright
  env: {}

instructions: |
  You have access to the Visual Renderer tool for generating images
  from HTML/CSS using the Playwright browser.

  ## Core Workflow

  1. **Generate HTML** — Write a complete, self-contained HTML file with
     inline CSS. The HTML IS the design — all styling, layout, fonts,
     colors, and content must be embedded.

  2. **Save HTML** — Write the HTML file to the squad's output folder
     (e.g., `output/slides/slide-01.html`)

  3. **Render** — Use Playwright to:
     a. browser_navigate → file path of the HTML (file:// protocol)
     b. browser_resize → target viewport dimensions
     c. browser_take_screenshot → save as PNG

  4. **Verify** — Read the screenshot to confirm quality. Re-render
     if needed.

  ## Viewport Presets (width x height)

  Use these standard dimensions:
  - Instagram Post: 1080 x 1080
  - Instagram Carousel: 1080 x 1350
  - Instagram Story/Reel: 1080 x 1920
  - Facebook Post: 1200 x 630
  - Twitter/X Post: 1200 x 675
  - LinkedIn Post: 1200 x 627
  - YouTube Thumbnail: 1280 x 720
  - Custom: as specified by the squad

  ## HTML Template Guidelines

  The HTML you generate MUST:
  - Be self-contained (inline CSS, no external dependencies)
  - Use web-safe fonts OR Google Fonts via @import
  - Embed images as absolute paths or base64 data URIs
  - Set exact body dimensions matching the viewport
  - Use `margin: 0; padding: 0; overflow: hidden` on body
  - Account for device pixel ratio if high-res needed

  Example minimal structure:
  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { width: 1080px; height: 1350px; overflow: hidden; }
      /* ... your design ... */
    </style>
  </head>
  <body>
    <!-- Your content -->
  </body>
  </html>
  ```

  ## Batch Rendering (Carousels/Multi-slide)

  For multi-image outputs like carousels:
  1. Generate one HTML file per slide
  2. Render each sequentially
  3. Name output files with zero-padded numbers:
     slide-01.png, slide-02.png, slide-03.png
  4. Keep all slides at the same viewport dimensions

  ## Best Practices
  - Always verify the first rendered image before batch rendering
  - Use CSS Grid/Flexbox for layout — most reliable across renderers
  - Avoid animations/transitions (static screenshot only)
  - For rounded corners on images, use CSS border-radius + overflow
  - For emoji rendering, rely on system fonts (Windows: Segoe UI Emoji)
  - Test text overflow — ensure no content is clipped unexpectedly
  - Keep HTML files alongside output PNGs for easy re-rendering

categories: [design, automation, images]
useful_for: [content-design, social-media-content, visual-content, presentations]
```

**Step 2: Validate YAML syntax**

Same validation approach as Task 1, adapted for this file path.

**Step 3: Commit**

```bash
git add _opensquad/tools/registry/visual-renderer.tool.yaml
git commit -m "feat: add visual-renderer tool to Opensquad registry

MCP tool that renders HTML/CSS into PNG images via Playwright.
Generic engine — visual format defined entirely by HTML templates."
```

---

### Task 3: Update Architect — add Visual Output Squad Pattern

**Files:**
- Modify: `_opensquad/core/architect.agent.yaml:26-42` (principles section)
- Modify: `_opensquad/core/architect.agent.yaml:375-459` (Phase 4 Design section)

**Step 1: Add visual output principle**

In the `principles` array (line ~42 of `architect.agent.yaml`), add a new principle after the existing tool discovery principle:

Find:
```yaml
      - "Tool discovery: after extraction, scan _opensquad/tools/registry/ for tools matching the squad's needs and offer relevant integrations to the user before designing the squad"
```

Add after it:
```yaml
      - "Visual output: when visual-renderer and/or asset-fetcher tools are selected, add design/render steps to the pipeline and ensure at least one agent has design capability (HTML/CSS generation for visual-renderer, asset sourcing for asset-fetcher)"
```

**Step 2: Add Visual Output Squad Pattern in Phase 4**

In Phase 4 Design section, after the Content Squad Pattern (item 4, which ends around line 439), add a new item 4.5 for Visual Output Pattern. Find the line that says:

```
         Note: For non-content squads (data analysis, automation, etc.), the traditional pattern still applies:
         researcher + analyst + writer/executor + reviewer, without platform-specific creators.
```

Add after it:

```yaml

      4.5. **Visual Output Pattern** (when visual-renderer or asset-fetcher tools are installed):

         When the squad's tools list includes `visual-renderer` and/or `asset-fetcher`
         (installed during Phase 3.5), modify the pipeline to include visual output steps:

         a. **Asset Acquisition step** (if `asset-fetcher` is installed):
            - Add a dedicated pipeline step AFTER the writing/creation step
            - execution: subagent (runs in background to fetch images)
            - Agent uses asset-fetcher to: search images, take screenshots, organize assets
            - Output: reference folder with all acquired assets + metadata document

         b. **Design & Render step** (if `visual-renderer` is installed):
            - Add a dedicated pipeline step AFTER asset acquisition (or after writing if no asset-fetcher)
            - execution: inline (interactive — user can review and iterate on visuals)
            - Agent generates self-contained HTML/CSS files using:
              - Text content from the writer/creator step
              - Assets from the asset-fetcher step (if available)
              - Branding from company.md (colors, logo, fonts)
              - Platform viewport dimensions from visual-renderer instructions
            - Agent uses visual-renderer to capture HTML as PNG screenshots
            - Output: PNG files in squad output folder + HTML source files for re-rendering
            - CHECKPOINT after rendering: user reviews generated images

         c. **Agent design for visual squads**:
            - Option A: Add a **dedicated Designer agent** with HTML/CSS expertise
              - Alliterative name following convention (e.g., "Diana Design", "Vitor Visual")
              - Tools: [visual-renderer] (and optionally asset-fetcher)
              - Persona focused on visual design, layout, typography, color theory
            - Option B: Extend the **Creator agent** with design capability
              - Add visual-renderer to the creator's tools list
              - Add design tasks to the creator's task list
              - Use when the squad is simple and doesn't warrant a separate designer
            - Choose Option A for Alta Performance mode, Option B for Econômico mode

         d. **Pipeline integration**:
            ```
            ... → [Writing/Creation] → [Asset Acquisition] → [Design & Render] → 🛑 Review Images → ...
            ```
            - The Review step MUST evaluate the generated images (not just text)
            - on_reject from review loops back to the Design & Render step
            - Reviewer agent needs visual-renderer tool access to view the generated PNGs

         e. **Both tools share Playwright MCP**: When either tool is installed,
            Playwright is configured once in `.claude/settings.local.json`.
            The second tool reuses the same MCP server — no duplicate config needed.
            During tool installation (Phase 3.5), if one is already installed and user
            selects the other, skip the Playwright MCP setup step.
```

**Step 3: Verify the edit didn't break YAML structure**

The Architect file is a large YAML with multi-line strings. Verify the file is still valid:

Run: `node -e "const yaml = require('yaml'); const fs = require('fs'); const doc = yaml.parse(fs.readFileSync('_opensquad/core/architect.agent.yaml', 'utf8')); console.log('Valid. Principles count:', doc.agent.persona.principles.length)"`

Expected: principle count should be one more than before (was ~12, now ~13).

If yaml parser not available, do a basic sanity check: read the file and verify the indentation is consistent and the new content is properly within the YAML string.

**Step 4: Commit**

```bash
git add _opensquad/core/architect.agent.yaml
git commit -m "feat: teach Architect about visual output tools

Add Visual Output Squad Pattern to Phase 4 and a new principle
for designing squads that use visual-renderer and asset-fetcher."
```

---

### Task 4: Verify tool discovery works

**Files:**
- Read: `_opensquad/tools/registry/*.tool.yaml` (all tool files)
- Read: `_opensquad/core/tools.engine.md` (discovery logic)

**Step 1: List all registry tools**

Run: `ls _opensquad/tools/registry/`

Expected: 4 files:
- `apify.tool.yaml`
- `asset-fetcher.tool.yaml`
- `canva.tool.yaml`
- `visual-renderer.tool.yaml`

**Step 2: Verify useful_for tags match content squad needs**

Check that both new tools have `useful_for` entries that would match content creation squads:

Run: `grep -A1 "useful_for:" _opensquad/tools/registry/asset-fetcher.tool.yaml _opensquad/tools/registry/visual-renderer.tool.yaml`

Expected: Both should contain `content-design` and `social-media-content` in their `useful_for` arrays.

**Step 3: Verify Architect principle is present**

Run: `grep "Visual output" _opensquad/core/architect.agent.yaml`

Expected: Should find the new principle about visual output.

**Step 4: Final commit (if any fixes needed)**

If any fixes were needed, commit them. Otherwise, no action needed.

---

### Summary

| Task | Action | Files |
|------|--------|-------|
| 1 | Create asset-fetcher tool | `_opensquad/tools/registry/asset-fetcher.tool.yaml` |
| 2 | Create visual-renderer tool | `_opensquad/tools/registry/visual-renderer.tool.yaml` |
| 3 | Update Architect agent | `_opensquad/core/architect.agent.yaml` |
| 4 | Verify everything works | Read-only verification |

**Total: 4 tasks, ~3 commits**

# Design: Image Generation Tools for Opensquad

**Date**: 2026-02-26
**Status**: Approved

## Context

Opensquad squads currently produce text-only output. The instagram-content squad generates carousel copy in markdown but cannot produce actual images. This design adds two new tools to the Opensquad registry that enable squads to generate production-ready social media images.

**Inspiration**: [Instagram Carousel Generator with Claude Code](https://www.youtube.com/watch?v=59TQNbMi3J4) — a skill that uses Python/Pillow to render carousel slides from config.json. Our approach adapts this concept using HTML/CSS + Playwright (no Python dependency).

## Decision: Two Separate Tools

Image generation is split into two tools with distinct responsibilities:

- **asset-fetcher** — Acquires visual assets (images, screenshots) from external sources
- **visual-renderer** — Renders HTML/CSS into PNG images via Playwright

**Rationale**: Rendering and asset acquisition are different responsibilities. Separating them allows:
- Independent evolution (swap web_search for AI generation, add internal asset bank)
- Squads that only need screenshots (asset-fetcher alone)
- Squads that only need rendering from user-provided assets (visual-renderer alone)
- Full pipeline squads that use both

## Tool A: asset-fetcher

### Purpose

Acquires visual assets from multiple sources and organizes them for use by agents and other tools.

### Definition (asset-fetcher.tool.yaml)

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

### Architect Suggestion Criteria

The Architect suggests `asset-fetcher` when:
- Pipeline output format includes visual content (carousel, banner, thumbnail, presentation)
- A pipeline step requires visual enrichment (images to accompany text)
- Agent declares image dependencies and assets are NOT user-provided

Does NOT suggest when:
- Squad is purely textual
- All images are always provided by the user
- Squad only uses Canva (which handles its own assets)

---

## Tool B: visual-renderer

### Purpose

Renders HTML/CSS into production-ready PNG images via Playwright. Generic engine — the visual format is defined entirely by the HTML template, not by the tool.

### Definition (visual-renderer.tool.yaml)

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

### Architect Suggestion Criteria

The Architect suggests `visual-renderer` when:
- Squad needs to **generate images** as pipeline output (not just text)
- Output format includes: carousel, visual post, banner, thumbnail, presentation
- Pipeline has a step that produces formatted visual content

Usually suggested **together with** `asset-fetcher` when the squad also needs to source images for embedding in templates.

---

## Integration with Architect

### Phase 3.5 — Tool Discovery

When the Architect detects a squad needs visual output:

1. Suggest `visual-renderer` for image generation
2. Suggest `asset-fetcher` if the squad also needs to find/screenshot images
3. Both tools share the Playwright MCP dependency — one installation covers both
4. Architect adds a **designer** agent (or design capability to existing agent) that:
   - Receives text content from the writer agent
   - Receives assets from the asset-fetcher
   - Generates HTML/CSS templates
   - Uses visual-renderer to produce final PNGs

### Agent Design Pattern

When these tools are installed, the Architect should create agents with awareness of the rendering pipeline:

```
Writer Agent → produces text content
    ↓
Designer Agent → generates HTML/CSS using:
    - text from writer
    - assets from asset-fetcher
    - branding from company.md
    - uses visual-renderer to produce PNGs
    ↓
Reviewer Agent → evaluates final images
```

---

## Typical Pipeline Flow

```
Step 1: Research (subagent)
    ↓ [CHECKPOINT: user selects research findings]
Step 2: Ideation (inline)
    ↓ [CHECKPOINT: user selects angle]
Step 3: Writing (inline)
    ↓ auto-proceed
Step 4: Asset Acquisition (subagent, uses asset-fetcher)
    ↓ auto-proceed
Step 5: Design & Render (inline, uses visual-renderer)
    ↓ [CHECKPOINT: user reviews images]
Step 6: Review (inline)
    ↓ [CHECKPOINT: approve or reject → loop to Step 5]
```

---

## Dependencies

Both tools depend on:
- **Playwright MCP** — Available as Claude Code plugin (`plugin:playwright:playwright`)
- Must be active in the user's Claude Code environment
- No additional npm packages or runtime required

---

## Future Evolution

### asset-fetcher roadmap
- AI image generation (DALL-E, Midjourney API)
- Internal asset bank (squad-level image library)
- Brand asset management (logos, icons, color palettes)
- Video frame extraction

### visual-renderer roadmap
- Video/GIF output (animate HTML with CSS animations → MP4)
- Template library (pre-built HTML templates for common formats)
- High-DPI rendering (2x/3x for retina displays)
- A/B variant generation (multiple versions of same slide)

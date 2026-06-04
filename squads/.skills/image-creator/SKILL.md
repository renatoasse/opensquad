---
name: image-creator
description: >
  Renders HTML/CSS into production-ready images via Playwright.
  Accepts complete HTML content, opens it in a headless browser at
  the specified viewport, and captures a pixel-perfect screenshot.
  Generic engine -- any visual format is defined by the HTML template.
description_pt-BR: >
  Renderiza HTML/CSS em imagens prontas para produção via Playwright.
  Aceita conteúdo HTML completo, abre em um navegador headless na
  viewport especificada e captura uma screenshot pixel-perfect.
  Motor genérico -- qualquer formato visual é definido pelo template HTML.
description_es: >
  Renderiza HTML/CSS en imágenes listas para producción vía Playwright.
  Acepta contenido HTML completo, lo abre en un navegador headless en
  el viewport especificado y captura una screenshot pixel-perfect.
  Motor genérico -- cualquier formato visual se define por el template HTML.
type: mcp
version: "1.0.0"
mcp:
  server_name: playwright
categories: [design, automation, images]
---

# Image Creator

## When to use

Use the Visual Renderer when you need to generate production-ready images from HTML/CSS. This skill uses Playwright to render complete, self-contained HTML files in a headless browser and capture pixel-perfect screenshots. It is the primary engine for creating social media graphics, carousel slides, infographics, and any other visual content defined by HTML templates.

## Instructions

### Core Workflow

1. **Generate HTML** -- Write a complete, self-contained HTML file with inline CSS. The HTML IS the design -- all styling, layout, fonts, colors, and content must be embedded.

2. **Save HTML** -- Write the HTML file to the squad's output folder (e.g., `output/slides/slide-01.html`)

3. **Start HTTP server** -- Before rendering, start a local HTTP server in the squad's output folder:
   ```bash
   python -m http.server 8765 --directory "OUTPUT_DIR" &
   for i in $(seq 1 30); do curl -s http://localhost:8765 > /dev/null 2>&1 && break || sleep 0.1; done
   ```
   Replace OUTPUT_DIR with the actual absolute path to the output folder (quote paths that contain spaces).

4. **Render** -- Use Playwright to:
   - `browser_navigate` to `http://localhost:8765/slide-01.html` (filename only, not full path)
   - `browser_resize` to target viewport dimensions
   - `browser_take_screenshot` to save as PNG

5. **Verify** -- Read the screenshot to confirm quality. Re-render if needed.

6. **Stop server** -- After all slides are rendered, stop the HTTP server:
   ```bash
   pkill -f "http.server 8765" 2>/dev/null || true
   ```

### Viewport Presets (width x height)

Use these standard dimensions:
- Instagram Post: 1080 x 1080
- Instagram Carousel: 1080 x 1440
- Instagram Story/Reel: 1080 x 1920
- Facebook Post: 1200 x 630
- Twitter/X Post: 1200 x 675
- LinkedIn Post: 1200 x 627
- YouTube Thumbnail: 1280 x 720
- Custom: as specified by the squad

### HTML Template Guidelines

The HTML you generate MUST:
- Be self-contained (inline CSS, no external dependencies)
- Use web-safe fonts OR Google Fonts via `@import`
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
    body { width: 1080px; height: 1440px; overflow: hidden; }
    /* ... your design ... */
  </style>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

### Batch Rendering (Carousels/Multi-slide)

For multi-image outputs like carousels:
1. Generate one HTML file per slide
2. Start the HTTP server **once** before the batch (step 3 of Core Workflow)
3. Render each slide sequentially (step 4 repeated per slide)
4. Stop the HTTP server **once** after all slides are done (step 6 of Core Workflow)
5. Name output files with zero-padded numbers: slide-01.png, slide-02.png, slide-03.png
6. Keep all slides at the same viewport dimensions

### Best Practices

- Always verify the first rendered image before batch rendering
- Use CSS Grid/Flexbox for layout -- most reliable across renderers
- Avoid animations/transitions (static screenshot only)
- For rounded corners on images, use CSS `border-radius` + `overflow`
- For emoji rendering, rely on system fonts (Windows: Segoe UI Emoji)
- Test text overflow -- ensure no content is clipped unexpectedly
- Keep HTML files alongside output PNGs for easy re-rendering

### Typography & Readability Rules

Text must be legible in the target platform's smallest viewing context (mobile feed for social platforms). Text inside linked or embedded image files (JPG, PNG, base64 assets) is decorative and exempt. All HTML text nodes and inline SVG text are subject to these rules.

These are HARD minimums -- never go below them for readable text.

#### Minimum Font Sizes by Platform

| Text Role        | Instagram Post/Carousel | Instagram Story/Reel | LinkedIn/Facebook | YouTube Thumb |
|------------------|------------------------|----------------------|-------------------|---------------|
| Hero / Display   | 58px                   | 56px                 | 40px              | 60px          |
| Heading          | 43px                   | 42px                 | 32px              | 36px          |
| Body / Bullets   | 34px                   | 32px                 | 24px              | 36px          |
| Caption / Footer | 24px                   | 20px                 | 20px              | 32px          |

**Universal rule**: No text element meant to be read may use a font size smaller than 20px, on any platform.

#### Font Weight

- Body text and above: use font-weight 500+ (medium/semibold/bold)
- Caption text: font-weight 500+ strongly recommended; 400 only with explicit high-contrast background (4.5:1 ratio minimum)
- Avoid thin/light weights (100-300) for any readable text

#### Verification Checklist

Before calling `browser_take_screenshot`, scan your HTML and confirm:
- All text elements use explicit px sizes (not em/rem that could resolve smaller)
- No heading is below the Heading minimum for the target platform
- No body/bullet text is below the Body minimum
- No footer or metadata text is below the Caption minimum
- No readable text uses font-weight below 500 (caption at 400 only with 4.5:1 contrast background)

## Available operations

- **Render HTML to PNG** -- Convert self-contained HTML/CSS into a pixel-perfect screenshot
- **Batch Render** -- Render multiple slides/pages sequentially for carousels and multi-image content
- **Viewport Resize** -- Set precise viewport dimensions for any target platform
- **Quality Verification** -- Visually inspect rendered output and re-render if needed

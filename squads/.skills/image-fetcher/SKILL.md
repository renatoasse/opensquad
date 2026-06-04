---
name: image-fetcher
description: >
  Acquires visual assets from multiple sources: web image search,
  live website screenshots via Playwright, and user-provided files.
  Organizes assets in the squad's reference folder.
description_pt-BR: >
  Obtém assets visuais de múltiplas fontes: busca de imagens na web,
  capturas de sites via Playwright e arquivos fornecidos pelo usuário.
  Organiza os assets na pasta de referência do squad.
description_es: >
  Obtiene assets visuales de múltiples fuentes: búsqueda de imágenes en la web,
  capturas de sitios vía Playwright y archivos proporcionados por el usuario.
  Organiza los assets en la carpeta de referencia del squad.
type: hybrid
version: "1.0.0"
mcp:
  server_name: playwright
categories: [assets, scraping, automation, images]
---

# Asset Fetcher

## When to use

Use the Asset Fetcher when you need to acquire visual assets for content creation. It supports three acquisition modes: web image search, live website screenshots via Playwright, and organizing user-provided files. All assets are saved to the squad's reference or output folder with descriptive filenames and metadata.

## Instructions

### Capabilities

1. **Web Image Search** -- Use the native web_search tool to find images by keyword. Evaluate results and download the best match.

2. **Live Screenshot** -- Use Playwright MCP to navigate to a URL, set viewport dimensions, and capture a screenshot.

3. **Asset Organization** -- Save all acquired assets with descriptive filenames in the squad's reference/ or output/ folder.

### Screenshot Modes

- **viewport** -- Capture only the visible viewport area (default)
- **full_page** -- Capture the entire scrollable page
- **selector** -- Capture a specific CSS selector element

### Screenshot Workflow

When taking a screenshot:
1. Navigate to the URL with `browser_navigate`
2. Set viewport: `browser_resize` with width/height for target format
   - Instagram post: 1080x1080
   - Instagram carousel: 1080x1440
   - Story/Reel: 1080x1920
   - Generic: 1280x720
3. Wait for page load (`browser_wait_for` if needed)
4. Capture: `browser_take_screenshot`
5. Save to reference folder with descriptive filename

### Asset Metadata

After acquiring each asset, document in your output:
- `path`: local file path
- `width/height`: image dimensions
- `source_type`: "web_search" | "screenshot" | "user_provided"
- `original_url`: source URL (if applicable)

### Cache Policy

Before fetching an asset:
- Check if the reference folder already has a matching file
- Use deterministic filenames based on source (e.g., URL slug + viewport)
- Reuse existing assets to avoid redundant fetches

### Safety

- Timeout: max 30s per screenshot, skip and warn if exceeded
- Maximum screenshot dimensions: 1920x1920px
- Block `file://` protocol URLs
- Block localhost and private IP ranges (127.0.0.1, 10.x, 192.168.x)

### Best Practices

- Prefer screenshots over web search for product/tool pages (images are often outdated)
- Save with descriptive names: `gemini-benchmark-chart.png` not `image1.png`
- Normalize URLs before caching (strip tracking params)
- Document all acquired assets with metadata for downstream tools

## Available operations

- **Web Image Search** -- Find and download images by keyword from the web
- **Live Screenshot** -- Capture viewport, full-page, or element screenshots of any URL
- **Asset Organization** -- Save and catalog assets with descriptive filenames and metadata
- **Cache Check** -- Detect and reuse previously fetched assets to avoid redundant downloads

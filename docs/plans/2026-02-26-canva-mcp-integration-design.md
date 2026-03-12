# Design: Replace Figma with Canva Connect MCP

**Date:** 2026-02-26
**Status:** Approved

## Summary

Replace the Figma MCP tool in the Opensquad registry with Canva Connect MCP. The Architect auto-suggests Canva when creating squads that need design/visual content. No structural changes to the tools engine.

## What Changes

### 1. New registry file: `canva.tool.yaml`

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

### 2. Delete `figma.tool.yaml`

Remove entirely from both `_opensquad/tools/registry/` and `templates/_opensquad/tools/registry/`.

### 3. Update references

Replace any mentions of "figma" in:
- Architect agent (Phase 3.5 tool discovery)
- Runner pipeline (if any hardcoded references)
- Existing squad definitions (if any reference figma)
- Template files

### 4. No structural changes

The Architect Phase 3.5 tool discovery works by matching `categories` and `useful_for` fields. Canva has the right categories (`design`, `ui`, `assets`) and use cases (`content-design`, `brand-guidelines`, `visual-content`) to be auto-suggested for content/design squads.

## Technical Details

- **Transport:** HTTP (streamable)
- **URL:** `https://mcp.canva.com/mcp`
- **Auth:** OAuth (browser popup on first use, no API key needed)
- **Claude Code install command:** `claude mcp add --transport http canva https://mcp.canva.com/mcp`

## Capabilities

| Feature | Description | Plan Required |
|---------|-------------|---------------|
| Create designs | New empty designs of any type | Free |
| Search designs | Find existing designs in account | Free |
| Autofill templates | Fill template placeholders with content | Paid |
| Export designs | Export as PDF or image | Free |

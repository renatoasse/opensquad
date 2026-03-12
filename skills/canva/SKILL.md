---
name: canva
description: >
  Create, search, autofill, and export designs from Canva.
  Enables agents to generate visual content, fill templates
  with brand assets, and export in various formats.
description_pt-BR: >
  Crie, busque, preencha e exporte designs do Canva.
  Permite que agentes gerem conteúdo visual, preencham templates
  com assets da marca e exportem em diversos formatos.
description_es: >
  Crea, busca, completa y exporta diseños de Canva.
  Permite que los agentes generen contenido visual, completen plantillas
  con recursos de marca y exporten en diversos formatos.
type: mcp
version: "1.0.0"
mcp:
  server_name: canva
  transport: http
  url: "https://mcp.canva.com/mcp"
categories: [design, ui, assets, automation]
---

# Canva Connect

## When to use

Use Canva when you need to create, search, or export visual designs. This skill connects to the user's Canva account via OAuth and enables agents to generate presentations, social media posts, logos, and other visual content. It also supports autofilling templates with brand assets and exporting designs in various formats.

## Instructions

You have access to Canva through the Canva Connect MCP server.

### Key capabilities

- Create new designs (presentations, social posts, logos, etc.)
- Autofill templates with content (text, images, brand elements)
- Search existing designs in the user's Canva account
- Export designs as PDF or image files

### Best practices

- Use templates when possible -- faster and more on-brand
- When autofilling, match content to template placeholder names
- Export in the format most useful for the pipeline (PNG for social, PDF for documents)
- Respect the user's Canva plan limitations (some features require paid plans)

### Requirements

- User needs a Canva account (free or paid)
- OAuth authorization is required on first use (browser popup)
- Autofill templates require a Canva paid plan

## Available operations

- **Create Design** -- Generate new designs from scratch or templates
- **Search Designs** -- Find existing designs in the user's Canva account
- **Autofill Template** -- Fill template placeholders with text, images, and brand elements
- **Export Design** -- Export designs as PDF, PNG, JPG, or other formats
- **Browse Templates** -- Search Canva's template library for the right starting point

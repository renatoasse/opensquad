---
name: Notion MCP
description: Lê e escreve páginas, databases e propriedades do Notion via MCP
type: mcp
version: 1.0.0
mcp:
  server_name: b7019053-6b1c-4685-9bbd-9b3e2c3862ea
  transport: stdio
env: []
categories:
  - productivity
  - content
---

## Como usar o Notion MCP

Use as ferramentas `notion-fetch`, `notion-search`, `notion-create-pages`, `notion-update-page`, etc. para interagir com o workspace do Notion.

### Leitura de briefings

Para ler o conteúdo de uma página do Notion:
1. Use `notion-fetch` com o ID ou URL da página
2. O conteúdo retornado inclui blocos, propriedades e metadata
3. Extraia o texto de cada bloco para compor o briefing

### Formatos de ID aceitos
- URL completa: `https://www.notion.so/workspace/Titulo-da-pagina-{id}`
- ID direto: `{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}`

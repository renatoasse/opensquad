---
name: gmail-automation
description: "Automate Gmail tasks via Rube MCP (Composio): send/reply, search, labels, drafts, attachments."
type: mcp
version: "1.0.0"
mcp:
  server_name: rube
  transport: http
  url: "https://rube.app/mcp"
categories: [messaging, automation, email]
---

# Gmail Automation via Rube MCP

Use este componente para buscar e-mails do Acquire.com e monitorar a pasta "Ideia de SaaS".

## Instruções
- Use `GMAIL_FETCH_EMAILS` com a query `label:Ideia-de-SaaS` (ou o nome exato da pasta).
- Extraia o corpo do e-mail para análise estratégica.
- Se necessário, use `GMAIL_LIST_LABELS` para confirmar o ID exato da pasta.

## Exemplo de Busca
Query: `label:Ideia-de-SaaS after:2024/01/01`

---
name: resend
description: >
  Send emails through Resend's official MCP server.
  Supports single send, batch send, HTML and plain text bodies,
  attachments, CC/BCC, scheduling, and contact management.
description_pt-BR: >
  Envie emails pelo servidor MCP oficial da Resend.
  Suporta envio individual, envio em lote, corpo HTML e texto puro,
  anexos, CC/BCC, agendamento e gerenciamento de contatos.
description_es: >
  Enviar correos electrónicos a través del servidor MCP oficial de Resend.
  Soporta envío individual, envío por lotes, cuerpo HTML y texto plano,
  adjuntos, CC/BCC, programación y gestión de contactos.
type: mcp
version: "1.0.0"
mcp:
  server_name: resend
  command: npx
  args: ["-y", "resend-mcp"]
  transport: stdio
env:
  - RESEND_API_KEY
categories: [email, automation, communication]
---

# Resend — Email Skill

## When to use

Use this skill when a squad needs to send emails — welcome messages, notifications,
reports, newsletters, or any transactional/marketing email. Resend handles delivery
so the squad only needs to compose the content and call the MCP tools.

## Instructions

### Sending a single email

1. Prepare **from**, **to**, **subject**, and **body** (HTML or plain text).
2. Call the Resend MCP `send_email` tool.
3. Check the response for a successful `id` — that confirms the email was queued.

### Sending a batch

1. Build an array of email objects (same fields as single send).
2. Call the Resend MCP `batch_send_emails` tool.
3. Each item in the response will have its own `id` or error.

### Attachments

Pass attachments as an array with `filename`, `path` (local file), `url`, or `content` (base64).

### Scheduling

Include a `scheduled_at` field (ISO 8601 datetime) to schedule future delivery.

## Best practices

- Validate **from** against a verified domain before sending — Resend rejects unverified senders.
- Keep subject lines under 80 characters for better deliverability.
- For batch sends, group by shared content to reduce payload size.
- Always check the response for errors and surface them to the user rather than silently failing.
- When composing HTML emails, keep the markup simple — most email clients ignore complex CSS.

## Available operations

- **Send Email** — Single email with HTML/text body, attachments, CC/BCC, reply-to
- **Batch Send** — Multiple emails in one call
- **Schedule Email** — Queue an email for future delivery
- **List/Get Emails** — Check delivery status of sent emails
- **Cancel Email** — Cancel a scheduled email before it sends
- **Manage Contacts** — Create, list, update, and remove contacts from audiences
- **Manage Domains** — Add and verify sender domains

## Setup

1. Create a free account at [resend.com](https://resend.com)
2. Generate an API key (starts with `re_`)
3. Add a verified sender domain (or use Resend's shared `onboarding@resend.dev` for testing)
4. Set `RESEND_API_KEY` in your `.env` file

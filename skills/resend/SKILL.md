---
name: resend
description: >
  Email delivery via Resend's official MCP server. Use when squads need to send
  single emails or batch emails through the bundled Resend integration.
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

# Resend Email Skill

## When to use

Use this skill when a squad or agent needs to send email through Resend. It is
the bundled MCP-first path for single-send and batch-send email workflows.

## Instructions

1. Use the official Resend MCP server exposed by `resend-mcp`.
2. For single-send work, prepare sender, recipient, subject, and body content
   before invoking the email tool.
3. For batch-send work, prepare the recipient list and shared message content
   before invoking the batch tool.
4. Prefer the MCP tools over direct API calls in v1.
5. Treat the skill as already configured through MCP registration and
   `RESEND_API_KEY`; do not direct users to edit env files manually as the
   primary setup path.

## Best practices

- Keep payloads minimal and validate sender, recipient, and subject before
  sending.
- Use batch send only when the same message should go to multiple recipients.
- Preserve provider defaults and reuse the official MCP path rather than
  building a custom transport.
- Report failures with enough detail to retry the specific message or
  recipient.

## Available operations

- Send a single email through the Resend MCP server.
- Send a batch of emails through the Resend MCP server.
- Prepare payloads for sender, recipient, subject, and body content.
- Return delivery results and errors for downstream squad handling.

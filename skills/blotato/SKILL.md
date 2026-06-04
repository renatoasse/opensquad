---
name: blotato
description: >
  Social media publishing and scheduling platform.
  Publish and schedule posts across Instagram, LinkedIn, Twitter/X,
  TikTok, YouTube, and more. Upload media and monitor post status.
description_pt-BR: >
  Plataforma de publicação e agendamento em redes sociais.
  Publique e agende posts no Instagram, LinkedIn, Twitter/X,
  TikTok, YouTube e mais. Faça upload de mídia e monitore o status dos posts.
description_es: >
  Plataforma de publicación y programación en redes sociales.
  Publica y programa posts en Instagram, LinkedIn, Twitter/X,
  TikTok, YouTube y más. Sube contenido multimedia y monitorea el estado de los posts.
type: mcp
version: "1.0.0"
mcp:
  server_name: blotato
  transport: http
  url: "https://mcp.blotato.com/mcp"
  headers:
    blotato-api-key: BLOTATO_API_KEY
env:
  - BLOTATO_API_KEY
categories: [social-media, automation, publishing, scheduling]
---

# Blotato Publisher

## When to use

Use Blotato when you need to publish or schedule social media posts across multiple platforms from a single interface. Blotato supports Instagram, LinkedIn, Twitter/X, TikTok, YouTube, and more. It handles media uploads, post scheduling, and status monitoring.

## Instructions

You have access to Blotato for social media publishing.

### Key workflow

1. Use `blotato_list_accounts` to get account IDs and platforms
2. If post includes images or videos, upload them with `blotato_upload_media` first and use the returned media IDs in `blotato_create_post`
3. Use `blotato_create_post` to publish or schedule
4. Use `blotato_get_post_status` to confirm success

### Best practices

- Always call `blotato_list_accounts` first to get valid account IDs
- For scheduled posts, use ISO 8601 format for datetime
- After posting, poll `blotato_get_post_status` until status is "published" or "scheduled"
- If status is "failed", report the error details to the user

### Requirements

- Blotato account required (blotato.com)
- API key must be configured (Blotato Settings > API section)

## Available operations

- **List Accounts** -- Retrieve connected social media accounts and their platform types
- **Upload Media** -- Upload images and videos for use in posts
- **Create Post** -- Publish or schedule a post to one or more platforms
- **Get Post Status** -- Monitor publishing status (published, scheduled, failed)
- **Multi-platform Publishing** -- Post the same content across Instagram, LinkedIn, Twitter/X, TikTok, YouTube simultaneously

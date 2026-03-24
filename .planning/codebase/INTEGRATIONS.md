# External Integrations

**Analysis Date:** 2026-03-24

## APIs & External Services

**Social Publishing:**
- Instagram Graph API - Direct carousel publishing from `skills/instagram-publisher/scripts/publish.js`
  - SDK/Client: Native `fetch` calls from Node.js; no third-party SDK
  - Auth: `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` from `.env` / `.env.example`
  - Endpoints used: `https://graph.facebook.com/v21.0/{user-id}/media`, `/{container-id}?fields=status_code`, `/{user-id}/media_publish`, and `/{media-id}?fields=permalink`
- Blotato - Multi-platform social publishing and scheduling
  - SDK/Client: MCP HTTP server at `https://mcp.blotato.com/mcp`
  - Auth: `BLOTATO_API_KEY` header
  - Used by: `skills/blotato/SKILL.md`

**Design / Creative Tools:**
- Canva Connect - Design creation, template autofill, and export
  - SDK/Client: MCP HTTP server at `https://mcp.canva.com/mcp`
  - Auth: Canva OAuth on first use
  - Used by: `skills/canva/SKILL.md`

**Data Collection:**
- Apify - Web scraping and automation
  - SDK/Client: MCP stdio server launched with `npx -y @apify/actors-mcp-server@latest`
  - Auth: `APIFY_TOKEN`
  - Used by: `skills/apify/SKILL.md`

**AI / Generation:**
- OpenRouter API - AI image generation in `skills/image-generator/scripts/generate.py`
  - SDK/Client: Direct HTTPS requests to `https://openrouter.ai/api/v1/chat/completions`
  - Auth: `OPENROUTER_API_KEY`
  - Used for: test and production image generation, including reference-image inputs

## Data Storage

**File Storage:**
- catbox.moe - Temporary public hosting for Instagram publishing
  - SDK/Client: Direct multipart upload from `skills/instagram-publisher/scripts/publish.js`
  - Auth: None
  - Used for: hosting local JPEGs before creating Instagram media containers

**Databases:**
- None

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Instagram Business account connected to a Facebook Page - Required for `skills/instagram-publisher/`
  - Implementation: Long-lived access token generated through Meta Graph API Explorer
  - Token storage: `INSTAGRAM_ACCESS_TOKEN` in `.env`
  - Session management: Manual token refresh every 60 days
- Canva OAuth - Required for `skills/canva/SKILL.md`
  - Implementation: Managed by Canva Connect MCP
  - Token storage: User-authorized OAuth session

## Monitoring & Observability

**Error Tracking:**
- None configured

**Analytics:**
- None configured

**Logs:**
- CLI and skills log to stdout/stderr only
- Dashboard uses browser console and Vite dev-server logs during local development

## CI/CD & Deployment

**Hosting:**
- None in this repository

**CI Pipeline:**
- None in this repository

## Environment Configuration

**Development:**
- Required env vars are skill-specific, not global
- `/.env.example` documents the Instagram publishing variables
- `skills/apify/SKILL.md`, `skills/blotato/SKILL.md`, and `skills/image-generator/SKILL.md` declare their own required env vars
- Generated projects also install Playwright and Chromium through `src/init.js`

**Staging:**
- Not defined

**Production:**
- Secrets are stored locally in `.env` for skills or in the external service dashboards for OAuth/MCP credentials
- No centralized secret manager is configured in this repo

## Webhooks & Callbacks

**Incoming:**
- None implemented

**Outgoing:**
- Instagram Graph API status polling in `skills/instagram-publisher/scripts/publish.js`
  - Trigger: container processing and final publish flow
  - Behavior: polls media container status until `FINISHED` or `ERROR`
- Blotato post-status polling is part of the skill workflow in `skills/blotato/SKILL.md`

---

*Integration audit: 2026-03-24*
*Update when adding/removing external services*

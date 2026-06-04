# Opensquad Skill Catalog

Browse available skills for your squads. Install any skill with:

```bash
npx opensquad install <skill-name>
```

## Available Skills

| Skill | Type | Description | Env Vars | Install |
|-------|------|-------------|----------|---------|
| [apify](./apify/) | mcp | Web scraping and automation platform. Extract data from any website using pre-built Actors. | `APIFY_TOKEN` | `npx opensquad install apify` |
| [canva](./canva/) | mcp | Create, search, autofill, and export designs from Canva. | _(none -- OAuth)_ | `npx opensquad install canva` |
| [instagram-publisher](./instagram-publisher/) | script | Publish Instagram carousel posts from local JPEG images via the Graph API. | `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | `npx opensquad install instagram-publisher` |
| [blotato](./blotato/) | mcp | Publish and schedule posts across Instagram, LinkedIn, Twitter/X, TikTok, YouTube, and more. | `BLOTATO_API_KEY` | `npx opensquad install blotato` |
| [resend](./resend/) | mcp | Send emails through Resend — single send, batch, scheduling, attachments, and contact management. | `RESEND_API_KEY` | `npx opensquad install resend` |
| [image-fetcher](./image-fetcher/) | hybrid | Acquire visual assets via web search, live screenshots (Playwright), and user-provided files. | _(none)_ | `npx opensquad install image-fetcher` |
| [image-creator](./image-creator/) | mcp | Render HTML/CSS into production-ready PNG images via Playwright. | _(none)_ | `npx opensquad install image-creator` |
| [image-ai-generator](./image-ai-generator/) | script | Generate AI images via Openrouter API. Test mode (cheap) and production mode (high-quality). Supports reference images for brand consistency. | `OPENROUTER_API_KEY` | `npx opensquad install image-ai-generator` |

## Skill Types

- **mcp** -- Connects to an external MCP server (stdio or HTTP transport)
- **script** -- Runs a local script (Node.js, Python, etc.)
- **hybrid** -- Combines MCP server access with local script capabilities

## Directory Structure

Each skill lives in its own folder with a `SKILL.md` file:

```
skills/
  apify/
    SKILL.md
  canva/
    SKILL.md
  instagram-publisher/
    SKILL.md
    scripts/
      publish.js
  blotato/
    SKILL.md
  resend/
    SKILL.md
  image-fetcher/
    SKILL.md
  image-creator/
    SKILL.md
  image-ai-generator/
    SKILL.md
    scripts/
      generate.py
```

The `SKILL.md` file contains YAML frontmatter (name, type, version, MCP/script config, env vars, categories) and a Markdown body with usage instructions and available operations.

## Adding a New Skill

1. Create a new folder under `skills/` with the skill ID as the name
2. Add a `SKILL.md` file with valid YAML frontmatter and Markdown body
3. If the skill includes scripts, place them in a `scripts/` subfolder
4. Update this README to include the new skill in the catalog table

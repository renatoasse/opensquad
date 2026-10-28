# Formats System Design

**Date:** 2026-02-28
**Status:** Approved

## Problem

Agents like the copywriter behave differently depending on the target platform. Writing for Instagram is fundamentally different from WhatsApp, email, or blog — different constraints, structures, conventions, and quality criteria. The system needs a way to inject platform+format-specific instructions into any agent's execution context.

## Decision

Create a **Formats System** — a new abstraction that defines rules, structure, and constraints per platform+content type combination. Formats are platform-agnostic from the agent's perspective: any agent can receive format context and interpret it through their own role.

## Architecture

### Directory

```
_opensquad/core/formats/
  instagram-feed.md
  instagram-reels.md
  instagram-stories.md
  linkedin-post.md
  linkedin-article.md
  twitter-post.md
  twitter-thread.md
  youtube-script.md
  youtube-shorts.md
  whatsapp-broadcast.md
  email-newsletter.md
  email-sales.md
  blog-post.md
  blog-seo.md
```

**Naming pattern:** `{platform}-{type}.md` (flat, no subdirectories)

### Format File Schema

```yaml
---
name: "Instagram Feed Post"
platform: "instagram"
content_type: "feed"
description: "Carousels and single image posts for the Instagram feed"
constraints:
  caption_max_chars: 2200
  caption_visible_chars: 125
  max_hashtags: 30
  recommended_hashtags: "5-15"
  carousel_max_slides: 20
  recommended_slides: "6-10"
  image_ratio: "4:5 portrait"
  image_resolution: "1080x1350px"
version: "1.0.0"
---

# {Format Name}

## Platform Rules
General platform rules relevant to this content type.
Algorithm, engagement signals, timing.

## Content Structure
Structural patterns: carousel flow, reel structure, email sections, etc.

## Writing Guidelines
Platform-specific writing rules: hook, body, CTA, hashtags, subject lines, etc.

## Output Format
Template showing how the output should be structured.
Agents follow this format when producing content.

## Quality Criteria
Checklist specific to this format.

## Anti-Patterns
What NOT to do in this format.
```

The `constraints` in YAML frontmatter are parseable — enables future automated validation (e.g., "caption exceeds 2200 chars").

### Integration

#### Pipeline Steps
```yaml
# pipeline/steps/step-02-write-caption.md
---
agent: copywriter
format: instagram-feed    # new optional field
execution: inline
outputFile: squads/my-squad/output/caption.md
---
```

The `format` field is **optional**. Steps without it work as they do today.

#### Pipeline Runner
When executing a step with `format:`:
1. Read `_opensquad/core/formats/{format}.md`
2. Inject into agent context after overlays, before skill instructions:

```
{base agent content}
{squad overlay (.custom.md) if applicable}

--- FORMAT: Instagram Feed Post ---

{format file content}

--- SKILL INSTRUCTIONS ---

{skill content if applicable}
```

**Context injection order:**
```
Base Agent → Squad Overlay (.custom.md) → Format → Skill Instructions
```

#### Architect
During squad creation (Phase 1 — Discovery), the Architect:
1. Asks about target platforms and content types
2. Lists available formats from `_opensquad/core/formats/`
3. Selects relevant formats
4. Configures each pipeline step with the correct `format:` field

#### Agents
Any agent that receives a format context interprets it through their role:
- **Copywriter**: writes content within format constraints
- **Reviewer**: validates content against format rules
- **Strategist**: plans content strategy around format dynamics
- **Data Analyst**: interprets platform-specific metrics

### Scope Rules
- **One format per step.** Multiple formats = separate steps in the pipeline
- **Format is optional.** Steps without format work as before
- **Formats are reusable.** The same format file is used across all squads

### Deprecation
The existing `_opensquad/core/platforms/` directory is **deprecated**. Platform-specific content is migrated into the relevant format files. Each format is self-contained — it includes both platform rules and format-specific instructions.

## Migration Path
1. Create `_opensquad/core/formats/` directory
2. Migrate content from `_opensquad/core/platforms/instagram.md` → `instagram-feed.md`, `instagram-reels.md`, `instagram-stories.md`
3. Migrate content from other platform files similarly
4. Add deprecation notice to `_opensquad/core/platforms/*.md`
5. Update Pipeline Runner to support `format:` field in step frontmatter
6. Update Architect to ask about formats during squad creation
7. Add new platforms not previously covered (WhatsApp, Email, Blog)

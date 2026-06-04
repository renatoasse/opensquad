# Opensquad Skill Format Reference

## SKILL.md Structure

Every Opensquad skill consists of a `SKILL.md` file with YAML frontmatter and a Markdown body.

### Common Frontmatter Fields (all types)

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (lowercase, hyphenated) |
| `description` | Yes | What the skill does and when to use it |
| `type` | Yes | `mcp`, `script`, `hybrid`, or `prompt` |
| `version` | Yes | Semver version string (e.g., `1.0.0`) |
| `categories` | No | Classification tags array (e.g., `["social-media", "content"]`) |
| `env` | No | Required environment variable names array |

### Type: mcp

MCP skills connect to external APIs via Model Context Protocol servers.

Additional fields under `mcp:`:

| Field | Required | Description |
|-------|----------|-------------|
| `server_name` | Yes | Key used in MCP config |
| `command` | Yes (stdio) | Command to run the server |
| `args` | Yes (stdio) | Command arguments array |
| `transport` | Yes | `stdio` or `http` |
| `url` | Yes (http) | Server URL for HTTP transport |
| `headers` | No | Auth headers mapping (key-value pairs) |

### Type: script

Script skills run custom code via a specific runtime.

Additional fields under `script:`:

| Field | Required | Description |
|-------|----------|-------------|
| `path` | Yes | Script path relative to skill directory |
| `runtime` | Yes | `node`, `python`, or `bash` |
| `dependencies` | No | Package list to install before running |
| `invoke` | Yes | Full invocation command template |

### Type: hybrid

Hybrid skills combine both MCP and script components. Include both `mcp:` and `script:` sections as defined above.

### Type: prompt

Prompt skills are pure behavioral instructions for agents with no external integration. No additional fields beyond the common fields are required — the Markdown body is the entire skill.

---

## Markdown Body

The body contains instructions for agents. Recommended sections:

- `## When to use` — describes when agents should activate this skill
- `## Instructions` — step-by-step usage guide
- `## Available operations` — what the skill can do (especially for MCP/script types)
- `## Examples` — input/output examples to guide agent behavior
- `## Error handling` — what to do when things go wrong

---

## Complete Examples

### Example: MCP Skill (Canva Integration)

```yaml
---
name: canva-design
description: Create and manage Canva designs. Use when users want to generate social media graphics, presentations, or any visual content via Canva.
type: mcp
version: 1.0.0
categories:
  - design
  - social-media
env:
  - CANVA_API_KEY
mcp:
  server_name: canva
  command: npx
  args: ["-y", "@anthropic/canva-mcp-server"]
  transport: stdio
---

# Canva Design Skill

## When to use

Use this skill when the user or squad pipeline needs to create visual content — social media posts, presentations, flyers, or any graphic design task that benefits from Canva's template library.

## Instructions

1. Start by understanding the design requirements (type, dimensions, brand colors)
2. Search for relevant templates using `search-brand-templates`
3. Generate the design with `generate-design`
4. Present candidates to the user for selection
5. Export in the requested format

## Available operations

- Search templates and designs
- Generate new designs from prompts
- Edit existing designs (text, images, layout)
- Export to PDF, PNG, JPG, PPTX
```

### Example: Script Skill (Data Processor)

```yaml
---
name: csv-analyzer
description: Analyze CSV files and generate summary reports. Use when users need data analysis, column statistics, or trend detection from CSV/spreadsheet data.
type: script
version: 1.0.0
categories:
  - data
  - analytics
script:
  path: scripts/analyze.py
  runtime: python
  dependencies:
    - pandas
    - matplotlib
  invoke: python scripts/analyze.py --input {input_file} --output {output_dir}
---

# CSV Analyzer Skill

## When to use

Use this skill when the pipeline needs to analyze tabular data from CSV files — generating summaries, detecting trends, computing statistics, or creating visualizations.

## Instructions

1. Read the input CSV file to understand its structure
2. Run the analysis script: `python scripts/analyze.py --input <file> --output <dir>`
3. Review the generated report in the output directory
4. Present findings to the user with key insights highlighted

## Available operations

- Column statistics (mean, median, mode, std dev)
- Trend detection across time-series columns
- Correlation analysis between numeric columns
- Chart generation (bar, line, scatter)
```

### Example: Prompt Skill (Tone of Voice)

```yaml
---
name: professional-tone
description: Write content in a professional corporate tone. Use when squad agents need to produce business communications, reports, or client-facing materials that require formal, polished language.
type: prompt
version: 1.0.0
categories:
  - writing
  - tone
---

# Professional Tone Skill

## When to use

Apply this skill whenever generating content that will be seen by clients, executives, or external stakeholders. This includes emails, reports, proposals, and presentation scripts.

## Instructions

When writing in professional tone:

1. Use formal but accessible language — avoid jargon unless the audience expects it
2. Lead with the conclusion or recommendation, then support with evidence
3. Keep sentences concise (aim for 15-20 words average)
4. Use active voice by default; passive voice only when the actor is unknown or irrelevant
5. Structure content with clear headings and bullet points for scannability

## Examples

**Input:** "Hey, just wanted to let you know the project is running behind. We messed up the timeline."

**Output:** "I'm writing to provide an update on the project timeline. Due to unforeseen complexity in the integration phase, we are currently tracking two weeks behind our original schedule. I've prepared a revised timeline and mitigation plan for your review."

## Avoid

- Casual language ("gonna", "kinda", "hey")
- Hedging without substance ("I think maybe we could possibly...")
- Exclamation marks in formal contexts
- Emojis in any client-facing content
```

### Example: Hybrid Skill (Social Media Publisher)

```yaml
---
name: social-publisher
description: Draft social media content and publish via API. Use when squads need to create and post content to Instagram, Twitter/X, or LinkedIn with approval workflows.
type: hybrid
version: 1.0.0
categories:
  - social-media
  - publishing
env:
  - SOCIAL_API_KEY
mcp:
  server_name: social-api
  command: npx
  args: ["-y", "@company/social-mcp"]
  transport: stdio
script:
  path: scripts/format_post.py
  runtime: python
  dependencies:
    - pillow
  invoke: python scripts/format_post.py --platform {platform} --input {draft_file}
---

# Social Media Publisher

## When to use

Use this skill when the pipeline needs to both create and publish social media content. The script handles formatting and image processing, while the MCP server handles the actual publishing API calls.

## Instructions

1. Draft the content using squad agent context (topic, tone, audience)
2. Run the formatting script to prepare platform-specific versions
3. Present drafts for user approval at the checkpoint
4. After approval, use the MCP server to publish to the target platforms
5. Log the published URLs in the output directory
```

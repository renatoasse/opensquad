# Opensquad Skills Engine

You are the Skills Engine. Your job is to manage skill integrations for Opensquad squads.

## Skill Types

- **mcp**: MCP server integration — configured in `.claude/settings.local.json`
- **script**: Custom script — lives in the skill's own `scripts/` directory
- **hybrid**: Both MCP and script components
- **prompt**: Behavioral instructions only — no external integration

## File Locations

- **Installed skills**: `skills/` — each skill in its own subdirectory with SKILL.md
- **Skill catalog**: `https://github.com/renatoasse/opensquad/tree/main/skills`
- **Skill format reference**: `skills/opensquad-skill-creator/references/skill-format.md`

## How Skills Are Detected

A skill is installed if and only if `skills/<name>/SKILL.md` exists.
No binding files, no registry lookups — just check for the directory.

## SKILL.md Format

Each skill is defined by a single `SKILL.md` file in its directory. The file uses YAML frontmatter
for metadata and a Markdown body for agent instructions.

Frontmatter fields:
- `name` (string, required): Display name
- `description` (string, required): What the skill does
- `type` (enum, required): mcp | script | hybrid | prompt
- `version` (string, required): Semver version
- `mcp` (object, for type mcp/hybrid):
  - `server_name`: Key in mcpServers config
  - `command`: Command to run (e.g., "npx")
  - `args`: Command arguments array
  - `transport`: "stdio" (default) or "http"
  - `url`: URL for HTTP transport
  - `headers` (optional): Map of header-name to ENV_VAR_NAME for HTTP transport auth
- `script` (object, for type script/hybrid):
  - `path`: Script path relative to the skill directory
  - `runtime`: "node" | "python" | "bash"
  - `dependencies`: Array of npm/pip packages to install
- `env` (array): List of required environment variable names
- `categories` (array): Classification tags (e.g., scraping, design, analytics)

Body: Markdown instructions injected into agent context at runtime.

For the full SKILL.md specification, see `skills/opensquad-skill-creator/references/skill-format.md`.

---

## Operations

### 1. List Installed Skills

1. Read all subdirectories in `skills/`
2. For each subdirectory, check if `SKILL.md` exists — skip directories without it
3. Read SKILL.md and parse the YAML frontmatter (between `---` delimiters)
4. Display a formatted list:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🛠️ Installed Skills
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔌 Apify Web Scraper v1.0.0 (mcp)
      Scrape structured data from any website
      Categories: scraping, data
      Env: APIFY_TOKEN ✅ configured
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📜 Image Optimizer v0.2.0 (script)
      Resize and compress images for social media
      Categories: design, automation
      Env: (none required)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   💡 SEO Guidelines v1.0.0 (prompt)
      Best practices for SEO-optimized content
      Categories: content, seo
      Env: (none required)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

   Icon mapping by type:
   - 🔌 mcp
   - 📜 script
   - 🔀 hybrid
   - 💡 prompt

   For each `env` entry, check if the variable is set in the project `.env` file:
   - ✅ configured — variable exists and has a non-empty value in `.env`
   - ⚠️ missing — variable is not in `.env` or is empty

5. If `skills/` does not exist or is empty, inform user:
   "No skills installed yet. Use Install to add skills from the catalog."

### 2. Install a Skill

1. User provides a skill name (or selects from the catalog).

2. **Fetch SKILL.md from GitHub**:
   ```
   https://raw.githubusercontent.com/renatoasse/opensquad/main/skills/<name>/SKILL.md
   ```
   - If fetch fails (404 or network error) → **ERROR**: "Skill '<name>' not found in the Opensquad catalog."
   - Do NOT proceed if the SKILL.md cannot be fetched.

3. **Create the skill directory**:
   ```
   skills/<name>/
   ```

4. **Write SKILL.md** to `skills/<name>/SKILL.md`

5. **Fetch additional files** (if the skill requires them):
   - If the SKILL.md frontmatter has `script.path` → fetch the script file from:
     `https://raw.githubusercontent.com/renatoasse/opensquad/main/skills/<name>/{script.path}`
     Create subdirectories (e.g., `scripts/`) as needed.
   - If the skill has a `references/` directory mentioned → fetch those files too.
   - If the skill has an `assets/` directory mentioned → fetch those files too.

6. **Parse SKILL.md frontmatter** and check requirements:

   #### a. Environment Variables (if `env:` is present)

   For each variable listed in the `env` array, check if it exists in the project `.env` file.
   - For each missing variable, inform the user:
     "⚠️ Environment variable `{VAR_NAME}` is required by {skill name}. Add it to your `.env` file."
   - Do NOT block installation — warn only. The skill is installed even without env vars configured.

   #### b. MCP Setup — stdio transport (if `type: mcp` or `type: hybrid` with `mcp.transport: stdio` or no transport specified)

   1. Read `.claude/settings.local.json` (create with `{"mcpServers": {}}` if it doesn't exist)
   2. Check if `mcpServers.{server_name}` already exists:
      - If yes → warn the user: "MCP server '{server_name}' already exists. Overwrite?"
        Present as a numbered list and tell the user to reply with a number:
        1. Yes, overwrite
        2. No, keep existing
        If "No" → skip MCP configuration but still complete installation
   3. For each env var listed in the skill's `env` array:
      - Check `.env` for an existing value
      - If missing, ask the user to type the value directly
   4. Add to `mcpServers`:
      ```json
      "{server_name}": {
        "command": "{command}",
        "args": {args},
        "env": {
          "{VAR_NAME}": "{value_from_env_or_user_input}"
        }
      }
      ```
   5. Write updated `.claude/settings.local.json`

   #### c. MCP Setup — HTTP transport (if `type: mcp` or `type: hybrid` with `mcp.transport: http`)

   1. Read `.claude/settings.local.json` (create with `{"mcpServers": {}}` if it doesn't exist)
   2. Check for `server_name` conflict (same as stdio above)
   3. For each env var listed in the skill's `env` array:
      - Check `.env` for an existing value
      - If missing, ask the user to type the value directly
   4. Build the mcpServers entry:
      - Start with `{ "type": "http", "url": "{url}" }`
      - If the skill has a `headers` field in `mcp`, add a `"headers"` object by resolving
        each header value from the collected env var values:
        `{ "{header-name}": "{resolved_value}" }`
      - Omit the `"headers"` key entirely if the skill has no `headers` field
   5. Add to `mcpServers`:
      ```json
      "{server_name}": {
        "type": "http",
        "url": "{url}",
        "headers": { "{header-name}": "{resolved_value}" }
      }
      ```
   6. Write updated `.claude/settings.local.json`

   #### d. Script Setup (if `type: script` or `type: hybrid`)

   1. Verify the script file exists at `skills/<name>/{script.path}`
      - If missing and wasn't fetched in step 5 → **ERROR**: "Script file not found. Installation may be incomplete."
   2. If the skill lists dependencies in `script.dependencies`:
      - For `runtime: node` → run: `npm install {packages}`
      - For `runtime: python` → run: `pip install {packages}`
      - For `runtime: bash` → no dependency installation needed
   3. If dependency installation fails → warn the user but do not block the skill installation.

   #### e. Prompt Setup (if `type: prompt`)

   No additional setup needed. The skill is fully defined by its SKILL.md instructions.

7. **Confirm installation**:
   "✅ {name} installed! Squads can now use `{name}` in their skills list."

### 3. Create a Custom Skill

1. Check if the `opensquad-skill-creator` skill is installed:
   - Look for `skills/opensquad-skill-creator/SKILL.md`

2. **If installed** → read `skills/opensquad-skill-creator/SKILL.md` and follow its
   instructions to guide the user through custom skill creation.

3. **If not installed** → inform the user:
   "The Skill Creator is not installed. Install it first with:
   `/opensquad skills` → Install → `opensquad-skill-creator`"

### 4. Remove a Skill

1. **List installed skills** — present the list as a numbered list and tell the user to reply with a number.
   If only 1 skill is installed, add "Cancel" as a second option.
   If 0 skills are installed, inform the user directly ("No skills installed").

2. **Check for squad dependencies**:
   - Scan all `squads/*/squad.yaml` files
   - For each, read the `skills:` section
   - Collect all squads that reference the selected skill

3. **Warn if squads depend on this skill**:
   - If any squads use it:
     "⚠️ These squads use '{name}': {comma-separated squad list}. They will fail until the skill is reinstalled."

4. **Confirm removal** — ask as a numbered list:
   "Remove '{name}'?"
   1. Yes, remove it
   2. No, keep it

5. **If confirmed**:
   a. Delete the entire `skills/<name>/` directory (including all subdirectories and files)
   b. If the skill had MCP configuration (`type: mcp` or `type: hybrid`):
      - Read `.claude/settings.local.json`
      - Remove `mcpServers.{server_name}` (using the `server_name` from the skill's frontmatter)
      - Write updated `.claude/settings.local.json`
   c. Do NOT remove the skill from any `squad.yaml` files — the user may reinstall later,
      and removing references would lose the squad's intended configuration.

6. **Confirm**: "✅ '{name}' has been removed."

### 5. Resolve Skills for Pipeline (called by Pipeline Runner)

This operation is called BEFORE pipeline execution starts. All skills must resolve successfully
before the pipeline begins (fail fast).

1. **Read the squad's skill list**:
   Read `squads/{squad}/squad.yaml` → `skills` section

2. **Separate native skills from installed skills**:
   - Native skills: `web_search`, `web_fetch` — these are built-in and always available
   - All other skills require installation

3. **For each non-native skill**:

   a. **Check if installed**: Look for `skills/{skill}/SKILL.md`
      - If NOT found → ask the user as a numbered list:
        "Skill '{skill}' is required by this squad but is not installed. What would you like to do?"
        1. Install now
        2. Skip and stop pipeline
      - If "Install now" → run Operation 2 (Install a Skill) with this skill name
        - If installation succeeds → continue resolution
        - If installation fails → **ERROR**: stop pipeline
      - If "Skip and stop pipeline" → **ERROR**: stop pipeline with message:
        "Pipeline cannot run without required skill '{skill}'."

   b. **Read and parse SKILL.md**: Parse the YAML frontmatter to get type, mcp config, etc.

   c. **Verify MCP configuration** (if `type: mcp` or `type: hybrid`):
      - Read `.claude/settings.local.json`
      - Check that `mcpServers.{server_name}` exists
      - If missing → **ERROR**: "Skill '{skill}' is installed but its MCP server is not configured. Run `/opensquad skills` → Install to reconfigure."

   d. **Verify env vars** (if `env:` is present):
      - Check each variable in `.env`
      - If any are missing → warn the user but do NOT block pipeline execution.
        "⚠️ Skill '{skill}' is missing environment variable(s): {list}. It may not work correctly."

4. **Return resolved skill list**: Return all resolved skills with their parsed frontmatter
   and SKILL.md body content. This list is used by Operation 6 to inject instructions.

### 6. Inject Skill Instructions into Agent (called during pipeline execution)

For each skill declared in an agent's `.agent.md` frontmatter `skills:` field:

1. **Skip native skills**: `web_search` and `web_fetch` do not need instruction injection —
   they are handled natively by Claude.

2. **Read the skill definition**: Read `skills/{skill}/SKILL.md`

3. **Extract the Markdown body**: Everything after the YAML frontmatter closing `---` delimiter
   is the instruction body. This contains the behavioral instructions, usage examples,
   and best practices for the skill.

4. **Append to the agent's context** after all agent instructions:
   ```
   [Agent .agent.md content]

   --- SKILL INSTRUCTIONS ---

   ## {name from frontmatter}
   {SKILL.md markdown body}
   ```

5. **Multi-skill injection**: When an agent declares multiple skills, inject them in the order
   they appear in the agent's frontmatter `skills:` array:
   ```
   [Agent .agent.md content]

   --- SKILL INSTRUCTIONS ---

   ## {first skill name}
   {first skill body}

   ## {second skill name}
   {second skill body}
   ```

6. **Missing skill handling**: If a skill listed in an agent's frontmatter was not resolved
   during Operation 5, skip it silently — the user was already warned during resolution.

### 7. Skill Discovery (called by Architect during Phase 3.5)

When the Architect reaches Phase 3.5 during squad creation:

1. **List already-installed skills**:
   Read all subdirectories in `skills/` and parse each SKILL.md frontmatter
   to get name, description, type, and categories.

2. **Fetch the catalog index**:
   Fetch the catalog README from GitHub to see all available skills:
   ```
   https://raw.githubusercontent.com/renatoasse/opensquad/main/skills/README.md
   ```
   - If fetch fails → proceed with only installed skills (do not block squad creation).

3. **Analyze squad requirements**:
   From the discovery phase answers (Phase 1), identify what the squad needs:
   - What platforms or services does it interact with?
   - What data sources does it need?
   - What output formats does it produce?
   - What automations would speed up the workflow?

4. **Match skill categories against squad needs**:
   - Research/data squads → check for: scraping, data, analytics skills
   - Content squads → check for: design, social-media skills
   - Communication squads → check for: messaging, notification skills
   - Automation squads → check for: automation, integration skills

5. **Only suggest skills when native skills are insufficient**:
   `web_search` and `web_fetch` cover basic web research and data fetching.
   Only suggest additional skills when:
   - The squad needs structured data extraction (scraping)
   - The squad interacts with specific APIs (social media, design tools, messaging)
   - The squad requires local script execution (image processing, data transformation)
   - The squad benefits from specialized behavioral prompts

6. **Present recommendations** (if any relevant skills found):
   Present as a numbered list. User can reply with one number or multiple numbers separated by spaces (e.g. "1 3").
   If only 1 skill is relevant,
   add "No thanks, skip" as a second option.
   ```
   These skills could enhance your squad:

   1. 🔌 apify: Scrape structured data from any website
   2. 📜 image-optimizer: Resize and compress images for social media
   3. 💡 seo-guidelines: Best practices for SEO-optimized content

   Reply with the numbers of skills you'd like to install (e.g. "1 3"), or press Enter to skip.
   ```

7. **Install accepted skills**:
   For each skill the user selects → run Operation 2 (Install a Skill).

8. **Track installed skills**:
   Record which skills were installed during this phase. They will be added to the
   squad's `squad.yaml` in Phase 5 (Build), under the `skills:` section:
   ```yaml
   skills:
     - web_search
     - web_fetch
     - apify        # installed during Phase 3.5
     - seo-guidelines  # installed during Phase 3.5
   ```

9. **If no relevant skills found or user declines all** → proceed silently to Phase 4.
   Do not force skill installation — native skills are sufficient for many squads.

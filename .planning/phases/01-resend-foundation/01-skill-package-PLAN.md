---
wave: 1
depends_on: []
files_modified:
  - skills/resend/SKILL.md
  - skills/README.md
requirements:
  - SKILL-01
  - SKILL-02
  - SKILL-03
autonomous: true
---

# Objective
Create the bundled `resend` MCP skill and expose it in the catalog with instructions that make the MCP-first usage path explicit.

## must_haves
- `skills/resend/SKILL.md` exists and uses the established bundled-skill format with `type: mcp`.
- The frontmatter sets `name: resend`, `mcp.server_name: resend`, `mcp.command: npx`, `mcp.args: ["-y", "resend-mcp"]`, `mcp.transport: stdio`, and `env: ["RESEND_API_KEY"]`.
- The body explains that agents should use the official Resend MCP server for single-send and batch-send email workflows.
- `skills/README.md` includes a `resend` catalog row with type `mcp`, the `RESEND_API_KEY` env var, and the install command that matches the bundled skill path.
- The body stays focused on usage instructions, not setup prompts or repair logic.

## verification
- `skills/resend/SKILL.md` is present and parses as valid YAML frontmatter.
- `src/skills.js` can read the `resend` metadata and report `type === "mcp"` and `env` containing `RESEND_API_KEY`.
- The catalog table in `skills/README.md` shows `resend` alongside the other bundled skills.
- `npm test` still passes after the new skill and catalog changes.

## tasks
<task id="bundle-resend-skill">
  <objective>Author the bundled MCP skill definition and runtime guidance for Resend.</objective>
  <read_first>
    - `skills/blotato/SKILL.md`
    - `skills/apify/SKILL.md`
    - `templates/_opensquad/core/skills.engine.md`
  </read_first>
  <action>
    - Create `skills/resend/SKILL.md` with `version: "1.0.0"`, `type: mcp`, `mcp.server_name: resend`, `mcp.command: npx`, `mcp.args: ["-y", "resend-mcp"]`, `mcp.transport: stdio`, and `env: ["RESEND_API_KEY"]`.
    - Write a Markdown body with `When to use`, `Instructions`, `Best practices`, and `Available operations` sections that tell agents to use the official Resend MCP path for single-send and batch-send email work.
    - Include explicit guidance that the skill expects API-key-backed MCP configuration and should not describe manual environment-file editing as the primary setup path.
  </action>
  <acceptance_criteria>
    - The skill file is present under `skills/resend/SKILL.md`.
    - The frontmatter fields match the bundled MCP shape in the research notes.
    - The body clearly mentions single-send and batch-send usage through the MCP server.
  </acceptance_criteria>
</task>
<task id="catalog-resend-skill">
  <objective>Expose the new bundled skill in the catalog README with the correct type and install path.</objective>
  <read_first>
    - `skills/README.md`
    - `skills/resend/SKILL.md`
  </read_first>
  <action>
    - Add a `resend` row to the `Available Skills` table in `skills/README.md` with type `mcp`, description text that matches the new skill purpose, `RESEND_API_KEY` in the env column, and an install command using `npx opensquad install resend`.
    - Keep the catalog ordering consistent with the existing table style and do not change the skill-type legend.
  </action>
  <acceptance_criteria>
    - The catalog lists `resend` as an available bundled skill.
    - The install command and env var entry match the new skill frontmatter.
  </acceptance_criteria>
</task>

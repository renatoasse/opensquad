# Security

This document describes how opensquad handles security, privacy, and user data.

## Browser Sessions (Sherlock Investigator)

When you provide reference profile URLs during squad creation, opensquad dispatches the Sherlock investigator agent, which uses a headless Chromium browser (via Playwright) to navigate social media profiles and extract content patterns.

### How sessions work

- **First login:** When Sherlock encounters a login wall, it asks you to log in manually and **asks for your consent** before saving the session.
- **Persistent cookies:** If you consent, cookies and session data are stored locally in `_opensquad/_browser_profile/`. This directory is gitignored and never committed.
- **Headless mode:** The browser runs in headless mode (no visible window) by default. Configuration is in `_opensquad/config/playwright.config.json`.
- **Access scope:** The browser can navigate to any URL, not just the reference URLs you provided. Navigation, clicks, and JavaScript execution are controlled by the agent.

### Revoking sessions

Delete the `_opensquad/_browser_profile/` directory to remove all saved cookies and session data. The next investigation will require a fresh manual login.

## Image Hosting (imgBB)

The `instagram-publisher` skill uploads images to [imgBB](https://imgbb.com) to make them accessible via public URL for the Instagram Graph API.

- **API key required:** You must provide your own `IMGBB_API_KEY` in `.env`. Get a free key at https://api.imgbb.com/. This means image uploads only happen when you explicitly configure the key.
- **Public access:** Uploaded images are publicly accessible via their URL.
- **Account control:** Since you use your own API key, you can manage and delete uploaded images from your imgBB account.

## Checkpoints

Checkpoints are points in the squad pipeline where the agent pauses and asks for your approval before continuing. They are implemented as **instructions in the agent pipeline** (prompt-level), not as programmatic guards in the framework code.

The actual permission enforcement depends on the host IDE:
- **Claude Code:** Has its own permission layer that gates tool use (file writes, bash commands, browser actions).
- **Cursor, VS Code + Copilot:** Have their own approval mechanisms for agent actions.
- **Other IDEs:** Check your IDE's documentation for how agent permissions are handled.

opensquad's checkpoints instruct the agent to stop and ask — the host IDE enforces whether the agent can proceed without asking.

## Skills

Skills are opensquad's extension system. A skill is a directory containing a `SKILL.md` file with instructions that are injected into the agent context at runtime.

### Security model

- **No cryptographic verification:** Skills are not signed or hashed. Installation checks only for the presence of `skills/<name>/SKILL.md`.
- **Execution scope by type:**
  - `prompt` — Influences agent behavior through instructions only.
  - `script` — Can execute bash commands with the **full permissions of the local user**.
  - `mcp` — Can connect to external servers and receives tokens from `.env`.
  - `hybrid` — Combination of script and MCP capabilities.
- **Official catalog:** Skills from the official catalog (installed via `npx opensquad install <name>`) are maintained in the opensquad repository.
- **Community skills:** Community-submitted skills go through code review before being accepted into the official catalog.
- **Third-party skills:** If you install skills from other sources, review the `SKILL.md` and any scripts before use.

### Best practices

- Review `SKILL.md` and `scripts/` of any skill before installing from untrusted sources.
- Check which environment variables a skill requires (listed in the SKILL.md frontmatter `env:` field).
- Be cautious with `script` and `hybrid` type skills — they can execute arbitrary commands.

## Token Consumption

opensquad is free and open source software. However, running squads consumes AI tokens from your IDE or AI provider, which are typically paid.

- Every squad run consumes tokens. The amount depends on the number of agents, pipeline complexity, and model tier.
- Sherlock investigations and image generation are especially token-intensive.
- The framework loads system prompts, best practices, and agent instructions into context on every run.
- Each new skill or best-practice guide added to the project increases the base context size.

Monitor your usage in your IDE or AI provider dashboard.

## Reporting Security Issues

If you find a security vulnerability in opensquad, please open an issue at [github.com/renatoasse/opensquad/issues](https://github.com/renatoasse/opensquad/issues) or contact the maintainer directly.

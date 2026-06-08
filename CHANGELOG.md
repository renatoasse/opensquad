# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.15] - 2026-04-10

### Added
- Gemini CLI IDE support — templates, settings merge, and Playwright MCP config
- Qwen Code IDE support — templates, settings merge, and Playwright MCP config
- Trae IDE support — rules and MCP config templates
- New IDEs listed in README compatibility table (PT-BR and EN)
- Post-init instructions for Gemini CLI, Qwen Code, and Trae
- Locale strings for new IDE setup steps (en, es, pt-BR)
- Tests covering new IDE template installation and settings merge

## [0.1.14] - 2026-03-30

### Added
- Resend email skill — send emails through Resend's MCP server (single, batch, scheduling, attachments)
- "Para quem?" and "O que da pra fazer?" sections in README
- IDE working directory note in README English section

### Fixed
- `.gitignore` and `.npmignore` updated to exclude test artifacts and local settings

## [0.1.13] - 2026-03-30

Major release with security, transparency, and token optimization improvements — inspired by the thorough audit from [@morpheus-zion](https://github.com/morpheus-zion) in [#18](https://github.com/renatoasse/opensquad/issues/18). Thank you for the contribution that directly shaped this release.

### Added
- SECURITY.md covering browser sessions, image hosting, skills, checkpoints, and tokens
- Token cost warning displayed in README and during `npx opensquad init`
- "About" section in README with maintainer disclosure
- Skill security checklist in CONTRIBUTING.md
- Token consumption impact section in CONTRIBUTING.md
- Browser session consent — Sherlock now asks before persisting cookies
- Bash validation gates in runner (pre-step input + post-step output)
- `/opensquad` command files for Cursor and OpenCode IDEs
- OpenCode template with AGENTS.md
- Template designer skill with image-based design and guidelines
- Squad memory system (`memories.md` + `runs.md` per squad)
- File links included when requesting user approval
- All squad creation options contextualized with examples
- Investigation always offered as an option during discovery

### Changed
- **Dashboard fully rewritten from PixiJS to Phaser** with pixel art sprite assets
- Isometric office layout with furniture, walls, and depth sorting
- Gender-aware character assignment with proper sprite sheets
- Image hosting migrated from catbox.moe to imgBB (user-owned API key)
- Sherlock refactored from monolithic prompt into platform-specific extractors
- Squad creation refactored into phased orchestration (discovery → design → build)
- Investigation depth reduced from 5-10 to max 3 posts per profile
- Checkpoint description rewritten (semantic instructions, not programmatic guards)
- Antigravity templates rewritten (rules + workflows, inline subagent fallback)
- Hardcoded model names removed — generic tiers across all IDEs
- Template designer uses direct image rendering instead of a server
- Template duplication eliminated — init/update copy from canonical sources
- Architect uses natural language, auto-detects tools
- Research phase tightened with efficiency directives
- Runner handoff sleep delay (3s) removed
- image-generator skill renamed to image-ai-generator
- Artificial agent count limit removed in design phase
- Performance modes removed, agile philosophy adopted
- `README.md` protected from overwrite on init
- `.bak` backups created before overwriting on update

### Fixed
- Squad name collisions prevented; template preview links fixed
- Round-robin gender-aware character assignment in dashboard
- Template designer runs server in background on Windows

## [0.1.12] - 2026-03-22

### Added
- Isometric office scene with depth sorting and furniture placement
- Phaser-based dashboard replacing PixiJS procedural rendering
- AgentSprite with avatar animations and status badges
- Template designer skill with HTTP server, image guidelines, and base templates
- Platform-specific Sherlock extractors (split from monolithic prompt)
- Phased squad creation workflow (discovery, design, build)
- Gender-aware sprite selection with male/female character sets
- Memory system: auto-generated `memories.md` and `runs.md` per squad
- Dashboard design skill Phase 7: full sprite review workflow
- Pre-step input validation and post-step output validation bash gates in runner

### Changed
- Dashboard rewritten from PixiJS to Phaser game engine
- Sherlock prompt split into platform-specific files
- Architect communication style updated to natural language
- Template duplication eliminated: init/update now copy from canonical sources
- Character sprites renamed to Male1-4/Female1-6

### Fixed
- Gray backgrounds removed from sprites
- Dashboard skill loop guards and trigger scope tightened
- Memory step ordering and reverse-chron log clarified

## [0.1.11] - 2026-03-20

### Added
- Dashboard visual upgrade: Gather.town-level detail with name cards, desk accessories, and detailed workstations
- Character sprites rewritten at 48x48 with shading, working, and done poses
- Image generator skill added

### Changed
- Runner output path transformation improved for task-based execution chains

### Fixed
- Instagram publisher: use `CAROUSEL` instead of `CAROUSEL_ALBUM`
- Update command now auto-imports skills with env requirements
- Runner: fix sequencing, placeholder convention, and checkpoint outputFile paths

## [0.1.10] - 2026-03-18

### Fixed
- Dashboard validates `state.json` before sending to frontend

## [0.1.9] - 2026-03-17

### Added
- Dashboard HTTP polling fallback with `/api/snapshot` REST endpoint
- `runs` command for execution history
- State.json archival to output folder after pipeline completion
- CLI execution logger
- ESLint and GitHub Actions CI
- CONTRIBUTING.md with philosophy, contribution paths, and governance

### Changed
- SquadWatcher plugin callers converted to async IO
- Process-local metadata cache added for agents and skills
- Dashboard file watching switched from `fs.watch` to chokidar

### Fixed
- Dashboard StrictMode WebSocket error resolved
- 5 failing test expectations corrected
- Node v24 CI test pattern fixed (single glob)
- `ERR_FS_CP_EINVAL` prevented when running init from inside the opensquad repo

## [0.1.8] - 2026-03-12

_Version bump only (syncing opensquad-version to 0.1.7)._

## [0.1.7] - 2026-03-12

_Tag-only release._

## [0.1.5] - 2026-03-11

### Added
- Cursor IDE support: locale strings, rules, MCP config, and `.cursorignore`
- VS Code Copilot IDE support with `mergeVsCodeSettings()` and `opensquad.prompt.md`
- Codex agent skill for `$opensquad` in Codex CLI

### Changed
- Removed OpenCode and Windsurf from init IDE options

### Fixed
- Missing `skills/` directory entry in Cursor rules template
- Architect: blocking outputFile path check in Gate 3
- Pipeline PATH RULE: researcher outputFile must use `output/`, not `pipeline/data/`
- Architect: creator owns angle generation for news-based squads

## [0.1.4] - 2026-03-05

### Added
- Opensquad Skills Engine and related workflows
- Single bilingual README template (PT/EN)

### Changed
- OpenSquad renamed to Opensquad in README template

## [0.1.1] - 2026-03-05

### Fixed
- Normalize bin path and repository URL in `package.json`

## [0.1.0] - 2026-02-23

### Added
- Initial release
- npm package with `npx opensquad init` CLI
- Architect agent (Atlas) and Pipeline Runner
- Instagram Content Creator squad (definition, 4 agents, 6-step pipeline)
- Prompt templates: researcher, writer, reviewer, analyst
- SquadOS skill entry point and CLAUDE.md instructions
- 30 template files with full test coverage

[Unreleased]: https://github.com/renatoasse/opensquad/compare/v0.1.13...HEAD
[0.1.13]: https://github.com/renatoasse/opensquad/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/renatoasse/opensquad/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/renatoasse/opensquad/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/renatoasse/opensquad/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/renatoasse/opensquad/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/renatoasse/opensquad/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/renatoasse/opensquad/compare/v0.1.5...v0.1.7
[0.1.5]: https://github.com/renatoasse/opensquad/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/renatoasse/opensquad/compare/v0.1.1...v0.1.4
[0.1.1]: https://github.com/renatoasse/opensquad/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/renatoasse/opensquad/releases/tag/v0.1.0

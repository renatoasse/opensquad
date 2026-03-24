# Technology Stack

**Analysis Date:** 2026-03-24

## Languages

**Primary:**
- JavaScript (ES modules) - Root CLI and orchestration code in `bin/opensquad.js` and `src/*.js`

**Secondary:**
- TypeScript 5.8.x - Dashboard app in `dashboard/src/*.ts` and `dashboard/src/*.tsx`
- Python 3 - `skills/image-generator/scripts/generate.py`
- Markdown/YAML - Skills, agent prompts, configs, and squad definitions in `skills/*/SKILL.md`, `_opensquad/**/*.md`, and `_opensquad/**/*.yaml`

## Runtime

**Environment:**
- Node.js 20+ - Required by the root package in `package.json`
- Browser runtime - Required for the dashboard in `dashboard/`
- Python 3 - Required for the image generation skill script

**Package Manager:**
- npm - Used by the root project and dashboard project
- Lockfiles: `package-lock.json` at the root and `dashboard/package-lock.json`

## Frameworks

**Core:**
- None for the CLI itself - the root package is a Node.js ESM binary with bundled skills and templates
- React 19.1.x - Dashboard UI in `dashboard/src/App.tsx`
- PixiJS 8.9.x with `@pixi/react` 8.0.x - Visual scene rendering in `dashboard/src/office/*`

**Testing:**
- Node test runner - Root tests in `tests/*.test.js` run via `node --test`
- No dedicated frontend test framework is configured in `dashboard/`

**Build/Dev:**
- ESLint 10.x - Root linting via `eslint.config.js` and `npm run lint`
- TypeScript 5.8.x - Dashboard type-check/build via `dashboard/tsconfig.json`
- Vite 6.3.x - Dashboard dev server and production bundle in `dashboard/vite.config.ts`
- `@vitejs/plugin-react` 4.5.x - React transform for the dashboard
- `chokidar` 4.x and `ws` 8.x - Live squad file watching and WebSocket transport in `dashboard/src/plugin/squadWatcher.ts`

## Key Dependencies

**Critical:**
- `@inquirer/checkbox`, `@inquirer/input`, `@inquirer/select` - Interactive CLI setup and skill selection in `src/prompt.js` and `src/init.js`
- `react`, `react-dom`, `@pixi/react`, `pixi.js`, `zustand`, `yaml` - Dashboard rendering, state management, and squad YAML parsing
- `ws` - WebSocket server for the live dashboard bridge
- `chokidar` - Filesystem watcher for `squads/` changes

**Infrastructure:**
- Node.js built-ins (`fs`, `path`, `child_process`, `url`) - Initialization, template copying, and skill installation in `src/init.js`, `src/update.js`, and `src/skills.js`
- `typescript` and `vite` - Dashboard build pipeline

## Configuration

**Environment:**
- Root CLI has no mandatory runtime env vars
- Skill-specific env vars are declared in `skills/*/SKILL.md`; the main ones are `APIFY_TOKEN`, `BLOTATO_API_KEY`, `OPENROUTER_API_KEY`, `INSTAGRAM_ACCESS_TOKEN`, and `INSTAGRAM_USER_ID`
- Optional `.env`-based setup is documented in `.env.example`

**Build:**
- Root CLI and packaged templates are driven by `package.json`
- Dashboard build config lives in `dashboard/vite.config.ts` and `dashboard/tsconfig.json`
- Browser automation support is scaffolded through `templates/package.json`, `templates/_opensquad/config/playwright.config.json`, and `_opensquad/config/playwright.config.json`

## Platform Requirements

**Development:**
- Node.js 20+ and npm
- Chromium is installed during init via `npx playwright install chromium` in `src/init.js`
- Dashboard dev mode expects a browser and a local Vite server

**Production:**
- CLI distributed as an npm package via the root `package.json`
- Dashboard ships as static Vite output from `dashboard/`
- Generated squads inherit Playwright/browser automation support from the templates in `templates/`

---

*Stack analysis: 2026-03-24*
*Update after major dependency changes*

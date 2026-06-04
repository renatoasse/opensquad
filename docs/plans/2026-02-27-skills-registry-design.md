# Skills Registry — Design Document

**Date:** 2026-02-27
**Status:** Approved

## Problem

Opensquad is expected to grow to 100+ skills. Bundling all skills inside the npm package forces every user to download content they don't need. Skills should be distributed on-demand, outside the installed package.

## Approach

GitHub Raw Content + Static Manifest (zero infrastructure, CDN-backed, no rate limits).

Skills live in a `skills/` folder in the main opensquad GitHub repository (not in `templates/`). A `manifest.json` lists all available skills. Users browse and install only what they want, via CLI or `/opensquad`.

## Repository Structure

```
opensquad/
├── skills/                           ← NEW (not in templates, never copied to users)
│   ├── manifest.json                 ← central registry of all skills
│   ├── social-media-calendar/
│   │   └── SKILL.md
│   ├── seo-optimizer/
│   │   └── SKILL.md
│   └── ...
├── templates/                        ← UNCHANGED
│   └── .claude/skills/opensquad/SKILL.md
├── src/
│   ├── skills.js                     ← NEW — fetch/install/remove logic
│   ├── init.js
│   └── update.js
└── bin/
    └── opensquad.js                    ← updated with new subcommands
```

## manifest.json Format

```json
{
  "version": "1",
  "skills": [
    {
      "id": "social-media-calendar",
      "name": "Social Media Calendar",
      "description": "Creates weekly content calendars for social media platforms",
      "category": "marketing",
      "version": "1.0.0"
    }
  ]
}
```

**Base URL constant** (in `src/skills.js`):
```js
const REGISTRY_BASE = 'https://raw.githubusercontent.com/<owner>/opensquad/main';
const MANIFEST_URL = `${REGISTRY_BASE}/skills/manifest.json`;
// Skill file: `${REGISTRY_BASE}/skills/${id}/SKILL.md`
```

## CLI Commands

New subcommands registered in `bin/opensquad.js`, logic in `src/skills.js`:

| Command | Action |
|---|---|
| `opensquad skills list` | Fetch manifest, show available vs installed |
| `opensquad skills install <id>` | Download SKILL.md → `.claude/skills/<id>/SKILL.md` |
| `opensquad skills remove <id>` | Delete `.claude/skills/<id>/` |
| `opensquad skills update` | Re-download all installed skills |

**`skills list` output:**
```
  📦 Opensquad Skills Registry

  Installed:
  ✓ social-media-calendar   Social Media Calendar     v1.0.0

  Available:
  ○ email-marketing         Email Campaign Builder    v1.0.0
  ○ youtube-scripts         YouTube Script Writer     v1.0.0

  Install with: opensquad skills install <id>
```

"Installed" is detected by checking if `.claude/skills/<id>/` exists in the current directory — no tracking file needed.

## /opensquad Skill Integration

New menu item added to the main opensquad skill:

```
  ❯ 1. Create a new squad
    2. Run a squad
    3. Edit a squad
    4. Skills — Browse & install
    5. Help
```

**Flow when user selects "Skills":**
1. `WebFetch` manifest URL
2. `Glob` `.claude/skills/*/` to detect installed skills
3. Show list with installed/available status
4. User selects a skill to install
5. `WebFetch` the skill's `SKILL.md`
6. `Write` to `.claude/skills/<id>/SKILL.md`
7. Confirm: *"✓ Installed. Use `/<id>` now."*

To remove: user selects installed skill → `Bash` deletes the directory.

## Error Handling

| Situation | Behavior |
|---|---|
| Manifest unreachable | Clear message: "Could not reach skills registry. Check your connection." |
| Skill already installed (`install`) | Ask: "Already installed. Update to latest?" |
| `.claude/skills/` doesn't exist | Created automatically |
| Skill removed from registry but installed locally | Shows as "local only" in `list`, keeps working |
| `skills update` — skill no longer in registry | Warns, preserves local copy |

## Out of Scope

- Community skill publishing (MVP: Opensquad team only)
- Global install (`~/.claude/skills/`) — project-level only
- Skill dependencies
- Skill versioning beyond what's in the manifest

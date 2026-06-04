---
name: agent-browser
description: "Browser automation for AI agents via inference.sh. Navigate web pages, interact with elements using @e refs, take screenshots, record video. Capabilities: web scraping, form filling, clicking, typing, drag-drop, file upload, JavaScript execution. Use for: web automation, data extraction, testing, agent browsing, research. Triggers: browser, web automation, scrape, navigate, click, fill form, screenshot, browse web, playwright, headless browser, web agent, surf internet, record video"
allowed-tools: Bash(infsh *)
---

# Agentic Browser

Browser automation for AI agents via [inference.sh](https://inference.sh). Uses Playwright under the hood with a simple `@e` ref system for element interaction.

![Agentic Browser](https://cloud.inference.sh/app/files/u/4mg21r6ta37mpaz6ktzwtt8krr/01kgjw8atdxgkrsr8a2t5peq7b.jpeg)

## Quick Start

> Requires inference.sh CLI (`infsh`). [Install instructions](https://raw.githubusercontent.com/inference-sh/skills/refs/heads/main/cli-install.md)

```bash
infsh login

# Open a page and get interactive elements
infsh app run agent-browser --function open --input '{"url": "https://example.com"}' --session new
```


## Core Workflow

Every browser automation follows this pattern:

1. **Open** - Navigate to URL, get `@e` refs for elements
2. **Interact** - Use refs to click, fill, drag, etc.
3. **Re-snapshot** - After navigation/changes, get fresh refs
4. **Close** - End session (returns video if recording)

```bash
# 1. Start session
RESULT=$(infsh app run agent-browser --function open --session new --input '{
  "url": "https://example.com/login"
}')
SESSION_ID=$(echo $RESULT | jq -r '.session_id')
# Elements: @e1 [input] "Email", @e2 [input] "Password", @e3 [button] "Sign In"

# 2. Fill and submit
infsh app run agent-browser --function interact --session $SESSION_ID --input '{
  "action": "fill", "ref": "@e1", "text": "user@example.com"
}'
infsh app run agent-browser --function interact --session $SESSION_ID --input '{
  "action": "fill", "ref": "@e2", "text": "password123"
}'
infsh app run agent-browser --function interact --session $SESSION_ID --input '{
  "action": "click", "ref": "@e3"
}'

# 3. Re-snapshot after navigation
infsh app run agent-browser --function snapshot --session $SESSION_ID --input '{}'

# 4. Close when done
infsh app run agent-browser --function close --session $SESSION_ID --input '{}'
```

## Functions

| Function | Description |
|----------|-------------|
| `open` | Navigate to URL, configure browser (viewport, proxy, video recording) |
| `snapshot` | Re-fetch page state with `@e` refs after DOM changes |
| `interact` | Perform actions using `@e` refs (click, fill, drag, upload, etc.) |
| `screenshot` | Take page screenshot (viewport or full page) |
| `execute` | Run JavaScript code on the page |
| `close` | Close session, returns video if recording was enabled |

## Interact Actions

| Action | Description | Required Fields |
|--------|-------------|-----------------|
| `click` | Click element | `ref` |
| `dblclick` | Double-click element | `ref` |
| `fill` | Clear and type text | `ref`, `text` |
| `type` | Type text (no clear) | `text` |
| `press` | Press key (Enter, Tab, etc.) | `text` |
| `select` | Select dropdown option | `ref`, `text` |
| `hover` | Hover over element | `ref` |
| `check` | Check checkbox | `ref` |
| `uncheck` | Uncheck checkbox | `ref` |
| `drag` | Drag and drop | `ref`, `target_ref` |
| `upload` | Upload file(s) | `ref`, `file_paths` |
| `scroll` | Scroll page | `direction` (up/down/left/right), `scroll_amount` |
| `back` | Go back in history | - |
| `wait` | Wait milliseconds | `wait_ms` |
| `goto` | Navigate to URL | `url` |

## Element Refs

Elements are returned with `@e` refs:

```
@e1 [a] "Home" href="/"
@e2 [input type="text"] placeholder="Search"
@e3 [button] "Submit"
@e4 [select] "Choose option"
@e5 [input type="checkbox"] name="agree"
```

**Important:** Refs are invalidated after navigation. Always re-snapshot after:
- Clicking links/buttons that navigate
- Form submissions
- Dynamic content loading

## Features

### Video Recording

Record browser sessions for debugging or documentation:

```bash
# Start with recording enabled (optionally show cursor indicator)
SESSION=$(infsh app run agent-browser --function open --session new --input '{
  "url": "https://example.com",
  "record_video": true,
  "show_cursor": true
}' | jq -r '.session_id')

# ... perform actions ...

# Close to get the video file
infsh app run agent-browser --function close --session $SESSION --input '{}'
# Returns: {"success": true, "video": <File>}
```

### Cursor Indicator

Show a visible cursor in screenshots and video (useful for demos):

```bash
infsh app run agent-browser --function open --session new --input '{
  "url": "https://example.com",
  "show_cursor": true,
  "record_video": true
}'
```

The cursor appears as a red dot that follows mouse movements and shows click feedback.

### Proxy Support

Route traffic through a proxy server:

```bash
infsh app run agent-browser --function open --session new --input '{
  "url": "https://example.com",
  "proxy_url": "http://proxy.example.com:8080",
  "proxy_username": "user",
  "proxy_password": "pass"
}'
```

### File Upload

Upload files to file inputs:

```bash
infsh app run agent-browser --function interact --session $SESSION --input '{
  "action": "upload",
  "ref": "@e5",
  "file_paths": ["/path/to/file.pdf"]
}'
```

### Drag and Drop

Drag elements to targets:

```bash
infsh app run agent-browser --function interact --session $SESSION --input '{
  "action": "drag",
  "ref": "@e1",
  "target_ref": "@e2"
}'
```

### JavaScript Execution

Run custom JavaScript:

```bash
infsh app run agent-browser --function execute --session $SESSION --input '{
  "code": "document.querySelectorAll(\"h2\").length"
}'
# Returns: {"result": "5", "screenshot": <File>}
```

## Deep-Dive Documentation

| Reference | Description |
|-----------|-------------|
| [references/commands.md](references/commands.md) | Full function reference with all options |
| [references/snapshot-refs.md](references/snapshot-refs.md) | Ref lifecycle, invalidation rules, troubleshooting |
| [references/session-management.md](references/session-management.md) | Session persistence, parallel sessions |
| [references/authentication.md](references/authentication.md) | Login flows, OAuth, 2FA handling |
| [references/video-recording.md](references/video-recording.md) | Recording workflows for debugging |
| [references/proxy-support.md](references/proxy-support.md) | Proxy configuration, geo-testing |

## Ready-to-Use Templates

| Template | Description |
|----------|-------------|
| [templates/form-automation.sh](templates/form-automation.sh) | Form filling with validation |
| [templates/authenticated-session.sh](templates/authenticated-session.sh) | Login once, reuse session |
| [templates/capture-workflow.sh](templates/capture-workflow.sh) | Content extraction with screenshots |

## Examples

### Form Submission

```bash
SESSION=$(infsh app run agent-browser --function open --session new --input '{
  "url": "https://example.com/contact"
}' | jq -r '.session_id')

# Get elements: @e1 [input] "Name", @e2 [input] "Email", @e3 [textarea], @e4 [button] "Send"

infsh app run agent-browser --function interact --session $SESSION --input '{"action": "fill", "ref": "@e1", "text": "John Doe"}'
infsh app run agent-browser --function interact --session $SESSION --input '{"action": "fill", "ref": "@e2", "text": "john@example.com"}'
infsh app run agent-browser --function interact --session $SESSION --input '{"action": "fill", "ref": "@e3", "text": "Hello!"}'
infsh app run agent-browser --function interact --session $SESSION --input '{"action": "click", "ref": "@e4"}'

infsh app run agent-browser --function snapshot --session $SESSION --input '{}'
infsh app run agent-browser --function close --session $SESSION --input '{}'
```

### Search and Extract

```bash
SESSION=$(infsh app run agent-browser --function open --session new --input '{
  "url": "https://google.com"
}' | jq -r '.session_id')

infsh app run agent-browser --function interact --session $SESSION --input '{"action": "fill", "ref": "@e1", "text": "weather today"}'
infsh app run agent-browser --function interact --session $SESSION --input '{"action": "press", "text": "Enter"}'
infsh app run agent-browser --function interact --session $SESSION --input '{"action": "wait", "wait_ms": 2000}'

infsh app run agent-browser --function snapshot --session $SESSION --input '{}'
infsh app run agent-browser --function close --session $SESSION --input '{}'
```

### Screenshot with Video

```bash
SESSION=$(infsh app run agent-browser --function open --session new --input '{
  "url": "https://example.com",
  "record_video": true
}' | jq -r '.session_id')

# Take full page screenshot
infsh app run agent-browser --function screenshot --session $SESSION --input '{
  "full_page": true
}'

# Close and get video
RESULT=$(infsh app run agent-browser --function close --session $SESSION --input '{}')
echo $RESULT | jq '.video'
```

## Sessions

Browser state persists within a session. Always:

1. Start with `--session new` on first call
2. Use returned `session_id` for subsequent calls
3. Close session when done

## Related Skills

```bash
# Web search (for research + browse)
npx skills add inference-sh/skills@web-search

# LLM models (analyze extracted content)
npx skills add inference-sh/skills@llm-models
```

## Documentation

- [inference.sh Sessions](https://inference.sh/docs/extend/sessions) - Session management
- [Multi-function Apps](https://inference.sh/docs/extend/multi-function-apps) - How functions work


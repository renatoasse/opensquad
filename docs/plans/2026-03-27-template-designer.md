# Template Designer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a self-contained skill that opens a local visual companion for interactive image template selection during squad creation.

**Architecture:** Pure Node.js HTTP server (zero deps) serves HTML templates in a browser. The agent adapts 3 base models to squad context, shows them to the user, iterates on feedback, then saves the approved template as HTML reference + structured style rules into the squad's pipeline data.

**Tech Stack:** Node.js (http, fs, path modules only), HTML/CSS, Bash scripts

---

## File Structure

```
skills/template-designer/
  ├── SKILL.md                      ← Skill definition (type: hybrid)
  ├── scripts/
  │   ├── server.js                 ← HTTP server (~120 lines, pure Node.js)
  │   ├── start-server.sh           ← Start script (Windows/Linux/bg handling)
  │   ├── stop-server.sh            ← Manual shutdown
  │   ├── frame-template.html       ← HTML wrapper (dark theme, CSS, layout)
  │   └── helper.js                 ← Client-side JS (click reporting)
  └── base-templates/
      ├── model-a.html              ← Base model A (user-approved)
      ├── model-b.html              ← Base model B (user-approved)
      └── model-c.html              ← Base model C (user-approved)
```

---

### Task 1: HTTP Server (`scripts/server.js`)

**Files:**
- Create: `skills/template-designer/scripts/server.js`
- Create: `skills/template-designer/scripts/frame-template.html`
- Create: `skills/template-designer/scripts/helper.js`

- [ ] **Step 1: Create `server.js`**

The server must:
- Bind to `127.0.0.1` on a random high port
- Accept `TEMPLATE_DIR` (content dir), `TEMPLATE_STATE_DIR` (state dir), `TEMPLATE_HOST` (bind host), `TEMPLATE_URL_HOST` (display host), `TEMPLATE_OWNER_PID` (parent process PID) from environment
- On startup, write `server-info.json` to `TEMPLATE_STATE_DIR` with `{ type, port, url, content_dir, state_dir }`
- Serve the newest `.html` file from `TEMPLATE_DIR` by modification time
- If the HTML file does NOT start with `<!DOCTYPE` or `<html`, wrap it in `frame-template.html` (read from same directory as `server.js`). Otherwise serve as-is but inject `helper.js` before `</body>`.
- Serve `helper.js` at path `/helper.js`
- Handle POST `/event` — append JSON body as a line to `TEMPLATE_STATE_DIR/events.jsonl`, clearing the file when the served HTML file changes
- Track last request time. Every 60 seconds, check if 30 minutes have elapsed since last request. If so, write `server-stopped` to `TEMPLATE_STATE_DIR` and exit.
- Also check every 60 seconds if `TEMPLATE_OWNER_PID` is still alive (using `process.kill(pid, 0)` in a try/catch). If the owner is gone, shut down.

```js
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = process.env.TEMPLATE_DIR;
const STATE_DIR = process.env.TEMPLATE_STATE_DIR;
const BIND_HOST = process.env.TEMPLATE_HOST || '127.0.0.1';
const URL_HOST = process.env.TEMPLATE_URL_HOST || 'localhost';
const OWNER_PID = parseInt(process.env.TEMPLATE_OWNER_PID || '0', 10);
const TIMEOUT_MS = 30 * 60 * 1000;
const SCRIPT_DIR = __dirname;

let lastRequestTime = Date.now();
let lastServedFile = null;

function getNewestHtml() {
  try {
    const files = fs.readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(CONTENT_DIR, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    return files.length > 0 ? files[0].name : null;
  } catch { return null; }
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

function wrapInFrame(content) {
  const frame = readFile(path.join(SCRIPT_DIR, 'frame-template.html'));
  if (!frame) return content;
  return frame.replace('<!-- CONTENT -->', content);
}

function injectHelper(html) {
  const tag = '<script src="/helper.js"></script>';
  if (html.includes('</body>')) return html.replace('</body>', tag + '\n</body>');
  return html + '\n' + tag;
}

const server = http.createServer((req, res) => {
  lastRequestTime = Date.now();

  if (req.method === 'POST' && req.url === '/event') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const eventsFile = path.join(STATE_DIR, 'events.jsonl');
        fs.appendFileSync(eventsFile, body.trim() + '\n');
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(500);
        res.end('{"error":"' + e.message + '"}');
      }
    });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.url === '/helper.js') {
    const js = readFile(path.join(SCRIPT_DIR, 'helper.js'));
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(js || '');
    return;
  }

  // Serve newest HTML
  const newest = getNewestHtml();
  if (!newest) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body style="background:#111;color:#aaa;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>Waiting for content...</p></body></html>');
    return;
  }

  // Clear events when served file changes
  if (newest !== lastServedFile) {
    lastServedFile = newest;
    const eventsFile = path.join(STATE_DIR, 'events.jsonl');
    try { fs.writeFileSync(eventsFile, ''); } catch {}
  }

  let html = readFile(path.join(CONTENT_DIR, newest));
  if (!html) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const isFullDoc = html.trimStart().startsWith('<!DOCTYPE') || html.trimStart().startsWith('<html');
  if (isFullDoc) {
    html = injectHelper(html);
  } else {
    html = wrapInFrame(html);
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

// Find random port
server.listen(0, BIND_HOST, () => {
  const port = server.address().port;
  const info = JSON.stringify({
    type: 'server-started',
    port,
    host: BIND_HOST,
    url_host: URL_HOST,
    url: `http://${URL_HOST}:${port}`,
    content_dir: CONTENT_DIR,
    state_dir: STATE_DIR
  });
  fs.writeFileSync(path.join(STATE_DIR, 'server-info.json'), info);
  console.log(info);
});

// Inactivity timeout + owner check
const checker = setInterval(() => {
  const elapsed = Date.now() - lastRequestTime;
  let ownerGone = false;
  if (OWNER_PID > 0) {
    try { process.kill(OWNER_PID, 0); } catch { ownerGone = true; }
  }
  if (elapsed > TIMEOUT_MS || ownerGone) {
    try { fs.writeFileSync(path.join(STATE_DIR, 'server-stopped'), ''); } catch {}
    clearInterval(checker);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000);
  }
}, 60000);
checker.unref();
```

- [ ] **Step 2: Create `helper.js`**

Client-side script injected into every page. Reports clicks on `[data-choice]` elements back to the server.

```js
(function() {
  function reportEvent(type, data) {
    fetch('/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ type: type, timestamp: Math.floor(Date.now()/1000) }, data))
    }).catch(function() {});
  }

  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-choice]');
    if (!el) return;
    var choice = el.getAttribute('data-choice');
    var text = el.textContent.trim().substring(0, 200);

    // Toggle selection
    var container = el.closest('.options, .cards');
    var isMulti = container && container.hasAttribute('data-multiselect');
    if (!isMulti && container) {
      container.querySelectorAll('[data-choice]').forEach(function(opt) {
        opt.classList.remove('selected');
      });
    }
    el.classList.toggle('selected');

    // Update indicator
    var selected = document.querySelectorAll('[data-choice].selected');
    var indicator = document.getElementById('selection-indicator');
    if (indicator) {
      if (selected.length > 0) {
        var labels = Array.from(selected).map(function(s) { return s.getAttribute('data-choice').toUpperCase(); });
        indicator.textContent = 'Selected: ' + labels.join(', ');
        indicator.style.display = 'block';
      } else {
        indicator.style.display = 'none';
      }
    }

    reportEvent('click', { choice: choice, text: text });
  });

  // Auto-refresh: poll for content changes
  var currentUrl = location.href;
  setInterval(function() {
    fetch(currentUrl, { method: 'HEAD' }).then(function(r) {
      var lm = r.headers.get('last-modified');
      if (lm && window._lastMod && lm !== window._lastMod) {
        location.reload();
      }
      window._lastMod = lm;
    }).catch(function() {});
  }, 2000);
})();
```

- [ ] **Step 3: Create `frame-template.html`**

The HTML wrapper with dark theme CSS, layout classes, and selection indicator. Content fragments are injected at `<!-- CONTENT -->`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Designer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 2rem;
    }

    /* Header */
    .frame-header {
      text-align: center;
      padding: 1rem 0 2rem;
      border-bottom: 1px solid #222;
      margin-bottom: 2rem;
    }
    .frame-header h1 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #888;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* Typography */
    h2 { font-size: 1.8rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
    h3 { font-size: 1.2rem; font-weight: 600; color: #ddd; margin-bottom: 0.5rem; }
    p { line-height: 1.6; color: #bbb; }
    .subtitle { font-size: 1rem; color: #888; margin-bottom: 1.5rem; }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #666; }
    .section { margin-bottom: 2rem; }

    /* Options (A/B/C choices) */
    .options { display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0; }
    .option {
      display: flex; align-items: flex-start; gap: 1rem;
      padding: 1.2rem; border: 1px solid #2a2a2a; border-radius: 12px;
      cursor: pointer; transition: all 0.2s ease;
      background: #111;
    }
    .option:hover { border-color: #444; background: #1a1a1a; }
    .option.selected { border-color: #7c3aed; background: #1a1028; }
    .option .letter {
      flex-shrink: 0; width: 2rem; height: 2rem; border-radius: 8px;
      background: #1e1e1e; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem; color: #888;
    }
    .option.selected .letter { background: #7c3aed; color: #fff; }
    .option .content { flex: 1; }
    .option .content h3 { margin-bottom: 0.3rem; }
    .option .content p { font-size: 0.9rem; color: #888; }

    /* Cards (visual designs) */
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 1.5rem 0; }
    .card {
      border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;
      cursor: pointer; transition: all 0.2s ease; background: #111;
    }
    .card:hover { border-color: #444; transform: translateY(-2px); }
    .card.selected { border-color: #7c3aed; box-shadow: 0 0 20px rgba(124,58,237,0.15); }
    .card-image { padding: 1rem; background: #0d0d0d; min-height: 200px; }
    .card-body { padding: 1rem; }
    .card-body h3 { margin-bottom: 0.3rem; }
    .card-body p { font-size: 0.85rem; color: #888; }

    /* Mockup container */
    .mockup {
      border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;
      margin: 1rem 0; background: #111;
    }
    .mockup-header {
      padding: 0.6rem 1rem; background: #1a1a1a; border-bottom: 1px solid #2a2a2a;
      font-size: 0.8rem; color: #666;
    }
    .mockup-body { padding: 1rem; }

    /* Split view */
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1rem 0; }

    /* Pros/Cons */
    .pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
    .pros, .cons { padding: 1rem; border-radius: 8px; }
    .pros { background: #0a1a0a; border: 1px solid #1a3a1a; }
    .cons { background: #1a0a0a; border: 1px solid #3a1a1a; }
    .pros h4 { color: #4ade80; } .cons h4 { color: #f87171; }
    .pros ul, .cons ul { padding-left: 1.2rem; margin-top: 0.5rem; }
    .pros li, .cons li { font-size: 0.9rem; margin-bottom: 0.3rem; }

    /* Selection indicator */
    #selection-indicator {
      position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
      background: #7c3aed; color: #fff; padding: 0.6rem 1.5rem;
      border-radius: 999px; font-size: 0.9rem; font-weight: 600;
      display: none; z-index: 100; box-shadow: 0 4px 20px rgba(124,58,237,0.4);
    }
  </style>
</head>
<body>
  <div class="frame-header">
    <h1>Template Designer</h1>
  </div>

  <!-- CONTENT -->

  <div id="selection-indicator"></div>
  <script src="/helper.js"></script>
</body>
</html>
```

- [ ] **Step 4: Test the server manually**

Run: `cd skills/template-designer/scripts && node -e "require('./server.js')"` — this won't work because env vars are missing. Instead, test by creating a temp content dir and running:

```bash
mkdir -p /tmp/td-test/content /tmp/td-test/state
echo '<h2>Test</h2><div class="options"><div class="option" data-choice="a" onclick="toggleSelect(this)"><div class="letter">A</div><div class="content"><h3>Test A</h3></div></div></div>' > /tmp/td-test/content/test.html
cd skills/template-designer/scripts
TEMPLATE_DIR=/tmp/td-test/content TEMPLATE_STATE_DIR=/tmp/td-test/state TEMPLATE_HOST=127.0.0.1 TEMPLATE_URL_HOST=localhost TEMPLATE_OWNER_PID=$$ node server.js &
sleep 2
cat /tmp/td-test/state/server-info.json
```

Expected: JSON with `type: "server-started"`, a port number, and a URL.
Open the URL in browser — should see "Test" heading with option A on dark background.

Kill the server: `kill $(cat /tmp/td-test/state/server.pid 2>/dev/null) 2>/dev/null; kill %1 2>/dev/null`

- [ ] **Step 5: Commit**

```bash
git add skills/template-designer/scripts/server.js skills/template-designer/scripts/frame-template.html skills/template-designer/scripts/helper.js
git commit -m "feat(template-designer): add HTTP server, frame template, and helper JS"
```

---

### Task 2: Shell Scripts (`start-server.sh`, `stop-server.sh`)

**Files:**
- Create: `skills/template-designer/scripts/start-server.sh`
- Create: `skills/template-designer/scripts/stop-server.sh`

- [ ] **Step 1: Create `start-server.sh`**

Handles session directory creation, Windows detection, foreground/background modes. Accepts `--session-dir <path>` (required — the squad's `_build/template-session` path).

```bash
#!/usr/bin/env bash
# Start the template designer server
# Usage: start-server.sh --session-dir <path> [--host <bind-host>] [--url-host <display-host>] [--foreground]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

SESSION_DIR=""
FOREGROUND="false"
BIND_HOST="127.0.0.1"
URL_HOST=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --session-dir)
      SESSION_DIR="$2"
      shift 2
      ;;
    --host)
      BIND_HOST="$2"
      shift 2
      ;;
    --url-host)
      URL_HOST="$2"
      shift 2
      ;;
    --foreground|--no-daemon)
      FOREGROUND="true"
      shift
      ;;
    *)
      echo "{\"error\": \"Unknown argument: $1\"}"
      exit 1
      ;;
  esac
done

if [[ -z "$SESSION_DIR" ]]; then
  echo '{"error": "--session-dir is required"}'
  exit 1
fi

if [[ -z "$URL_HOST" ]]; then
  if [[ "$BIND_HOST" == "127.0.0.1" || "$BIND_HOST" == "localhost" ]]; then
    URL_HOST="localhost"
  else
    URL_HOST="$BIND_HOST"
  fi
fi

# Windows/Git Bash auto-foreground
case "${OSTYPE:-}" in
  msys*|cygwin*|mingw*) FOREGROUND="true" ;;
esac
if [[ -n "${MSYSTEM:-}" ]]; then
  FOREGROUND="true"
fi

CONTENT_DIR="${SESSION_DIR}/content"
STATE_DIR="${SESSION_DIR}/state"
PID_FILE="${STATE_DIR}/server.pid"
LOG_FILE="${STATE_DIR}/server.log"

mkdir -p "$CONTENT_DIR" "$STATE_DIR"

# Kill existing server if any
if [[ -f "$PID_FILE" ]]; then
  old_pid=$(cat "$PID_FILE")
  kill "$old_pid" 2>/dev/null
  rm -f "$PID_FILE"
fi

# Resolve owner PID
OWNER_PID="$(ps -o ppid= -p "$PPID" 2>/dev/null | tr -d ' ')"
if [[ -z "$OWNER_PID" || "$OWNER_PID" == "1" ]]; then
  OWNER_PID="$PPID"
fi

if [[ "$FOREGROUND" == "true" ]]; then
  echo "$$" > "$PID_FILE"
  env TEMPLATE_DIR="$CONTENT_DIR" TEMPLATE_STATE_DIR="$STATE_DIR" TEMPLATE_HOST="$BIND_HOST" TEMPLATE_URL_HOST="$URL_HOST" TEMPLATE_OWNER_PID="$OWNER_PID" node "$SCRIPT_DIR/server.js"
  exit $?
fi

# Background mode
nohup env TEMPLATE_DIR="$CONTENT_DIR" TEMPLATE_STATE_DIR="$STATE_DIR" TEMPLATE_HOST="$BIND_HOST" TEMPLATE_URL_HOST="$URL_HOST" TEMPLATE_OWNER_PID="$OWNER_PID" node "$SCRIPT_DIR/server.js" > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null
echo "$SERVER_PID" > "$PID_FILE"

# Wait for startup
for i in {1..50}; do
  if [[ -f "$STATE_DIR/server-info.json" ]]; then
    cat "$STATE_DIR/server-info.json"
    exit 0
  fi
  sleep 0.1
done

echo '{"error": "Server failed to start within 5 seconds"}'
exit 1
```

- [ ] **Step 2: Create `stop-server.sh`**

```bash
#!/usr/bin/env bash
# Stop the template designer server
# Usage: stop-server.sh <session-dir>

SESSION_DIR="$1"
if [[ -z "$SESSION_DIR" ]]; then
  echo "Usage: stop-server.sh <session-dir>"
  exit 1
fi

PID_FILE="${SESSION_DIR}/state/server.pid"
STATE_DIR="${SESSION_DIR}/state"

if [[ -f "$PID_FILE" ]]; then
  pid=$(cat "$PID_FILE")
  kill "$pid" 2>/dev/null
  rm -f "$PID_FILE"
  echo "" > "${STATE_DIR}/server-stopped"
  echo "Server stopped (pid $pid)"
else
  echo "No server running (no PID file found)"
fi
```

- [ ] **Step 3: Make scripts executable and test `start-server.sh`**

```bash
chmod +x skills/template-designer/scripts/start-server.sh skills/template-designer/scripts/stop-server.sh
```

On Windows (Git Bash), test with `run_in_background: true`:

```bash
bash skills/template-designer/scripts/start-server.sh --session-dir /tmp/td-test2
```

Expected: JSON output with server-started info, or on Windows foreground mode it blocks (use `run_in_background`). Read `/tmp/td-test2/state/server-info.json` to verify.

Then stop:

```bash
bash skills/template-designer/scripts/stop-server.sh /tmp/td-test2
```

Expected: "Server stopped (pid NNNN)"

- [ ] **Step 4: Commit**

```bash
git add skills/template-designer/scripts/start-server.sh skills/template-designer/scripts/stop-server.sh
git commit -m "feat(template-designer): add start/stop shell scripts"
```

---

### Task 3: Base Template Placeholders

**Files:**
- Create: `skills/template-designer/base-templates/model-a.html`
- Create: `skills/template-designer/base-templates/model-b.html`
- Create: `skills/template-designer/base-templates/model-c.html`

**Note:** These are placeholder files. The actual templates will be designed with the user via the visual companion and approved before being committed. The placeholders establish the file structure and contain a minimal example so the skill is functional during development.

- [ ] **Step 1: Create placeholder `model-a.html`**

A minimal 1080x1440 template placeholder. This is NOT the final design — just enough to validate the server pipeline works end-to-end.

```html
<!-- Model A: Placeholder — awaiting user approval for final design -->
<div style="width:1080px;height:1440px;background:#0d0d0d;color:#fff;font-family:sans-serif;padding:60px;display:flex;flex-direction:column;justify-content:space-between;">
  <div>
    <div style="font-size:18px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:20px;">Category Tag</div>
    <h1 style="font-size:52px;font-weight:900;line-height:1.1;margin-bottom:24px;">
      Headline text goes here with <span style="color:#F59E0B;">highlighted words</span>
    </h1>
    <p style="font-size:28px;color:#aaa;line-height:1.5;">Supporting body text that provides context and detail about the topic.</p>
  </div>
  <div style="display:flex;align-items:center;gap:16px;padding-top:24px;border-top:1px solid #222;">
    <div style="width:48px;height:48px;border-radius:50%;background:#333;"></div>
    <span style="font-size:18px;color:#888;">@username</span>
  </div>
</div>
```

- [ ] **Step 2: Create placeholder `model-b.html`**

```html
<!-- Model B: Placeholder — awaiting user approval for final design -->
<div style="width:1080px;height:1440px;background:#ffffff;color:#111;font-family:sans-serif;padding:60px;display:flex;flex-direction:column;justify-content:space-between;">
  <div>
    <div style="font-size:18px;color:#7C3AED;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:20px;">Category Tag</div>
    <h1 style="font-size:52px;font-weight:900;line-height:1.1;margin-bottom:24px;color:#111;">
      Headline text goes here with <span style="color:#7C3AED;">highlighted words</span>
    </h1>
    <p style="font-size:28px;color:#555;line-height:1.5;">Supporting body text that provides context and detail about the topic.</p>
  </div>
  <div style="display:flex;align-items:center;gap:16px;padding-top:24px;border-top:1px solid #eee;">
    <div style="width:48px;height:48px;border-radius:50%;background:#ddd;"></div>
    <span style="font-size:18px;color:#888;">@username</span>
  </div>
</div>
```

- [ ] **Step 3: Create placeholder `model-c.html`**

```html
<!-- Model C: Placeholder — awaiting user approval for final design -->
<div style="width:1080px;height:1440px;background:linear-gradient(135deg,#1a0533,#0d0d0d);color:#fff;font-family:sans-serif;padding:60px;display:flex;flex-direction:column;justify-content:space-between;">
  <div>
    <div style="font-size:18px;color:#F59E0B;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:20px;">Category Tag</div>
    <h1 style="font-size:52px;font-weight:900;line-height:1.1;margin-bottom:24px;">
      Headline text goes here with <span style="background:linear-gradient(90deg,#F59E0B,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">highlighted words</span>
    </h1>
    <p style="font-size:28px;color:#ccc;line-height:1.5;">Supporting body text that provides context and detail about the topic.</p>
  </div>
  <div style="display:flex;align-items:center;gap:16px;padding-top:24px;border-top:1px solid #333;">
    <div style="width:48px;height:48px;border-radius:50%;background:#333;"></div>
    <span style="font-size:18px;color:#888;">@username</span>
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add skills/template-designer/base-templates/
git commit -m "feat(template-designer): add placeholder base templates (awaiting user approval)"
```

---

### Task 4: SKILL.md

**Files:**
- Create: `skills/template-designer/SKILL.md`

- [ ] **Step 1: Create `SKILL.md`**

```yaml
---
name: template-designer
description: Interactive visual template selection for image design agents. Opens a local browser companion to choose, refine, and approve visual identity templates.
type: hybrid
version: "1.0.0"
script:
  path: scripts/start-server.sh
  runtime: bash
categories: [design, visual, templates]
---
```

Then the markdown body with full instructions for the agent. This is the longest file — it teaches the agent everything it needs to do.

```markdown
# Template Designer

Interactive visual companion for selecting and refining image templates during squad creation.

## When to Use

- During squad creation: when the Design phase identifies an image design agent and the user opts to choose a template
- During squad editing: when the user asks to define, edit, or change the visual identity / template of a design agent
- Trigger: presence of `image-creator` skill (or similar image-producing skill) in the squad's skill list

## Prerequisites

- A squad with a design agent that produces images (uses `image-creator` skill)
- Squad's `_build/` directory must exist (created during Discovery/Design phases)
- Node.js available in PATH

## How It Works

1. You start a local HTTP server that shows HTML templates in the browser
2. You read the base templates from `skills/template-designer/base-templates/`
3. You adapt them to the squad's context (platform, domain, tone, Sherlock data)
4. The user views templates in the browser and gives feedback in the terminal
5. You iterate until the user approves
6. You save the approved template as HTML reference + structured style rules
7. The server dies by inactivity timeout (30 min)

## Starting the Server

### On Windows (Git Bash)

The script auto-detects Windows and runs in foreground mode. Use `run_in_background: true` on the Bash tool call:

~~~
bash skills/template-designer/scripts/start-server.sh --session-dir "squads/{code}/_build/template-session"
~~~

Then read `squads/{code}/_build/template-session/state/server-info.json` on your next turn to get the URL and port.

### On macOS/Linux

~~~
bash skills/template-designer/scripts/start-server.sh --session-dir "squads/{code}/_build/template-session"
~~~

The script backgrounds the server and prints the JSON with URL.

### Server Info

After starting, read `squads/{code}/_build/template-session/state/server-info.json`:
~~~json
{"type":"server-started","port":52341,"url":"http://localhost:52341","content_dir":"...","state_dir":"..."}
~~~

Tell the user to open the URL in their browser.

## Generating Templates

### Step 1: Read Context

Read these files to understand the squad:
- `squads/{code}/_build/discovery.yaml` — platform, domain, tone, language
- `squads/{code}/_build/design.yaml` — agents, purpose, skills
- `squads/{code}/_investigations/consolidated-analysis.md` (if exists) — visual patterns from reference profiles

### Step 2: Read Base Templates

Read the 3 base templates from `skills/template-designer/base-templates/`:
- `model-a.html`
- `model-b.html`
- `model-c.html`

### Step 3: Generate Adapted Variations

For each base template, create an adapted version:
- Adjust colors to match the squad's domain/brand (use Sherlock palette if available)
- Adjust typography for the target platform
- Replace example content with domain-relevant content
- Resize viewport if the target is not 1080x1440 (e.g., 1080x1080 for posts, 1080x1920 for stories)
- Add any visual elements that match the squad's personality

Write each adapted template as a **content fragment** (no `<!DOCTYPE>` or `<html>` — the server wraps it in the frame template automatically).

### Step 4: Write to Content Directory

Use the Write tool to create HTML files in the `content_dir` from `server-info.json`:

- First batch: `templates-overview.html` — shows all 3 adapted templates as cards for selection
- Individual views: `template-a.html`, `template-b.html`, `template-c.html` — full-size previews

The server automatically serves the newest file.

### Available CSS Classes (from frame template)

Cards for template selection:
~~~html
<div class="cards">
  <div class="card" data-choice="a" onclick="toggleSelect(this)">
    <div class="card-image"><!-- scaled-down template preview --></div>
    <div class="card-body"><h3>Name</h3><p>Description</p></div>
  </div>
</div>
~~~

Options for A/B/C choices:
~~~html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content"><h3>Title</h3><p>Description</p></div>
  </div>
</div>
~~~

## Iteration Loop

1. **Write HTML** to a new file in `content_dir` (use Write tool, never cat/heredoc)
2. **Tell user** what's on screen and remind them of the URL
3. **Wait for user response** in terminal
4. **Read events** from `state_dir/events.jsonl` (if exists) to see browser clicks
5. **Generate new version** based on feedback — write as new file (e.g., `template-v2.html`, `template-v3.html`)
6. **Repeat** until user approves

File naming: use semantic names, never reuse. Append version suffix for iterations.

When returning to terminal-only questions (no visual needed), push a waiting screen:
~~~html
<!-- waiting.html -->
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">Continuing in terminal...</p>
</div>
~~~

## Saving the Approved Template

When the user approves, create two files:

### 1. Template Reference HTML

Save to: `squads/{code}/pipeline/data/template-reference.html`

The complete, self-contained HTML/CSS of the approved template at full resolution (e.g., 1080x1440). This is the literal example the design agent will use.

### 2. Visual Identity Rules

Save to: `squads/{code}/pipeline/data/visual-identity.md`

Extract structured rules from the approved template:

~~~markdown
# Visual Identity

## Color Palette
- **Primary:** #HEXCODE — usage description
- **Secondary:** #HEXCODE — usage description
- **Background:** #HEXCODE
- **Text:** #HEXCODE
- **Accent:** #HEXCODE — usage description

## Typography
- **Headings:** Font Family, weight, size range
- **Body:** Font Family, weight, size range
- **Caption:** Font Family, weight, size range
- **Minimum sizes:** body 32px, caption 24px, heading 48px

## Layout
- **Viewport:** WIDTHxHEIGHT px
- **Padding:** value
- **Grid:** description
- **Spacing rules:** description

## Composition Rules
- Logo/profile placement: description
- Image treatment: description
- Visual hierarchy: description
- Footer/CTA pattern: description

## Adaptation Rules
- How to handle different viewport sizes
- What stays fixed vs. what adapts
- Color usage rules (when to use primary vs accent)
~~~

### 3. Update Squad Files

If the squad is being created (Build phase hasn't run yet):
- The design.yaml context now includes the template data — Build will pick it up

If the squad already exists (editing flow):
- Add `pipeline/data/template-reference.html` and `pipeline/data/visual-identity.md` to `squad.yaml` `data:` list
- Update the design agent's `.agent.md` to reference both files
- Update the design agent's tasks to include the rule: "always follow visual-identity.md and use template-reference.html as the base model"

## Stopping the Server

The server auto-stops after 30 minutes of inactivity. For manual stop:

~~~
bash skills/template-designer/scripts/stop-server.sh "squads/{code}/_build/template-session"
~~~

## Checking Server Status

Before writing content, verify the server is alive:
- Check if `state_dir/server-info.json` exists AND `state_dir/server-stopped` does NOT exist
- If stopped, restart with `start-server.sh`
```

- [ ] **Step 2: Commit**

```bash
git add skills/template-designer/SKILL.md
git commit -m "feat(template-designer): add SKILL.md with full agent instructions"
```

---

### Task 5: Architect Integration

**Files:**
- Modify: `_opensquad/core/prompts/design.prompt.md` (add template selection offer after Phase G)
- Modify: `_opensquad/core/architect.agent.yaml` (add template-designer awareness to edit-squad workflow)

- [ ] **Step 1: Read current `design.prompt.md`**

Read the full file to find the exact insertion point. The template selection offer goes after Phase G (Design Presentation), right before the phase outputs `design.yaml`.

- [ ] **Step 2: Add Phase G.5 to `design.prompt.md`**

After the Design Presentation section (Phase G), add a conditional section:

```markdown
### Phase G.5: Template Selection (Optional)

**Condition:** The design includes an agent with the `image-creator` skill (or any image-producing skill).

If this condition is met, after the user approves the design in Phase G, present:

> "O squad inclui um agente de design de imagens. Quer escolher um template visual agora para definir a identidade visual? Você pode fazer isso depois também, pedindo para editar o template do designer."

- **If Yes:** Read and follow the instructions in `skills/template-designer/SKILL.md`. The template selection process takes over until the user approves a template. The approved template data (template-reference.html path and visual-identity.md path) should be included in the design.yaml output so the Build phase can reference them.

- **If No:** Continue to Build phase. Add a note to design.yaml: `template_selection: skipped` so the Build phase knows no template was chosen.

After template selection completes (or is skipped), proceed to output design.yaml as normal.
```

- [ ] **Step 3: Add template-designer awareness to `architect.agent.yaml`**

In the `edit-squad` workflow section, add awareness that the user might ask to edit templates:

```markdown
    edit-squad: |
      ## Edit Squad Workflow
      1. Ask which squad to edit (list available squads if not specified)
      2. Read the squad's squad.yaml to understand current structure
      3. Ask what changes the user wants
      4. **If the user asks to edit/define/change the visual template or identity of a design agent:**
         - Read and follow `skills/template-designer/SKILL.md`
         - If `template-reference.html` and `visual-identity.md` already exist in the squad's `pipeline/data/`, load them as the starting point
      5. Modify the relevant files (agent .md files, pipeline steps, squad.yaml)
      6. Present summary of changes
      7. Confirm with user
```

- [ ] **Step 4: Commit**

```bash
git add _opensquad/core/prompts/design.prompt.md _opensquad/core/architect.agent.yaml
git commit -m "feat(architect): integrate template-designer skill into design and edit flows"
```

---

### Task 6: End-to-End Validation

**Files:** None (testing only)

- [ ] **Step 1: Verify skill file structure**

```bash
find skills/template-designer -type f | sort
```

Expected:
```
skills/template-designer/SKILL.md
skills/template-designer/base-templates/model-a.html
skills/template-designer/base-templates/model-b.html
skills/template-designer/base-templates/model-c.html
skills/template-designer/scripts/frame-template.html
skills/template-designer/scripts/helper.js
skills/template-designer/scripts/server.js
skills/template-designer/scripts/start-server.sh
skills/template-designer/scripts/stop-server.sh
```

- [ ] **Step 2: Test full server lifecycle**

```bash
# Create a test session dir
TEST_DIR="/tmp/td-e2e-test"

# Start server
bash skills/template-designer/scripts/start-server.sh --session-dir "$TEST_DIR"

# Verify server-info.json exists
cat "$TEST_DIR/state/server-info.json"

# Write a test template to content dir
# (use Write tool to create $TEST_DIR/content/test-template.html with a simple card layout)

# Open URL in browser and verify it renders
# Click an option and verify events.jsonl gets written
cat "$TEST_DIR/state/events.jsonl"

# Stop server
bash skills/template-designer/scripts/stop-server.sh "$TEST_DIR"

# Verify server-stopped exists
ls "$TEST_DIR/state/server-stopped"
```

- [ ] **Step 3: Verify architect integration**

Read `_opensquad/core/prompts/design.prompt.md` and confirm Phase G.5 is present and correctly placed.
Read `_opensquad/core/architect.agent.yaml` and confirm edit-squad workflow includes template-designer awareness.

- [ ] **Step 4: Clean up test artifacts**

```bash
rm -rf /tmp/td-test /tmp/td-test2 /tmp/td-e2e-test
```

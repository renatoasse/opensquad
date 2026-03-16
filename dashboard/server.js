/**
 * Standalone dashboard server — serves the built dashboard with real-time
 * WebSocket updates and HTTP polling fallback.
 *
 * Usage:
 *   node server.js [--port 3737] [--squads-dir ../squads]
 */
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { watch as chokidarWatch } from "chokidar";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CLI args ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { port: 3737, squadsDir: "" };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      opts.port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--squads-dir" && args[i + 1]) {
      opts.squadsDir = args[i + 1];
      i++;
    }
  }
  return opts;
}

// ─── Squad directory resolution ──────────────────────────────────────────────

function resolveSquadsDir(hint) {
  if (hint && fs.existsSync(hint)) return path.resolve(hint);

  const candidates = [
    path.resolve(process.cwd(), "../squads"),
    path.resolve(process.cwd(), "squads"),
    path.resolve(__dirname, "../squads"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../squads");
}

// ─── Squad discovery ─────────────────────────────────────────────────────────

function discoverSquads(squadsDir) {
  if (!fs.existsSync(squadsDir)) return [];

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  const squads = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(squadsDir, entry.name, "squad.yaml");
    if (fs.existsSync(yamlPath)) {
      try {
        const raw = fs.readFileSync(yamlPath, "utf-8");
        const parsed = parseYaml(raw);
        const s = parsed?.squad;
        if (s) {
          squads.push({
            code: typeof s.code === "string" ? s.code : entry.name,
            name: typeof s.name === "string" ? s.name : entry.name,
            description: typeof s.description === "string" ? s.description : "",
            icon: typeof s.icon === "string" ? s.icon : "\u{1F4CB}",
            agents: Array.isArray(s.agents)
              ? s.agents.filter((a) => typeof a === "string")
              : [],
          });
          continue;
        }
      } catch {
        console.warn(`[dashboard] failed to parse ${yamlPath}, using defaults`);
      }
    }

    squads.push({
      code: entry.name,
      name: entry.name,
      description: "",
      icon: "\u{1F4CB}",
      agents: [],
    });
  }

  return squads;
}

function readActiveStates(squadsDir) {
  const states = {};
  if (!fs.existsSync(squadsDir)) return states;

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(squadsDir, entry.name, "state.json");
    if (!fs.existsSync(statePath)) continue;

    try {
      const raw = fs.readFileSync(statePath, "utf-8");
      states[entry.name] = JSON.parse(raw);
    } catch {
      // Skip invalid JSON (partial write in progress)
    }
  }

  return states;
}

function buildSnapshot(squadsDir) {
  return {
    type: "SNAPSHOT",
    squads: discoverSquads(squadsDir),
    activeStates: readActiveStates(squadsDir),
  };
}

// ─── Static file serving ─────────────────────────────────────────────────────

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function serveStatic(distDir, req, res) {
  // Decode URL and strip query strings
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch {
    res.writeHead(400);
    res.end("Bad Request");
    return true;
  }

  let filePath = path.resolve(path.join(distDir, urlPath === "/" ? "/index.html" : urlPath));

  // Security: prevent directory traversal (check resolved path)
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return true;
  }

  try {
    // If path doesn't exist or is a directory, serve index.html (SPA fallback)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      return false; // Let caller handle 404
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": mimeType });
    res.end(content);
    return true;
  } catch {
    res.writeHead(500);
    res.end("Internal Server Error");
    return true;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const opts = parseArgs();
const squadsDir = resolveSquadsDir(opts.squadsDir);
const distDir = path.resolve(__dirname, "dist");

// Ensure squads directory exists
if (!fs.existsSync(squadsDir)) {
  fs.mkdirSync(squadsDir, { recursive: true });
}

// Check that dist/ exists (dashboard must be built first)
if (!fs.existsSync(distDir)) {
  console.error(
    "[dashboard] dist/ not found. Run 'npm run build' before 'npm start'.",
  );
  process.exit(1);
}

console.log(`[dashboard] squads dir: ${squadsDir}`);
console.log(`[dashboard] serving from: ${distDir}`);

// ─── HTTP Server ─────────────────────────────────────────────────────────────

const httpServer = createServer((req, res) => {
  // REST API: snapshot endpoint (polling fallback)
  if (req.url === "/api/snapshot") {
    try {
      const snapshot = buildSnapshot(squadsDir);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify(snapshot));
    } catch {
      res.writeHead(500);
      res.end("Internal Server Error");
    }
    return;
  }

  // Serve static files from dist/
  if (!serveStatic(distDir, req, res)) {
    res.writeHead(404);
    res.end("Not Found");
  }
});

// ─── WebSocket Server ────────────────────────────────────────────────────────

const wss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", (req, socket, head) => {
  if (req.url === "/__squads_ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws) => {
  try {
    ws.send(JSON.stringify(buildSnapshot(squadsDir)));
  } catch {
    // Connection may have closed immediately
  }
});

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch {
        // Client connection dying — ws library will clean it up
      }
    }
  }
}

// ─── File Watcher (chokidar) ─────────────────────────────────────────────────

const watcher = chokidarWatch(squadsDir, {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 50,
  },
  ignored: [/(^|[/\\])\./, /node_modules/, /output\//],
  depth: 2,
});

function handleFileChange(filePath) {
  const relative = path.relative(squadsDir, filePath).replace(/\\/g, "/");
  const parts = relative.split("/");
  if (parts.length < 2) return;

  const squadName = parts[0];
  const fileName = parts[1];

  if (fileName === "state.json") {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const state = JSON.parse(raw);
      broadcast({ type: "SQUAD_UPDATE", squad: squadName, state });
    } catch {
      // Invalid JSON — next file change will trigger retry
    }
  } else if (fileName === "squad.yaml") {
    broadcast(buildSnapshot(squadsDir));
  }
}

function handleFileRemoval(filePath) {
  const relative = path.relative(squadsDir, filePath).replace(/\\/g, "/");
  const parts = relative.split("/");
  if (parts.length < 2) return;

  const squadName = parts[0];
  const fileName = parts[1];

  if (fileName === "state.json") {
    broadcast({ type: "SQUAD_INACTIVE", squad: squadName });
  } else if (fileName === "squad.yaml") {
    broadcast(buildSnapshot(squadsDir));
  }
}

watcher.on("add", handleFileChange);
watcher.on("change", handleFileChange);
watcher.on("unlink", handleFileRemoval);

// ─── Start ───────────────────────────────────────────────────────────────────

httpServer.listen(opts.port, () => {
  console.log(`[dashboard] listening on http://localhost:${opts.port}`);
  console.log(`[dashboard] WebSocket at ws://localhost:${opts.port}/__squads_ws`);
  console.log(`[dashboard] REST API at http://localhost:${opts.port}/api/snapshot`);
});

// Graceful shutdown
function shutdown() {
  console.log("\n[dashboard] shutting down...");
  watcher.close();
  wss.close();
  httpServer.close(() => process.exit(0));
  // Force exit after 3s if graceful shutdown hangs
  setTimeout(() => process.exit(0), 3000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

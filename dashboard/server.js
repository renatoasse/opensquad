import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { watch } from "chokidar";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "dist");
const SQUADS_DIR = process.env.SQUADS_DIR ?? resolve(__dirname, "../squads");
const PORT = parseInt(process.env.PORT ?? "4000", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

// ── Squad data ──────────────────────────────────────────────────────────

async function discoverSquads(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return []; }

  const squads = [];
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith(".") || e.name.startsWith("_")) continue;
    const yamlPath = join(dir, e.name, "squad.yaml");
    try {
      const raw = await readFile(yamlPath, "utf-8");
      const parsed = parseYaml(raw);
      const s = parsed?.squad;
      if (s) {
        squads.push({
          code: typeof s.code === "string" ? s.code : e.name,
          name: typeof s.name === "string" ? s.name : e.name,
          description: typeof s.description === "string" ? s.description : "",
          icon: typeof s.icon === "string" ? s.icon : "📋",
          agents: Array.isArray(s.agents) ? s.agents.filter(a => typeof a === "string") : [],
        });
        continue;
      }
    } catch { /* fall through */ }
    squads.push({ code: e.name, name: e.name, description: "", icon: "📋", agents: [] });
  }
  return squads;
}

async function readActiveStates(dir) {
  const states = {};
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return states; }

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    try {
      const raw = await readFile(join(dir, e.name, "state.json"), "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed?.status && parsed?.step && Array.isArray(parsed?.agents)) {
        states[e.name] = parsed;
      }
    } catch { /* skip */ }
  }
  return states;
}

async function buildSnapshot() {
  return {
    type: "SNAPSHOT",
    squads: await discoverSquads(SQUADS_DIR),
    activeStates: await readActiveStates(SQUADS_DIR),
  };
}

// ── Static file server ──────────────────────────────────────────────────

async function serveStatic(req, res) {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";

  let filePath = join(DIST, urlPath);

  if (!existsSync(filePath)) {
    filePath = join(DIST, "index.html"); // SPA fallback
  }

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

// ── HTTP server ─────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
    return;
  }

  if (req.url === "/api/snapshot") {
    try {
      const snap = await buildSnapshot();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-cache");
      res.writeHead(200).end(JSON.stringify(snap));
    } catch {
      res.writeHead(500).end("Internal Server Error");
    }
    return;
  }

  await serveStatic(req, res);
});

// ── WebSocket ───────────────────────────────────────────────────────────

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/__squads_ws") {
    wss.handleUpgrade(req, socket, head, ws => wss.emit("connection", ws));
  } else {
    socket.destroy();
  }
});

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(data); } catch { /* dead client */ }
    }
  }
}

wss.on("connection", async ws => {
  try {
    ws.send(JSON.stringify(await buildSnapshot()));
  } catch { /* closed before snapshot */ }
});

// ── File watcher ────────────────────────────────────────────────────────

const watcher = watch(SQUADS_DIR, {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 50 },
  ignored: [/(^|[/\\])\./, /node_modules/, /output[/\\]/],
  depth: 2,
});

watcher.on("add", handleChange);
watcher.on("change", handleChange);
watcher.on("unlink", handleRemove);

function handleChange(filePath) {
  const rel = filePath.replace(SQUADS_DIR + "/", "").replace(/\\/g, "/");
  const parts = rel.split("/");
  if (parts.length < 2) return;
  const [squadName, fileName] = parts;

  if (fileName === "state.json") {
    readFile(filePath, "utf-8").then(raw => {
      const parsed = JSON.parse(raw);
      if (parsed?.status && parsed?.step && Array.isArray(parsed?.agents)) {
        broadcast({ type: "SQUAD_UPDATE", squad: squadName, state: parsed });
      }
    }).catch(() => {});
  } else if (fileName === "squad.yaml") {
    buildSnapshot().then(snap => broadcast(snap)).catch(() => {});
  }
}

function handleRemove(filePath) {
  const rel = filePath.replace(SQUADS_DIR + "/", "").replace(/\\/g, "/");
  const parts = rel.split("/");
  if (parts.length < 2) return;
  const [squadName, fileName] = parts;

  if (fileName === "state.json") {
    broadcast({ type: "SQUAD_INACTIVE", squad: squadName });
  } else if (fileName === "squad.yaml") {
    buildSnapshot().then(snap => broadcast(snap)).catch(() => {});
  }
}

// ── Start ───────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`nhande-agentes listening on :`);
  console.log(`squads dir: ${SQUADS_DIR}`);
});

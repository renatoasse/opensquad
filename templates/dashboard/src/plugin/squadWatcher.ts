import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage, ServerResponse } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { SquadInfo, SquadState, WsMessage } from "../types/state";

function resolveSquadsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../squads"),  // started from dashboard/
    path.resolve(process.cwd(), "squads"),     // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../squads"); // default (will be created on demand)
}

function resolveProjectDir(): string {
  const candidates = [
    path.resolve(process.cwd(), ".."),  // started from dashboard/
    process.cwd(),                       // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "_opensquad"))) return c;
  }
  return path.resolve(process.cwd(), "..");
}

function discoverSquads(squadsDir: string): SquadInfo[] {
  if (!fs.existsSync(squadsDir)) return [];

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  const squads: SquadInfo[] = [];

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
            agents: Array.isArray(s.agents) ? (s.agents as unknown[]).filter((a): a is string => typeof a === "string") : [],
          });
          continue;
        }
      } catch {
        // Fall through to default
      }
    }

    // No squad.yaml or invalid YAML — use directory name as fallback
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

function readActiveStates(squadsDir: string): Record<string, SquadState> {
  const states: Record<string, SquadState> = {};
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
      // Skip invalid JSON
    }
  }

  return states;
}

function buildSnapshot(squadsDir: string): WsMessage {
  return {
    type: "SNAPSHOT",
    squads: discoverSquads(squadsDir),
    activeStates: readActiveStates(squadsDir),
  };
}

function broadcast(wss: WebSocketServer, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// SQLite database access (lazy loaded)
let dbModule: any = null;

async function getDb(projectDir: string) {
  if (!dbModule) {
    try {
      // Dynamic import of the db module
      const dbPath = path.join(projectDir, "src", "db.js");
      if (fs.existsSync(dbPath)) {
        dbModule = await import(dbPath);
        await dbModule.initDb(projectDir);
      }
    } catch (e) {
      console.error("[squad-watcher] Failed to load db module:", e);
    }
  }
  return dbModule;
}

// REST API handlers
async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  projectDir: string
): Promise<boolean> {
  const url = req.url || "";

  if (!url.startsWith("/__api/")) {
    return false;
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const db = await getDb(projectDir);

    if (!db) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: "Database not available" }));
      return true;
    }

    // GET /__api/companies
    if (url === "/__api/companies") {
      const companies = db.listCompanies();
      res.end(JSON.stringify(companies));
      return true;
    }

    // GET /__api/products
    if (url === "/__api/products" || url.startsWith("/__api/products?")) {
      const urlObj = new URL(url, "http://localhost");
      const companyId = urlObj.searchParams.get("company_id");

      const products = companyId
        ? db.listProducts(companyId)
        : db.listAllProducts();

      res.end(JSON.stringify(products));
      return true;
    }

    // GET /__api/squads
    if (url === "/__api/squads" || url.startsWith("/__api/squads?")) {
      const urlObj = new URL(url, "http://localhost");
      const productId = urlObj.searchParams.get("product_id");

      const squads = productId
        ? db.listSquads(productId)
        : db.listAllSquads();

      res.end(JSON.stringify(squads));
      return true;
    }

    // GET /__api/runs/:squadCode
    const runsMatch = url.match(/^\/__api\/runs\/([^/?]+)/);
    if (runsMatch) {
      const squadCode = runsMatch[1];
      const squad = db.getSquadByCode(squadCode);

      if (!squad) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Squad not found" }));
        return true;
      }

      const runs = db.listRuns(squad.id, { limit: 50 });
      res.end(JSON.stringify(runs));
      return true;
    }

    // GET /__api/run/:runId
    const runMatch = url.match(/^\/__api\/run\/([^/?]+)/);
    if (runMatch) {
      const runId = runMatch[1];
      const run = db.getRunById(runId);

      if (!run) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Run not found" }));
        return true;
      }

      const steps = db.listRunSteps(runId);
      res.end(JSON.stringify({ run, steps }));
      return true;
    }

    // GET /__api/context
    if (url === "/__api/context") {
      const context = db.getActiveContext();
      res.end(JSON.stringify(context));
      return true;
    }

    // GET /__api/stats
    if (url === "/__api/stats") {
      const stats = db.getStats();
      res.end(JSON.stringify(stats));
      return true;
    }

    // Unknown API endpoint
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
    return true;

  } catch (e: any) {
    console.error("[squad-watcher] API error:", e);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
    return true;
  }
}

export function squadWatcherPlugin(): Plugin {
  return {
    name: "squad-watcher",
    configureServer(server: ViteDevServer) {
      const squadsDir = resolveSquadsDir();
      const projectDir = resolveProjectDir();
      server.config.logger.info(`[squad-watcher] squads dir: ${squadsDir}`);
      server.config.logger.info(`[squad-watcher] project dir: ${projectDir}`);

      // Create WebSocket server with noServer to avoid intercepting Vite's HMR
      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url === "/__squads_ws") {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
        // Let Vite handle all other upgrade requests (HMR)
      });

      // Send snapshot on new connection
      wss.on("connection", (ws) => {
        ws.send(JSON.stringify(buildSnapshot(squadsDir)));
      });

      // Add middleware for REST API
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleApiRequest(req, res, projectDir);
        if (!handled) {
          next();
        }
      });

      // Ensure squads directory exists
      if (!fs.existsSync(squadsDir)) {
        fs.mkdirSync(squadsDir, { recursive: true });
      }

      // Debounce timers per squad to avoid reading partial writes
      const changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

      // Use native fs.watch with recursive mode — reliable on Windows for
      // files written by external processes (the CLI agent runner).
      const fsWatcher = fs.watch(squadsDir, { recursive: true }, (_event, filename) => {
        if (!filename || typeof filename !== "string") return;

        // Normalize path separators (Windows uses backslashes)
        const normalized = filename.replace(/\\/g, "/");

        if (normalized.endsWith("state.json")) {
          const parts = normalized.split("/");
          const squadName = parts.length >= 2 ? parts[0] : null;
          if (!squadName) return;

          // Debounce to handle rapid writes / partial file states
          clearTimeout(changeTimers.get(squadName));
          changeTimers.set(squadName, setTimeout(() => {
            const statePath = path.join(squadsDir, squadName, "state.json");
            if (!fs.existsSync(statePath)) {
              clearTimeout(changeTimers.get(squadName));
              changeTimers.delete(squadName);
              broadcast(wss, { type: "SQUAD_INACTIVE", squad: squadName });
              return;
            }
            try {
              const raw = fs.readFileSync(statePath, "utf-8");
              const state: SquadState = JSON.parse(raw);
              broadcast(wss, { type: "SQUAD_UPDATE", squad: squadName, state });
            } catch { /* skip invalid JSON during write */ }
          }, 50));

        } else if (normalized.endsWith("squad.yaml")) {
          broadcast(wss, buildSnapshot(squadsDir));
        }
      });

      // Clean up fs watcher when Vite server closes
      server.httpServer?.on("close", () => {
        fsWatcher.close();
        for (const timer of changeTimers.values()) clearTimeout(timer);
      });
    },
  };
}

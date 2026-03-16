import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import fsp from "node:fs/promises";
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

async function discoverSquads(squadsDir: string): Promise<SquadInfo[]> {
  try {
    await fsp.access(squadsDir);
  } catch {
    return [];
  }

  const entries = await fsp.readdir(squadsDir, { withFileTypes: true });
  const squads: SquadInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(squadsDir, entry.name, "squad.yaml");
    try {
      const raw = await fsp.readFile(yamlPath, "utf-8");
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
      // No squad.yaml or invalid YAML — fall through to default
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

async function readActiveStates(squadsDir: string): Promise<Record<string, SquadState>> {
  const states: Record<string, SquadState> = {};
  try {
    await fsp.access(squadsDir);
  } catch {
    return states;
  }

  const entries = await fsp.readdir(squadsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(squadsDir, entry.name, "state.json");

    try {
      const raw = await fsp.readFile(statePath, "utf-8");
      states[entry.name] = JSON.parse(raw);
    } catch {
      // Skip missing or invalid JSON
    }
  }

  return states;
}

async function buildSnapshot(squadsDir: string): Promise<WsMessage> {
  return {
    type: "SNAPSHOT",
    squads: await discoverSquads(squadsDir),
    activeStates: await readActiveStates(squadsDir),
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

export function squadWatcherPlugin(): Plugin {
  return {
    name: "squad-watcher",
    configureServer(server: ViteDevServer) {
      const squadsDir = resolveSquadsDir();
      server.config.logger.info(`[squad-watcher] squads dir: ${squadsDir}`);

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
        buildSnapshot(squadsDir).then((snap) => {
          ws.send(JSON.stringify(snap));
        });
      });

      // Ensure squads directory exists
      fsp.mkdir(squadsDir, { recursive: true }).catch(() => {});

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
            fsp.readFile(statePath, "utf-8").then((raw) => {
              const state: SquadState = JSON.parse(raw);
              broadcast(wss, { type: "SQUAD_UPDATE", squad: squadName, state });
            }).catch(() => {
              // File missing or invalid JSON — treat as inactive
              changeTimers.delete(squadName);
              broadcast(wss, { type: "SQUAD_INACTIVE", squad: squadName });
            });
          }, 50));

        } else if (normalized.endsWith("squad.yaml")) {
          buildSnapshot(squadsDir).then((snap) => broadcast(wss, snap));
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


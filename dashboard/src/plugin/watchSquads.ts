/**
 * Shared squad file-watching logic — used by both Vite plugin (dev) and standalone server (prod).
 */
import fs from "node:fs";
import path from "node:path";
import { watch as chokidarWatch } from "chokidar";
import { parse as parseYaml } from "yaml";
import type { SquadInfo, SquadState, WsMessage } from "../types/state";

// ─── Directory resolution ────────────────────────────────────────────────────

export function resolveSquadsDir(hint?: string): string {
  if (hint && fs.existsSync(hint)) return path.resolve(hint);

  const candidates = [
    path.resolve(process.cwd(), "../squads"),
    path.resolve(process.cwd(), "squads"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // Default — will be created on demand
  return path.resolve(process.cwd(), "../squads");
}

// ─── Discovery helpers ───────────────────────────────────────────────────────

export function discoverSquads(squadsDir: string): SquadInfo[] {
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
            agents: Array.isArray(s.agents)
              ? (s.agents as unknown[]).filter((a): a is string => typeof a === "string")
              : [],
          });
          continue;
        }
      } catch {
        console.warn(`[squad-watcher] failed to parse ${yamlPath}, using defaults`);
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

export function readActiveStates(squadsDir: string): Record<string, SquadState> {
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
      // Skip invalid JSON (partial write in progress)
    }
  }

  return states;
}

export function buildSnapshot(squadsDir: string): WsMessage {
  return {
    type: "SNAPSHOT",
    squads: discoverSquads(squadsDir),
    activeStates: readActiveStates(squadsDir),
  };
}

// ─── Chokidar watcher ────────────────────────────────────────────────────────

export interface WatcherCallbacks {
  onSquadUpdate(squad: string, state: SquadState): void;
  onSquadInactive(squad: string): void;
  onSnapshotChanged(snapshot: WsMessage): void;
}

/**
 * Creates a chokidar watcher on the squads directory.
 * Returns a cleanup function that stops watching.
 */
export function createSquadsWatcher(squadsDir: string, callbacks: WatcherCallbacks): () => void {
  // Ensure squads directory exists
  try {
    if (!fs.existsSync(squadsDir)) {
      fs.mkdirSync(squadsDir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[squad-watcher] could not create ${squadsDir}: ${err}`);
  }

  const watcher = chokidarWatch(squadsDir, {
    ignoreInitial: true,
    // Wait for writes to finish — handles partial JSON from external processes.
    // 300ms stability threshold covers most write scenarios including slow I/O.
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 50,
    },
    // Ignore non-relevant files for performance
    ignored: [
      /(^|[/\\])\./, // dotfiles
      /node_modules/,
      /output\//,
    ],
    depth: 2,
  });

  function handleStateChange(filePath: string) {
    const relative = path.relative(squadsDir, filePath).replace(/\\/g, "/");
    const parts = relative.split("/");
    if (parts.length < 2) return;

    const squadName = parts[0];
    const fileName = parts[1];

    if (fileName === "state.json") {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const state: SquadState = JSON.parse(raw);
        callbacks.onSquadUpdate(squadName, state);
      } catch {
        // Invalid JSON — chokidar's awaitWriteFinish should prevent this,
        // but if it happens the next file change will trigger a retry.
      }
    } else if (fileName === "squad.yaml") {
      callbacks.onSnapshotChanged(buildSnapshot(squadsDir));
    }
  }

  function handleStateRemoval(filePath: string) {
    const relative = path.relative(squadsDir, filePath).replace(/\\/g, "/");
    const parts = relative.split("/");
    if (parts.length < 2) return;

    const squadName = parts[0];
    const fileName = parts[1];

    if (fileName === "state.json") {
      callbacks.onSquadInactive(squadName);
    } else if (fileName === "squad.yaml") {
      callbacks.onSnapshotChanged(buildSnapshot(squadsDir));
    }
  }

  watcher.on("add", handleStateChange);
  watcher.on("change", handleStateChange);
  watcher.on("unlink", handleStateRemoval);

  return () => {
    watcher.close();
  };
}

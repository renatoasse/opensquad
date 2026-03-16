import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import {
  resolveSquadsDir,
  buildSnapshot,
  createSquadsWatcher,
} from "./watchSquads";
import type { WsMessage } from "../types/state";

function broadcast(wss: WebSocketServer, msg: WsMessage) {
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

export function squadWatcherPlugin(): Plugin {
  return {
    name: "squad-watcher",
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) {
        server.config.logger.warn("[squad-watcher] no httpServer — skipping");
        return;
      }

      const squadsDir = resolveSquadsDir();
      server.config.logger.info(`[squad-watcher] squads dir: ${squadsDir}`);

      // Create WebSocket server with noServer to avoid intercepting Vite's HMR
      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on(
        "upgrade",
        (req: IncomingMessage, socket: Duplex, head: Buffer) => {
          if (req.url === "/__squads_ws") {
            wss.handleUpgrade(req, socket, head, (ws) => {
              wss.emit("connection", ws, req);
            });
          }
          // Let Vite handle all other upgrade requests (HMR)
        },
      );

      // Send snapshot on new connection
      wss.on("connection", (ws) => {
        try {
          ws.send(JSON.stringify(buildSnapshot(squadsDir)));
        } catch {
          // Connection may have closed immediately
        }
      });

      // REST API fallback — serves same data over HTTP for polling clients
      server.middlewares.use((req, res, next) => {
        if (req.url === "/api/snapshot") {
          try {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-cache");
            res.end(JSON.stringify(buildSnapshot(squadsDir)));
          } catch (err) {
            res.writeHead(500);
            res.end("Internal Server Error");
          }
          return;
        }
        next();
      });

      // File watcher using chokidar (reliable cross-platform)
      const stopWatcher = createSquadsWatcher(squadsDir, {
        onSquadUpdate(squad, state) {
          broadcast(wss, { type: "SQUAD_UPDATE", squad, state });
        },
        onSquadInactive(squad) {
          broadcast(wss, { type: "SQUAD_INACTIVE", squad });
        },
        onSnapshotChanged(snapshot) {
          broadcast(wss, snapshot);
        },
      });

      // Clean up when Vite server closes
      server.httpServer?.on("close", () => {
        stopWatcher();
      });
    },
  };
}

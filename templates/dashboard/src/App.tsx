import { useState } from "react";
import { useSquadSocket } from "@/hooks/useSquadSocket";
import { SquadSelector } from "@/components/SquadSelector";
import { HierarchySidebar } from "@/components/HierarchySidebar";
import { OfficeScene } from "@/office/OfficeScene";
import { RunHistory } from "@/components/RunHistory";
import { StatusBar } from "@/components/StatusBar";

type SidebarMode = "squads" | "hierarchy";
type MainView = "office" | "history";

export function App() {
  useSquadSocket();

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("squads");
  const [mainView, setMainView] = useState<MainView>("office");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 40,
          minHeight: 40,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-sidebar)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        <span>opensquad Dashboard</span>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setMainView("office")}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              background: mainView === "office" ? "var(--accent)" : "var(--bg-hover)",
              color: mainView === "office" ? "white" : "var(--text-primary)",
            }}
          >
            🏢 Office
          </button>
          <button
            onClick={() => setMainView("history")}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              background: mainView === "history" ? "var(--accent)" : "var(--bg-hover)",
              color: mainView === "history" ? "white" : "var(--text-primary)",
            }}
          >
            📊 History
          </button>
        </div>

        {/* Sidebar toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setSidebarMode("squads")}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              background: sidebarMode === "squads" ? "var(--bg-selected)" : "transparent",
              color: "var(--text-primary)",
            }}
          >
            Squads
          </button>
          <button
            onClick={() => setSidebarMode("hierarchy")}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              background: sidebarMode === "hierarchy" ? "var(--bg-selected)" : "transparent",
              color: "var(--text-primary)",
            }}
          >
            Hierarchy
          </button>
        </div>
      </header>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {sidebarMode === "squads" ? <SquadSelector /> : <HierarchySidebar />}

        {mainView === "office" ? <OfficeScene /> : <RunHistory />}
      </div>

      {/* Footer */}
      <StatusBar />
    </div>
  );
}

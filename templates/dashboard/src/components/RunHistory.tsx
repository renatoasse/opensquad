import { useEffect, useState } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import { useHierarchyStore, type Run, type RunStep } from "@/store/useHierarchyStore";
import { formatTime } from "@/lib/formatTime";

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString();
}

function getStatusIcon(status: string): string {
  switch (status) {
    case "completed":
      return "✅";
    case "running":
      return "🔄";
    case "failed":
      return "❌";
    case "pending":
      return "⏳";
    default:
      return "❔";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "var(--success)";
    case "running":
      return "var(--accent)";
    case "failed":
      return "var(--error)";
    default:
      return "var(--text-secondary)";
  }
}

interface RunItemProps {
  run: Run;
  isSelected: boolean;
  onClick: () => void;
}

function RunItem({ run, isSelected, onClick }: RunItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        cursor: "pointer",
        background: isSelected ? "var(--bg-selected)" : "transparent",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "var(--bg-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span style={{ fontSize: 16 }}>{getStatusIcon(run.status)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {run.topic || "No topic"}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
          {formatDate(run.started_at)}
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
          textAlign: "right",
        }}
      >
        {formatDuration(run.duration_ms)}
      </div>
    </div>
  );
}

interface RunDetailsProps {
  run: Run;
  steps: RunStep[];
}

function RunDetails({ run, steps }: RunDetailsProps) {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 24 }}>{getStatusIcon(run.status)}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{run.topic || "No topic"}</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            Started: {new Date(run.started_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: "var(--bg-sidebar)",
            padding: 12,
            borderRadius: 6,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {run.current_step}/{run.step_count || "?"}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Steps</div>
        </div>
        <div
          style={{
            background: "var(--bg-sidebar)",
            padding: 12,
            borderRadius: 6,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatDuration(run.duration_ms)}</div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Duration</div>
        </div>
        <div
          style={{
            background: "var(--bg-sidebar)",
            padding: 12,
            borderRadius: 6,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: getStatusColor(run.status),
              textTransform: "capitalize",
            }}
          >
            {run.status}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>Status</div>
        </div>
      </div>

      {/* Error message if failed */}
      {run.error_message && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--error)",
            borderRadius: 6,
            padding: 12,
            marginBottom: 16,
            fontSize: 12,
            color: "var(--error)",
          }}
        >
          <strong>Error:</strong> {run.error_message}
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Steps
          </div>
          <div
            style={{
              background: "var(--bg-sidebar)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {steps.map((step) => (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-secondary)", width: 20 }}>
                  #{step.step_number}
                </span>
                <span style={{ fontSize: 14 }}>{getStatusIcon(step.status)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{step.agent_name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    {step.agent_id}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  {formatDuration(step.duration_ms)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function RunHistory() {
  const selectedSquad = useSquadStore((s) => s.selectedSquad);
  const squads = useHierarchyStore((s) => s.squads);
  const runs = useHierarchyStore((s) => s.runs);
  const runSteps = useHierarchyStore((s) => s.runSteps);
  const setRuns = useHierarchyStore((s) => s.setRuns);
  const setRunSteps = useHierarchyStore((s) => s.setRunSteps);
  const selectedRunId = useHierarchyStore((s) => s.selectedRunId);
  const selectRun = useHierarchyStore((s) => s.selectRun);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch runs when squad is selected
  useEffect(() => {
    if (!selectedSquad) {
      setRuns([]);
      return;
    }

    async function fetchRuns() {
      setIsLoading(true);
      try {
        const res = await fetch(`/__api/runs/${selectedSquad}`);
        if (res.ok) {
          const data = await res.json();
          setRuns(data);
        }
      } catch (e) {
        console.error("Failed to fetch runs:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRuns();
  }, [selectedSquad, setRuns]);

  // Fetch run steps when run is selected
  useEffect(() => {
    if (!selectedRunId) return;

    async function fetchSteps() {
      try {
        const res = await fetch(`/__api/run/${selectedRunId}`);
        if (res.ok) {
          const data = await res.json();
          setRunSteps(selectedRunId!, data.steps || []);
        }
      } catch (e) {
        console.error("Failed to fetch run details:", e);
      }
    }

    fetchSteps();
  }, [selectedRunId, setRunSteps]);

  const selectedRun = runs.find((r) => r.id === selectedRunId);
  const selectedSteps = selectedRunId ? runSteps.get(selectedRunId) || [] : [];

  if (!selectedSquad) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-secondary)",
          fontSize: 12,
        }}
      >
        Select a squad to view run history
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-main)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Run History</span>
        <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
          {runs.length} runs
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Run list */}
        <div
          style={{
            width: 280,
            minWidth: 280,
            borderRight: "1px solid var(--border)",
            overflowY: "auto",
          }}
        >
          {isLoading && (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 12,
              }}
            >
              Loading runs...
            </div>
          )}
          {!isLoading && runs.length === 0 && (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 12,
              }}
            >
              No runs yet
            </div>
          )}
          {runs.map((run) => (
            <RunItem
              key={run.id}
              run={run}
              isSelected={run.id === selectedRunId}
              onClick={() => selectRun(run.id)}
            />
          ))}
        </div>

        {/* Run details */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {selectedRun ? (
            <RunDetails run={selectedRun} steps={selectedSteps} />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-secondary)",
                fontSize: 12,
              }}
            >
              Select a run to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

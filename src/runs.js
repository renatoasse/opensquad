import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const MAX_RUNS = 20;
const PROJECT_SQUADS_DIR_PARTS = [
  ['marketing', 'squads'],
  ['squads'],
];

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getProjectSquadsDirCandidates(targetDir) {
  return PROJECT_SQUADS_DIR_PARTS.map((parts) => join(targetDir, ...parts));
}

async function getExistingProjectSquadsDirs(targetDir) {
  const dirs = [];
  for (const dir of getProjectSquadsDirCandidates(targetDir)) {
    if (await pathExists(dir)) {
      dirs.push(dir);
    }
  }
  return dirs;
}

function isRunDirName(name) {
  return /^\d{4}-\d{2}-\d{2}-\d{6}(?:-\d+)?$/.test(name);
}

async function collectProjectSquadDirs(targetDir, squadName) {
  const squadDirsByName = new Map();

  for (const squadsDir of await getExistingProjectSquadsDirs(targetDir)) {
    if (squadName) {
      const squadDir = join(squadsDir, squadName);
      if (!await pathExists(squadDir)) continue;
      squadDirsByName.set(squadName, [...(squadDirsByName.get(squadName) || []), squadDir]);
      continue;
    }

    let entries;
    try {
      entries = await readdir(squadsDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      squadDirsByName.set(entry.name, [
        ...(squadDirsByName.get(entry.name) || []),
        join(squadsDir, entry.name),
      ]);
    }
  }

  return squadDirsByName;
}

export async function listRuns(squadName, targetDir = process.cwd()) {
  const squadDirsByName = await collectProjectSquadDirs(targetDir, squadName);
  const runs = new Map();

  for (const [name, squadDirs] of squadDirsByName) {
    for (const squadDir of squadDirs) {
      const outputDir = join(squadDir, 'output');
      let runDirs;
      try {
        const entries = await readdir(outputDir, { withFileTypes: true });
        runDirs = entries.filter((e) => e.isDirectory() && isRunDirName(e.name)).map((e) => e.name);
      } catch {
        continue;
      }

      for (const runId of runDirs) {
        const runKey = `${name}:${runId}`;
        if (runs.has(runKey)) continue;

        const run = { squad: name, runId, status: 'unknown', steps: null, duration: null };

        try {
          const raw = await readFile(join(outputDir, runId, 'state.json'), 'utf-8');
          const state = JSON.parse(raw);
          run.status = state.status || 'unknown';
          if (state.step) run.steps = `${state.step.current}/${state.step.total}`;
          if (state.startedAt && (state.completedAt || state.failedAt)) {
            const start = new Date(state.startedAt).getTime();
            const end = new Date(state.completedAt || state.failedAt).getTime();
            run.duration = formatDuration(end - start);
          }
        } catch {
          // No state.json or malformed — keep defaults
        }

        runs.set(runKey, run);
      }
    }
  }

  const sortedRuns = [...runs.values()].sort((a, b) => b.runId.localeCompare(a.runId));
  return sortedRuns.slice(0, MAX_RUNS);
}

export function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function printRuns(runs) {
  if (runs.length === 0) {
    console.log('\n  No runs found.\n');
    return;
  }

  let currentSquad = null;
  for (const run of runs) {
    if (run.squad !== currentSquad) {
      currentSquad = run.squad;
      console.log(`\n  ${currentSquad}`);
      console.log('  ' + '─'.repeat(50));
    }
    const parts = [`    ${run.runId}`];
    parts.push(`[${run.status}]`);
    if (run.steps) parts.push(`${run.steps} steps`);
    if (run.duration) parts.push(run.duration);
    console.log(parts.join('  '));
  }
  console.log();
}

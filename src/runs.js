import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadSavedLocale } from './init.js';

const MAX_RUNS = 20;

export async function listRuns(targetDir, squadName) {
  const squadsDir = join(targetDir, 'squads');
  let squadDirs;

  try {
    const entries = await readdir(squadsDir, { withFileTypes: true });
    squadDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }

  if (squadName) {
    squadDirs = squadDirs.filter((d) => d === squadName);
  }

  const allRuns = [];

  for (const squad of squadDirs) {
    const outputDir = join(squadsDir, squad, 'output');
    let runDirs;

    try {
      const entries = await readdir(outputDir, { withFileTypes: true });
      runDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      continue;
    }

    for (const runId of runDirs) {
      const logPath = join(outputDir, runId, 'run-log.json');
      let log = null;

      try {
        const raw = await readFile(logPath, 'utf-8');
        log = JSON.parse(raw);
      } catch {
        // No log file or malformed JSON — use fallback
      }

      if (log) {
        allRuns.push({
          squad,
          runId,
          status: log.status || 'unknown',
          startedAt: log.startedAt || null,
          completedAt: log.completedAt || null,
          stepsCompleted: log.steps ? log.steps.filter((s) => s.status === 'completed').length : 0,
          stepsTotal: log.steps ? log.steps.length : 0,
          durationMs: computeDuration(log),
          error: findLastError(log),
        });
      } else {
        allRuns.push({
          squad,
          runId,
          status: 'unknown',
          startedAt: null,
          completedAt: null,
          stepsCompleted: 0,
          stepsTotal: 0,
          durationMs: null,
          error: null,
        });
      }
    }
  }

  allRuns.sort((a, b) => (b.runId > a.runId ? 1 : b.runId < a.runId ? -1 : 0));

  return allRuns.slice(0, MAX_RUNS);
}

function computeDuration(log) {
  if (!log.startedAt || !log.completedAt) return null;
  const start = new Date(log.startedAt).getTime();
  const end = new Date(log.completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return end - start;
}

function findLastError(log) {
  if (!log.steps || log.steps.length === 0) return null;
  for (let i = log.steps.length - 1; i >= 0; i--) {
    if (log.steps[i].error) return log.steps[i].error;
  }
  return null;
}

export function formatDuration(ms) {
  if (ms == null) return '';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0) return `${min}m${sec.toString().padStart(2, '0')}s`;
  return `${sec}s`;
}

export async function printRuns(targetDir, squadName) {
  await loadSavedLocale(targetDir);

  const runs = await listRuns(targetDir, squadName);

  if (runs.length === 0) {
    if (squadName) {
      console.log(`\n  No runs found for squad "${squadName}".\n`);
    } else {
      console.log('\n  No runs found.\n');
    }
    return;
  }

  console.log('\n  opensquad -- Run History\n');

  const grouped = {};
  for (const run of runs) {
    if (!grouped[run.squad]) grouped[run.squad] = [];
    grouped[run.squad].push(run);
  }

  for (const [squad, squadRuns] of Object.entries(grouped)) {
    console.log(`  ${squad}`);
    console.log('  ' + '\u2500'.repeat(54));

    for (const run of squadRuns) {
      const parts = [`  ${run.runId}`];
      parts.push(run.status.padEnd(10));

      if (run.status === 'unknown') {
        parts.push('(no log file)');
      } else {
        if (run.stepsTotal > 0) {
          parts.push(`${run.stepsCompleted}/${run.stepsTotal} steps`.padEnd(12));
        }
        if (run.durationMs != null) {
          parts.push(formatDuration(run.durationMs));
        }
        if (run.error) {
          parts.push(run.error);
        }
      }

      console.log(parts.join('  '));
    }

    console.log('');
  }
}

import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function logEvent(action, details = {}, targetDir = process.cwd()) {
  try {
    const logDir = join(targetDir, '_opensquad', 'logs');
    await mkdir(logDir, { recursive: true });
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      details,
    });
    await appendFile(join(logDir, 'cli.log'), entry + '\n', 'utf-8');
  } catch {
    // Silent — logging must never break the operation
  }
}

export async function readCliLogs({ action, limit } = {}, targetDir = process.cwd()) {
  try {
    const raw = await readFile(join(targetDir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const lines = raw.trim().split('\n');
    let entries = [];
    for (const line of lines) {
      try {
        entries.push(JSON.parse(line));
      } catch {
        // Skip malformed lines
      }
    }
    entries.reverse(); // newest first
    if (action) entries = entries.filter((e) => e.action === action);
    if (limit) entries = entries.slice(0, limit);
    return entries;
  } catch {
    return [];
  }
}

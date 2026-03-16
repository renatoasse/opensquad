import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const LOG_DIR = '_opensquad/logs';
const LOG_FILE = 'cli.log';

export async function logEvent(targetDir, event) {
  try {
    const logDir = join(targetDir, LOG_DIR);
    await mkdir(logDir, { recursive: true });
    const line = JSON.stringify({
      action: event.action,
      status: event.status,
      detail: event.detail || {},
      timestamp: event.timestamp || new Date().toISOString(),
    }) + '\n';
    await appendFile(join(logDir, LOG_FILE), line, 'utf-8');
  } catch {
    // Silent — never break the operation being logged.
  }
}

export async function readCliLogs(targetDir, options = {}) {
  const { limit, action, since } = options;
  const logPath = join(targetDir, LOG_DIR, LOG_FILE);

  let raw;
  try {
    raw = await readFile(logPath, 'utf-8');
  } catch {
    return [];
  }

  let events = raw
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (action) {
    events = events.filter((e) => e.action === action);
  }

  if (since) {
    events = events.filter((e) => e.timestamp > since);
  }

  events.reverse();

  if (limit && limit > 0) {
    events = events.slice(0, limit);
  }

  return events;
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { logEvent, readCliLogs } from '../src/logger.js';

test('logEvent creates log directory and writes event', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    await logEvent(tempDir, {
      action: 'init',
      status: 'success',
      detail: { ides: ['claude-code'] },
    });

    const logPath = join(tempDir, '_opensquad', 'logs', 'cli.log');
    await stat(logPath);
    const content = await readFile(logPath, 'utf-8');
    const event = JSON.parse(content.trim());
    assert.equal(event.action, 'init');
    assert.equal(event.status, 'success');
    assert.deepEqual(event.detail, { ides: ['claude-code'] });
    assert.ok(event.timestamp);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('logEvent appends multiple events', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    await logEvent(tempDir, { action: 'init', status: 'success' });
    await logEvent(tempDir, { action: 'update', status: 'success' });

    const logPath = join(tempDir, '_opensquad', 'logs', 'cli.log');
    const lines = (await readFile(logPath, 'utf-8')).trim().split('\n');
    assert.equal(lines.length, 2);
    assert.equal(JSON.parse(lines[0]).action, 'init');
    assert.equal(JSON.parse(lines[1]).action, 'update');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('logEvent uses provided timestamp', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    const ts = '2026-01-01T00:00:00Z';
    await logEvent(tempDir, { action: 'init', status: 'success', timestamp: ts });

    const events = await readCliLogs(tempDir);
    assert.equal(events[0].timestamp, ts);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('logEvent silently fails on read-only path', async () => {
  // Passing an invalid path should not throw
  await logEvent('/nonexistent/readonly/path', {
    action: 'init',
    status: 'success',
  });
});

test('readCliLogs returns empty array when no logs exist', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    const events = await readCliLogs(tempDir);
    assert.deepEqual(events, []);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('readCliLogs returns events in reverse chronological order', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    await logEvent(tempDir, { action: 'first', status: 'success', timestamp: '2026-01-01T00:00:00Z' });
    await logEvent(tempDir, { action: 'second', status: 'success', timestamp: '2026-01-02T00:00:00Z' });
    await logEvent(tempDir, { action: 'third', status: 'success', timestamp: '2026-01-03T00:00:00Z' });

    const events = await readCliLogs(tempDir);
    assert.equal(events[0].action, 'third');
    assert.equal(events[1].action, 'second');
    assert.equal(events[2].action, 'first');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('readCliLogs filters by action', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    await logEvent(tempDir, { action: 'init', status: 'success' });
    await logEvent(tempDir, { action: 'update', status: 'success' });
    await logEvent(tempDir, { action: 'init', status: 'success' });

    const events = await readCliLogs(tempDir, { action: 'init' });
    assert.equal(events.length, 2);
    assert.ok(events.every((e) => e.action === 'init'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('readCliLogs filters by since', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    await logEvent(tempDir, { action: 'old', status: 'success', timestamp: '2026-01-01T00:00:00Z' });
    await logEvent(tempDir, { action: 'new', status: 'success', timestamp: '2026-06-01T00:00:00Z' });

    const events = await readCliLogs(tempDir, { since: '2026-03-01T00:00:00Z' });
    assert.equal(events.length, 1);
    assert.equal(events[0].action, 'new');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('readCliLogs respects limit after filtering', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    await logEvent(tempDir, { action: 'init', status: 'success', timestamp: '2026-01-01T00:00:00Z' });
    await logEvent(tempDir, { action: 'init', status: 'success', timestamp: '2026-01-02T00:00:00Z' });
    await logEvent(tempDir, { action: 'init', status: 'success', timestamp: '2026-01-03T00:00:00Z' });

    const events = await readCliLogs(tempDir, { limit: 2 });
    assert.equal(events.length, 2);
    assert.equal(events[0].action, 'init');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('readCliLogs skips malformed log lines', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-logger-'));
  try {
    await logEvent(tempDir, { action: 'valid', status: 'success' });
    // Manually append a broken line
    const { appendFile } = await import('node:fs/promises');
    await appendFile(
      join(tempDir, '_opensquad', 'logs', 'cli.log'),
      'not valid json\n',
      'utf-8',
    );
    await logEvent(tempDir, { action: 'also-valid', status: 'success' });

    const events = await readCliLogs(tempDir);
    assert.equal(events.length, 2);
    assert.equal(events[0].action, 'also-valid');
    assert.equal(events[1].action, 'valid');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

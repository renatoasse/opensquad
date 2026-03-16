import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { listRuns, formatDuration } from '../src/runs.js';

async function createRunLog(baseDir, squad, runId, log) {
  const dir = join(baseDir, 'squads', squad, 'output', runId);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'run-log.json'), JSON.stringify(log), 'utf-8');
}

async function createRunDir(baseDir, squad, runId) {
  const dir = join(baseDir, 'squads', squad, 'output', runId);
  await mkdir(dir, { recursive: true });
}

test('listRuns returns empty array when no squads exist', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    const runs = await listRuns(tempDir);
    assert.deepEqual(runs, []);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns returns empty array when squads dir exists but is empty', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await mkdir(join(tempDir, 'squads'), { recursive: true });
    const runs = await listRuns(tempDir);
    assert.deepEqual(runs, []);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns reads run-log.json and returns structured data', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await createRunLog(tempDir, 'my-squad', '2026-03-15-120000', {
      squad: 'my-squad',
      runId: '2026-03-15-120000',
      status: 'completed',
      startedAt: '2026-03-15T12:00:00Z',
      completedAt: '2026-03-15T12:05:00Z',
      steps: [
        { index: 1, id: 'step-1', status: 'completed' },
        { index: 2, id: 'step-2', status: 'completed' },
      ],
    });

    const runs = await listRuns(tempDir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].squad, 'my-squad');
    assert.equal(runs[0].status, 'completed');
    assert.equal(runs[0].stepsCompleted, 2);
    assert.equal(runs[0].stepsTotal, 2);
    assert.equal(runs[0].durationMs, 300000);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns uses fallback for runs without run-log.json', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await createRunDir(tempDir, 'my-squad', '2026-03-14-090000');

    const runs = await listRuns(tempDir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, 'unknown');
    assert.equal(runs[0].stepsCompleted, 0);
    assert.equal(runs[0].durationMs, null);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns handles malformed run-log.json as fallback', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    const dir = join(tempDir, 'squads', 'my-squad', 'output', '2026-03-14-090000');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'run-log.json'), 'not valid json', 'utf-8');

    const runs = await listRuns(tempDir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, 'unknown');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns sorts by runId descending', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await createRunLog(tempDir, 'my-squad', '2026-03-13-090000', {
      status: 'completed',
      startedAt: '2026-03-13T09:00:00Z',
      completedAt: '2026-03-13T09:05:00Z',
      steps: [],
    });
    await createRunLog(tempDir, 'my-squad', '2026-03-15-120000', {
      status: 'completed',
      startedAt: '2026-03-15T12:00:00Z',
      completedAt: '2026-03-15T12:05:00Z',
      steps: [],
    });
    await createRunLog(tempDir, 'my-squad', '2026-03-14-180000', {
      status: 'failed',
      startedAt: '2026-03-14T18:00:00Z',
      steps: [{ index: 1, id: 'step-1', status: 'failed', error: 'timeout' }],
    });

    const runs = await listRuns(tempDir);
    assert.equal(runs[0].runId, '2026-03-15-120000');
    assert.equal(runs[1].runId, '2026-03-14-180000');
    assert.equal(runs[2].runId, '2026-03-13-090000');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns filters by squad name', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await createRunLog(tempDir, 'squad-a', '2026-03-15-120000', {
      status: 'completed', steps: [],
    });
    await createRunLog(tempDir, 'squad-b', '2026-03-15-130000', {
      status: 'completed', steps: [],
    });

    const runs = await listRuns(tempDir, 'squad-a');
    assert.equal(runs.length, 1);
    assert.equal(runs[0].squad, 'squad-a');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns extracts error from last failed step', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await createRunLog(tempDir, 'my-squad', '2026-03-15-120000', {
      status: 'failed',
      startedAt: '2026-03-15T12:00:00Z',
      steps: [
        { index: 1, id: 'step-1', status: 'completed' },
        { index: 2, id: 'step-2', status: 'failed', error: "skill 'blotato' not installed" },
      ],
    });

    const runs = await listRuns(tempDir);
    assert.equal(runs[0].error, "skill 'blotato' not installed");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listRuns collects runs from multiple squads', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await createRunLog(tempDir, 'squad-a', '2026-03-15-120000', {
      status: 'completed', steps: [],
    });
    await createRunLog(tempDir, 'squad-b', '2026-03-15-130000', {
      status: 'completed', steps: [],
    });

    const runs = await listRuns(tempDir);
    assert.equal(runs.length, 2);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('formatDuration formats minutes and seconds', () => {
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(5000), '5s');
  assert.equal(formatDuration(65000), '1m05s');
  assert.equal(formatDuration(300000), '5m00s');
  assert.equal(formatDuration(null), '');
});

test('listRuns skips non-directory entries in squads folder', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-runs-'));
  try {
    await mkdir(join(tempDir, 'squads'), { recursive: true });
    await writeFile(join(tempDir, 'squads', '.gitkeep'), '', 'utf-8');
    await createRunLog(tempDir, 'real-squad', '2026-03-15-120000', {
      status: 'completed', steps: [],
    });

    const runs = await listRuns(tempDir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].squad, 'real-squad');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

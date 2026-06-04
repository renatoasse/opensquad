import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../src/init.js';
import { update } from '../src/update.js';

test('update returns failure when not initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    const result = await update(tempDir);
    assert.equal(result.success, false);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update overwrites system files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(join(tempDir, 'CLAUDE.md'), 'garbage content', 'utf-8');

    await update(tempDir);

    const content = await readFile(join(tempDir, 'CLAUDE.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(!content.includes('garbage content'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves _memory contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(
      join(tempDir, '_opensquad', '_memory', 'company.md'),
      'My Company Info',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, '_opensquad', '_memory', 'company.md'),
      'utf-8'
    );
    assert.equal(content, 'My Company Info');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves _investigations contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(
      join(tempDir, '_opensquad', '_investigations', 'profile-analysis.md'),
      'investigation data',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, '_opensquad', '_investigations', 'profile-analysis.md'),
      'utf-8'
    );
    assert.equal(content, 'investigation data');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves squads contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await mkdir(join(tempDir, 'squads', 'my-squad'), { recursive: true });
    await writeFile(
      join(tempDir, 'squads', 'my-squad', 'custom.md'),
      'user squad content',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, 'squads', 'my-squad', 'custom.md'),
      'utf-8'
    );
    assert.equal(content, 'user squad content');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update writes new version to .opensquad-version', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await update(tempDir);

    const version = await readFile(
      join(tempDir, '_opensquad', '.opensquad-version'),
      'utf-8'
    );
    assert.ok(version.trim().length > 0);
    assert.match(version.trim(), /^\d+\.\d+\.\d+$/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update succeeds without existing .opensquad-version (legacy install)', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await rm(join(tempDir, '_opensquad', '.opensquad-version'), { force: true });

    const result = await update(tempDir);
    assert.equal(result.success, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update returns success when initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    const result = await update(tempDir);
    assert.equal(result.success, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update succeeds when no bundled agents exist', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const result = await update(tempDir);
    assert.equal(result.success, true);
    // No bundled agents — agents/ dir should not exist
    await assert.rejects(
      stat(join(tempDir, 'agents')),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves user-created agent files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    // User manually created an agent
    const agentsDir = join(tempDir, 'agents');
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, 'custom.agent.md'), 'my agent', 'utf-8');

    await update(tempDir);

    const content = await readFile(join(agentsDir, 'custom.agent.md'), 'utf-8');
    assert.equal(content, 'my agent');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update auto-imports bundled skills with env requirements', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    // image-ai-generator is the canonical non-MCP skill with env requirements (env: [OPENROUTER_API_KEY])
    // Simulate a user who installed opensquad before this skill was bundled
    await rm(join(tempDir, 'skills', 'image-ai-generator'), { recursive: true, force: true });

    await update(tempDir);

    // image-ai-generator has `env: [OPENROUTER_API_KEY]` and should be re-installed by update
    const skillMd = join(tempDir, 'skills', 'image-ai-generator', 'SKILL.md');
    const content = await readFile(skillMd, 'utf-8');
    assert.ok(content.includes('OPENROUTER_API_KEY'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

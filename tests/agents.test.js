import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  listAvailable,
  installAgent,
  removeAgent,
  getAgentMeta,
  clearMetaCache,
} from '../src/agents.js';

// --- getAgentMeta cache ---

test('getAgentMeta returns null for nonexistent agent', async () => {
  clearMetaCache();
  const meta = await getAgentMeta('nonexistent-agent');
  assert.equal(meta, null);
});

test('getAgentMeta caches null for nonexistent agent', async () => {
  clearMetaCache();
  const first = await getAgentMeta('nonexistent-agent');
  assert.equal(first, null);
  const second = await getAgentMeta('nonexistent-agent');
  assert.equal(second, null);
});

test('clearMetaCache allows re-read from disk', async () => {
  clearMetaCache();
  // Cache a null
  await getAgentMeta('nonexistent-agent');
  // Clear and verify we can query again without error
  clearMetaCache();
  const meta = await getAgentMeta('nonexistent-agent');
  assert.equal(meta, null);
});

// Cache with real bundled agents (if they exist)
test('getAgentMeta caches result when bundled agents exist', async () => {
  clearMetaCache();
  const available = await listAvailable();
  if (available.length === 0) {
    // No bundled agents in dev environment — skip
    return;
  }
  const id = available[0];
  const first = await getAgentMeta(id);
  const second = await getAgentMeta(id);
  assert.equal(first, second); // same reference from cache
});

test('clearMetaCache forces re-read when bundled agents exist', async () => {
  clearMetaCache();
  const available = await listAvailable();
  if (available.length === 0) return;
  const id = available[0];
  const first = await getAgentMeta(id);
  clearMetaCache();
  const second = await getAgentMeta(id);
  assert.notEqual(first, second); // different reference
  assert.equal(first.name, second.name); // same content
});

// --- installAgent / removeAgent invalidation ---

test('installAgent invalidates metaCache', async () => {
  const available = await listAvailable();
  if (available.length === 0) return;
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const id = available[0];
    clearMetaCache();
    const before = await getAgentMeta(id);
    await installAgent(id, dir);
    const after = await getAgentMeta(id);
    assert.notEqual(before, after);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('removeAgent invalidates metaCache', async () => {
  const available = await listAvailable();
  if (available.length === 0) return;
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const id = available[0];
    await installAgent(id, dir);
    clearMetaCache();
    await getAgentMeta(id); // populate cache
    await removeAgent(id, dir);
    const meta = await getAgentMeta(id);
    assert.ok(meta); // still in bundled dir
  } finally {
    await rm(dir, { recursive: true });
  }
});

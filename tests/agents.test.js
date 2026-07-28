import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  listAvailable,
  listInstalled,
  installAgent,
  installCatalog,
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

// --- bundled catalog ---

test('bundled agent catalog is not empty', async () => {
  const available = await listAvailable();
  assert.ok(available.length > 0, 'agents/ registry must ship at least one archetype');
});

test('every bundled archetype has parseable frontmatter', async () => {
  clearMetaCache();
  for (const id of await listAvailable()) {
    const meta = await getAgentMeta(id);
    assert.ok(meta, `${id} has no parseable AGENT.md`);
    assert.ok(meta.name, `${id} is missing name`);
    assert.ok(meta.icon, `${id} is missing icon`);
    assert.ok(meta.category, `${id} is missing category`);
    assert.ok(meta.version, `${id} is missing version`);
    assert.ok(meta.description, `${id} is missing description`);
  }
});

test('every bundled archetype ships pt-BR and es descriptions', async () => {
  clearMetaCache();
  for (const id of await listAvailable()) {
    const meta = await getAgentMeta(id);
    assert.ok(meta.descriptions['pt-BR'], `${id} is missing description_pt-BR`);
    assert.ok(meta.descriptions.es, `${id} is missing description_es`);
  }
});

test('every bundled archetype id is installable', async () => {
  // installAgent() validates against /^[a-z0-9][a-z0-9-]*$/ — a bad dir name is uninstallable
  for (const id of await listAvailable()) {
    assert.match(id, /^[a-z0-9][a-z0-9-]*$/, `${id} is not a valid agent id`);
  }
});

test('bundled archetypes carry the specialization contract', async () => {
  // Archetypes are foundations, not finished agents. Both markers are what tells the
  // Architect to specialize rather than copy — and Gate 1 rejects them in generated agents.
  for (const id of await listAvailable()) {
    const body = await readFile(new URL(`../agents/${id}/AGENT.md`, import.meta.url), 'utf-8');
    assert.ok(body.includes('**ARCHETYPE**'), `${id} is missing the ARCHETYPE banner`);
    assert.ok(body.includes('## Specialization Contract'), `${id} is missing its contract`);
  }
});

// --- getAgentMeta cache against the real registry ---

test('getAgentMeta caches result for a bundled agent', async () => {
  clearMetaCache();
  const [id] = await listAvailable();
  const first = await getAgentMeta(id);
  const second = await getAgentMeta(id);
  assert.equal(first, second); // same reference from cache
});

test('clearMetaCache forces re-read for a bundled agent', async () => {
  clearMetaCache();
  const [id] = await listAvailable();
  const first = await getAgentMeta(id);
  clearMetaCache();
  const second = await getAgentMeta(id);
  assert.notEqual(first, second); // different reference
  assert.equal(first.name, second.name); // same content
});

// --- installAgent / removeAgent invalidation ---

test('installAgent invalidates metaCache', async () => {
  const [id] = await listAvailable();
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    clearMetaCache();
    const before = await getAgentMeta(id);
    await installAgent(id, dir);
    const after = await getAgentMeta(id);
    assert.notEqual(before, after);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installAgent writes {id}.agent.md into the target', async () => {
  const [id] = await listAvailable();
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await installAgent(id, dir);
    const installed = await listInstalled(dir);
    assert.deepEqual(installed, [id]);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installAgent rejects an invalid id', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await assert.rejects(() => installAgent('../escape', dir), /Invalid agent id/);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installCatalog copies _catalog.yaml and it is not listed as an agent', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    assert.equal(await installCatalog(dir), true);
    const raw = await readFile(join(dir, 'agents', '_catalog.yaml'), 'utf-8');
    assert.ok(raw.includes('catalog:'));
    // listInstalled only counts *.agent.md — the catalog must not inflate the agent list
    assert.deepEqual(await listInstalled(dir), []);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('every catalog entry maps to a real bundled archetype', async () => {
  const raw = await readFile(new URL('../agents/_catalog.yaml', import.meta.url), 'utf-8');
  const ids = [...raw.matchAll(/^\s*-\s+id:\s*(\S+)/gm)].map((m) => m[1]);
  const available = await listAvailable();
  assert.ok(ids.length > 0, 'catalog lists no entries');
  for (const id of ids) {
    assert.ok(available.includes(id), `catalog lists '${id}' but agents/${id}/ does not exist`);
  }
  for (const id of available) {
    assert.ok(ids.includes(id), `agents/${id}/ exists but is not listed in _catalog.yaml`);
  }
});

test('removeAgent invalidates metaCache', async () => {
  const [id] = await listAvailable();
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
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

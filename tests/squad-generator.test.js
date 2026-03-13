/**
 * Tests for squad-generator.js
 *
 * Tests the generation of YAML/MD files from SQLite database.
 */

import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let testDir;
let db;
let generator;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-generator-test-'));
  await mkdir(join(testDir, '_opensquad', 'data'), { recursive: true });
  await mkdir(join(testDir, 'squads'), { recursive: true });

  db = await import('../src/db.js');
  await db.initDb(testDir);

  generator = await import('../src/squad-generator.js');
});

afterEach(async () => {
  if (db) {
    db.closeDb();
  }
  if (testDir) {
    await rm(testDir, { recursive: true, force: true });
  }
});

// =============================================================================
// generateSquadFiles TESTS
// =============================================================================

describe('generateSquadFiles', () => {
  test('creates squad directory', async () => {
    db.createSquad({
      code: 'test-squad',
      name: 'Test Squad'
    });

    await generator.generateSquadFiles(testDir, 'test-squad');

    const squadDir = join(testDir, 'squads', 'test-squad');
    const dirStat = await stat(squadDir);
    assert.ok(dirStat.isDirectory());
  });

  test('generates squad.yaml with all fields', async () => {
    db.createSquad({
      code: 'full-squad',
      name: 'Full Squad',
      description: 'A complete squad',
      icon: '🚀',
      format: 'instagram-feed',
      performance_mode: 'alta-performance',
      target_audience: 'Millennials',
      skills: ['web_search', 'image-creator']
    });

    await generator.generateSquadFiles(testDir, 'full-squad');

    const yamlPath = join(testDir, 'squads', 'full-squad', 'squad.yaml');
    const content = await readFile(yamlPath, 'utf-8');

    assert.ok(content.includes('code: "full-squad"'));
    assert.ok(content.includes('name: "Full Squad"'));
    assert.ok(content.includes('description: "A complete squad"'));
    assert.ok(content.includes('icon: "🚀"'));
    assert.ok(content.includes('format: "instagram-feed"'));
    assert.ok(content.includes('performance_mode: "alta-performance"'));
    assert.ok(content.includes('target_audience: "Millennials"'));
    assert.ok(content.includes('skills:'));
    assert.ok(content.includes('"web_search"'));
    assert.ok(content.includes('"image-creator"'));
  });

  test('generates agent files', async () => {
    const squad = db.createSquad({
      code: 'agent-squad',
      name: 'Agent Squad'
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'researcher',
      name: 'Carlos Researcher',
      icon: '🔍',
      role: 'Research topics deeply',
      execution: 'subagent',
      skills: ['web_search'],
      persona: '# Carlos Researcher\n\nI am a skilled researcher.',
      position: 1
    });

    await generator.generateSquadFiles(testDir, 'agent-squad');

    const agentPath = join(testDir, 'squads', 'agent-squad', 'agents', 'researcher.md');
    const content = await readFile(agentPath, 'utf-8');

    assert.ok(content.includes('id: "researcher"'));
    assert.ok(content.includes('name: "Carlos Researcher"'));
    assert.ok(content.includes('icon: "🔍"'));
    assert.ok(content.includes('role: "Research topics deeply"'));
    assert.ok(content.includes('execution: "subagent"'));
    assert.ok(content.includes('I am a skilled researcher'));
  });

  test('generates multiple agent files in order', async () => {
    const squad = db.createSquad({
      code: 'multi-agent-squad',
      name: 'Multi Agent Squad'
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-c',
      name: 'Agent C',
      position: 3
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-a',
      name: 'Agent A',
      position: 1
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-b',
      name: 'Agent B',
      position: 2
    });

    await generator.generateSquadFiles(testDir, 'multi-agent-squad');

    const agentsDir = join(testDir, 'squads', 'multi-agent-squad', 'agents');

    // Verify all agent files exist
    await stat(join(agentsDir, 'agent-a.md'));
    await stat(join(agentsDir, 'agent-b.md'));
    await stat(join(agentsDir, 'agent-c.md'));
  });

  test('throws error for non-existent squad', async () => {
    await assert.rejects(
      async () => generator.generateSquadFiles(testDir, 'non-existent'),
      { message: 'Squad "non-existent" not found' }
    );
  });

  test('includes product_id when squad has product', async () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Test Product',
      slug: 'test-product'
    });

    db.createSquad({
      product_id: product.id,
      code: 'product-squad',
      name: 'Product Squad'
    });

    await generator.generateSquadFiles(testDir, 'product-squad');

    const yamlPath = join(testDir, 'squads', 'product-squad', 'squad.yaml');
    const content = await readFile(yamlPath, 'utf-8');

    assert.ok(content.includes('product_id:'));
    assert.ok(content.includes(product.id));
  });
});

// =============================================================================
// generateContextFile TESTS
// =============================================================================

describe('generateContextFile', () => {
  test('generates context file with company info', async () => {
    const company = db.createCompany({
      name: 'Context Company',
      slug: 'context-company',
      description: 'A company for context testing',
      sector: 'Technology',
      target_audience: 'Developers',
      tone_of_voice: 'Professional',
      website: 'https://context.com'
    });

    const product = db.createProduct({
      company_id: company.id,
      name: 'Context Product',
      slug: 'context-product',
      description: 'A product for context',
      value_proposition: 'Best context ever',
      key_features: ['Feature 1', 'Feature 2']
    });

    db.createSquad({
      product_id: product.id,
      code: 'context-squad',
      name: 'Context Squad',
      description: 'Squad for context',
      format: 'blog-post'
    });

    await generator.generateContextFile(testDir, 'context-squad');

    const contextPath = join(testDir, 'squads', 'context-squad', '_context.md');
    const content = await readFile(contextPath, 'utf-8');

    // Check company section
    assert.ok(content.includes('## Empresa'));
    assert.ok(content.includes('Context Company'));
    assert.ok(content.includes('Technology'));
    assert.ok(content.includes('Developers'));

    // Check product section
    assert.ok(content.includes('## Produto'));
    assert.ok(content.includes('Context Product'));
    assert.ok(content.includes('Best context ever'));

    // Check squad section
    assert.ok(content.includes('## Squad'));
    assert.ok(content.includes('Context Squad'));
    assert.ok(content.includes('blog-post'));
  });

  test('generates context file without product', async () => {
    db.createSquad({
      code: 'solo-squad',
      name: 'Solo Squad',
      description: 'Standalone squad'
    });

    await generator.generateContextFile(testDir, 'solo-squad');

    const contextPath = join(testDir, 'squads', 'solo-squad', '_context.md');
    const content = await readFile(contextPath, 'utf-8');

    assert.ok(content.includes('## Squad'));
    assert.ok(content.includes('Solo Squad'));
    assert.ok(!content.includes('## Empresa'));
    assert.ok(!content.includes('## Produto'));
  });

  test('includes auto-generation warning', async () => {
    db.createSquad({
      code: 'warning-squad',
      name: 'Warning Squad'
    });

    await generator.generateContextFile(testDir, 'warning-squad');

    const contextPath = join(testDir, 'squads', 'warning-squad', '_context.md');
    const content = await readFile(contextPath, 'utf-8');

    assert.ok(content.includes('gerado automaticamente'));
    assert.ok(content.includes('Não edite manualmente'));
  });
});

// =============================================================================
// syncAllSquads TESTS
// =============================================================================

describe('syncAllSquads', () => {
  test('syncs all squads from database', async () => {
    db.createSquad({ code: 'squad-1', name: 'Squad 1' });
    db.createSquad({ code: 'squad-2', name: 'Squad 2' });
    db.createSquad({ code: 'squad-3', name: 'Squad 3' });

    const result = await generator.syncAllSquads(testDir);

    assert.ok(result.success);
    assert.strictEqual(result.count, 3);

    // Verify all squads were created
    await stat(join(testDir, 'squads', 'squad-1', 'squad.yaml'));
    await stat(join(testDir, 'squads', 'squad-2', 'squad.yaml'));
    await stat(join(testDir, 'squads', 'squad-3', 'squad.yaml'));
  });

  test('returns zero count when no squads', async () => {
    const result = await generator.syncAllSquads(testDir);

    assert.ok(result.success);
    assert.strictEqual(result.count, 0);
  });

  test('generates both yaml and context files', async () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Product',
      slug: 'product'
    });

    db.createSquad({
      product_id: product.id,
      code: 'full-sync-squad',
      name: 'Full Sync Squad'
    });

    await generator.syncAllSquads(testDir);

    await stat(join(testDir, 'squads', 'full-sync-squad', 'squad.yaml'));
    await stat(join(testDir, 'squads', 'full-sync-squad', '_context.md'));
  });
});

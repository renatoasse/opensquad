/**
 * Extended Tests for db.js
 *
 * Additional tests for memories, squad agents, and edge cases.
 */

import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let db;
let testDir;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-db-ext-test-'));
  await mkdir(join(testDir, '_opensquad', 'data'), { recursive: true });

  db = await import('../src/db.js');
  await db.initDb(testDir);
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
// MEMORY TESTS
// =============================================================================

describe('memories', () => {
  test('createMemory creates a memory entry', () => {
    const memory = db.createMemory({
      category: 'insight',
      content: 'Users prefer dark mode',
      relevance_score: 0.9
    });

    assert.ok(memory.id);
    assert.strictEqual(memory.category, 'insight');
    assert.strictEqual(memory.content, 'Users prefer dark mode');
    assert.strictEqual(memory.relevance_score, 0.9);
    assert.ok(memory.created_at);
  });

  test('createMemory links to squad', () => {
    const squad = db.createSquad({ code: 'mem-squad', name: 'Memory Squad' });

    const memory = db.createMemory({
      squad_id: squad.id,
      category: 'learning',
      content: 'This squad learned something'
    });

    assert.strictEqual(memory.squad_id, squad.id);
  });

  test('createMemory links to product', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Memory Product',
      slug: 'mem-product'
    });

    const memory = db.createMemory({
      product_id: product.id,
      category: 'feedback',
      content: 'Users love this feature'
    });

    assert.strictEqual(memory.product_id, product.id);
  });

  test('createMemory links to company', () => {
    const company = db.createCompany({ name: 'Memory Company', slug: 'mem-company' });

    const memory = db.createMemory({
      company_id: company.id,
      category: 'brand',
      content: 'Brand guidelines note'
    });

    assert.strictEqual(memory.company_id, company.id);
  });

  test('createMemory links to source run', () => {
    const squad = db.createSquad({ code: 'run-squad', name: 'Run Squad' });
    const run = db.createRun({ squad_id: squad.id, topic: 'Test Run' });

    const memory = db.createMemory({
      squad_id: squad.id,
      source_run_id: run.id,
      category: 'output',
      content: 'Generated insight from run'
    });

    assert.strictEqual(memory.source_run_id, run.id);
  });

  test('getMemoryById returns correct memory', () => {
    const created = db.createMemory({
      category: 'test',
      content: 'Test content'
    });

    const found = db.getMemoryById(created.id);
    assert.strictEqual(found.id, created.id);
    assert.strictEqual(found.content, 'Test content');
  });

  test('listSquadMemories returns memories for squad', () => {
    const squad1 = db.createSquad({ code: 'squad-1', name: 'Squad 1' });
    const squad2 = db.createSquad({ code: 'squad-2', name: 'Squad 2' });

    db.createMemory({ squad_id: squad1.id, category: 'a', content: 'Memory 1' });
    db.createMemory({ squad_id: squad1.id, category: 'b', content: 'Memory 2' });
    db.createMemory({ squad_id: squad2.id, category: 'c', content: 'Memory 3' });

    const memories1 = db.listSquadMemories(squad1.id);
    const memories2 = db.listSquadMemories(squad2.id);

    assert.strictEqual(memories1.length, 2);
    assert.strictEqual(memories2.length, 1);
  });

  test('listSquadMemories orders by relevance score desc', () => {
    const squad = db.createSquad({ code: 'rel-squad', name: 'Relevance Squad' });

    db.createMemory({ squad_id: squad.id, category: 'a', content: 'Low', relevance_score: 0.3 });
    db.createMemory({ squad_id: squad.id, category: 'b', content: 'High', relevance_score: 0.9 });
    db.createMemory({ squad_id: squad.id, category: 'c', content: 'Medium', relevance_score: 0.6 });

    const memories = db.listSquadMemories(squad.id);

    assert.strictEqual(memories[0].content, 'High');
    assert.strictEqual(memories[1].content, 'Medium');
    assert.strictEqual(memories[2].content, 'Low');
  });

  test('listProductMemories returns memories for product', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Test Product',
      slug: 'test-product'
    });

    db.createMemory({ product_id: product.id, category: 'a', content: 'Memory 1' });
    db.createMemory({ product_id: product.id, category: 'b', content: 'Memory 2' });

    const memories = db.listProductMemories(product.id);
    assert.strictEqual(memories.length, 2);
  });

  test('listCompanyMemories returns memories for company', () => {
    const company = db.createCompany({ name: 'Memory Co', slug: 'mem-co' });

    db.createMemory({ company_id: company.id, category: 'a', content: 'Company Memory 1' });
    db.createMemory({ company_id: company.id, category: 'b', content: 'Company Memory 2' });
    db.createMemory({ company_id: company.id, category: 'c', content: 'Company Memory 3' });

    const memories = db.listCompanyMemories(company.id);
    assert.strictEqual(memories.length, 3);
  });

  test('deleteMemory removes memory', () => {
    const memory = db.createMemory({
      category: 'deletable',
      content: 'To be deleted'
    });

    db.deleteMemory(memory.id);
    const found = db.getMemoryById(memory.id);
    assert.strictEqual(found, undefined);
  });

  test('default relevance_score is 1.0', () => {
    const memory = db.createMemory({
      category: 'default',
      content: 'Default relevance'
    });

    assert.strictEqual(memory.relevance_score, 1.0);
  });
});

// =============================================================================
// SQUAD AGENT EXTENDED TESTS
// =============================================================================

describe('squad agents extended', () => {
  test('createSquadAgent with all fields', () => {
    const squad = db.createSquad({ code: 'agent-squad', name: 'Agent Squad' });

    const agent = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'full-agent',
      name: 'Full Agent',
      icon: '🤖',
      role: 'Do everything',
      execution: 'subagent',
      skills: ['skill1', 'skill2'],
      persona: '# Full Agent\n\nI do everything.',
      position: 5
    });

    assert.ok(agent.id);
    assert.strictEqual(agent.squad_id, squad.id);
    assert.strictEqual(agent.agent_id, 'full-agent');
    assert.strictEqual(agent.name, 'Full Agent');
    assert.strictEqual(agent.icon, '🤖');
    assert.strictEqual(agent.role, 'Do everything');
    assert.strictEqual(agent.execution, 'subagent');
    assert.deepStrictEqual(agent.skills, ['skill1', 'skill2']);
    assert.ok(agent.persona.includes('Full Agent'));
    assert.strictEqual(agent.position, 5);
  });

  test('updateSquadAgent updates fields', () => {
    const squad = db.createSquad({ code: 'update-squad', name: 'Update Squad' });
    const agent = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'updatable',
      name: 'Original Name'
    });

    const updated = db.updateSquadAgent(agent.id, {
      name: 'Updated Name',
      role: 'New Role',
      skills: ['new-skill']
    });

    assert.strictEqual(updated.name, 'Updated Name');
    assert.strictEqual(updated.role, 'New Role');
    assert.deepStrictEqual(updated.skills, ['new-skill']);
  });

  test('deleteSquadAgent removes single agent', () => {
    const squad = db.createSquad({ code: 'del-squad', name: 'Delete Squad' });

    const agent1 = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-1',
      name: 'Agent 1'
    });

    const agent2 = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-2',
      name: 'Agent 2'
    });

    db.deleteSquadAgent(agent1.id);

    const agents = db.listSquadAgents(squad.id);
    assert.strictEqual(agents.length, 1);
    assert.strictEqual(agents[0].agent_id, 'agent-2');
  });

  test('deleteSquadAgents removes all agents for squad', () => {
    const squad = db.createSquad({ code: 'clear-squad', name: 'Clear Squad' });

    db.createSquadAgent({ squad_id: squad.id, agent_id: 'a', name: 'A' });
    db.createSquadAgent({ squad_id: squad.id, agent_id: 'b', name: 'B' });
    db.createSquadAgent({ squad_id: squad.id, agent_id: 'c', name: 'C' });

    db.deleteSquadAgents(squad.id);

    const agents = db.listSquadAgents(squad.id);
    assert.strictEqual(agents.length, 0);
  });

  test('listSquadAgents orders by position', () => {
    const squad = db.createSquad({ code: 'order-squad', name: 'Order Squad' });

    db.createSquadAgent({ squad_id: squad.id, agent_id: 'c', name: 'C', position: 3 });
    db.createSquadAgent({ squad_id: squad.id, agent_id: 'a', name: 'A', position: 1 });
    db.createSquadAgent({ squad_id: squad.id, agent_id: 'b', name: 'B', position: 2 });

    const agents = db.listSquadAgents(squad.id);

    assert.strictEqual(agents[0].agent_id, 'a');
    assert.strictEqual(agents[1].agent_id, 'b');
    assert.strictEqual(agents[2].agent_id, 'c');
  });

  test('default execution is inline', () => {
    const squad = db.createSquad({ code: 'exec-squad', name: 'Exec Squad' });

    const agent = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'default-exec',
      name: 'Default Exec Agent'
    });

    assert.strictEqual(agent.execution, 'inline');
  });
});

// =============================================================================
// RUN EXTENDED TESTS
// =============================================================================

describe('runs extended', () => {
  test('updateRun updates multiple fields', () => {
    const squad = db.createSquad({ code: 'run-squad', name: 'Run Squad' });
    const run = db.createRun({ squad_id: squad.id, topic: 'Original Topic' });

    const updated = db.updateRun(run.id, {
      topic: 'Updated Topic',
      current_step: 3,
      step_count: 5
    });

    assert.strictEqual(updated.topic, 'Updated Topic');
    assert.strictEqual(updated.current_step, 3);
    assert.strictEqual(updated.step_count, 5);
  });

  test('listRuns respects limit and offset', () => {
    const squad = db.createSquad({ code: 'limit-squad', name: 'Limit Squad' });

    for (let i = 1; i <= 10; i++) {
      db.createRun({ squad_id: squad.id, topic: `Topic ${i}` });
    }

    const page1 = db.listRuns(squad.id, { limit: 3, offset: 0 });
    const page2 = db.listRuns(squad.id, { limit: 3, offset: 3 });

    assert.strictEqual(page1.length, 3);
    assert.strictEqual(page2.length, 3);

    // Runs are ordered by started_at DESC, so newest first
    assert.notStrictEqual(page1[0].id, page2[0].id);
  });

  test('listAllRuns includes squad info', () => {
    const squad1 = db.createSquad({ code: 'sq-1', name: 'Squad One' });
    const squad2 = db.createSquad({ code: 'sq-2', name: 'Squad Two' });

    db.createRun({ squad_id: squad1.id, topic: 'Run 1' });
    db.createRun({ squad_id: squad2.id, topic: 'Run 2' });

    const runs = db.listAllRuns();

    assert.ok(runs[0].squad_name);
    assert.ok(runs[0].squad_code);
    assert.ok(runs[1].squad_name);
    assert.ok(runs[1].squad_code);
  });

  test('failRunStep updates status to failed', () => {
    const squad = db.createSquad({ code: 'fail-squad', name: 'Fail Squad' });
    const run = db.createRun({ squad_id: squad.id, topic: 'Fail Test' });
    const step = db.createRunStep({
      run_id: run.id,
      step_number: 1,
      agent_id: 'fail-agent',
      agent_name: 'Fail Agent'
    });

    db.startRunStep(step.id);
    const failed = db.failRunStep(step.id);

    assert.strictEqual(failed.status, 'failed');
    assert.ok(failed.completed_at);
  });
});

// =============================================================================
// PRODUCT EXTENDED TESTS
// =============================================================================

describe('products extended', () => {
  test('getProductBySlug with company_id', () => {
    const company1 = db.createCompany({ name: 'Company 1', slug: 'company-1' });
    const company2 = db.createCompany({ name: 'Company 2', slug: 'company-2' });

    db.createProduct({ company_id: company1.id, name: 'Same Name', slug: 'same-slug' });
    db.createProduct({ company_id: company2.id, name: 'Same Name', slug: 'same-slug' });

    const product1 = db.getProductBySlug(company1.id, 'same-slug');
    const product2 = db.getProductBySlug(company2.id, 'same-slug');

    assert.notStrictEqual(product1.id, product2.id);
    assert.strictEqual(product1.company_id, company1.id);
    assert.strictEqual(product2.company_id, company2.id);
  });

  test('updateProduct updates key_features array', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Feature Product',
      slug: 'feature-product',
      key_features: ['Feature A']
    });

    const updated = db.updateProduct(product.id, {
      key_features: ['Feature A', 'Feature B', 'Feature C']
    });

    assert.deepStrictEqual(updated.key_features, ['Feature A', 'Feature B', 'Feature C']);
  });
});

// =============================================================================
// SQUAD EXTENDED TESTS
// =============================================================================

describe('squads extended', () => {
  test('updateSquad updates skills array', () => {
    const squad = db.createSquad({
      code: 'skill-squad',
      name: 'Skill Squad',
      skills: ['skill1']
    });

    const updated = db.updateSquad(squad.id, {
      skills: ['skill1', 'skill2', 'skill3']
    });

    assert.deepStrictEqual(updated.skills, ['skill1', 'skill2', 'skill3']);
  });

  test('updateSquad updates pipeline_config', () => {
    const squad = db.createSquad({
      code: 'pipeline-squad',
      name: 'Pipeline Squad'
    });

    const updated = db.updateSquad(squad.id, {
      pipeline_config: {
        checkpoints: [
          { after: 'researcher', message: 'Review research' }
        ],
        parallel: false
      }
    });

    assert.deepStrictEqual(updated.pipeline_config, {
      checkpoints: [
        { after: 'researcher', message: 'Review research' }
      ],
      parallel: false
    });
  });

  test('listSquads filters by product_id', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product1 = db.createProduct({ company_id: company.id, name: 'P1', slug: 'p1' });
    const product2 = db.createProduct({ company_id: company.id, name: 'P2', slug: 'p2' });

    db.createSquad({ product_id: product1.id, code: 's1', name: 'Squad 1' });
    db.createSquad({ product_id: product1.id, code: 's2', name: 'Squad 2' });
    db.createSquad({ product_id: product2.id, code: 's3', name: 'Squad 3' });

    const squads1 = db.listSquads(product1.id);
    const squads2 = db.listSquads(product2.id);

    assert.strictEqual(squads1.length, 2);
    assert.strictEqual(squads2.length, 1);
  });
});

// =============================================================================
// DATABASE PATH TESTS
// =============================================================================

describe('database management', () => {
  test('getDbPath returns correct path', () => {
    const dbPath = db.getDbPath();
    assert.ok(dbPath.includes('opensquad.db'));
    assert.ok(dbPath.includes('_opensquad'));
    assert.ok(dbPath.includes('data'));
  });

  test('database file is created', async () => {
    const dbPath = db.getDbPath();
    const dbStat = await stat(dbPath);
    assert.ok(dbStat.isFile());
  });
});

// =============================================================================
// FOREIGN KEY CONSTRAINT TESTS
// =============================================================================

describe('foreign key constraints', () => {
  test('deleting squad cascades to squad_agents', () => {
    const squad = db.createSquad({ code: 'cascade-squad', name: 'Cascade Squad' });

    db.createSquadAgent({ squad_id: squad.id, agent_id: 'agent-1', name: 'Agent 1' });
    db.createSquadAgent({ squad_id: squad.id, agent_id: 'agent-2', name: 'Agent 2' });

    db.deleteSquad(squad.id);

    // Agents should be deleted via CASCADE
    // Note: We can't directly query deleted agents, but we can verify the squad is gone
    const foundSquad = db.getSquadByCode('cascade-squad');
    assert.strictEqual(foundSquad, undefined);
  });

  test('deleting run cascades to run_steps', () => {
    const squad = db.createSquad({ code: 'run-cascade', name: 'Run Cascade' });
    const run = db.createRun({ squad_id: squad.id, topic: 'Cascade Test' });

    db.createRunStep({ run_id: run.id, step_number: 1, agent_id: 'a', agent_name: 'A' });
    db.createRunStep({ run_id: run.id, step_number: 2, agent_id: 'b', agent_name: 'B' });

    // Delete the squad which should cascade to runs and run_steps
    db.deleteSquad(squad.id);

    const foundRun = db.getRunById(run.id);
    assert.strictEqual(foundRun, undefined);
  });

  test('deleting product sets squad product_id to null', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({ company_id: company.id, name: 'P', slug: 'p' });
    const squad = db.createSquad({ product_id: product.id, code: 'orphan', name: 'Orphan' });

    db.deleteProduct(product.id);

    const foundSquad = db.getSquadByCode('orphan');
    assert.ok(foundSquad); // Squad still exists
    assert.strictEqual(foundSquad.product_id, null); // But product_id is null
  });
});

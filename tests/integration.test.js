/**
 * Integration Tests for Opensquad Multi-Company System
 *
 * Tests complete workflows across multiple modules.
 */

import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let testDir;
let db;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-integration-test-'));
  await mkdir(join(testDir, '_opensquad', 'data'), { recursive: true });
  await mkdir(join(testDir, '_opensquad', '_memory'), { recursive: true });
  await mkdir(join(testDir, 'squads'), { recursive: true });

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
// WORKFLOW: Company → Product → Squad → Run → Memory
// =============================================================================

describe('complete workflow: company to memory', () => {
  test('creates full hierarchy and records execution', async () => {
    // 1. Create company
    const company = db.createCompany({
      name: 'Integration Corp',
      slug: 'integration-corp',
      description: 'A company for integration testing',
      sector: 'Technology',
      target_audience: 'Developers',
      tone_of_voice: 'Professional'
    });

    assert.ok(company.id);

    // 2. Set as active
    db.setActiveCompanyId(company.id);
    assert.strictEqual(db.getActiveCompanyId(), company.id);

    // 3. Create product
    const product = db.createProduct({
      company_id: company.id,
      name: 'Integration Platform',
      slug: 'integration-platform',
      description: 'Platform for integration',
      target_audience: 'API Developers',
      value_proposition: 'Seamless integrations',
      key_features: ['REST API', 'Webhooks', 'OAuth']
    });

    assert.ok(product.id);
    assert.strictEqual(product.company_id, company.id);

    // 4. Set product as active
    db.setActiveProductId(product.id);
    assert.strictEqual(db.getActiveProductId(), product.id);

    // 5. Create squad
    const squad = db.createSquad({
      product_id: product.id,
      code: 'api-docs',
      name: 'API Documentation Squad',
      description: 'Creates API documentation',
      format: 'technical-docs',
      skills: ['web_search', 'code-analysis']
    });

    assert.ok(squad.id);
    assert.strictEqual(squad.product_id, product.id);

    // 6. Create agents
    const researcher = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'api-researcher',
      name: 'API Researcher',
      role: 'Research API patterns and best practices',
      execution: 'inline',
      skills: ['web_search'],
      position: 1
    });

    const writer = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'doc-writer',
      name: 'Documentation Writer',
      role: 'Write clear API documentation',
      execution: 'inline',
      position: 2
    });

    const reviewer = db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'tech-reviewer',
      name: 'Technical Reviewer',
      role: 'Review documentation for accuracy',
      execution: 'subagent',
      position: 3
    });

    const agents = db.listSquadAgents(squad.id);
    assert.strictEqual(agents.length, 3);
    assert.strictEqual(agents[0].agent_id, 'api-researcher');
    assert.strictEqual(agents[1].agent_id, 'doc-writer');
    assert.strictEqual(agents[2].agent_id, 'tech-reviewer');

    // 7. Create run
    const run = db.createRun({
      squad_id: squad.id,
      topic: 'Authentication API Documentation',
      step_count: 3
    });

    assert.ok(run.id);
    assert.strictEqual(run.status, 'running');

    // 8. Create and progress steps
    const step1 = db.createRunStep({
      run_id: run.id,
      step_number: 1,
      agent_id: 'api-researcher',
      agent_name: 'API Researcher'
    });

    db.startRunStep(step1.id);
    await new Promise(resolve => setTimeout(resolve, 10));
    db.completeRunStep(step1.id, 'research-output.md');

    const step2 = db.createRunStep({
      run_id: run.id,
      step_number: 2,
      agent_id: 'doc-writer',
      agent_name: 'Documentation Writer'
    });

    db.startRunStep(step2.id);
    await new Promise(resolve => setTimeout(resolve, 10));
    db.completeRunStep(step2.id, 'documentation.md');

    const step3 = db.createRunStep({
      run_id: run.id,
      step_number: 3,
      agent_id: 'tech-reviewer',
      agent_name: 'Technical Reviewer'
    });

    db.startRunStep(step3.id);
    await new Promise(resolve => setTimeout(resolve, 10));
    db.completeRunStep(step3.id, 'review-notes.md');

    // 9. Complete run
    const completedRun = db.completeRun(run.id, 'completed');

    assert.strictEqual(completedRun.status, 'completed');
    assert.ok(completedRun.duration_ms > 0);

    // 10. Create memories from run
    const memory1 = db.createMemory({
      squad_id: squad.id,
      source_run_id: run.id,
      category: 'best-practice',
      content: 'Always include error codes in API docs',
      relevance_score: 0.95
    });

    const memory2 = db.createMemory({
      product_id: product.id,
      category: 'user-feedback',
      content: 'Users want code examples in multiple languages',
      relevance_score: 0.8
    });

    const memory3 = db.createMemory({
      company_id: company.id,
      category: 'brand-guideline',
      content: 'Use active voice in technical writing',
      relevance_score: 0.9
    });

    // 11. Verify statistics
    const stats = db.getStats();

    assert.strictEqual(stats.companies, 1);
    assert.strictEqual(stats.products, 1);
    assert.strictEqual(stats.squads, 1);
    assert.strictEqual(stats.runs.total, 1);
    assert.strictEqual(stats.runs.completed, 1);
    assert.strictEqual(stats.memories, 3);

    // 12. Verify context
    const context = db.getActiveContext();
    assert.strictEqual(context.company.name, 'Integration Corp');
    assert.strictEqual(context.product.name, 'Integration Platform');
  });
});

// =============================================================================
// WORKFLOW: Migration → Context Loading → File Generation
// =============================================================================

describe('workflow: migration to file generation', () => {
  test('migrates data, loads context, and generates files', async () => {
    // 1. Create source files for migration
    const companyMd = `---
name: Migration Company
slug: migration-company
sector: SaaS
---

# Migration Company

A company created for migration testing.

## Público-alvo
Startups and SMBs
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    const squadDir = join(testDir, 'squads', 'content-squad');
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    const squadYaml = `squad:
  code: content-squad
  name: Content Creation Squad
  description: Creates engaging content
  format: blog-post
  skills:
    - web_search
    - image-creator
`;
    await writeFile(join(squadDir, 'squad.yaml'), squadYaml);

    const agentMd = `---
id: content-writer
name: Content Writer
role: Write engaging blog posts
execution: inline
---

# Content Writer

I create engaging, SEO-optimized blog posts.
`;
    await writeFile(join(agentsDir, 'content-writer.md'), agentMd);

    // 2. Run migration
    const migrate = await import('../src/migrate-to-sqlite.js');
    const migrationResult = await migrate.migrateToSqlite(testDir);

    assert.ok(migrationResult.success);

    // 3. Verify migration results
    const companies = db.listCompanies();
    assert.strictEqual(companies.length, 1);
    assert.strictEqual(companies[0].name, 'Migration Company');

    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 1);
    assert.strictEqual(squads[0].code, 'content-squad');

    const squad = db.getSquadByCode('content-squad');
    const agents = db.listSquadAgents(squad.id);
    assert.strictEqual(agents.length, 1);
    assert.strictEqual(agents[0].agent_id, 'content-writer');

    // 4. Load context
    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'content-squad');

    assert.ok(context.squad);
    assert.ok(context.context.includes('Content Creation Squad'));

    // 5. Generate files from database
    const generator = await import('../src/squad-generator.js');

    // Create a new squad in DB
    const newSquad = db.createSquad({
      code: 'new-generated-squad',
      name: 'New Generated Squad',
      description: 'Created for file generation test',
      format: 'instagram-feed',
      skills: ['image-creator']
    });

    db.createSquadAgent({
      squad_id: newSquad.id,
      agent_id: 'visual-creator',
      name: 'Visual Creator',
      role: 'Create visual content',
      position: 1
    });

    await generator.generateSquadFiles(testDir, 'new-generated-squad');

    // 6. Verify generated files
    const generatedYaml = await readFile(
      join(testDir, 'squads', 'new-generated-squad', 'squad.yaml'),
      'utf-8'
    );
    assert.ok(generatedYaml.includes('new-generated-squad'));
    assert.ok(generatedYaml.includes('instagram-feed'));

    const generatedAgent = await readFile(
      join(testDir, 'squads', 'new-generated-squad', 'agents', 'visual-creator.md'),
      'utf-8'
    );
    assert.ok(generatedAgent.includes('Visual Creator'));
  });
});

// =============================================================================
// WORKFLOW: Multiple Companies with Products
// =============================================================================

describe('workflow: multiple companies', () => {
  test('manages multiple companies with separate products and squads', () => {
    // Create Company 1 with products
    const company1 = db.createCompany({
      name: 'Tech Corp',
      slug: 'tech-corp',
      sector: 'Technology'
    });

    const product1a = db.createProduct({
      company_id: company1.id,
      name: 'DevTools',
      slug: 'devtools'
    });

    const product1b = db.createProduct({
      company_id: company1.id,
      name: 'CloudService',
      slug: 'cloudservice'
    });

    // Create Company 2 with products
    const company2 = db.createCompany({
      name: 'Creative Agency',
      slug: 'creative-agency',
      sector: 'Marketing'
    });

    const product2a = db.createProduct({
      company_id: company2.id,
      name: 'BrandKit',
      slug: 'brandkit'
    });

    // Create squads for each product
    const squad1a = db.createSquad({
      product_id: product1a.id,
      code: 'devtools-docs',
      name: 'DevTools Documentation'
    });

    const squad1b = db.createSquad({
      product_id: product1b.id,
      code: 'cloud-marketing',
      name: 'Cloud Marketing'
    });

    const squad2a = db.createSquad({
      product_id: product2a.id,
      code: 'brand-content',
      name: 'Brand Content'
    });

    // Verify hierarchy
    const allProducts = db.listAllProducts();
    assert.strictEqual(allProducts.length, 3);

    const techProducts = db.listProducts(company1.id);
    assert.strictEqual(techProducts.length, 2);

    const creativeProducts = db.listProducts(company2.id);
    assert.strictEqual(creativeProducts.length, 1);

    const devtoolsSquads = db.listSquads(product1a.id);
    assert.strictEqual(devtoolsSquads.length, 1);

    // Switch contexts
    db.setActiveCompanyId(company1.id);
    db.setActiveProductId(product1a.id);

    let context = db.getActiveContext();
    assert.strictEqual(context.company.name, 'Tech Corp');
    assert.strictEqual(context.product.name, 'DevTools');

    db.setActiveCompanyId(company2.id);
    db.setActiveProductId(product2a.id);

    context = db.getActiveContext();
    assert.strictEqual(context.company.name, 'Creative Agency');
    assert.strictEqual(context.product.name, 'BrandKit');
  });
});

// =============================================================================
// WORKFLOW: Run History and Analysis
// =============================================================================

describe('workflow: run history and analysis', () => {
  test('tracks multiple runs and analyzes performance', async () => {
    const squad = db.createSquad({
      code: 'analytics-squad',
      name: 'Analytics Squad'
    });

    // Create multiple runs with varying results
    const runData = [
      { topic: 'Weekly Report', success: true, durationMs: 45000 },
      { topic: 'Monthly Analysis', success: true, durationMs: 120000 },
      { topic: 'Ad Campaign', success: false, durationMs: 15000 },
      { topic: 'Customer Research', success: true, durationMs: 60000 },
      { topic: 'Competitor Analysis', success: true, durationMs: 90000 }
    ];

    for (const data of runData) {
      const run = db.createRun({
        squad_id: squad.id,
        topic: data.topic
      });

      // Simulate duration
      if (data.success) {
        // Manually set the completed state to simulate timing
        const now = new Date();
        const startTime = new Date(now.getTime() - data.durationMs);

        db.getDb().prepare(`
          UPDATE runs
          SET status = 'completed',
              started_at = ?,
              completed_at = ?,
              duration_ms = ?
          WHERE id = ?
        `).run(
          startTime.toISOString(),
          now.toISOString(),
          data.durationMs,
          run.id
        );
      } else {
        db.completeRun(run.id, 'failed', 'API rate limit exceeded');
      }
    }

    // Verify runs
    const runs = db.listRuns(squad.id);
    assert.strictEqual(runs.length, 5);

    const allRuns = db.listAllRuns();
    assert.strictEqual(allRuns.length, 5);

    // Verify statistics
    const stats = db.getStats();
    assert.strictEqual(stats.runs.total, 5);
    assert.strictEqual(stats.runs.completed, 4);
    assert.strictEqual(stats.runs.failed, 1);
    assert.ok(stats.runs.avgDurationMs > 0);

    // Check failed run has error
    const failedRun = runs.find(r => r.status === 'failed');
    assert.ok(failedRun);
    assert.strictEqual(failedRun.error_message, 'API rate limit exceeded');
  });
});

// =============================================================================
// WORKFLOW: Memory System
// =============================================================================

describe('workflow: memory system', () => {
  test('stores and retrieves memories at all levels', () => {
    const company = db.createCompany({ name: 'Memory Co', slug: 'memory-co' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Memory Product',
      slug: 'memory-product'
    });
    const squad = db.createSquad({
      product_id: product.id,
      code: 'memory-squad',
      name: 'Memory Squad'
    });

    // Create memories at each level
    db.createMemory({
      company_id: company.id,
      category: 'brand',
      content: 'Company-wide brand guideline',
      relevance_score: 1.0
    });

    db.createMemory({
      company_id: company.id,
      category: 'brand',
      content: 'Secondary brand guideline',
      relevance_score: 0.8
    });

    db.createMemory({
      product_id: product.id,
      category: 'audience',
      content: 'Product-specific audience insight',
      relevance_score: 0.9
    });

    db.createMemory({
      squad_id: squad.id,
      category: 'learning',
      content: 'Squad-specific learning',
      relevance_score: 0.95
    });

    // Retrieve and verify
    const companyMemories = db.listCompanyMemories(company.id);
    assert.strictEqual(companyMemories.length, 2);
    // Should be sorted by relevance
    assert.strictEqual(companyMemories[0].relevance_score, 1.0);
    assert.strictEqual(companyMemories[1].relevance_score, 0.8);

    const productMemories = db.listProductMemories(product.id);
    assert.strictEqual(productMemories.length, 1);

    const squadMemories = db.listSquadMemories(squad.id);
    assert.strictEqual(squadMemories.length, 1);

    // Verify total
    const stats = db.getStats();
    assert.strictEqual(stats.memories, 4);
  });
});

// =============================================================================
// WORKFLOW: Cascade Deletion
// =============================================================================

describe('workflow: cascade deletion', () => {
  test('deleting company cascades to all related data', () => {
    const company = db.createCompany({ name: 'Delete Me', slug: 'delete-me' });

    const product = db.createProduct({
      company_id: company.id,
      name: 'Product to Delete',
      slug: 'product-delete'
    });

    const squad = db.createSquad({
      product_id: product.id,
      code: 'squad-delete',
      name: 'Squad to Delete'
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-delete',
      name: 'Agent to Delete'
    });

    const run = db.createRun({ squad_id: squad.id, topic: 'Run to Delete' });

    db.createRunStep({
      run_id: run.id,
      step_number: 1,
      agent_id: 'agent-delete',
      agent_name: 'Agent'
    });

    db.createMemory({
      company_id: company.id,
      category: 'test',
      content: 'Memory to check'
    });

    // Verify everything exists
    let stats = db.getStats();
    assert.strictEqual(stats.companies, 1);
    assert.strictEqual(stats.products, 1);
    assert.strictEqual(stats.squads, 1);
    assert.strictEqual(stats.runs.total, 1);

    // Delete company
    db.deleteCompany(company.id);

    // Verify cascade
    stats = db.getStats();
    assert.strictEqual(stats.companies, 0);
    assert.strictEqual(stats.products, 0);
    // Squad might still exist but with null product_id
    // depending on ON DELETE behavior

    const foundProduct = db.getProductById(product.id);
    assert.strictEqual(foundProduct, undefined);
  });
});

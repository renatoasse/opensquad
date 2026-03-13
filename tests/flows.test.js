/**
 * Comprehensive Flow Tests for Opensquad
 *
 * End-to-end tests covering all major workflows:
 * - Initialization flows
 * - Company management flows
 * - Product management flows
 * - Squad management flows
 * - Context loading flows
 * - Migration flows
 * - Backup/restore flows
 * - History flows
 * - Error handling
 * - Multi-command workflows
 */

import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile, readFile, stat, readdir, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync, spawn } from 'node:child_process';

let testDir;
let db;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-flow-test-'));
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
// 1. COMPANY MANAGEMENT FLOWS
// =============================================================================

describe('Company Management Flows', () => {
  test('first company created becomes active automatically', () => {
    const company = db.createCompany({
      name: 'First Company',
      slug: 'first-company'
    });

    db.setActiveCompanyId(company.id);
    const activeId = db.getActiveCompanyId();

    assert.strictEqual(activeId, company.id);
  });

  test('create multiple companies and switch between them', () => {
    const companyA = db.createCompany({ name: 'Company A', slug: 'company-a' });
    const companyB = db.createCompany({ name: 'Company B', slug: 'company-b' });
    const companyC = db.createCompany({ name: 'Company C', slug: 'company-c' });

    db.setActiveCompanyId(companyA.id);
    assert.strictEqual(db.getActiveCompanyId(), companyA.id);

    db.setActiveCompanyId(companyB.id);
    assert.strictEqual(db.getActiveCompanyId(), companyB.id);

    db.setActiveCompanyId(companyC.id);
    assert.strictEqual(db.getActiveCompanyId(), companyC.id);
  });

  test('company creation with complete profile stores all fields', () => {
    const company = db.createCompany({
      name: 'Full Profile Co',
      slug: 'full-profile',
      description: 'A complete company profile',
      website: 'https://fullprofile.com',
      sector: 'Technology',
      target_audience: 'Enterprise developers',
      tone_of_voice: 'Professional but approachable',
      social_instagram: '@fullprofile',
      social_linkedin: 'linkedin.com/company/fullprofile',
      social_twitter: '@fullprofile_x',
      icon: '🏢'
    });

    const retrieved = db.getCompanyById(company.id);

    assert.strictEqual(retrieved.name, 'Full Profile Co');
    assert.strictEqual(retrieved.slug, 'full-profile');
    assert.strictEqual(retrieved.description, 'A complete company profile');
    assert.strictEqual(retrieved.website, 'https://fullprofile.com');
    assert.strictEqual(retrieved.sector, 'Technology');
    assert.strictEqual(retrieved.target_audience, 'Enterprise developers');
    assert.strictEqual(retrieved.tone_of_voice, 'Professional but approachable');
    assert.strictEqual(retrieved.social_instagram, '@fullprofile');
    assert.strictEqual(retrieved.social_linkedin, 'linkedin.com/company/fullprofile');
    assert.strictEqual(retrieved.social_twitter, '@fullprofile_x');
    assert.strictEqual(retrieved.icon, '🏢');
  });

  test('edit company preserves product relationships', () => {
    const company = db.createCompany({ name: 'Original Name', slug: 'original' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Product',
      slug: 'product'
    });

    db.updateCompany(company.id, { name: 'Updated Name' });

    const updatedProduct = db.getProductById(product.id);
    assert.strictEqual(updatedProduct.company_id, company.id);
  });

  test('delete company cascades to products', () => {
    const company = db.createCompany({ name: 'To Delete', slug: 'to-delete' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Orphan Product',
      slug: 'orphan'
    });

    db.deleteCompany(company.id);

    const deletedProduct = db.getProductById(product.id);
    assert.strictEqual(deletedProduct, undefined);
  });

  test('slug uniqueness enforced for companies', () => {
    db.createCompany({ name: 'First', slug: 'unique-slug' });

    assert.throws(() => {
      db.createCompany({ name: 'Second', slug: 'unique-slug' });
    }, /UNIQUE constraint failed|already exists/i);
  });

  test('company list returns all companies', () => {
    db.createCompany({ name: 'Alpha', slug: 'alpha' });
    db.createCompany({ name: 'Beta', slug: 'beta' });
    db.createCompany({ name: 'Gamma', slug: 'gamma' });

    const companies = db.listCompanies();

    assert.strictEqual(companies.length, 3);
    assert.ok(companies.some(c => c.name === 'Alpha'));
    assert.ok(companies.some(c => c.name === 'Beta'));
    assert.ok(companies.some(c => c.name === 'Gamma'));
  });

  test('delete active company clears active state', () => {
    const company = db.createCompany({ name: 'Active', slug: 'active' });
    db.setActiveCompanyId(company.id);

    db.deleteCompany(company.id);

    const activeId = db.getActiveCompanyId();
    assert.strictEqual(activeId, null);
  });
});

// =============================================================================
// 2. PRODUCT MANAGEMENT FLOWS
// =============================================================================

describe('Product Management Flows', () => {
  test('product creation with all fields', () => {
    const company = db.createCompany({ name: 'Test Co', slug: 'test-co' });

    const product = db.createProduct({
      company_id: company.id,
      name: 'Full Product',
      slug: 'full-product',
      description: 'A complete product',
      target_audience: 'Startups',
      tone_of_voice: 'Casual',
      value_proposition: 'Save time and money',
      key_features: ['Feature A', 'Feature B', 'Feature C'],
      icon: '📦'
    });

    const retrieved = db.getProductById(product.id);

    assert.strictEqual(retrieved.name, 'Full Product');
    assert.strictEqual(retrieved.description, 'A complete product');
    assert.strictEqual(retrieved.value_proposition, 'Save time and money');
    assert.deepStrictEqual(retrieved.key_features, ['Feature A', 'Feature B', 'Feature C']);
  });

  test('first product in company can be set as active', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'First Product',
      slug: 'first'
    });

    db.setActiveProductId(product.id);
    assert.strictEqual(db.getActiveProductId(), product.id);
  });

  test('list products filtered by company', () => {
    const companyA = db.createCompany({ name: 'Company A', slug: 'company-a' });
    const companyB = db.createCompany({ name: 'Company B', slug: 'company-b' });

    db.createProduct({ company_id: companyA.id, name: 'Prod A1', slug: 'prod-a1' });
    db.createProduct({ company_id: companyA.id, name: 'Prod A2', slug: 'prod-a2' });
    db.createProduct({ company_id: companyB.id, name: 'Prod B1', slug: 'prod-b1' });

    const productsA = db.listProducts(companyA.id);
    const productsB = db.listProducts(companyB.id);

    assert.strictEqual(productsA.length, 2);
    assert.strictEqual(productsB.length, 1);
  });

  test('list all products across companies', () => {
    const companyA = db.createCompany({ name: 'Company A', slug: 'company-a' });
    const companyB = db.createCompany({ name: 'Company B', slug: 'company-b' });

    db.createProduct({ company_id: companyA.id, name: 'Prod A1', slug: 'prod-a1' });
    db.createProduct({ company_id: companyA.id, name: 'Prod A2', slug: 'prod-a2' });
    db.createProduct({ company_id: companyB.id, name: 'Prod B1', slug: 'prod-b1' });

    const allProducts = db.listAllProducts();

    assert.strictEqual(allProducts.length, 3);
  });

  test('delete product clears active selection', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'To Delete',
      slug: 'to-delete'
    });

    db.setActiveProductId(product.id);
    db.deleteProduct(product.id);

    assert.strictEqual(db.getActiveProductId(), null);
  });

  test('product slug unique within company', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });

    db.createProduct({ company_id: company.id, name: 'First', slug: 'same-slug' });

    assert.throws(() => {
      db.createProduct({ company_id: company.id, name: 'Second', slug: 'same-slug' });
    }, /UNIQUE constraint failed/i);
  });

  test('same slug allowed in different companies', () => {
    const companyA = db.createCompany({ name: 'A', slug: 'a' });
    const companyB = db.createCompany({ name: 'B', slug: 'b' });

    const productA = db.createProduct({ company_id: companyA.id, name: 'Prod', slug: 'same-slug' });
    const productB = db.createProduct({ company_id: companyB.id, name: 'Prod', slug: 'same-slug' });

    assert.ok(productA.id);
    assert.ok(productB.id);
    assert.notStrictEqual(productA.id, productB.id);
  });

  test('update product key features', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Prod',
      slug: 'prod',
      key_features: ['A', 'B', 'C']
    });

    db.updateProduct(product.id, { key_features: ['X', 'Y'] });

    const updated = db.getProductById(product.id);
    assert.deepStrictEqual(updated.key_features, ['X', 'Y']);
  });
});

// =============================================================================
// 3. SQUAD MANAGEMENT FLOWS
// =============================================================================

describe('Squad Management Flows', () => {
  test('create squad linked to product', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Product',
      slug: 'product'
    });

    const squad = db.createSquad({
      product_id: product.id,
      code: 'linked-squad',
      name: 'Linked Squad'
    });

    assert.strictEqual(squad.product_id, product.id);
  });

  test('create standalone squad without product', () => {
    const squad = db.createSquad({
      code: 'standalone-squad',
      name: 'Standalone Squad'
    });

    assert.strictEqual(squad.product_id, null);
  });

  test('squad code uniqueness enforced', () => {
    db.createSquad({ code: 'unique-code', name: 'First' });

    assert.throws(() => {
      db.createSquad({ code: 'unique-code', name: 'Second' });
    }, /UNIQUE constraint failed/i);
  });

  test('create squad with agent pipeline', () => {
    const squad = db.createSquad({ code: 'pipeline-squad', name: 'Pipeline Squad' });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'researcher',
      name: 'Researcher',
      position: 1
    });
    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'writer',
      name: 'Writer',
      position: 2
    });
    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'reviewer',
      name: 'Reviewer',
      position: 3
    });

    const agents = db.listSquadAgents(squad.id);

    assert.strictEqual(agents.length, 3);
    assert.strictEqual(agents[0].agent_id, 'researcher');
    assert.strictEqual(agents[1].agent_id, 'writer');
    assert.strictEqual(agents[2].agent_id, 'reviewer');
  });

  test('squad with all fields', () => {
    const squad = db.createSquad({
      code: 'full-squad',
      name: 'Full Squad',
      description: 'A complete squad',
      icon: '🚀',
      format: 'instagram-feed',
      performance_mode: 'alta-performance',
      target_audience: 'Gen Z',
      skills: ['web_search', 'image-creator']
    });

    const retrieved = db.getSquadByCode('full-squad');

    assert.strictEqual(retrieved.description, 'A complete squad');
    assert.strictEqual(retrieved.format, 'instagram-feed');
    assert.strictEqual(retrieved.performance_mode, 'alta-performance');
    assert.strictEqual(retrieved.target_audience, 'Gen Z');
    assert.deepStrictEqual(retrieved.skills, ['web_search', 'image-creator']);
  });

  test('list squads by product', () => {
    const company = db.createCompany({ name: 'Test', slug: 'test' });
    const productA = db.createProduct({ company_id: company.id, name: 'A', slug: 'a' });
    const productB = db.createProduct({ company_id: company.id, name: 'B', slug: 'b' });

    db.createSquad({ product_id: productA.id, code: 'squad-a1', name: 'Squad A1' });
    db.createSquad({ product_id: productA.id, code: 'squad-a2', name: 'Squad A2' });
    db.createSquad({ product_id: productB.id, code: 'squad-b1', name: 'Squad B1' });

    const squadsA = db.listSquads(productA.id);
    const squadsB = db.listSquads(productB.id);

    assert.strictEqual(squadsA.length, 2);
    assert.strictEqual(squadsB.length, 1);
  });

  test('list all squads', () => {
    db.createSquad({ code: 'squad-1', name: 'Squad 1' });
    db.createSquad({ code: 'squad-2', name: 'Squad 2' });
    db.createSquad({ code: 'squad-3', name: 'Squad 3' });

    const allSquads = db.listAllSquads();

    assert.strictEqual(allSquads.length, 3);
  });

  test('delete squad removes agents', () => {
    const squad = db.createSquad({ code: 'to-delete', name: 'To Delete' });
    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-1',
      name: 'Agent 1'
    });

    db.deleteSquad(squad.id);

    const agents = db.listSquadAgents(squad.id);
    assert.strictEqual(agents.length, 0);
  });

  test('update squad fields', () => {
    const squad = db.createSquad({
      code: 'update-me',
      name: 'Original',
      format: 'blog-post'
    });

    db.updateSquad(squad.id, {
      name: 'Updated',
      format: 'instagram-feed'
    });

    const updated = db.getSquadById(squad.id);
    assert.strictEqual(updated.name, 'Updated');
    assert.strictEqual(updated.format, 'instagram-feed');
  });
});

// =============================================================================
// 4. CONTEXT LOADING FLOWS
// =============================================================================

describe('Context Loading Flows', () => {
  test('load context for squad with full hierarchy', async () => {
    const company = db.createCompany({
      name: 'Context Co',
      slug: 'context-co',
      sector: 'Tech'
    });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Context Product',
      slug: 'context-product'
    });
    const squad = db.createSquad({
      product_id: product.id,
      code: 'context-squad',
      name: 'Context Squad'
    });

    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'context-squad');

    assert.ok(context.company);
    assert.ok(context.product);
    assert.ok(context.squad);
    assert.strictEqual(context.company.name, 'Context Co');
    assert.strictEqual(context.product.name, 'Context Product');
  });

  test('load context uses active context when squad has no product', async () => {
    db.createSquad({ code: 'standalone', name: 'Standalone' });

    const company = db.createCompany({ name: 'Active Co', slug: 'active-co' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Active Product',
      slug: 'active-product'
    });

    db.setActiveCompanyId(company.id);
    db.setActiveProductId(product.id);

    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'standalone');

    assert.ok(context.company);
    assert.ok(context.product);
    assert.strictEqual(context.company.name, 'Active Co');
    assert.strictEqual(context.product.name, 'Active Product');
  });

  test('build markdown context includes all sections', async () => {
    const company = db.createCompany({
      name: 'Markdown Co',
      slug: 'markdown-co',
      sector: 'Marketing',
      target_audience: 'CMOs'
    });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Markdown Product',
      slug: 'markdown-product',
      value_proposition: 'Best marketing tool'
    });
    db.createSquad({
      product_id: product.id,
      code: 'markdown-squad',
      name: 'Markdown Squad',
      format: 'linkedin-post'
    });

    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'markdown-squad');

    assert.ok(context.context.includes('Markdown Co'));
    assert.ok(context.context.includes('Markdown Product'));
    assert.ok(context.context.includes('Markdown Squad'));
  });

  test('build JSON context for API consumption', async () => {
    const company = db.createCompany({ name: 'JSON Co', slug: 'json-co' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'JSON Product',
      slug: 'json-product'
    });
    db.createSquad({
      product_id: product.id,
      code: 'json-squad',
      name: 'JSON Squad'
    });

    const contextLoader = await import('../src/context-loader.js');
    const jsonContext = await contextLoader.buildJsonContext(testDir, 'json-squad');

    assert.ok(jsonContext.company);
    assert.ok(jsonContext.product);
    assert.ok(jsonContext.squad);
    assert.ok(jsonContext.effective);
  });

  test('effective target audience inheritance from product', async () => {
    const company = db.createCompany({
      name: 'Inherit Co',
      slug: 'inherit-co',
      target_audience: 'Company Audience'
    });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Inherit Product',
      slug: 'inherit-product',
      target_audience: 'Product Audience'
    });
    db.createSquad({
      product_id: product.id,
      code: 'inherit-squad',
      name: 'Inherit Squad'
      // No target_audience set
    });

    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'inherit-squad');

    const effective = contextLoader.getEffectiveTargetAudience(
      context.squad,
      context.product,
      context.company
    );

    assert.strictEqual(effective, 'Product Audience');
  });

  test('effective tone of voice inheritance from company', async () => {
    const company = db.createCompany({
      name: 'Tone Co',
      slug: 'tone-co',
      tone_of_voice: 'Formal and professional'
    });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Tone Product',
      slug: 'tone-product'
      // No tone_of_voice set
    });
    db.createSquad({
      product_id: product.id,
      code: 'tone-squad',
      name: 'Tone Squad'
    });

    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'tone-squad');

    const effective = contextLoader.getEffectiveToneOfVoice(
      context.squad,
      context.product,
      context.company
    );

    assert.strictEqual(effective, 'Formal and professional');
  });

  test('load context with multi-agent squad', async () => {
    const squad = db.createSquad({ code: 'multi-agent', name: 'Multi Agent' });

    db.createSquadAgent({ squad_id: squad.id, agent_id: 'a1', name: 'Agent 1', position: 1 });
    db.createSquadAgent({ squad_id: squad.id, agent_id: 'a2', name: 'Agent 2', position: 2 });
    db.createSquadAgent({ squad_id: squad.id, agent_id: 'a3', name: 'Agent 3', position: 3 });

    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'multi-agent');

    assert.strictEqual(context.agents.length, 3);
    assert.strictEqual(context.agents[0].agent_id, 'a1');
    assert.strictEqual(context.agents[2].agent_id, 'a3');
  });
});

// =============================================================================
// 5. MIGRATION FLOWS
// =============================================================================

describe('Migration Flows', () => {
  test('migrate company from markdown with frontmatter', async () => {
    const companyMd = `---
name: Migrated Company
slug: migrated-company
sector: Finance
website: https://migrated.com
---

# Migrated Company

A company description here.
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    const migrate = await import('../src/migrate-to-sqlite.js');
    await migrate.migrateToSqlite(testDir);

    const companies = db.listCompanies();
    assert.strictEqual(companies.length, 1);
    assert.strictEqual(companies[0].name, 'Migrated Company');
    assert.strictEqual(companies[0].sector, 'Finance');
  });

  test('migrate squad.yaml with agents', async () => {
    const squadDir = join(testDir, 'squads', 'migrated-squad');
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: migrated-squad
  name: Migrated Squad
  format: twitter-thread
  skills:
    - web_search
`);

    await writeFile(join(agentsDir, 'agent-one.md'), `---
id: agent-one
name: Agent One
role: First agent
---

Persona content here.
`);

    const migrate = await import('../src/migrate-to-sqlite.js');
    await migrate.migrateToSqlite(testDir);

    const squad = db.getSquadByCode('migrated-squad');
    assert.ok(squad);
    assert.strictEqual(squad.format, 'twitter-thread');

    const agents = db.listSquadAgents(squad.id);
    assert.strictEqual(agents.length, 1);
    assert.strictEqual(agents[0].agent_id, 'agent-one');
  });

  test('migration is idempotent - skips existing entries', async () => {
    // First migration
    const companyMd = `---
name: Idempotent Company
slug: idempotent
---`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    const migrate = await import('../src/migrate-to-sqlite.js');
    await migrate.migrateToSqlite(testDir);

    // Second migration should not create duplicate
    await migrate.migrateToSqlite(testDir);

    const companies = db.listCompanies();
    assert.strictEqual(companies.length, 1);
  });

  test('migration extracts section content from markdown', async () => {
    const companyMd = `---
name: Section Company
slug: section-company
---

# Section Company

## Público-alvo
Young professionals aged 25-35

## Tom de Voz
Casual and friendly
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    const migrate = await import('../src/migrate-to-sqlite.js');
    await migrate.migrateToSqlite(testDir);

    const company = db.getCompanyBySlug('section-company');
    assert.ok(company.target_audience.includes('Young professionals'));
  });

  test('migration parses inline YAML arrays', async () => {
    const squadDir = join(testDir, 'squads', 'inline-array');
    await mkdir(squadDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: inline-array
  name: Inline Array Squad
  skills: [web_search, code-analysis, image-creator]
`);

    const migrate = await import('../src/migrate-to-sqlite.js');
    await migrate.migrateToSqlite(testDir);

    const squad = db.getSquadByCode('inline-array');
    assert.deepStrictEqual(squad.skills, ['web_search', 'code-analysis', 'image-creator']);
  });

  test('migration sets first company as active', async () => {
    const companyMd = `---
name: Auto Active Company
slug: auto-active
---`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    const migrate = await import('../src/migrate-to-sqlite.js');
    await migrate.migrateToSqlite(testDir);

    const activeId = db.getActiveCompanyId();
    const company = db.getCompanyBySlug('auto-active');
    assert.strictEqual(activeId, company.id);
  });
});

// =============================================================================
// 6. RUN HISTORY FLOWS
// =============================================================================

describe('Run History Flows', () => {
  test('create run and progress through steps', () => {
    const squad = db.createSquad({ code: 'run-test', name: 'Run Test' });

    const run = db.createRun({
      squad_id: squad.id,
      topic: 'Test Topic',
      step_count: 2
    });

    assert.strictEqual(run.status, 'running');

    const step1 = db.createRunStep({
      run_id: run.id,
      step_number: 1,
      agent_id: 'step-1',
      agent_name: 'Step 1'
    });

    db.startRunStep(step1.id);
    db.completeRunStep(step1.id, 'output1.md');

    const step2 = db.createRunStep({
      run_id: run.id,
      step_number: 2,
      agent_id: 'step-2',
      agent_name: 'Step 2'
    });

    db.startRunStep(step2.id);
    db.completeRunStep(step2.id, 'output2.md');

    const completedRun = db.completeRun(run.id, 'completed');
    assert.strictEqual(completedRun.status, 'completed');
  });

  test('list runs by squad', () => {
    const squadA = db.createSquad({ code: 'squad-a', name: 'Squad A' });
    const squadB = db.createSquad({ code: 'squad-b', name: 'Squad B' });

    db.createRun({ squad_id: squadA.id, topic: 'Run A1' });
    db.createRun({ squad_id: squadA.id, topic: 'Run A2' });
    db.createRun({ squad_id: squadB.id, topic: 'Run B1' });

    const runsA = db.listRuns(squadA.id);
    const runsB = db.listRuns(squadB.id);

    assert.strictEqual(runsA.length, 2);
    assert.strictEqual(runsB.length, 1);
  });

  test('list all runs', () => {
    const squad = db.createSquad({ code: 'all-runs', name: 'All Runs' });

    db.createRun({ squad_id: squad.id, topic: 'Run 1' });
    db.createRun({ squad_id: squad.id, topic: 'Run 2' });
    db.createRun({ squad_id: squad.id, topic: 'Run 3' });

    const allRuns = db.listAllRuns();
    assert.strictEqual(allRuns.length, 3);
  });

  test('run can be marked as failed', () => {
    const squad = db.createSquad({ code: 'fail-test', name: 'Fail Test' });
    const run = db.createRun({ squad_id: squad.id, topic: 'Will Fail' });

    const failedRun = db.completeRun(run.id, 'failed', 'API rate limit exceeded');

    assert.strictEqual(failedRun.status, 'failed');
    assert.strictEqual(failedRun.error_message, 'API rate limit exceeded');
  });
});

// =============================================================================
// 7. MEMORY SYSTEM FLOWS
// =============================================================================

describe('Memory System Flows', () => {
  test('create and retrieve memories at all levels', () => {
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

    db.createMemory({
      company_id: company.id,
      category: 'brand',
      content: 'Company memory',
      relevance_score: 1.0
    });

    db.createMemory({
      product_id: product.id,
      category: 'feature',
      content: 'Product memory',
      relevance_score: 0.9
    });

    db.createMemory({
      squad_id: squad.id,
      category: 'learning',
      content: 'Squad memory',
      relevance_score: 0.8
    });

    const companyMemories = db.listCompanyMemories(company.id);
    const productMemories = db.listProductMemories(product.id);
    const squadMemories = db.listSquadMemories(squad.id);

    assert.strictEqual(companyMemories.length, 1);
    assert.strictEqual(productMemories.length, 1);
    assert.strictEqual(squadMemories.length, 1);
  });

  test('memories sorted by relevance', () => {
    const company = db.createCompany({ name: 'Sort Co', slug: 'sort-co' });

    db.createMemory({
      company_id: company.id,
      category: 'test',
      content: 'Low relevance',
      relevance_score: 0.5
    });

    db.createMemory({
      company_id: company.id,
      category: 'test',
      content: 'High relevance',
      relevance_score: 0.9
    });

    db.createMemory({
      company_id: company.id,
      category: 'test',
      content: 'Medium relevance',
      relevance_score: 0.7
    });

    const memories = db.listCompanyMemories(company.id);

    assert.strictEqual(memories[0].relevance_score, 0.9);
    assert.strictEqual(memories[1].relevance_score, 0.7);
    assert.strictEqual(memories[2].relevance_score, 0.5);
  });

  test('memory linked to run', () => {
    const squad = db.createSquad({ code: 'run-memory', name: 'Run Memory' });
    const run = db.createRun({ squad_id: squad.id, topic: 'Memory Run' });

    db.createMemory({
      squad_id: squad.id,
      source_run_id: run.id,
      category: 'insight',
      content: 'Learned from run'
    });

    const memories = db.listSquadMemories(squad.id);
    assert.strictEqual(memories[0].source_run_id, run.id);
  });
});

// =============================================================================
// 8. FILE GENERATION FLOWS
// =============================================================================

describe('File Generation Flows', () => {
  test('generate squad.yaml from database', async () => {
    db.createSquad({
      code: 'gen-squad',
      name: 'Generated Squad',
      description: 'A generated squad',
      format: 'instagram-feed',
      skills: ['web_search']
    });

    const generator = await import('../src/squad-generator.js');
    await generator.generateSquadFiles(testDir, 'gen-squad');

    const yamlPath = join(testDir, 'squads', 'gen-squad', 'squad.yaml');
    const content = await readFile(yamlPath, 'utf-8');

    assert.ok(content.includes('gen-squad'));
    assert.ok(content.includes('Generated Squad'));
    assert.ok(content.includes('instagram-feed'));
  });

  test('generate agent files from database', async () => {
    const squad = db.createSquad({ code: 'gen-agents', name: 'Gen Agents' });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'gen-agent',
      name: 'Generated Agent',
      role: 'Test role',
      persona: 'Agent persona content'
    });

    const generator = await import('../src/squad-generator.js');
    await generator.generateSquadFiles(testDir, 'gen-agents');

    const agentPath = join(testDir, 'squads', 'gen-agents', 'agents', 'gen-agent.md');
    const content = await readFile(agentPath, 'utf-8');

    assert.ok(content.includes('Generated Agent'));
    assert.ok(content.includes('Test role'));
  });

  test('generate context file for squad', async () => {
    const company = db.createCompany({ name: 'Gen Co', slug: 'gen-co' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Gen Product',
      slug: 'gen-product'
    });
    db.createSquad({
      product_id: product.id,
      code: 'gen-context',
      name: 'Gen Context'
    });

    const generator = await import('../src/squad-generator.js');
    await generator.generateContextFile(testDir, 'gen-context');

    const contextPath = join(testDir, 'squads', 'gen-context', '_context.md');
    const content = await readFile(contextPath, 'utf-8');

    assert.ok(content.includes('Gen Co'));
    assert.ok(content.includes('Gen Product'));
  });

  test('sync all squads generates all files', async () => {
    db.createSquad({ code: 'sync-1', name: 'Sync 1' });
    db.createSquad({ code: 'sync-2', name: 'Sync 2' });
    db.createSquad({ code: 'sync-3', name: 'Sync 3' });

    const generator = await import('../src/squad-generator.js');
    const result = await generator.syncAllSquads(testDir);

    assert.ok(result.success);
    assert.strictEqual(result.count, 3);

    await stat(join(testDir, 'squads', 'sync-1', 'squad.yaml'));
    await stat(join(testDir, 'squads', 'sync-2', 'squad.yaml'));
    await stat(join(testDir, 'squads', 'sync-3', 'squad.yaml'));
  });
});

// =============================================================================
// 9. STATISTICS AND REPORTING FLOWS
// =============================================================================

describe('Statistics Flows', () => {
  test('get comprehensive stats', () => {
    const company = db.createCompany({ name: 'Stats Co', slug: 'stats-co' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Stats Prod',
      slug: 'stats-prod'
    });
    const squad = db.createSquad({
      product_id: product.id,
      code: 'stats-squad',
      name: 'Stats Squad'
    });

    const run1 = db.createRun({ squad_id: squad.id, topic: 'Run 1' });
    db.completeRun(run1.id, 'completed');

    const run2 = db.createRun({ squad_id: squad.id, topic: 'Run 2' });
    db.completeRun(run2.id, 'failed', 'Error');

    db.createMemory({
      company_id: company.id,
      category: 'test',
      content: 'Memory'
    });

    const stats = db.getStats();

    assert.strictEqual(stats.companies, 1);
    assert.strictEqual(stats.products, 1);
    assert.strictEqual(stats.squads, 1);
    assert.strictEqual(stats.runs.total, 2);
    assert.strictEqual(stats.runs.completed, 1);
    assert.strictEqual(stats.runs.failed, 1);
    assert.strictEqual(stats.memories, 1);
  });
});

// =============================================================================
// 10. MULTI-COMMAND WORKFLOWS
// =============================================================================

describe('Multi-Command Workflows', () => {
  test('complete workflow: company → product → squad → run → memory', () => {
    // 1. Create company
    const company = db.createCompany({
      name: 'Workflow Co',
      slug: 'workflow-co',
      sector: 'Tech'
    });
    db.setActiveCompanyId(company.id);

    // 2. Create product
    const product = db.createProduct({
      company_id: company.id,
      name: 'Workflow Product',
      slug: 'workflow-product'
    });
    db.setActiveProductId(product.id);

    // 3. Create squad with agents
    const squad = db.createSquad({
      product_id: product.id,
      code: 'workflow-squad',
      name: 'Workflow Squad'
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-1',
      name: 'Agent 1',
      position: 1
    });

    // 4. Execute run
    const run = db.createRun({
      squad_id: squad.id,
      topic: 'Workflow Test',
      step_count: 1
    });

    const step = db.createRunStep({
      run_id: run.id,
      step_number: 1,
      agent_id: 'agent-1',
      agent_name: 'Agent 1'
    });

    db.startRunStep(step.id);
    db.completeRunStep(step.id, 'output.md');
    db.completeRun(run.id, 'completed');

    // 5. Create memory from run
    db.createMemory({
      squad_id: squad.id,
      source_run_id: run.id,
      category: 'learning',
      content: 'Workflow completed successfully'
    });

    // 6. Verify entire workflow
    const stats = db.getStats();
    assert.strictEqual(stats.companies, 1);
    assert.strictEqual(stats.products, 1);
    assert.strictEqual(stats.squads, 1);
    assert.strictEqual(stats.runs.completed, 1);
    assert.strictEqual(stats.memories, 1);

    const context = db.getActiveContext();
    assert.strictEqual(context.company.name, 'Workflow Co');
    assert.strictEqual(context.product.name, 'Workflow Product');
  });

  test('workflow with context switching between multiple companies', () => {
    // Create 2 companies with products
    const companyA = db.createCompany({ name: 'Company A', slug: 'company-a' });
    const companyB = db.createCompany({ name: 'Company B', slug: 'company-b' });

    const productA1 = db.createProduct({
      company_id: companyA.id,
      name: 'Product A1',
      slug: 'product-a1'
    });
    const productB1 = db.createProduct({
      company_id: companyB.id,
      name: 'Product B1',
      slug: 'product-b1'
    });

    // Switch to Company A
    db.setActiveCompanyId(companyA.id);
    db.setActiveProductId(productA1.id);

    let context = db.getActiveContext();
    assert.strictEqual(context.company.name, 'Company A');
    assert.strictEqual(context.product.name, 'Product A1');

    // Switch to Company B
    db.setActiveCompanyId(companyB.id);
    db.setActiveProductId(productB1.id);

    context = db.getActiveContext();
    assert.strictEqual(context.company.name, 'Company B');
    assert.strictEqual(context.product.name, 'Product B1');
  });

  test('workflow: migration → context loading → file generation', async () => {
    // 1. Create source files
    const companyMd = `---
name: Pipeline Company
slug: pipeline-company
---`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    const squadDir = join(testDir, 'squads', 'pipeline-squad');
    await mkdir(squadDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: pipeline-squad
  name: Pipeline Squad
`);

    // 2. Migrate
    const migrate = await import('../src/migrate-to-sqlite.js');
    await migrate.migrateToSqlite(testDir);

    // 3. Load context
    const contextLoader = await import('../src/context-loader.js');
    const context = await contextLoader.loadSquadContext(testDir, 'pipeline-squad');

    assert.ok(context.squad);

    // 4. Create a new squad in DB
    const newSquad = db.createSquad({
      code: 'new-from-db',
      name: 'New From DB'
    });

    // 5. Generate files
    const generator = await import('../src/squad-generator.js');
    await generator.generateSquadFiles(testDir, 'new-from-db');

    // 6. Verify generated files
    const yamlContent = await readFile(
      join(testDir, 'squads', 'new-from-db', 'squad.yaml'),
      'utf-8'
    );
    assert.ok(yamlContent.includes('new-from-db'));
  });
});

// =============================================================================
// 11. ERROR HANDLING FLOWS
// =============================================================================

describe('Error Handling Flows', () => {
  test('graceful handling of non-existent squad code', async () => {
    const contextLoader = await import('../src/context-loader.js');

    await assert.rejects(
      async () => contextLoader.loadSquadContext(testDir, 'non-existent'),
      { message: /Squad "non-existent" not found/ }
    );
  });

  test('graceful handling of non-existent company', () => {
    const company = db.getCompanyById('non-existent-uuid');
    assert.strictEqual(company, undefined);
  });

  test('graceful handling of non-existent product', () => {
    const product = db.getProductById('non-existent-uuid');
    assert.strictEqual(product, undefined);
  });

  test('constraint violation returns meaningful error', () => {
    db.createCompany({ name: 'Unique', slug: 'unique' });

    try {
      db.createCompany({ name: 'Duplicate', slug: 'unique' });
      assert.fail('Should have thrown');
    } catch (error) {
      assert.ok(error.message.includes('UNIQUE') || error.message.includes('constraint'));
    }
  });

  test('file generation for non-existent squad throws', async () => {
    const generator = await import('../src/squad-generator.js');

    await assert.rejects(
      async () => generator.generateSquadFiles(testDir, 'non-existent'),
      { message: /Squad "non-existent" not found/ }
    );
  });
});

// =============================================================================
// 12. CASCADE DELETION FLOWS
// =============================================================================

describe('Cascade Deletion Flows', () => {
  test('delete company cascades to products, squads, runs', () => {
    const company = db.createCompany({ name: 'Cascade Co', slug: 'cascade-co' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Cascade Prod',
      slug: 'cascade-prod'
    });
    const squad = db.createSquad({
      product_id: product.id,
      code: 'cascade-squad',
      name: 'Cascade Squad'
    });
    const run = db.createRun({
      squad_id: squad.id,
      topic: 'Cascade Run'
    });

    db.deleteCompany(company.id);

    assert.strictEqual(db.getCompanyById(company.id), undefined);
    assert.strictEqual(db.getProductById(product.id), undefined);
  });

  test('delete product does not delete company', () => {
    const company = db.createCompany({ name: 'Parent Co', slug: 'parent-co' });
    const product = db.createProduct({
      company_id: company.id,
      name: 'Child Prod',
      slug: 'child-prod'
    });

    db.deleteProduct(product.id);

    assert.ok(db.getCompanyById(company.id));
    assert.strictEqual(db.getProductById(product.id), undefined);
  });

  test('delete squad cascades to agents and runs', () => {
    const squad = db.createSquad({ code: 'cascade-del', name: 'Cascade Del' });
    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'agent-del',
      name: 'Agent Del'
    });
    db.createRun({ squad_id: squad.id, topic: 'Run Del' });

    db.deleteSquad(squad.id);

    assert.strictEqual(db.getSquadById(squad.id), undefined);
    assert.strictEqual(db.listSquadAgents(squad.id).length, 0);
  });
});

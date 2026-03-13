import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// We need to dynamically import the db module after setting up the test directory
let db;
let testDir;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-db-test-'));

  // Create _opensquad directory structure
  const { mkdir } = await import('node:fs/promises');
  await mkdir(join(testDir, '_opensquad', 'data'), { recursive: true });

  // Import db module fresh for each test
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
// COMPANY TESTS
// =============================================================================

test('createCompany creates a company with all fields', async () => {
  const company = db.createCompany({
    name: 'Test Company',
    slug: 'test-company',
    description: 'A test company',
    website: 'https://test.com',
    sector: 'Technology',
    target_audience: 'Developers',
    tone_of_voice: 'Professional',
    icon: '🏢'
  });

  assert.ok(company.id);
  assert.strictEqual(company.name, 'Test Company');
  assert.strictEqual(company.slug, 'test-company');
  assert.strictEqual(company.description, 'A test company');
  assert.strictEqual(company.website, 'https://test.com');
  assert.strictEqual(company.sector, 'Technology');
  assert.strictEqual(company.target_audience, 'Developers');
  assert.strictEqual(company.tone_of_voice, 'Professional');
  assert.strictEqual(company.icon, '🏢');
  assert.ok(company.created_at);
  assert.ok(company.updated_at);
});

test('createCompany uses default icon when not provided', async () => {
  const company = db.createCompany({
    name: 'Test Company',
    slug: 'test-company'
  });

  assert.strictEqual(company.icon, '🏢');
});

test('getCompanyById returns the correct company', async () => {
  const created = db.createCompany({
    name: 'Test Company',
    slug: 'test-company'
  });

  const found = db.getCompanyById(created.id);
  assert.strictEqual(found.id, created.id);
  assert.strictEqual(found.name, 'Test Company');
});

test('getCompanyById returns null for non-existent id', async () => {
  const found = db.getCompanyById('non-existent-id');
  assert.strictEqual(found, undefined);
});

test('getCompanyBySlug returns the correct company', async () => {
  db.createCompany({
    name: 'Test Company',
    slug: 'test-company'
  });

  const found = db.getCompanyBySlug('test-company');
  assert.strictEqual(found.slug, 'test-company');
});

test('listCompanies returns all companies sorted by name', async () => {
  db.createCompany({ name: 'Zebra Corp', slug: 'zebra' });
  db.createCompany({ name: 'Alpha Inc', slug: 'alpha' });
  db.createCompany({ name: 'Beta LLC', slug: 'beta' });

  const companies = db.listCompanies();
  assert.strictEqual(companies.length, 3);
  assert.strictEqual(companies[0].name, 'Alpha Inc');
  assert.strictEqual(companies[1].name, 'Beta LLC');
  assert.strictEqual(companies[2].name, 'Zebra Corp');
});

test('updateCompany updates the company fields', async () => {
  const created = db.createCompany({
    name: 'Test Company',
    slug: 'test-company'
  });

  const updated = db.updateCompany(created.id, {
    name: 'Updated Company',
    description: 'Updated description'
  });

  assert.strictEqual(updated.name, 'Updated Company');
  assert.strictEqual(updated.description, 'Updated description');
  assert.strictEqual(updated.slug, 'test-company'); // unchanged
});

test('deleteCompany removes the company', async () => {
  const created = db.createCompany({
    name: 'Test Company',
    slug: 'test-company'
  });

  db.deleteCompany(created.id);
  const found = db.getCompanyById(created.id);
  assert.strictEqual(found, undefined);
});

// =============================================================================
// PRODUCT TESTS
// =============================================================================

test('createProduct creates a product linked to company', async () => {
  const company = db.createCompany({
    name: 'Test Company',
    slug: 'test-company'
  });

  const product = db.createProduct({
    company_id: company.id,
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product',
    key_features: ['Feature 1', 'Feature 2']
  });

  assert.ok(product.id);
  assert.strictEqual(product.company_id, company.id);
  assert.strictEqual(product.name, 'Test Product');
  assert.strictEqual(product.slug, 'test-product');
  assert.deepStrictEqual(product.key_features, ['Feature 1', 'Feature 2']);
});

test('listProducts returns products for a company', async () => {
  const company1 = db.createCompany({ name: 'Company 1', slug: 'company-1' });
  const company2 = db.createCompany({ name: 'Company 2', slug: 'company-2' });

  db.createProduct({ company_id: company1.id, name: 'Product A', slug: 'product-a' });
  db.createProduct({ company_id: company1.id, name: 'Product B', slug: 'product-b' });
  db.createProduct({ company_id: company2.id, name: 'Product C', slug: 'product-c' });

  const products1 = db.listProducts(company1.id);
  const products2 = db.listProducts(company2.id);

  assert.strictEqual(products1.length, 2);
  assert.strictEqual(products2.length, 1);
});

test('listAllProducts returns all products with company info', async () => {
  const company1 = db.createCompany({ name: 'Company 1', slug: 'company-1' });
  const company2 = db.createCompany({ name: 'Company 2', slug: 'company-2' });

  db.createProduct({ company_id: company1.id, name: 'Product A', slug: 'product-a' });
  db.createProduct({ company_id: company2.id, name: 'Product B', slug: 'product-b' });

  const products = db.listAllProducts();
  assert.strictEqual(products.length, 2);
  assert.ok(products[0].company_name);
  assert.ok(products[0].company_slug);
});

test('deleteProduct removes the product', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });
  const product = db.createProduct({
    company_id: company.id,
    name: 'Test Product',
    slug: 'test-product'
  });

  db.deleteProduct(product.id);
  const found = db.getProductById(product.id);
  assert.strictEqual(found, undefined);
});

// =============================================================================
// SQUAD TESTS
// =============================================================================

test('createSquad creates a squad', async () => {
  const squad = db.createSquad({
    code: 'test-squad',
    name: 'Test Squad',
    description: 'A test squad',
    format: 'instagram-feed',
    skills: ['web_search', 'image-creator']
  });

  assert.ok(squad.id);
  assert.strictEqual(squad.code, 'test-squad');
  assert.strictEqual(squad.name, 'Test Squad');
  assert.deepStrictEqual(squad.skills, ['web_search', 'image-creator']);
});

test('createSquad can link to a product', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });
  const product = db.createProduct({
    company_id: company.id,
    name: 'Test Product',
    slug: 'test-product'
  });

  const squad = db.createSquad({
    product_id: product.id,
    code: 'test-squad',
    name: 'Test Squad'
  });

  assert.strictEqual(squad.product_id, product.id);
});

test('getSquadByCode returns the correct squad', async () => {
  db.createSquad({ code: 'my-squad', name: 'My Squad' });

  const found = db.getSquadByCode('my-squad');
  assert.strictEqual(found.code, 'my-squad');
  assert.strictEqual(found.name, 'My Squad');
});

test('listAllSquads returns all squads with product/company info', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });
  const product = db.createProduct({
    company_id: company.id,
    name: 'Test Product',
    slug: 'test-product'
  });

  db.createSquad({ product_id: product.id, code: 'squad-1', name: 'Squad 1' });
  db.createSquad({ code: 'squad-2', name: 'Squad 2' }); // No product

  const squads = db.listAllSquads();
  assert.strictEqual(squads.length, 2);
});

// =============================================================================
// RUN TESTS
// =============================================================================

test('createRun creates a run for a squad', async () => {
  const squad = db.createSquad({ code: 'test-squad', name: 'Test Squad' });

  const run = db.createRun({
    squad_id: squad.id,
    topic: 'Test Topic',
    step_count: 5
  });

  assert.ok(run.id);
  assert.strictEqual(run.squad_id, squad.id);
  assert.strictEqual(run.status, 'running');
  assert.strictEqual(run.topic, 'Test Topic');
  assert.strictEqual(run.step_count, 5);
  assert.ok(run.started_at);
});

test('completeRun updates status and calculates duration', async () => {
  const squad = db.createSquad({ code: 'test-squad', name: 'Test Squad' });
  const run = db.createRun({ squad_id: squad.id, topic: 'Test' });

  // Wait a bit to have measurable duration
  await new Promise(resolve => setTimeout(resolve, 10));

  const completed = db.completeRun(run.id, 'completed');

  assert.strictEqual(completed.status, 'completed');
  assert.ok(completed.completed_at);
  assert.ok(completed.duration_ms > 0);
});

test('completeRun can record error message', async () => {
  const squad = db.createSquad({ code: 'test-squad', name: 'Test Squad' });
  const run = db.createRun({ squad_id: squad.id, topic: 'Test' });

  const failed = db.completeRun(run.id, 'failed', 'API Error');

  assert.strictEqual(failed.status, 'failed');
  assert.strictEqual(failed.error_message, 'API Error');
});

test('listRuns returns runs for a squad', async () => {
  const squad1 = db.createSquad({ code: 'squad-1', name: 'Squad 1' });
  const squad2 = db.createSquad({ code: 'squad-2', name: 'Squad 2' });

  db.createRun({ squad_id: squad1.id, topic: 'Run 1' });
  db.createRun({ squad_id: squad1.id, topic: 'Run 2' });
  db.createRun({ squad_id: squad2.id, topic: 'Run 3' });

  const runs1 = db.listRuns(squad1.id);
  const runs2 = db.listRuns(squad2.id);

  assert.strictEqual(runs1.length, 2);
  assert.strictEqual(runs2.length, 1);
});

// =============================================================================
// RUN STEP TESTS
// =============================================================================

test('createRunStep creates a step for a run', async () => {
  const squad = db.createSquad({ code: 'test-squad', name: 'Test Squad' });
  const run = db.createRun({ squad_id: squad.id, topic: 'Test' });

  const step = db.createRunStep({
    run_id: run.id,
    step_number: 1,
    agent_id: 'researcher',
    agent_name: 'Researcher Agent'
  });

  assert.ok(step.id);
  assert.strictEqual(step.run_id, run.id);
  assert.strictEqual(step.step_number, 1);
  assert.strictEqual(step.agent_id, 'researcher');
  assert.strictEqual(step.status, 'pending');
});

test('startRunStep updates status and started_at', async () => {
  const squad = db.createSquad({ code: 'test-squad', name: 'Test Squad' });
  const run = db.createRun({ squad_id: squad.id, topic: 'Test' });
  const step = db.createRunStep({
    run_id: run.id,
    step_number: 1,
    agent_id: 'researcher',
    agent_name: 'Researcher'
  });

  const started = db.startRunStep(step.id);

  assert.strictEqual(started.status, 'running');
  assert.ok(started.started_at);
});

test('completeRunStep updates status and calculates duration', async () => {
  const squad = db.createSquad({ code: 'test-squad', name: 'Test Squad' });
  const run = db.createRun({ squad_id: squad.id, topic: 'Test' });
  const step = db.createRunStep({
    run_id: run.id,
    step_number: 1,
    agent_id: 'researcher',
    agent_name: 'Researcher'
  });

  db.startRunStep(step.id);
  await new Promise(resolve => setTimeout(resolve, 10));
  const completed = db.completeRunStep(step.id, 'output.md');

  assert.strictEqual(completed.status, 'completed');
  assert.ok(completed.completed_at);
  assert.ok(completed.duration_ms >= 0);
  assert.strictEqual(completed.output_file, 'output.md');
});

test('listRunSteps returns steps in order', async () => {
  const squad = db.createSquad({ code: 'test-squad', name: 'Test Squad' });
  const run = db.createRun({ squad_id: squad.id, topic: 'Test' });

  db.createRunStep({ run_id: run.id, step_number: 3, agent_id: 'c', agent_name: 'C' });
  db.createRunStep({ run_id: run.id, step_number: 1, agent_id: 'a', agent_name: 'A' });
  db.createRunStep({ run_id: run.id, step_number: 2, agent_id: 'b', agent_name: 'B' });

  const steps = db.listRunSteps(run.id);

  assert.strictEqual(steps.length, 3);
  assert.strictEqual(steps[0].step_number, 1);
  assert.strictEqual(steps[1].step_number, 2);
  assert.strictEqual(steps[2].step_number, 3);
});

// =============================================================================
// ACTIVE CONTEXT TESTS
// =============================================================================

test('setActiveCompanyId and getActiveCompanyId work correctly', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });

  assert.strictEqual(db.getActiveCompanyId(), null);

  db.setActiveCompanyId(company.id);
  assert.strictEqual(db.getActiveCompanyId(), company.id);
});

test('setActiveProductId and getActiveProductId work correctly', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });
  const product = db.createProduct({
    company_id: company.id,
    name: 'Test',
    slug: 'test'
  });

  assert.strictEqual(db.getActiveProductId(), null);

  db.setActiveProductId(product.id);
  assert.strictEqual(db.getActiveProductId(), product.id);
});

test('getActiveContext returns company and product', async () => {
  const company = db.createCompany({ name: 'Test Company', slug: 'test' });
  const product = db.createProduct({
    company_id: company.id,
    name: 'Test Product',
    slug: 'test'
  });

  db.setActiveCompanyId(company.id);
  db.setActiveProductId(product.id);

  const context = db.getActiveContext();
  assert.strictEqual(context.company.name, 'Test Company');
  assert.strictEqual(context.product.name, 'Test Product');
});

test('clearActiveContext removes all active selections', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });
  db.setActiveCompanyId(company.id);

  db.clearActiveContext();

  assert.strictEqual(db.getActiveCompanyId(), null);
  assert.strictEqual(db.getActiveProductId(), null);
});

// =============================================================================
// STATISTICS TESTS
// =============================================================================

test('getStats returns correct counts', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });
  const product = db.createProduct({
    company_id: company.id,
    name: 'Test',
    slug: 'test'
  });
  const squad = db.createSquad({ product_id: product.id, code: 'test', name: 'Test' });

  const run1 = db.createRun({ squad_id: squad.id, topic: 'Test 1' });
  const run2 = db.createRun({ squad_id: squad.id, topic: 'Test 2' });

  db.completeRun(run1.id, 'completed');
  db.completeRun(run2.id, 'failed', 'Error');

  const stats = db.getStats();

  assert.strictEqual(stats.companies, 1);
  assert.strictEqual(stats.products, 1);
  assert.strictEqual(stats.squads, 1);
  assert.strictEqual(stats.runs.total, 2);
  assert.strictEqual(stats.runs.completed, 1);
  assert.strictEqual(stats.runs.failed, 1);
});

// =============================================================================
// CASCADE DELETE TESTS
// =============================================================================

test('deleting a company cascades to products', async () => {
  const company = db.createCompany({ name: 'Test', slug: 'test' });
  const product = db.createProduct({
    company_id: company.id,
    name: 'Test',
    slug: 'test'
  });

  db.deleteCompany(company.id);

  const found = db.getProductById(product.id);
  assert.strictEqual(found, undefined);
});

test('deleting a squad cascades to runs', async () => {
  const squad = db.createSquad({ code: 'test', name: 'Test' });
  const run = db.createRun({ squad_id: squad.id, topic: 'Test' });

  db.deleteSquad(squad.id);

  const found = db.getRunById(run.id);
  assert.strictEqual(found, undefined);
});

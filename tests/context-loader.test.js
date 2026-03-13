/**
 * Tests for context-loader.js
 *
 * Tests the loading of company/product context for squad execution.
 */

import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let testDir;
let db;
let contextLoader;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-context-test-'));
  await mkdir(join(testDir, '_opensquad', 'data'), { recursive: true });

  // Import modules fresh for each test
  db = await import('../src/db.js');
  await db.initDb(testDir);

  contextLoader = await import('../src/context-loader.js');
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
// loadSquadContext TESTS
// =============================================================================

describe('loadSquadContext', () => {
  test('loads squad without product or company', async () => {
    db.createSquad({
      code: 'standalone-squad',
      name: 'Standalone Squad',
      description: 'A squad without product'
    });

    const context = await contextLoader.loadSquadContext(testDir, 'standalone-squad');

    assert.ok(context.squad);
    assert.strictEqual(context.squad.code, 'standalone-squad');
    assert.strictEqual(context.product, null);
    assert.strictEqual(context.company, null);
  });

  test('loads squad with product and company', async () => {
    const company = db.createCompany({
      name: 'Test Company',
      slug: 'test-company',
      target_audience: 'Developers',
      tone_of_voice: 'Professional'
    });

    const product = db.createProduct({
      company_id: company.id,
      name: 'Test Product',
      slug: 'test-product',
      target_audience: 'Frontend Developers'
    });

    db.createSquad({
      product_id: product.id,
      code: 'test-squad',
      name: 'Test Squad'
    });

    const context = await contextLoader.loadSquadContext(testDir, 'test-squad');

    assert.ok(context.squad);
    assert.ok(context.product);
    assert.ok(context.company);
    assert.strictEqual(context.company.name, 'Test Company');
    assert.strictEqual(context.product.name, 'Test Product');
  });

  test('loads agents for squad', async () => {
    const squad = db.createSquad({
      code: 'squad-with-agents',
      name: 'Squad with Agents'
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'researcher',
      name: 'Researcher',
      role: 'Research topics',
      position: 1
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'writer',
      name: 'Writer',
      role: 'Write content',
      position: 2
    });

    const context = await contextLoader.loadSquadContext(testDir, 'squad-with-agents');

    assert.strictEqual(context.agents.length, 2);
    assert.strictEqual(context.agents[0].agent_id, 'researcher');
    assert.strictEqual(context.agents[1].agent_id, 'writer');
  });

  test('throws error for non-existent squad', async () => {
    await assert.rejects(
      async () => contextLoader.loadSquadContext(testDir, 'non-existent'),
      { message: 'Squad "non-existent" not found' }
    );
  });

  test('uses active context when squad has no product', async () => {
    const company = db.createCompany({
      name: 'Active Company',
      slug: 'active-company'
    });

    const product = db.createProduct({
      company_id: company.id,
      name: 'Active Product',
      slug: 'active-product'
    });

    db.setActiveCompanyId(company.id);
    db.setActiveProductId(product.id);

    db.createSquad({
      code: 'orphan-squad',
      name: 'Orphan Squad'
      // No product_id
    });

    const context = await contextLoader.loadSquadContext(testDir, 'orphan-squad');

    assert.ok(context.product);
    assert.ok(context.company);
    assert.strictEqual(context.product.name, 'Active Product');
    assert.strictEqual(context.company.name, 'Active Company');
  });

  test('generates context markdown', async () => {
    const company = db.createCompany({
      name: 'Markdown Company',
      slug: 'md-company',
      description: 'A company for testing',
      sector: 'Technology',
      target_audience: 'Developers'
    });

    const product = db.createProduct({
      company_id: company.id,
      name: 'Markdown Product',
      slug: 'md-product',
      description: 'A product for testing',
      value_proposition: 'Best product ever'
    });

    db.createSquad({
      product_id: product.id,
      code: 'md-squad',
      name: 'Markdown Squad',
      description: 'A squad for testing',
      format: 'instagram-feed'
    });

    const context = await contextLoader.loadSquadContext(testDir, 'md-squad');

    assert.ok(context.context);
    assert.ok(context.context.includes('Markdown Company'));
    assert.ok(context.context.includes('Markdown Product'));
    assert.ok(context.context.includes('Markdown Squad'));
    assert.ok(context.context.includes('Technology'));
    assert.ok(context.context.includes('Developers'));
  });
});

// =============================================================================
// getEffectiveTargetAudience TESTS
// =============================================================================

describe('getEffectiveTargetAudience', () => {
  test('returns squad target_audience when set', () => {
    const squad = { target_audience: 'Squad Audience' };
    const product = { target_audience: 'Product Audience' };
    const company = { target_audience: 'Company Audience' };

    const result = contextLoader.getEffectiveTargetAudience(squad, product, company);
    assert.strictEqual(result, 'Squad Audience');
  });

  test('falls back to product target_audience', () => {
    const squad = { target_audience: null };
    const product = { target_audience: 'Product Audience' };
    const company = { target_audience: 'Company Audience' };

    const result = contextLoader.getEffectiveTargetAudience(squad, product, company);
    assert.strictEqual(result, 'Product Audience');
  });

  test('falls back to company target_audience', () => {
    const squad = { target_audience: null };
    const product = { target_audience: null };
    const company = { target_audience: 'Company Audience' };

    const result = contextLoader.getEffectiveTargetAudience(squad, product, company);
    assert.strictEqual(result, 'Company Audience');
  });

  test('returns null when nothing is set', () => {
    const result = contextLoader.getEffectiveTargetAudience({}, {}, {});
    assert.strictEqual(result, null);
  });

  test('handles null objects', () => {
    const result = contextLoader.getEffectiveTargetAudience(null, null, null);
    assert.strictEqual(result, null);
  });
});

// =============================================================================
// getEffectiveToneOfVoice TESTS
// =============================================================================

describe('getEffectiveToneOfVoice', () => {
  test('returns product tone_of_voice when set', () => {
    const product = { tone_of_voice: 'Professional' };
    const company = { tone_of_voice: 'Casual' };

    const result = contextLoader.getEffectiveToneOfVoice(null, product, company);
    assert.strictEqual(result, 'Professional');
  });

  test('falls back to company tone_of_voice', () => {
    const product = { tone_of_voice: null };
    const company = { tone_of_voice: 'Casual' };

    const result = contextLoader.getEffectiveToneOfVoice(null, product, company);
    assert.strictEqual(result, 'Casual');
  });

  test('returns null when nothing is set', () => {
    const result = contextLoader.getEffectiveToneOfVoice(null, {}, {});
    assert.strictEqual(result, null);
  });
});

// =============================================================================
// buildJsonContext TESTS
// =============================================================================

describe('buildJsonContext', () => {
  test('builds complete JSON context', async () => {
    const company = db.createCompany({
      name: 'JSON Company',
      slug: 'json-company',
      description: 'For JSON testing',
      website: 'https://json.com',
      sector: 'Tech',
      target_audience: 'Testers',
      tone_of_voice: 'Technical',
      social_instagram: '@json',
      social_linkedin: 'https://linkedin.com/json',
      social_twitter: '@jsonx'
    });

    const product = db.createProduct({
      company_id: company.id,
      name: 'JSON Product',
      slug: 'json-product',
      description: 'Product for JSON',
      target_audience: 'JSON Users',
      value_proposition: 'Best JSON',
      key_features: ['Fast', 'Reliable']
    });

    const squad = db.createSquad({
      product_id: product.id,
      code: 'json-squad',
      name: 'JSON Squad',
      description: 'Squad for JSON',
      format: 'json-format',
      performance_mode: 'alta-performance',
      skills: ['parsing', 'validation']
    });

    db.createSquadAgent({
      squad_id: squad.id,
      agent_id: 'parser',
      name: 'Parser Agent',
      role: 'Parse JSON',
      execution: 'inline',
      skills: ['parse'],
      position: 1
    });

    const context = await contextLoader.buildJsonContext(testDir, 'json-squad');

    // Company assertions
    assert.strictEqual(context.company.name, 'JSON Company');
    assert.strictEqual(context.company.slug, 'json-company');
    assert.strictEqual(context.company.social.instagram, '@json');

    // Product assertions
    assert.strictEqual(context.product.name, 'JSON Product');
    assert.deepStrictEqual(context.product.key_features, ['Fast', 'Reliable']);

    // Squad assertions
    assert.strictEqual(context.squad.code, 'json-squad');
    assert.deepStrictEqual(context.squad.skills, ['parsing', 'validation']);

    // Agents assertions
    assert.strictEqual(context.agents.length, 1);
    assert.strictEqual(context.agents[0].id, 'parser');

    // Effective values
    assert.strictEqual(context.effective.target_audience, 'JSON Users');
    assert.strictEqual(context.effective.tone_of_voice, 'Technical');
  });

  test('handles squad without product', async () => {
    db.createSquad({
      code: 'solo-squad',
      name: 'Solo Squad'
    });

    const context = await contextLoader.buildJsonContext(testDir, 'solo-squad');

    assert.strictEqual(context.company, null);
    assert.strictEqual(context.product, null);
    assert.ok(context.squad);
    assert.strictEqual(context.squad.code, 'solo-squad');
  });
});

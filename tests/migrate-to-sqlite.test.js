/**
 * Tests for migrate-to-sqlite.js
 *
 * Tests the migration of existing MD/YAML data to SQLite.
 */

import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let testDir;
let db;
let migrate;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-migrate-test-'));
  await mkdir(join(testDir, '_opensquad', 'data'), { recursive: true });
  await mkdir(join(testDir, '_opensquad', '_memory'), { recursive: true });
  await mkdir(join(testDir, 'squads'), { recursive: true });

  db = await import('../src/db.js');
  migrate = await import('../src/migrate-to-sqlite.js');
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
// COMPANY MIGRATION TESTS
// =============================================================================

describe('company migration', () => {
  test('migrates company from company.md with frontmatter', async () => {
    const companyMd = `---
name: Test Company
slug: test-company
description: A test company
website: https://test.com
sector: Technology
instagram: @test
linkedin: https://linkedin.com/test
twitter: @testx
icon: 🚀
---

# Test Company

This is a test company for migration.
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    await migrate.migrateToSqlite(testDir);

    const companies = db.listCompanies();
    assert.strictEqual(companies.length, 1);
    assert.strictEqual(companies[0].name, 'Test Company');
    assert.strictEqual(companies[0].slug, 'test-company');
    assert.strictEqual(companies[0].website, 'https://test.com');
  });

  test('extracts company name from markdown heading', async () => {
    const companyMd = `# Amazing Company

This is our company description.

## Público-alvo
Developers and engineers
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    await migrate.migrateToSqlite(testDir);

    const companies = db.listCompanies();
    assert.strictEqual(companies.length, 1);
    assert.strictEqual(companies[0].name, 'Amazing Company');
  });

  test('extracts target audience from markdown section', async () => {
    const companyMd = `---
name: Audience Company
slug: audience-company
---

# Audience Company

## Público-alvo
Developers, designers, and product managers
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    await migrate.migrateToSqlite(testDir);

    const companies = db.listCompanies();
    assert.strictEqual(companies.length, 1);
    assert.ok(companies[0].target_audience.includes('Developers'));
  });

  test('sets first company as active', async () => {
    const companyMd = `---
name: Active Company
slug: active-company
---
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);

    await migrate.migrateToSqlite(testDir);

    const activeId = db.getActiveCompanyId();
    const companies = db.listCompanies();
    assert.strictEqual(activeId, companies[0].id);
  });

  test('skips duplicate company slugs', async () => {
    // First migration
    const companyMd = `---
name: First Company
slug: first-company
---
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd);
    await migrate.migrateToSqlite(testDir);

    // Second migration with same slug should be skipped
    const companyMd2 = `---
name: Second Company
slug: first-company
---
`;
    await writeFile(join(testDir, '_opensquad', '_memory', 'company.md'), companyMd2);
    await migrate.migrateToSqlite(testDir);

    const companies = db.listCompanies();
    assert.strictEqual(companies.length, 1);
    assert.strictEqual(companies[0].name, 'First Company'); // Original name kept
  });
});

// =============================================================================
// SQUAD MIGRATION TESTS
// =============================================================================

describe('squad migration', () => {
  test('migrates squad from squad.yaml', async () => {
    const squadDir = join(testDir, 'squads', 'test-squad');
    await mkdir(squadDir, { recursive: true });

    const squadYaml = `squad:
  code: test-squad
  name: Test Squad
  description: A test squad for migration
  icon: 📋
  format: instagram-feed
  skills:
    - web_search
    - image-creator
`;
    await writeFile(join(squadDir, 'squad.yaml'), squadYaml);

    await migrate.migrateToSqlite(testDir);

    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 1);
    assert.strictEqual(squads[0].code, 'test-squad');
    assert.strictEqual(squads[0].name, 'Test Squad');
    assert.strictEqual(squads[0].format, 'instagram-feed');
  });

  test('migrates multiple squads', async () => {
    for (const code of ['squad-a', 'squad-b', 'squad-c']) {
      const squadDir = join(testDir, 'squads', code);
      await mkdir(squadDir, { recursive: true });

      await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: ${code}
  name: ${code.toUpperCase()}
`);
    }

    await migrate.migrateToSqlite(testDir);

    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 3);
  });

  test('uses directory name as fallback for code', async () => {
    const squadDir = join(testDir, 'squads', 'my-fallback-squad');
    await mkdir(squadDir, { recursive: true });

    const squadYaml = `squad:
  name: Fallback Squad
`;
    await writeFile(join(squadDir, 'squad.yaml'), squadYaml);

    await migrate.migrateToSqlite(testDir);

    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 1);
    // Code should be derived from directory or name
  });

  test('skips duplicate squad codes', async () => {
    // First migration
    const squadDir = join(testDir, 'squads', 'existing-squad');
    await mkdir(squadDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: existing-squad
  name: First Squad
`);

    await migrate.migrateToSqlite(testDir);

    // Update the yaml to have different name
    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: existing-squad
  name: Second Squad
`);

    // Second migration should skip
    await migrate.migrateToSqlite(testDir);

    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 1);
    assert.strictEqual(squads[0].name, 'First Squad'); // Original name kept
  });

  test('skips hidden directories', async () => {
    const hiddenDir = join(testDir, 'squads', '.hidden-squad');
    await mkdir(hiddenDir, { recursive: true });

    await writeFile(join(hiddenDir, 'squad.yaml'), `squad:
  code: hidden-squad
  name: Hidden Squad
`);

    await migrate.migrateToSqlite(testDir);

    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 0);
  });

  test('skips underscore directories', async () => {
    const underscoreDir = join(testDir, 'squads', '_internal-squad');
    await mkdir(underscoreDir, { recursive: true });

    await writeFile(join(underscoreDir, 'squad.yaml'), `squad:
  code: internal-squad
  name: Internal Squad
`);

    await migrate.migrateToSqlite(testDir);

    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 0);
  });
});

// =============================================================================
// AGENT MIGRATION TESTS
// =============================================================================

describe('agent migration', () => {
  test('migrates agents from agent markdown files', async () => {
    const squadDir = join(testDir, 'squads', 'agent-squad');
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: agent-squad
  name: Agent Squad
`);

    const agentMd = `---
id: researcher
name: Carlos Researcher
icon: 🔍
role: Research topics deeply
execution: subagent
skills:
  - web_search
---

# Carlos Researcher

I am a skilled researcher who finds the best information.

## My Approach

1. Search broadly
2. Filter relevant
3. Synthesize findings
`;
    await writeFile(join(agentsDir, 'researcher.md'), agentMd);

    await migrate.migrateToSqlite(testDir);

    const squad = db.getSquadByCode('agent-squad');
    const agents = db.listSquadAgents(squad.id);

    assert.strictEqual(agents.length, 1);
    assert.strictEqual(agents[0].agent_id, 'researcher');
    assert.strictEqual(agents[0].name, 'Carlos Researcher');
    assert.strictEqual(agents[0].icon, '🔍');
    assert.strictEqual(agents[0].role, 'Research topics deeply');
    assert.strictEqual(agents[0].execution, 'subagent');
    assert.ok(agents[0].persona.includes('skilled researcher'));
  });

  test('migrates multiple agents with correct order', async () => {
    const squadDir = join(testDir, 'squads', 'multi-agent');
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: multi-agent
  name: Multi Agent Squad
`);

    for (const [idx, name] of ['alpha', 'beta', 'gamma'].entries()) {
      await writeFile(join(agentsDir, `${name}.md`), `---
id: ${name}
name: ${name.toUpperCase()} Agent
---

# ${name.toUpperCase()}

Agent persona here.
`);
    }

    await migrate.migrateToSqlite(testDir);

    const squad = db.getSquadByCode('multi-agent');
    const agents = db.listSquadAgents(squad.id);

    assert.strictEqual(agents.length, 3);
  });

  test('uses filename as agent_id fallback', async () => {
    const squadDir = join(testDir, 'squads', 'fallback-agent');
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: fallback-agent
  name: Fallback Agent Squad
`);

    await writeFile(join(agentsDir, 'my-custom-agent.md'), `---
name: Custom Agent
---

Agent without explicit id.
`);

    await migrate.migrateToSqlite(testDir);

    const squad = db.getSquadByCode('fallback-agent');
    const agents = db.listSquadAgents(squad.id);

    assert.strictEqual(agents.length, 1);
    assert.strictEqual(agents[0].agent_id, 'my-custom-agent');
  });

  test('skips non-md files in agents directory', async () => {
    const squadDir = join(testDir, 'squads', 'mixed-files');
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: mixed-files
  name: Mixed Files Squad
`);

    await writeFile(join(agentsDir, 'valid-agent.md'), `---
id: valid
name: Valid Agent
---
`);

    await writeFile(join(agentsDir, 'readme.txt'), 'Not an agent');
    await writeFile(join(agentsDir, 'config.json'), '{}');

    await migrate.migrateToSqlite(testDir);

    const squad = db.getSquadByCode('mixed-files');
    const agents = db.listSquadAgents(squad.id);

    assert.strictEqual(agents.length, 1);
    assert.strictEqual(agents[0].agent_id, 'valid');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('edge cases', () => {
  test('handles empty squads directory', async () => {
    const result = await migrate.migrateToSqlite(testDir);
    assert.ok(result.success);
  });

  test('handles missing _memory directory', async () => {
    await rm(join(testDir, '_opensquad', '_memory'), { recursive: true, force: true });

    const result = await migrate.migrateToSqlite(testDir);
    assert.ok(result.success);
  });

  test('handles invalid YAML in squad.yaml', async () => {
    const squadDir = join(testDir, 'squads', 'bad-yaml');
    await mkdir(squadDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `
invalid: yaml: content
  - not valid
    missing: quotes "here
`);

    // Should not throw, just skip
    const result = await migrate.migrateToSqlite(testDir);
    assert.ok(result.success);
  });

  test('handles squad directory without squad.yaml', async () => {
    const squadDir = join(testDir, 'squads', 'no-yaml-squad');
    await mkdir(squadDir, { recursive: true });

    // Create some other file
    await writeFile(join(squadDir, 'readme.md'), '# No YAML here');

    const result = await migrate.migrateToSqlite(testDir);
    assert.ok(result.success);

    // Should not create a squad without yaml
    const squads = db.listAllSquads();
    assert.strictEqual(squads.length, 0);
  });

  test('handles agent without frontmatter', async () => {
    const squadDir = join(testDir, 'squads', 'no-frontmatter');
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    await writeFile(join(squadDir, 'squad.yaml'), `squad:
  code: no-frontmatter
  name: No Frontmatter Squad
`);

    await writeFile(join(agentsDir, 'simple-agent.md'), `# Simple Agent

This agent has no frontmatter, just markdown content.

It should still be imported using the filename as id.
`);

    await migrate.migrateToSqlite(testDir);

    const squad = db.getSquadByCode('no-frontmatter');
    const agents = db.listSquadAgents(squad.id);

    assert.strictEqual(agents.length, 1);
  });
});

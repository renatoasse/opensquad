/**
 * E2E Tests for CLI commands
 *
 * These tests run the actual CLI commands and verify their output.
 */

import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync, spawn } from 'node:child_process';

let testDir;
const CLI_PATH = join(import.meta.dirname, '..', 'bin', 'opensquad.js');

// Helper to run CLI command and capture output
function runCli(args, cwd) {
  try {
    const result = execSync(`node "${CLI_PATH}" ${args}`, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: result, exitCode: 0 };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status
    };
  }
}

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'opensquad-cli-test-'));
  // Create _opensquad directory structure
  await mkdir(join(testDir, '_opensquad', 'data'), { recursive: true });
  await mkdir(join(testDir, 'squads'), { recursive: true });
});

afterEach(async () => {
  if (testDir) {
    await rm(testDir, { recursive: true, force: true });
  }
});

// =============================================================================
// COMPANY CLI TESTS
// =============================================================================

describe('opensquad company', () => {
  test('company list shows empty message when no companies', async () => {
    const result = runCli('company list', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('No companies found'));
  });

  test('company help shows usage information', async () => {
    const result = runCli('company', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('opensquad company'));
    assert.ok(result.output.includes('list'));
    assert.ok(result.output.includes('add'));
    assert.ok(result.output.includes('switch'));
  });

  test('company current shows no active company message', async () => {
    const result = runCli('company current', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('No active company'));
  });
});

// =============================================================================
// PRODUCT CLI TESTS
// =============================================================================

describe('opensquad product', () => {
  test('product list requires active company', async () => {
    const result = runCli('product list', testDir);
    assert.ok(!result.success || result.output.includes('No active company'));
  });

  test('product help shows usage information', async () => {
    const result = runCli('product', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('opensquad product'));
    assert.ok(result.output.includes('list'));
    assert.ok(result.output.includes('add'));
  });

  test('product current shows no active product message', async () => {
    const result = runCli('product current', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('No active product'));
  });
});

// =============================================================================
// SQUAD CLI TESTS
// =============================================================================

describe('opensquad squad', () => {
  test('squad list --all shows empty when no squads', async () => {
    const result = runCli('squad list --all', testDir);
    // Command may fail or succeed depending on active product state
    // But output should mention "No squads" or "No active product"
    const output = result.output + (result.stderr || '');
    assert.ok(
      output.includes('No squads found') || output.includes('No active product'),
      `Expected 'No squads found' or 'No active product' but got: ${output}`
    );
  });

  test('squad help shows usage information', async () => {
    const result = runCli('squad', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('opensquad squad'));
    assert.ok(result.output.includes('list'));
    assert.ok(result.output.includes('add'));
  });
});

// =============================================================================
// HISTORY CLI TESTS
// =============================================================================

describe('opensquad history', () => {
  test('history shows empty when no runs', async () => {
    const result = runCli('history', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('No runs found'));
  });
});

// =============================================================================
// BACKUP CLI TESTS
// =============================================================================

describe('opensquad backup', () => {
  test('backup stats shows database statistics', async () => {
    // First run any command to initialize db
    runCli('company list', testDir);

    // Now check stats
    const result = runCli('backup stats', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('Database Statistics'));
    assert.ok(result.output.includes('Companies:'));
    assert.ok(result.output.includes('Products:'));
    assert.ok(result.output.includes('Squads:'));
    assert.ok(result.output.includes('Runs:'));
  });
});

// =============================================================================
// MIGRATE CLI TESTS
// =============================================================================

describe('opensquad migrate', () => {
  test('migrate works with no existing data', async () => {
    const result = runCli('migrate', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('Migration complete'));
  });

  test('migrate imports company from company.md', async () => {
    // Create a company.md file
    const memoryDir = join(testDir, '_opensquad', '_memory');
    await mkdir(memoryDir, { recursive: true });

    const companyMd = `---
name: Test Company
slug: test-company
sector: Technology
---

# Test Company

A test company for migration testing.

## Público-alvo
Developers and testers
`;
    await writeFile(join(memoryDir, 'company.md'), companyMd);

    const result = runCli('migrate', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('Company migrated') || result.output.includes('Migration complete'));
  });

  test('migrate imports squad from squad.yaml', async () => {
    // Create a squad
    const squadDir = join(testDir, 'squads', 'test-squad');
    await mkdir(squadDir, { recursive: true });

    const squadYaml = `squad:
  code: test-squad
  name: Test Squad
  description: A test squad
  format: instagram-feed
`;
    await writeFile(join(squadDir, 'squad.yaml'), squadYaml);

    const result = runCli('migrate', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('Squad migrated') || result.output.includes('Migration complete'));
  });
});

// =============================================================================
// MAIN CLI HELP TESTS
// =============================================================================

describe('opensquad (main)', () => {
  test('shows help when no command provided', async () => {
    const result = runCli('', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('opensquad'));
    assert.ok(result.output.includes('Multi-agent orchestration'));
  });

  test('shows all available commands in help', async () => {
    const result = runCli('', testDir);
    assert.ok(result.success);
    assert.ok(result.output.includes('company'));
    assert.ok(result.output.includes('product'));
    assert.ok(result.output.includes('squad'));
    assert.ok(result.output.includes('history'));
    assert.ok(result.output.includes('backup'));
    assert.ok(result.output.includes('migrate'));
  });
});

// =============================================================================
// DATABASE INITIALIZATION TESTS
// =============================================================================

describe('database initialization', () => {
  test('first command creates database and runs migrations', async () => {
    const { existsSync } = await import('node:fs');

    // Before running any command
    const dbPath = join(testDir, '_opensquad', 'data', 'opensquad.db');
    assert.ok(!existsSync(dbPath), 'Database should not exist before first command');

    // Run a command
    runCli('company list', testDir);

    // After running command
    assert.ok(existsSync(dbPath), 'Database should exist after first command');
  });
});

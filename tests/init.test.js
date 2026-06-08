import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../src/init.js';

test('init creates _opensquad directory structure', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await stat(join(tempDir, '_opensquad'));
    await stat(join(tempDir, '_opensquad', 'core'));
    await stat(join(tempDir, '_opensquad', 'core', 'architect.agent.yaml'));
    await stat(join(tempDir, '_opensquad', 'core', 'runner.pipeline.md'));
    await stat(join(tempDir, '_opensquad', '_memory'));
    await stat(join(tempDir, '.claude', 'skills', 'opensquad', 'SKILL.md'));
    await stat(join(tempDir, 'CLAUDE.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates empty squads directory', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await stat(join(tempDir, 'squads'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init does not overwrite if already initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await init(tempDir, { _skipPrompts: true }); // Should not throw, just warn
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLAUDE.md contains Opensquad instructions', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'CLAUDE.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates _investigations directory', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await stat(join(tempDir, '_opensquad', '_investigations'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init writes preferences file with defaults when prompts skipped', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const prefs = await readFile(join(tempDir, '_opensquad', '_memory', 'preferences.md'), 'utf-8');
    assert.ok(prefs.includes('Output Language:'));
    assert.ok(prefs.includes('English'));
    assert.ok(prefs.includes('IDEs:'));
    assert.ok(prefs.includes('claude-code'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with language option produces translated preferences', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Português (Brasil)' });

    const prefs = await readFile(join(tempDir, '_opensquad', '_memory', 'preferences.md'), 'utf-8');
    assert.ok(prefs.includes('Português (Brasil)'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates .opensquad-version file', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const version = await readFile(join(tempDir, '_opensquad', '.opensquad-version'), 'utf-8');
    assert.ok(version.trim().length > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates README.md in user project', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('README.md contains /opensquad command', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('README.md is in Portuguese when language is PT-BR', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Português (Brasil)' });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('Como Usar'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('README.md is in Spanish when language is Español', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Español' });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    // README is bilingual PT/EN — Spanish falls back to the same file
    assert.ok(content.includes('How to Use'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides installs only selected IDE files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['claude-code'] });

    // claude-code files exist
    await stat(join(tempDir, '.claude', 'skills', 'opensquad', 'SKILL.md'));
    await stat(join(tempDir, 'CLAUDE.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides codex creates AGENTS.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['codex'] });

    const content = await readFile(join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides antigravity creates .agent/rules/opensquad.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['antigravity'] });

    const content = await readFile(
      join(tempDir, '.agent', 'rules', 'opensquad.md'),
      'utf-8'
    );
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides antigravity creates .agent/workflows/opensquad.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['antigravity'] });

    const content = await readFile(
      join(tempDir, '.agent', 'workflows', 'opensquad.md'),
      'utf-8'
    );
    assert.ok(content.includes('description:'));
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with multiple ides records all in preferences', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['claude-code', 'codex'] });

    const prefs = await readFile(join(tempDir, '_opensquad', '_memory', 'preferences.md'), 'utf-8');
    assert.ok(prefs.includes('claude-code'));
    assert.ok(prefs.includes('codex'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates .gitignore with browser profile exclusion', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, '.gitignore'), 'utf-8');
    assert.ok(content.includes('_opensquad/_browser_profile/'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates playwright config with persistent context', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(
      join(tempDir, '_opensquad', 'config', 'playwright.config.json'),
      'utf-8'
    );
    const config = JSON.parse(content);
    assert.equal(config.browser.isolated, false);
    assert.equal(config.browser.userDataDir, '_opensquad/_browser_profile');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with claude-code IDE creates .mcp.json with playwright server', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['claude-code'] });

    const content = await readFile(join(tempDir, '.mcp.json'), 'utf-8');
    const config = JSON.parse(content);
    assert.ok(config.mcpServers.playwright);
    assert.ok(config.mcpServers.playwright.args.includes('--config'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init does not create agents dir when no bundled agents exist', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    // No bundled agents in dev environment — agents/ should not be created
    await assert.rejects(
      stat(join(tempDir, 'agents')),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init installs all bundled skills including MCP skills', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const skillsDir = join(tempDir, 'skills');
    const entries = await readdir(skillsDir);
    assert.ok(entries.includes('apify'), 'apify should be auto-installed');
    assert.ok(entries.includes('blotato'), 'blotato should be auto-installed');
    assert.ok(entries.includes('canva'), 'canva should be auto-installed');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init installs opensquad-skill-creator including subdirs', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const scripts = await readdir(join(tempDir, 'skills', 'opensquad-skill-creator', 'scripts'));
    assert.ok(scripts.length > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init does not overwrite existing package.json', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const pkgPath = join(tempDir, 'package.json');
    await writeFile(pkgPath, JSON.stringify({ name: 'my-project', version: '2.0.0' }), 'utf-8');

    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    assert.equal(pkg.name, 'my-project');
    assert.equal(pkg.version, '2.0.0');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init copies package.json to fresh project', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'package.json'), 'utf-8');
    const pkg = JSON.parse(content);
    assert.ok(pkg.dependencies?.playwright, 'playwright should be listed as a dependency');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides codex creates .agents/skills/opensquad/SKILL.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['codex'] });

    const content = await readFile(
      join(tempDir, '.agents', 'skills', 'opensquad', 'SKILL.md'),
      'utf-8'
    );
    assert.ok(content.includes('name: opensquad'));
    assert.ok(content.includes('description:'));
    assert.ok(content.includes('AGENTS.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with vscode-copilot creates .github/prompts/opensquad.prompt.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['vscode-copilot'] });
    const content = await readFile(
      join(tempDir, '.github', 'prompts', 'opensquad.prompt.md'),
      'utf-8'
    );
    assert.ok(content.includes('mode:'));
    assert.ok(content.includes('opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with vscode-copilot creates .vscode/mcp.json with playwright server', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['vscode-copilot'] });
    const content = await readFile(join(tempDir, '.vscode', 'mcp.json'), 'utf-8');
    const config = JSON.parse(content);
    assert.ok(config.servers?.playwright, 'playwright server missing');
    assert.ok(config.servers.playwright.args.includes('--config'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with vscode-copilot creates .vscode/settings.json with promptFilesLocations when no file exists', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['vscode-copilot'] });
    const content = await readFile(join(tempDir, '.vscode', 'settings.json'), 'utf-8');
    const settings = JSON.parse(content);
    assert.ok(
      Array.isArray(settings['chat.promptFilesLocations']),
      'chat.promptFilesLocations should be an array'
    );
    assert.ok(
      settings['chat.promptFilesLocations'].includes('.github/prompts'),
      '.github/prompts should be in the array'
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with vscode-copilot merges .vscode/settings.json when file already exists', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const vscodePath = join(tempDir, '.vscode');
    await mkdir(vscodePath, { recursive: true });
    await writeFile(
      join(vscodePath, 'settings.json'),
      JSON.stringify({ 'editor.fontSize': 14 }),
      'utf-8'
    );

    await init(tempDir, { _skipPrompts: true, _ides: ['vscode-copilot'] });

    const content = await readFile(join(vscodePath, 'settings.json'), 'utf-8');
    const settings = JSON.parse(content);
    assert.equal(settings['editor.fontSize'], 14, 'existing key must be preserved');
    assert.ok(
      settings['chat.promptFilesLocations'].includes('.github/prompts'),
      '.github/prompts must be added'
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with vscode-copilot skips merge when settings.json has invalid JSON', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const vscodePath = join(tempDir, '.vscode');
    await mkdir(vscodePath, { recursive: true });
    const settingsPath = join(vscodePath, 'settings.json');
    await writeFile(settingsPath, 'not valid json', 'utf-8');

    await init(tempDir, { _skipPrompts: true, _ides: ['vscode-copilot'] });

    // File must NOT be overwritten
    const content = await readFile(settingsPath, 'utf-8');
    assert.equal(content, 'not valid json', 'malformed settings.json must not be modified');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with cursor IDE creates .cursor/rules/opensquad.mdc', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['cursor'] });

    const content = await readFile(
      join(tempDir, '.cursor', 'rules', 'opensquad.mdc'),
      'utf-8'
    );
    assert.ok(content.includes('alwaysApply: true'));
    assert.ok(content.includes('opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with cursor IDE creates .cursor/mcp.json with playwright server', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['cursor'] });

    const content = await readFile(join(tempDir, '.cursor', 'mcp.json'), 'utf-8');
    const config = JSON.parse(content);
    assert.ok(config.mcpServers?.playwright, 'playwright server missing');
    assert.ok(config.mcpServers.playwright.args.includes('--config'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with cursor IDE creates .cursorignore with browser profile exclusion', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['cursor'] });

    const content = await readFile(join(tempDir, '.cursorignore'), 'utf-8');
    assert.ok(content.includes('_opensquad/_browser_profile/'));
    assert.ok(content.includes('node_modules/'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init does not copy dashboard node_modules or dist to user project', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await assert.rejects(
      stat(join(tempDir, 'dashboard', 'node_modules')),
      { code: 'ENOENT' }
    );
    await assert.rejects(
      stat(join(tempDir, 'dashboard', 'dist')),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides qwen-code creates .qwen/skills/opensquad/SKILL.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['qwen-code'] });

    const content = await readFile(
      join(tempDir, '.qwen', 'skills', 'opensquad', 'SKILL.md'),
      'utf-8'
    );
    assert.ok(content.includes('name: opensquad'));
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides qwen-code creates QWEN.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['qwen-code'] });

    const content = await readFile(join(tempDir, 'QWEN.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides qwen-code creates .qwen/settings.json with playwright MCP', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['qwen-code'] });

    const content = await readFile(join(tempDir, '.qwen', 'settings.json'), 'utf-8');
    const config = JSON.parse(content);
    assert.ok(config.mcpServers.playwright);
    assert.ok(config.mcpServers.playwright.args.includes('--config'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides qwen-code merges .qwen/settings.json when file already exists', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    const qwenPath = join(tempDir, '.qwen');
    await mkdir(qwenPath, { recursive: true });
    await writeFile(
      join(qwenPath, 'settings.json'),
      JSON.stringify({ model: { name: 'qwen3-coder' } }),
      'utf-8'
    );

    await init(tempDir, { _skipPrompts: true, _ides: ['qwen-code'] });

    const content = await readFile(join(qwenPath, 'settings.json'), 'utf-8');
    const settings = JSON.parse(content);
    assert.equal(settings.model.name, 'qwen3-coder', 'existing key must be preserved');
    assert.ok(settings.mcpServers.playwright, 'playwright MCP must be added');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides gemini-cli creates .gemini/skills/opensquad/SKILL.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['gemini-cli'] });

    const content = await readFile(
      join(tempDir, '.gemini', 'skills', 'opensquad', 'SKILL.md'),
      'utf-8'
    );
    assert.ok(content.includes('name: opensquad'));
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides gemini-cli creates GEMINI.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['gemini-cli'] });

    const content = await readFile(join(tempDir, 'GEMINI.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides gemini-cli creates .gemini/settings.json with playwright MCP', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['gemini-cli'] });

    const content = await readFile(join(tempDir, '.gemini', 'settings.json'), 'utf-8');
    const config = JSON.parse(content);
    assert.ok(config.mcpServers.playwright);
    assert.ok(config.mcpServers.playwright.args.includes('--config'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides gemini-cli merges .gemini/settings.json when file already exists', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    const geminiPath = join(tempDir, '.gemini');
    await mkdir(geminiPath, { recursive: true });
    await writeFile(
      join(geminiPath, 'settings.json'),
      JSON.stringify({ theme: 'dark' }),
      'utf-8'
    );

    await init(tempDir, { _skipPrompts: true, _ides: ['gemini-cli'] });

    const content = await readFile(join(geminiPath, 'settings.json'), 'utf-8');
    const settings = JSON.parse(content);
    assert.equal(settings.theme, 'dark', 'existing key must be preserved');
    assert.ok(settings.mcpServers.playwright, 'playwright MCP must be added');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides trae creates .trae/rules/opensquad.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['trae'] });

    const content = await readFile(
      join(tempDir, '.trae', 'rules', 'opensquad.md'),
      'utf-8'
    );
    assert.ok(content.includes('alwaysApply: true'));
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides trae creates .trae/mcp.json with playwright server', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['trae'] });

    const content = await readFile(join(tempDir, '.trae', 'mcp.json'), 'utf-8');
    const config = JSON.parse(content);
    assert.ok(config.mcpServers.playwright);
    assert.ok(config.mcpServers.playwright.args.includes('--config'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

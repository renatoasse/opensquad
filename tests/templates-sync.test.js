import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { init } from '../src/init.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IDE_TEMPLATES = join(ROOT, 'templates', 'ide-templates');
const CANONICAL_CREATE = 'create.orchestration.md';

// One entry point per IDE: the file that handles `/opensquad create`.
const ENTRY_POINTS = {
  'claude-code': '.claude/skills/opensquad/SKILL.md',
  cursor: '.cursor/commands/opensquad.md',
  'vscode-copilot': '.github/prompts/opensquad.prompt.md',
  codex: 'AGENTS.md',
  opencode: 'AGENTS.md',
  antigravity: '.agent/workflows/opensquad.md',
  'gemini-cli': '.gemini/skills/opensquad/SKILL.md',
  'qwen-code': '.qwen/skills/opensquad/SKILL.md',
  trae: '.trae/rules/opensquad.md',
};

test('repo Claude Code skill is identical to the shipped template', async () => {
  const repoSkill = await readFile(join(ROOT, '.claude', 'skills', 'opensquad', 'SKILL.md'), 'utf-8');
  const template = await readFile(join(IDE_TEMPLATES, 'claude-code', '.claude', 'skills', 'opensquad', 'SKILL.md'), 'utf-8');
  assert.equal(repoSkill, template, 'edit one and copy to the other — they must not drift');
});

test('repo CLAUDE.md is identical to the shipped template', async () => {
  const repo = await readFile(join(ROOT, 'CLAUDE.md'), 'utf-8');
  const template = await readFile(join(IDE_TEMPLATES, 'claude-code', 'CLAUDE.md'), 'utf-8');
  assert.equal(repo, template);
});

test('Qwen template equals Claude Code template except for the checkpoint heading', async () => {
  const claude = await readFile(join(IDE_TEMPLATES, 'claude-code', '.claude', 'skills', 'opensquad', 'SKILL.md'), 'utf-8');
  const qwen = await readFile(join(IDE_TEMPLATES, 'qwen-code', '.qwen', 'skills', 'opensquad', 'SKILL.md'), 'utf-8');
  assert.equal(qwen.replaceAll('Qwen Code', 'Claude Code'), claude);
});

for (const [ide, relPath] of Object.entries(ENTRY_POINTS)) {
  test(`${ide} entry point routes /opensquad create to the canonical orchestration file`, async () => {
    const content = await readFile(join(IDE_TEMPLATES, ide, relPath), 'utf-8');
    assert.ok(content.includes(`_opensquad/core/${CANONICAL_CREATE}`), `${relPath} must reference _opensquad/core/${CANONICAL_CREATE}`);
    assert.ok(!content.includes('Load Architect → Create Squad'), `${relPath} still routes create to the pre-phased Architect flow`);
    assert.ok(!content.includes('performance_mode'), `${relPath} references the removed performance_mode field`);
  });
}

test('canonical create orchestration matches the discovery.yaml schema', async () => {
  const content = await readFile(join(ROOT, '_opensquad', 'core', CANONICAL_CREATE), 'utf-8');
  assert.ok(!content.includes('performance_mode'));
  assert.ok(!content.includes('investigation.mode'), 'discovery.yaml uses investigation.enabled, not investigation.mode');
  assert.ok(content.includes('investigation.enabled'));
  for (const phase of ['discovery.prompt.md', 'design.prompt.md', 'build.prompt.md', 'sherlock-shared.md']) {
    assert.ok(content.includes(phase), `orchestration must reference ${phase}`);
  }
});

test('init delivers the canonical create orchestration file', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    await stat(join(tempDir, '_opensquad', 'core', CANONICAL_CREATE));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

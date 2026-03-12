import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  listInstalled,
  listAvailable,
  installSkill,
  removeSkill,
  getSkillVersion,
  getSkillMeta,
  getLocalizedDescription,
} from '../src/skills.js';

const SAMPLE_SKILL_MD = `---\nname: seo-optimizer\nversion: 1.2.0\ntype: tool\ndescription: SEO Optimizer\n---\n# SEO Optimizer\n`;

// --- listInstalled ---

test('listInstalled returns empty array when skills/ does not exist', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const result = await listInstalled(dir);
    assert.deepEqual(result, []);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('listInstalled excludes the built-in opensquad-skill-creator skill', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillsDir = join(dir, 'skills');
    await mkdir(join(skillsDir, 'opensquad-skill-creator'), { recursive: true });
    await mkdir(join(skillsDir, 'seo-optimizer'), { recursive: true });
    const result = await listInstalled(dir);
    assert.deepEqual(result, ['seo-optimizer']);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('listInstalled returns installed skill ids from skills/', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillsDir = join(dir, 'skills');
    await mkdir(join(skillsDir, 'seo-optimizer'), { recursive: true });
    await mkdir(join(skillsDir, 'email-marketing'), { recursive: true });
    const result = await listInstalled(dir);
    assert.ok(result.includes('seo-optimizer'));
    assert.ok(result.includes('email-marketing'));
    assert.equal(result.length, 2);
  } finally {
    await rm(dir, { recursive: true });
  }
});

// --- listAvailable ---

test('listAvailable returns bundled skill ids', async () => {
  const available = await listAvailable();
  assert.ok(available.includes('image-creator'));
  assert.ok(available.includes('apify'));
  assert.ok(available.length > 0);
});

// --- installSkill ---

test('installSkill copies SKILL.md from bundled skills to skills/<id>/', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await installSkill('image-creator', dir);
    const content = await readFile(join(dir, 'skills', 'image-creator', 'SKILL.md'), 'utf-8');
    assert.ok(content.includes('image-creator'));
    assert.ok(content.length > 0);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installSkill creates skills/ directory if missing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await installSkill('apify', dir);
    const content = await readFile(join(dir, 'skills', 'apify', 'SKILL.md'), 'utf-8');
    assert.ok(content.length > 0);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installSkill throws when skill not found in bundled skills', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await assert.rejects(
      () => installSkill('nonexistent', dir),
      /not found/
    );
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installSkill throws on invalid skill id', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await assert.rejects(
      () => installSkill('../evil', dir),
      /Invalid skill id/
    );
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('installSkill copies full directory including subdirs for opensquad-skill-creator', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await installSkill('opensquad-skill-creator', dir);
    const skill = await readFile(join(dir, 'skills', 'opensquad-skill-creator', 'SKILL.md'), 'utf-8');
    assert.ok(skill.length > 0);
    const scripts = await readdir(join(dir, 'skills', 'opensquad-skill-creator', 'scripts'));
    assert.ok(scripts.length > 0);
  } finally {
    await rm(dir, { recursive: true });
  }
});

// --- removeSkill ---

test('removeSkill deletes the skill directory from skills/', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillDir = join(dir, 'skills', 'seo-optimizer');
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), SAMPLE_SKILL_MD);
    await removeSkill('seo-optimizer', dir);
    await assert.rejects(
      () => readFile(join(skillDir, 'SKILL.md'), 'utf-8'),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('removeSkill does not throw when skill not installed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await assert.doesNotReject(() => removeSkill('nonexistent', dir));
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('removeSkill throws on invalid skill id', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await assert.rejects(
      () => removeSkill('../evil', dir),
      /Invalid skill id/
    );
  } finally {
    await rm(dir, { recursive: true });
  }
});

// --- getSkillVersion ---

test('getSkillVersion returns version from SKILL.md frontmatter', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillDir = join(dir, 'skills', 'seo-optimizer');
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), SAMPLE_SKILL_MD);
    const version = await getSkillVersion('seo-optimizer', dir);
    assert.equal(version, '1.2.0');
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('getSkillVersion returns null when SKILL.md has no version', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillDir = join(dir, 'skills', 'seo-optimizer');
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), '---\nname: seo-optimizer\n---\n# SEO\n');
    const version = await getSkillVersion('seo-optimizer', dir);
    assert.equal(version, null);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('getSkillVersion returns null when skill is not installed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const version = await getSkillVersion('nonexistent', dir);
    assert.equal(version, null);
  } finally {
    await rm(dir, { recursive: true });
  }
});

test('getSkillVersion returns null when SKILL.md has no frontmatter', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const skillDir = join(dir, 'skills', 'seo-optimizer');
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), '# SEO Optimizer\nNo frontmatter here.\n');
    const version = await getSkillVersion('seo-optimizer', dir);
    assert.equal(version, null);
  } finally {
    await rm(dir, { recursive: true });
  }
});

// --- getSkillMeta ---

test('getSkillMeta returns name, description, type, and env for a bundled skill', async () => {
  const meta = await getSkillMeta('apify');
  assert.equal(meta.name, 'apify');
  assert.equal(meta.type, 'mcp');
  assert.ok(meta.description.length > 0);
  assert.ok(Array.isArray(meta.env));
  assert.ok(meta.env.includes('APIFY_TOKEN'));
});

test('getSkillMeta returns empty env array when skill has no env vars', async () => {
  const meta = await getSkillMeta('image-creator');
  assert.ok(Array.isArray(meta.env));
  assert.equal(meta.env.length, 0);
});

test('getSkillMeta returns null for nonexistent skill', async () => {
  const meta = await getSkillMeta('nonexistent-skill');
  assert.equal(meta, null);
});

test('getSkillMeta returns descriptions object (empty until translations added)', async () => {
  const meta = await getSkillMeta('apify');
  assert.ok(meta.descriptions);
  assert.equal(typeof meta.descriptions, 'object');
});

// --- getLocalizedDescription ---

test('getLocalizedDescription returns pt-BR description when available', () => {
  const meta = {
    description: 'English description',
    descriptions: { 'pt-BR': 'Descrição em português', 'es': 'Descripción en español' },
  };
  assert.equal(getLocalizedDescription(meta, 'pt-BR'), 'Descrição em português');
});

test('getLocalizedDescription returns es description when available', () => {
  const meta = {
    description: 'English description',
    descriptions: { 'pt-BR': 'Descrição em português', 'es': 'Descripción en español' },
  };
  assert.equal(getLocalizedDescription(meta, 'es'), 'Descripción en español');
});

test('getLocalizedDescription falls back to English when locale not available', () => {
  const meta = {
    description: 'English description',
    descriptions: {},
  };
  assert.equal(getLocalizedDescription(meta, 'pt-BR'), 'English description');
});

test('getLocalizedDescription returns English for "en" locale', () => {
  const meta = {
    description: 'English description',
    descriptions: { 'pt-BR': 'Descrição' },
  };
  assert.equal(getLocalizedDescription(meta, 'en'), 'English description');
});

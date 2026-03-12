import { cp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS_DIR = join(__dirname, '..', 'skills');

export async function listInstalled(targetDir) {
  try {
    const skillsDir = join(targetDir, 'skills');
    const entries = await readdir(skillsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name !== 'opensquad-skill-creator')
      .map((e) => e.name);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function listAvailable() {
  try {
    const entries = await readdir(BUNDLED_SKILLS_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function getSkillMeta(id) {
  try {
    const raw = await readFile(join(BUNDLED_SKILLS_DIR, id, 'SKILL.md'), 'utf-8');
    const content = raw.replace(/\r\n/g, '\n');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return { name: id, description: '', descriptions: {}, type: '', env: [] };

    const fm = fmMatch[1];
    const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim() || id;
    const type = fm.match(/^type:\s*(.+)$/m)?.[1]?.trim() || '';

    // description may use YAML folded scalar (>)
    let description = '';
    const descBlock = fm.match(/^description:\s*>\s*\n((?:\s{2,}.+\n?)+)/m);
    if (descBlock) {
      description = descBlock[1].replace(/\n\s*/g, ' ').trim();
    } else {
      const descInline = fm.match(/^description:\s*(.+)$/m);
      if (descInline) description = descInline[1].trim();
    }

    // localized descriptions: description_pt-BR, description_es, etc.
    const descriptions = {};
    for (const code of ['pt-BR', 'es']) {
      const key = `description_${code}`;
      // folded scalar
      const blockMatch = fm.match(new RegExp(`^${key}:\\s*>\\s*\\n((?:\\s{2,}.+\\n?)+)`, 'm'));
      if (blockMatch) {
        descriptions[code] = blockMatch[1].replace(/\n\s*/g, ' ').trim();
      } else {
        // inline
        const inlineMatch = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
        if (inlineMatch) descriptions[code] = inlineMatch[1].trim();
      }
    }

    // env is a YAML list: lines starting with "  - "
    const env = [];
    const envSection = fm.match(/^env:\s*\n((?:\s+-\s+.+\n?)+)/m);
    if (envSection) {
      for (const line of envSection[1].split('\n')) {
        const item = line.match(/^\s+-\s+(.+)/);
        if (item) env.push(item[1].trim());
      }
    }

    return { name, description, descriptions, type, env };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function validateSkillId(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error(`Invalid skill id: '${id}'`);
  }
}

export async function installSkill(id, targetDir) {
  validateSkillId(id);
  const srcDir = join(BUNDLED_SKILLS_DIR, id);
  try {
    await stat(srcDir);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Skill '${id}' not found in registry`);
    throw err;
  }
  const destDir = join(targetDir, 'skills', id);
  await cp(srcDir, destDir, { recursive: true });
}

export async function removeSkill(id, targetDir) {
  validateSkillId(id);
  const skillDir = join(targetDir, 'skills', id);
  await rm(skillDir, { recursive: true, force: true });
}

export async function getSkillVersion(id, targetDir) {
  try {
    const skillPath = join(targetDir, 'skills', id, 'SKILL.md');
    const content = await readFile(skillPath, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return null;
    const versionMatch = fmMatch[1].match(/^version:\s*(.+)$/m);
    return versionMatch ? versionMatch[1].trim() : null;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export function getLocalizedDescription(meta, localeCode) {
  if (localeCode && localeCode !== 'en' && meta.descriptions?.[localeCode]) {
    return meta.descriptions[localeCode];
  }
  return meta.description;
}

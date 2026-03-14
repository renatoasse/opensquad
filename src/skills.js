import { cp, readdir, readFile, realpath, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseFrontmatter, getField, getDescription,
  getLocalizedDescriptions, getList, getVersion,
  getLocalizedDescription, validateResourceId,
} from './frontmatter.js';

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
    const fm = parseFrontmatter(raw);
    if (!fm) return { name: id, description: '', descriptions: {}, type: '', env: [] };

    return {
      name: getField(fm, 'name', id),
      description: getDescription(fm),
      descriptions: getLocalizedDescriptions(fm),
      type: getField(fm, 'type'),
      env: getList(fm, 'env'),
    };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function installSkill(id, targetDir) {
  validateResourceId(id, 'skill');
  const srcDir = join(BUNDLED_SKILLS_DIR, id);
  try {
    await stat(srcDir);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Skill '${id}' not found in registry`);
    throw err;
  }
  const destDir = join(targetDir, 'skills', id);
  // Skip copy when running init from inside the opensquad project itself
  const realSrc = await realpath(srcDir);
  let realDest;
  try {
    realDest = await realpath(destDir);
  } catch {
    realDest = null;
  }
  if (realSrc === realDest) return;
  await cp(srcDir, destDir, { recursive: true });
}

export async function removeSkill(id, targetDir) {
  validateResourceId(id, 'skill');
  await rm(join(targetDir, 'skills', id), { recursive: true, force: true });
}

export async function getSkillVersion(id, targetDir) {
  try {
    const content = await readFile(join(targetDir, 'skills', id, 'SKILL.md'), 'utf-8');
    return getVersion(content);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

// Re-export shared utility
export { getLocalizedDescription };

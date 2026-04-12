import { access, cp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS_DIR = join(__dirname, '..', 'skills');
const PROJECT_SKILLS_DIR_PARTS = [
  ['marketing', 'skills'],
  ['skills'],
];

const metaCache = new Map();

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getProjectSkillsDirCandidates(targetDir) {
  return PROJECT_SKILLS_DIR_PARTS.map((parts) => join(targetDir, ...parts));
}

async function getExistingProjectSkillsDirs(targetDir) {
  const dirs = [];
  for (const dir of getProjectSkillsDirCandidates(targetDir)) {
    if (await pathExists(dir)) {
      dirs.push(dir);
    }
  }
  return dirs;
}

async function resolvePreferredProjectSkillsDir(targetDir) {
  const marketingDir = join(targetDir, 'marketing');
  const marketingSkillsDir = join(marketingDir, 'skills');
  if (await pathExists(marketingDir) || await pathExists(marketingSkillsDir)) {
    return marketingSkillsDir;
  }
  return join(targetDir, 'skills');
}

async function resolveInstalledSkillDir(id, targetDir) {
  for (const skillsDir of await getExistingProjectSkillsDirs(targetDir)) {
    const skillDir = join(skillsDir, id);
    if (await pathExists(skillDir)) {
      return skillDir;
    }
  }
  return null;
}

export async function listInstalled(targetDir) {
  const installed = new Set();

  for (const skillsDir of await getExistingProjectSkillsDirs(targetDir)) {
    const entries = await readdir(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'opensquad-skill-creator') {
        installed.add(entry.name);
      }
    }
  }

  return [...installed];
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
  if (metaCache.has(id)) return metaCache.get(id);
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

    const result = { name, description, descriptions, type, env };
    metaCache.set(id, result);
    return result;
  } catch (err) {
    if (err.code === 'ENOENT') {
      metaCache.set(id, null);
      return null;
    }
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
    if (err.code === 'ENOENT') throw new Error(`Skill '${id}' not found in registry`, { cause: err });
    throw err;
  }
  const existingSkillDir = await resolveInstalledSkillDir(id, targetDir);
  const preferredSkillsDir = await resolvePreferredProjectSkillsDir(targetDir);
  const destDir = existingSkillDir || join(preferredSkillsDir, id);
  const resolvedSrc = resolve(srcDir);
  const resolvedDest = resolve(destDir);
  if (resolvedSrc === resolvedDest || resolvedDest.startsWith(resolvedSrc + sep)) {
    return destDir;
  }
  await cp(srcDir, destDir, { recursive: true });
  metaCache.delete(id);
  return destDir;
}

export async function removeSkill(id, targetDir) {
  validateSkillId(id);
  for (const skillsDir of getProjectSkillsDirCandidates(targetDir)) {
    const skillDir = join(skillsDir, id);
    await rm(skillDir, { recursive: true, force: true });
  }
  metaCache.delete(id);
}

export function clearMetaCache() {
  metaCache.clear();
}

export async function getSkillVersion(id, targetDir) {
  try {
    const skillDir = await resolveInstalledSkillDir(id, targetDir);
    if (!skillDir) return null;
    const skillPath = join(skillDir, 'SKILL.md');
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

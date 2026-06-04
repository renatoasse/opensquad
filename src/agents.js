import { copyFile, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_AGENTS_DIR = join(__dirname, '..', 'agents');

const metaCache = new Map();

export async function listInstalled(targetDir) {
  try {
    const agentsDir = join(targetDir, 'agents');
    const entries = await readdir(agentsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.agent.md'))
      .map((e) => e.name.replace(/\.agent\.md$/, ''));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function listAvailable() {
  try {
    const entries = await readdir(BUNDLED_AGENTS_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function getAgentMeta(id) {
  if (metaCache.has(id)) return metaCache.get(id);
  try {
    const raw = await readFile(join(BUNDLED_AGENTS_DIR, id, 'AGENT.md'), 'utf-8');
    const content = raw.replace(/\r\n/g, '\n');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return { name: id, description: '', descriptions: {}, category: '', icon: '', version: '' };

    const fm = fmMatch[1];
    const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim() || id;
    const category = fm.match(/^category:\s*(.+)$/m)?.[1]?.trim() || '';
    const icon = fm.match(/^icon:\s*(.+)$/m)?.[1]?.trim() || '';
    const version = fm.match(/^version:\s*(.+)$/m)?.[1]?.trim() || '';

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

    const result = { name, description, descriptions, category, icon, version };
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

function validateAgentId(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error(`Invalid agent id: '${id}'`);
  }
}

export async function installAgent(id, targetDir) {
  validateAgentId(id);
  const srcFile = join(BUNDLED_AGENTS_DIR, id, 'AGENT.md');
  try {
    await readFile(srcFile);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Agent '${id}' not found in registry`, { cause: err });
    throw err;
  }
  const destDir = join(targetDir, 'agents');
  await mkdir(destDir, { recursive: true });
  await copyFile(srcFile, join(destDir, `${id}.agent.md`));
  metaCache.delete(id);
}

export async function removeAgent(id, targetDir) {
  validateAgentId(id);
  const agentFile = join(targetDir, 'agents', `${id}.agent.md`);
  await rm(agentFile, { force: true });
  metaCache.delete(id);
}

export function clearMetaCache() {
  metaCache.clear();
}

export async function getAgentVersion(id, targetDir) {
  try {
    const agentPath = join(targetDir, 'agents', `${id}.agent.md`);
    const content = await readFile(agentPath, 'utf-8');
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

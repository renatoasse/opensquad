import { copyFile, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseFrontmatter, getField, getDescription,
  getLocalizedDescriptions, getVersion,
  getLocalizedDescription, validateResourceId,
} from './frontmatter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_AGENTS_DIR = join(__dirname, '..', 'agents');

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
  try {
    const raw = await readFile(join(BUNDLED_AGENTS_DIR, id, 'AGENT.md'), 'utf-8');
    const fm = parseFrontmatter(raw);
    if (!fm) return { name: id, description: '', descriptions: {}, category: '', icon: '', version: '' };

    return {
      name: getField(fm, 'name', id),
      description: getDescription(fm),
      descriptions: getLocalizedDescriptions(fm),
      category: getField(fm, 'category'),
      icon: getField(fm, 'icon'),
      version: getField(fm, 'version'),
    };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function installAgent(id, targetDir) {
  validateResourceId(id, 'agent');
  const srcFile = join(BUNDLED_AGENTS_DIR, id, 'AGENT.md');
  try {
    await readFile(srcFile);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Agent '${id}' not found in registry`);
    throw err;
  }
  const destDir = join(targetDir, 'agents');
  await mkdir(destDir, { recursive: true });
  await copyFile(srcFile, join(destDir, `${id}.agent.md`));
}

export async function removeAgent(id, targetDir) {
  validateResourceId(id, 'agent');
  await rm(join(targetDir, 'agents', `${id}.agent.md`), { force: true });
}

export async function getAgentVersion(id, targetDir) {
  try {
    const content = await readFile(join(targetDir, 'agents', `${id}.agent.md`), 'utf-8');
    return getVersion(content);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

// Re-export shared utility
export { getLocalizedDescription };

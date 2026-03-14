/**
 * Agents resource manager — thin wrapper around the generic resource-manager.
 *
 * Agents are single-file resources: each agent is an .agent.md file
 * copied from a bundled directory into the project's agents/ folder.
 *
 * @module agents
 */
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createResourceManager } from './resource-manager.js';
import { getField, getLocalizedDescription } from './frontmatter.js';

const manager = createResourceManager({
  bundledSubdir: 'agents',
  installedSubdir: 'agents',
  metaFilename: 'AGENT.md',
  resourceType: 'agent',

  filterInstalled: (entries) =>
    entries
      .filter((e) => e.isFile() && e.name.endsWith('.agent.md'))
      .map((e) => e.name.replace(/\.agent\.md$/, '')),

  extractMeta: (fm) => ({
    category: getField(fm, 'category'),
    icon: getField(fm, 'icon'),
    version: getField(fm, 'version'),
  }),

  defaultMeta: { description: '', descriptions: {}, category: '', icon: '', version: '' },

  async copyResource(id, srcDir, targetDir) {
    const srcFile = join(srcDir, 'AGENT.md');
    try {
      await readFile(srcFile);
    } catch (err) {
      if (err.code === 'ENOENT') throw new Error(`Agent '${id}' not found in registry`);
      throw err;
    }
    const destDir = join(targetDir, 'agents');
    await mkdir(destDir, { recursive: true });
    await copyFile(srcFile, join(destDir, `${id}.agent.md`));
  },

  async removeResource(id, targetDir) {
    await rm(join(targetDir, 'agents', `${id}.agent.md`), { force: true });
  },

  installedMetaPath: (id, targetDir) => join(targetDir, 'agents', `${id}.agent.md`),
});

// ---- Public API (preserves original export names) ----

export const listInstalled = manager.listInstalled;
export const listAvailable = manager.listAvailable;
export const getAgentMeta = manager.getMeta;
export const getAgentVersion = manager.getVersion;
export const installAgent = manager.install;
export const removeAgent = manager.remove;

// Re-export shared utility
export { getLocalizedDescription };

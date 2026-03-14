/**
 * Skills resource manager — thin wrapper around the generic resource-manager.
 *
 * Skills are directory-based resources: each skill lives in its own folder
 * containing a SKILL.md metadata file and any supporting files.
 *
 * @module skills
 */
import { cp, realpath, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createResourceManager } from './resource-manager.js';
import { getField, getList, getLocalizedDescription } from './frontmatter.js';

const manager = createResourceManager({
  bundledSubdir: 'skills',
  installedSubdir: 'skills',
  metaFilename: 'SKILL.md',
  resourceType: 'skill',

  filterInstalled: (entries) =>
    entries
      .filter((e) => e.isDirectory() && e.name !== 'opensquad-skill-creator')
      .map((e) => e.name),

  extractMeta: (fm) => ({
    type: getField(fm, 'type'),
    env: getList(fm, 'env'),
  }),

  defaultMeta: { description: '', descriptions: {}, type: '', env: [] },

  async copyResource(id, srcDir, targetDir) {
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
  },

  async removeResource(id, targetDir) {
    await rm(join(targetDir, 'skills', id), { recursive: true, force: true });
  },

  installedMetaPath: (id, targetDir) => join(targetDir, 'skills', id, 'SKILL.md'),
});

// ---- Public API (preserves original export names) ----

export const listInstalled = manager.listInstalled;
export const listAvailable = manager.listAvailable;
export const getSkillMeta = manager.getMeta;
export const getSkillVersion = manager.getVersion;
export const installSkill = manager.install;
export const removeSkill = manager.remove;

// Re-export shared utility
export { getLocalizedDescription };

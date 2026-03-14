/**
 * Generic resource manager factory for skills and agents.
 * Eliminates DRY violation between skills.js and agents.js by extracting
 * shared lifecycle operations (list, install, remove, getMeta, getVersion)
 * into a configurable factory.
 *
 * @module resource-manager
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseFrontmatter, getField, getDescription,
  getLocalizedDescriptions, getVersion, validateResourceId,
} from './frontmatter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {object} ResourceManagerConfig
 * @property {string} bundledSubdir - Directory name under project root for bundled resources (e.g. 'skills', 'agents')
 * @property {string} installedSubdir - Directory name under targetDir for installed resources (e.g. 'skills', 'agents')
 * @property {string} metaFilename - Metadata filename inside bundled directory (e.g. 'SKILL.md', 'AGENT.md')
 * @property {string} resourceType - Human-readable type for error messages (e.g. 'skill', 'agent')
 * @property {(entries: import('node:fs').Dirent[]) => string[]} filterInstalled - Filter and map directory entries to installed IDs
 * @property {(fm: string, id: string) => object} extractMeta - Extract metadata fields from parsed frontmatter
 * @property {object} defaultMeta - Default metadata object when frontmatter is missing
 * @property {(id: string, bundledDir: string, targetDir: string) => Promise<void>} copyResource - Copy resource from bundled to target
 * @property {(id: string, targetDir: string) => Promise<void>} removeResource - Remove installed resource
 * @property {(id: string, targetDir: string) => string} installedMetaPath - Path to installed resource's meta file
 */

/**
 * Create a resource manager with standard lifecycle operations.
 *
 * @param {ResourceManagerConfig} config
 * @returns {{ listInstalled, listAvailable, getMeta, getVersion, install, remove }}
 */
export function createResourceManager(config) {
  const {
    bundledSubdir,
    installedSubdir,
    metaFilename,
    resourceType,
    filterInstalled,
    extractMeta,
    defaultMeta,
    copyResource,
    removeResource,
    installedMetaPath,
  } = config;

  const BUNDLED_DIR = join(__dirname, '..', bundledSubdir);

  /**
   * List IDs of installed resources in the target directory.
   * @param {string} targetDir - Project root
   * @returns {Promise<string[]>}
   */
  async function listInstalled(targetDir) {
    try {
      const dir = join(targetDir, installedSubdir);
      const entries = await readdir(dir, { withFileTypes: true });
      return filterInstalled(entries);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  /**
   * List IDs of all bundled (available) resources.
   * @returns {Promise<string[]>}
   */
  async function listAvailable() {
    try {
      const entries = await readdir(BUNDLED_DIR, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  }

  /**
   * Get metadata for a bundled resource by ID.
   * @param {string} id - Resource identifier
   * @returns {Promise<object|null>} Metadata object or null if not found
   */
  async function getMeta(id) {
    try {
      const raw = await readFile(join(BUNDLED_DIR, id, metaFilename), 'utf-8');
      const fm = parseFrontmatter(raw);
      if (!fm) return { ...defaultMeta, name: id };

      return {
        name: getField(fm, 'name', id),
        description: getDescription(fm),
        descriptions: getLocalizedDescriptions(fm),
        ...extractMeta(fm, id),
      };
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  /**
   * Install a bundled resource into the target directory.
   * @param {string} id - Resource identifier
   * @param {string} targetDir - Project root
   */
  async function install(id, targetDir) {
    validateResourceId(id, resourceType);
    const srcDir = join(BUNDLED_DIR, id);
    await copyResource(id, srcDir, targetDir);
  }

  /**
   * Remove an installed resource from the target directory.
   * @param {string} id - Resource identifier
   * @param {string} targetDir - Project root
   */
  async function remove(id, targetDir) {
    validateResourceId(id, resourceType);
    await removeResource(id, targetDir);
  }

  /**
   * Get the version of an installed resource.
   * @param {string} id - Resource identifier
   * @param {string} targetDir - Project root
   * @returns {Promise<string|null>}
   */
  async function getInstalledVersion(id, targetDir) {
    try {
      const content = await readFile(installedMetaPath(id, targetDir), 'utf-8');
      return getVersion(content);
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  return { listInstalled, listAvailable, getMeta, getVersion: getInstalledVersion, install, remove };
}

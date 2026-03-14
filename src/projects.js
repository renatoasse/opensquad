/**
 * Project management module — global project/company switcher.
 *
 * Global registry: ~/.opensquad/projects.json
 * Per-project context: {projectDir}/_opensquad/context/project.md
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

/**
 * Returns the global config directory (~/.opensquad/).
 * Creates it if it doesn't exist.
 */
export async function getGlobalConfigDir() {
  const dir = join(homedir(), '.opensquad');
  await mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Returns the path to projects.json.
 */
async function getProjectsPath() {
  const dir = await getGlobalConfigDir();
  return join(dir, 'projects.json');
}

/**
 * Loads the global projects registry.
 * Returns { active: string|null, projects: {} } if file doesn't exist.
 */
export async function loadProjects() {
  const filePath = await getProjectsPath();
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { active: null, projects: {} };
  }
}

/**
 * Saves the global projects registry.
 */
export async function saveProjects(data) {
  const filePath = await getProjectsPath();
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Registers a project in the global registry.
 */
export async function registerProject(slug, name, path) {
  const data = await loadProjects();
  const today = new Date().toISOString().slice(0, 10);

  data.projects[slug] = {
    name,
    path,
    createdAt: data.projects[slug]?.createdAt || today,
    lastUsed: today,
  };

  // If no active project, set this one
  if (!data.active) {
    data.active = slug;
  }

  await saveProjects(data);
}

/**
 * Sets the active project.
 */
export async function setActiveProject(slug) {
  const data = await loadProjects();

  if (!data.projects[slug]) {
    return { success: false, error: `Project "${slug}" not found in registry.` };
  }

  data.active = slug;
  data.projects[slug].lastUsed = new Date().toISOString().slice(0, 10);
  await saveProjects(data);
  return { success: true };
}

/**
 * Returns the active project info, or null if none set.
 */
export async function getActiveProject() {
  const data = await loadProjects();
  if (!data.active || !data.projects[data.active]) return null;
  return { slug: data.active, ...data.projects[data.active] };
}

/**
 * Returns all projects as an array of { slug, name, path, createdAt, lastUsed }.
 */
export async function listProjects() {
  const data = await loadProjects();
  return Object.entries(data.projects).map(([slug, info]) => ({
    slug,
    ...info,
    isActive: slug === data.active,
  }));
}

/**
 * Removes a project from the registry (does NOT delete files on disk).
 */
export async function removeProject(slug) {
  const data = await loadProjects();

  if (!data.projects[slug]) {
    return { success: false, error: `Project "${slug}" not found in registry.` };
  }

  delete data.projects[slug];

  // If removed project was active, clear or pick another
  if (data.active === slug) {
    const remaining = Object.keys(data.projects);
    data.active = remaining.length > 0 ? remaining[0] : null;
  }

  await saveProjects(data);
  return { success: true };
}

/**
 * Generates a URL-safe slug from a name.
 * Lowercase, hyphens, only a-z 0-9 and hyphens, no leading/trailing hyphens.
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');         // trim hyphens
}

/**
 * Writes the per-project context file (_opensquad/context/project.md).
 */
export async function writeProjectContext(targetDir, slug, name) {
  const contextDir = join(targetDir, '_opensquad', 'context');
  await mkdir(contextDir, { recursive: true });

  // Read template and fill placeholders
  let template;
  try {
    template = await readFile(join(TEMPLATES_DIR, '_opensquad', 'context', 'project.md'), 'utf-8');
  } catch {
    // Fallback if template file doesn't exist
    template = `# Project Context

**Slug:** {{SLUG}}
**Name:** {{NAME}}
**Created:** {{DATE}}

## Company
See: company.md (auto-loaded by agents)

## Active Squads
(none yet)

## Notes
User can add free-text notes here that agents can read.
`;
  }

  const today = new Date().toISOString().slice(0, 10);
  const content = template
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{NAME\}\}/g, name)
    .replace(/\{\{DATE\}\}/g, today);

  await writeFile(join(contextDir, 'project.md'), content, 'utf-8');
}

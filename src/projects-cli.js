/**
 * CLI commands for the project/company switcher.
 *
 * Subcommands:
 *   list              — shows all projects with active indicator
 *   switch <slug>     — switches active project
 *   add <path>        — registers existing project
 *   remove <slug>     — unregisters project (doesn't delete files)
 *   info              — shows current active project details
 */
import { stat, readFile } from 'node:fs/promises';
import { join, resolve, basename } from 'node:path';
import { t } from './i18n.js';
import {
  listProjects,
  setActiveProject,
  getActiveProject,
  registerProject,
  removeProject,
  generateSlug,
  loadProjects,
} from './projects.js';

/**
 * Main CLI dispatch for project commands.
 */
export async function projectsCli(subcommand, args) {
  const handlers = {
    list: runList,
    switch: () => runSwitch(args[0]),
    add: () => runAdd(args[0]),
    remove: () => runRemove(args[0]),
    info: runInfo,
  };

  const handler = handlers[subcommand || 'list'];
  if (!handler) {
    console.log(`\n  Unknown project command: ${subcommand}`);
    console.log(`  Available: list, switch, add, remove, info\n`);
    return { success: false };
  }

  try {
    const result = await handler();
    if (result === false) return { success: false };
  } catch (err) {
    console.log(`\n  [ERROR] ${err.message}\n`);
    return { success: false };
  }

  return { success: true };
}

async function runList() {
  const projects = await listProjects();

  console.log('\n  Opensquad Projects\n');

  if (projects.length === 0) {
    console.log('  No projects registered yet.');
    console.log('  Run "npx opensquad init" in a project directory to get started.\n');
    return;
  }

  for (const p of projects) {
    const marker = p.isActive ? '\u2605' : ' ';
    console.log(`  ${marker} ${p.slug} — ${p.name}`);
    console.log(`    Path: ${p.path}`);
    console.log(`    Last used: ${p.lastUsed}`);
  }

  console.log('');
}

async function runSwitch(slug) {
  if (!slug) {
    console.log('\n  Usage: npx opensquad project switch <slug>\n');
    return false;
  }

  const result = await setActiveProject(slug);
  if (!result.success) {
    console.log(`\n  ${result.error}`);

    // Show available slugs
    const projects = await listProjects();
    if (projects.length > 0) {
      console.log('  Available projects:');
      for (const p of projects) {
        console.log(`    - ${p.slug}`);
      }
    }
    console.log('');
    return false;
  }

  console.log(`\n  \u2705 Switched to project: ${slug}\n`);
}

async function runAdd(targetPath) {
  if (!targetPath) {
    console.log('\n  Usage: npx opensquad project add <path>\n');
    return false;
  }

  const resolvedPath = resolve(targetPath);

  // Check if path exists and has _opensquad
  try {
    await stat(join(resolvedPath, '_opensquad'));
  } catch {
    console.log(`\n  Path "${resolvedPath}" does not contain an opensquad project.`);
    console.log('  Run "npx opensquad init" in that directory first.\n');
    return false;
  }

  // Try to read project context for name
  let name = basename(resolvedPath);
  let slug = generateSlug(name);
  try {
    const contextPath = join(resolvedPath, '_opensquad', 'context', 'project.md');
    const content = await readFile(contextPath, 'utf-8');
    const slugMatch = content.match(/\*\*Slug:\*\*\s*(.+)/);
    const nameMatch = content.match(/\*\*Name:\*\*\s*(.+)/);
    if (slugMatch) slug = slugMatch[1].trim();
    if (nameMatch) name = nameMatch[1].trim();
  } catch {
    // No context file — use directory name
  }

  await registerProject(slug, name, resolvedPath);
  console.log(`\n  \u2705 Registered project: ${slug} (${name})`);
  console.log(`  Path: ${resolvedPath}\n`);
}

async function runRemove(slug) {
  if (!slug) {
    console.log('\n  Usage: npx opensquad project remove <slug>\n');
    return false;
  }

  const result = await removeProject(slug);
  if (!result.success) {
    console.log(`\n  ${result.error}\n`);
    return false;
  }

  console.log(`\n  \u2705 Removed project "${slug}" from registry.`);
  console.log('  (Project files on disk were NOT deleted.)\n');
}

async function runInfo() {
  const active = await getActiveProject();

  if (!active) {
    console.log('\n  No active project set.');
    console.log('  Run "npx opensquad init" or "npx opensquad project switch <slug>".\n');
    return;
  }

  console.log('\n  Active Project\n');
  console.log(`  Slug:      ${active.slug}`);
  console.log(`  Name:      ${active.name}`);
  console.log(`  Path:      ${active.path}`);
  console.log(`  Created:   ${active.createdAt}`);
  console.log(`  Last used: ${active.lastUsed}`);

  // Try to show notes from project.md
  try {
    const contextPath = join(active.path, '_opensquad', 'context', 'project.md');
    const content = await readFile(contextPath, 'utf-8');
    const notesMatch = content.match(/## Notes\n([\s\S]*?)(?:\n##|$)/);
    if (notesMatch) {
      const notes = notesMatch[1].trim();
      if (notes && notes !== 'User can add free-text notes here that agents can read.') {
        console.log(`\n  Notes:\n  ${notes.replace(/\n/g, '\n  ')}`);
      }
    }
  } catch {
    // No context file
  }

  console.log('');
}

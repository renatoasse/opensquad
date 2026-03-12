import { cp, mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createPrompt } from './prompt.js';
import { loadLocale, t } from './i18n.js';
import { listAvailable, installSkill } from './skills.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const LANGUAGES = [
  { label: 'Português (Brasil)', value: 'Português (Brasil)' },
  { label: 'English', value: 'English' },
  { label: 'Español', value: 'Español' },
];

const IDES = [
  { label: 'Antigravity', value: 'antigravity', checked: true },
  { label: 'Claude Code', value: 'claude-code' },
  { label: 'Codex (OpenAI)', value: 'codex' },
  { label: 'Cursor', value: 'cursor' }, 
  { label: 'VS Code + Copilot', value: 'vscode-copilot' },
];

export async function init(targetDir, options = {}) {

  // Check if already initialized
  let isReInit = false;
  try {
    await stat(join(targetDir, '_opensquad'));
    isReInit = true;
  } catch {
    // Not initialized yet — continue
  }

  console.log(isReInit ? '\n  🔄 Opensquad — Re-configure\n' : '\n  🟢 Opensquad — Setup\n');

  // Guided installation (skip in test mode)
  let language = options._language || 'English';
  let ides = options._ides ?? ['claude-code'];
  let userName = '';

  if (!options._skipPrompts) {
    const prompt = createPrompt();

    try {
      // Language is asked FIRST (in English, before locale is loaded)
      const langChoice = await prompt.choose('What language do you prefer for outputs?', LANGUAGES);
      language = langChoice.value;

      // Load locale — all messages from here are translated
      await loadLocale(language);

      console.log(`\n  ${t('welcome')}\n`);

      userName = (await prompt.ask(`  ${t('askName')}`)).trim();

      ides = await prompt.multiChoose(t('chooseIdes'), IDES);
    } finally {
      prompt.close();
    }
  } else {
    await loadLocale(language);
  }

  // Copy template files
  await copyCommonTemplates(targetDir);
  await copyIdeTemplates(ides, targetDir);
  await installAllSkills(targetDir);
  if (!options._skipPrompts) {
    await installDependencies(targetDir);
  }
  await writeProjectReadme(targetDir);

  // Write user preferences
  const prefsPath = join(targetDir, '_opensquad', '_memory', 'preferences.md');
  await mkdir(dirname(prefsPath), { recursive: true });
  const prefsContent = `# Opensquad Preferences

- **User Name:** ${userName}
- **Output Language:** ${language}
- **IDEs:** ${ides.join(', ')}
- **Date Format:** YYYY-MM-DD
`;
  await writeFile(prefsPath, prefsContent, 'utf-8');

  console.log(`\n  ${t('success')}\n`);
  console.log(`  ${t('nextSteps')}`);
  for (const ide of ides) {
    if (ide === 'claude-code') {
      console.log(`  ${t('step1ClaudeCode')}`);
      console.log(`  ${t('step2ClaudeCode')}`);
      console.log(`  ${t('step3ClaudeCode')}\n`);
    } else if (ide === 'codex') {
      console.log(`  ${t('step1Codex')}\n`);
    } else if (ide === 'antigravity') {
      console.log(`  ${t('step1Antigravity')}\n`);
    } else if (ide === 'cursor') {
      console.log(`  ${t('step1Cursor')}\n`);
    } else if (ide === 'vscode-copilot') {
      console.log(`  ${t('step1VsCodeCopilot')}`);
      console.log(`  ${t('step2VsCodeCopilot')}`);
      console.log(`  ${t('step3VsCodeCopilot')}\n`);
    }
  }
}

export async function loadSavedLocale(targetDir) {
  try {
    const prefsPath = join(targetDir, '_opensquad', '_memory', 'preferences.md');
    const content = await readFile(prefsPath, 'utf-8');
    const match = content.match(/\*\*Output Language:\*\*\s*(.+)/);
    if (match) {
      await loadLocale(match[1].trim());
      return;
    }
  } catch {
    // No preferences file yet
  }
  await loadLocale('English');
}

async function installAllSkills(targetDir) {
  const available = await listAvailable();
  for (const id of available) {
    await installSkill(id, targetDir);
    console.log(`  ${t('createdFile', { path: `skills/${id}/SKILL.md` })}`);
  }
}

async function installDependencies(targetDir) {
  console.log(`\n  Installing dependencies...`);
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  console.log(`\n  Installing dashboard dependencies...`);
  execSync('npm install', { cwd: join(targetDir, 'dashboard'), stdio: 'inherit' });
  console.log(`\n  Installing Playwright browsers...`);
  execSync('npx playwright install chromium', { cwd: targetDir, stdio: 'inherit' });
}

async function writeProjectReadme(targetDir) {
  const readmePath = join(__dirname, 'readme', 'README.md');
  const content = await readFile(readmePath, 'utf-8');
  await writeFile(join(targetDir, 'README.md'), content, 'utf-8');
}

async function copyCommonTemplates(targetDir) {
  const entries = await getTemplateEntries(TEMPLATES_DIR);

  for (const entry of entries) {
    // Skip anything inside ide-templates/ — handled by copyIdeTemplates
    if (entry.replace(/\\/g, '/').includes('/ide-templates/')) continue;

    const relativePath = entry.slice(TEMPLATES_DIR.length + 1);
    const destPath = join(targetDir, relativePath);
    const destDir = dirname(destPath);
    await mkdir(destDir, { recursive: true });
    try {
      await stat(destPath);
      continue; // file already exists — skip
    } catch {
      // does not exist — copy it
    }
    await cp(entry, destPath);
    console.log(`  ${t('createdFile', { path: relativePath })}`);
  }
}

async function copyIdeTemplates(ides, targetDir) {
  const ideTemplatesDir = join(TEMPLATES_DIR, 'ide-templates');
  const writtenPaths = new Set();

  for (const ide of ides) {
    const ideSrcDir = join(ideTemplatesDir, ide);
    let entries;
    try {
      entries = await getTemplateEntries(ideSrcDir);
    } catch {
      continue; // no template dir for this IDE yet
    }

    for (const entry of entries) {
      const relativePath = entry.slice(ideSrcDir.length + 1);
      // settings.json for vscode-copilot is handled by mergeVsCodeSettings — skip here
      if (ide === 'vscode-copilot' && relativePath.replace(/\\/g, '/') === '.vscode/settings.json') continue;
      if (writtenPaths.has(relativePath)) continue;
      writtenPaths.add(relativePath);

      const destPath = join(targetDir, relativePath);
      const destDir = dirname(destPath);
      await mkdir(destDir, { recursive: true });
      await cp(entry, destPath);
      console.log(`  ${t('createdFile', { path: relativePath })}`);
    }
  }

  if (ides.includes('vscode-copilot')) {
    await mergeVsCodeSettings(targetDir);
  }
}

async function mergeVsCodeSettings(targetDir) {
  const settingsPath = join(targetDir, '.vscode', 'settings.json');

  let exists = false;
  try {
    await stat(settingsPath);
    exists = true;
  } catch {
    // doesn't exist
  }

  if (!exists) {
    const templateBase = join(TEMPLATES_DIR, 'ide-templates', 'vscode-copilot', '.vscode', 'settings.json');
    await mkdir(join(targetDir, '.vscode'), { recursive: true });
    await cp(templateBase, settingsPath);
    return;
  }

  const raw = await readFile(settingsPath, 'utf-8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.log(`  ⚠️  .vscode/settings.json has invalid JSON — skipping merge. Add manually: "chat.promptFilesLocations": [".github/prompts"]`);
    return;
  }

  if (!parsed['chat.promptFilesLocations']) {
    parsed['chat.promptFilesLocations'] = ['.github/prompts'];
  } else if (!parsed['chat.promptFilesLocations'].includes('.github/prompts')) {
    parsed['chat.promptFilesLocations'].push('.github/prompts');
  }

  await writeFile(settingsPath, JSON.stringify(parsed, null, 2), 'utf-8');
}

export async function getTemplateEntries(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await getTemplateEntries(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

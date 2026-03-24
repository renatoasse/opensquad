import { createInterface } from 'node:readline';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { listInstalled, installSkill, removeSkill, getSkillMeta, getLocalizedDescription } from './skills.js';
import { loadLocale, t, getLocaleCode } from './i18n.js';
import { loadSavedLocale } from './init.js';
import { logEvent } from './logger.js';
import { createPrompt } from './prompt.js';

const RESEND_SKILL_ID = 'resend';
const RESEND_SETUP_CONFIG = {
  command: 'npx',
  args: ['-y', 'resend-mcp'],
};
const RESEND_STATE_PATH = '_opensquad/_memory/resend.md';
const RESEND_SETTINGS_PATH = '.claude/settings.local.json';

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function ensureResendInstalled(targetDir) {
  const installed = await listInstalled(targetDir);
  if (!installed.includes(RESEND_SKILL_ID)) {
    await installSkill(RESEND_SKILL_ID, targetDir);
  }
}

async function runResendSetup(targetDir) {
  await ensureResendInstalled(targetDir);

  const prompt = createPrompt();
  try {
    console.log('\n  Resend setup\n');
    console.log('  Resend requires a verified sender email or domain before mail can be sent.');
    console.log('  Have your API key and sender details ready before continuing.\n');

    const apiKey = await askRequiredSecret(prompt, '  Resend API key');
    const defaultSenderEmail = await askOptionalText(
      prompt,
      '  Default sender email address (press Enter to skip)'
    );
    const senderDomain = await askOptionalText(
      prompt,
      '  Verified sender domain (press Enter to derive from the email address)'
    );

    await writeResendSettings(targetDir, apiKey);
    await writeResendState(targetDir, {
      defaultSenderEmail,
      senderDomain: senderDomain || inferSenderDomain(defaultSenderEmail),
    });

    console.log('  Resend setup saved in .claude/settings.local.json and _opensquad/_memory/resend.md\n');
  } finally {
    prompt.close();
  }
}

async function askRequiredSecret(prompt, question) {
  while (true) {
    const value = (await prompt.askSecret(question)).trim();
    if (value) return value;
    console.log('  Resend API key is required.\n');
  }
}

async function askOptionalText(prompt, question) {
  return (await prompt.ask(question)).trim();
}

function inferSenderDomain(senderEmail) {
  const domain = senderEmail.split('@')[1];
  return domain ? domain.trim() : '';
}

async function readJsonFile(filePath) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${filePath}`, { cause: err });
    }
    throw err;
  }
}

function parseResendState(raw) {
  const fields = {};

  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*-\s*([^:]+):\s*(.*)$/);
    if (match) {
      fields[match[1].trim()] = match[2].trim();
    }
  }

  return fields;
}

async function readResendState(targetDir) {
  const statePath = join(targetDir, RESEND_STATE_PATH);

  try {
    const raw = await readFile(statePath, 'utf-8');
    return { raw, fields: parseResendState(raw) };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isResendServerConfigValid(config) {
  if (!config || typeof config !== 'object') return false;

  const commandValid = config.command === RESEND_SETUP_CONFIG.command;
  const argsValid = Array.isArray(config.args)
    && config.args.length === RESEND_SETUP_CONFIG.args.length
    && config.args.every((value, index) => value === RESEND_SETUP_CONFIG.args[index]);
  const envValid = config.env && typeof config.env === 'object'
    && isNonEmptyString(config.env.RESEND_API_KEY);

  return commandValid && argsValid && envValid;
}

async function assessResendRepair(targetDir) {
  const settings = await readJsonFile(join(targetDir, RESEND_SETTINGS_PATH));
  const currentServers = settings.mcpServers && typeof settings.mcpServers === 'object'
    ? settings.mcpServers
    : {};
  const resendConfig = currentServers[RESEND_SKILL_ID];
  const state = await readResendState(targetDir);

  const issues = [];

  if (!isResendServerConfigValid(resendConfig)) {
    issues.push('mcpServers.resend is missing or incomplete');
  }

  if (!state) {
    issues.push('workspace memory file is missing');
  } else {
    const { fields } = state;
    if (fields.setup_complete !== 'true') {
      issues.push('setup_complete marker is missing');
    }
    if (!isNonEmptyString(fields.configured_at)) {
      issues.push('configured_at marker is missing');
    }
  }

  return {
    needsRepair: issues.length > 0,
    issues,
  };
}

async function writeResendSettings(targetDir, apiKey) {
  const settingsPath = join(targetDir, RESEND_SETTINGS_PATH);
  const settingsDir = dirname(settingsPath);
  const config = await readJsonFile(settingsPath);
  const currentServers = config.mcpServers && typeof config.mcpServers === 'object'
    ? config.mcpServers
    : {};
  const currentResend = currentServers[RESEND_SKILL_ID] && typeof currentServers[RESEND_SKILL_ID] === 'object'
    ? currentServers[RESEND_SKILL_ID]
    : {};
  const currentEnv = currentResend.env && typeof currentResend.env === 'object'
    ? currentResend.env
    : {};

  config.mcpServers = {
    ...currentServers,
    [RESEND_SKILL_ID]: {
      ...currentResend,
      ...RESEND_SETUP_CONFIG,
      env: {
        ...currentEnv,
        RESEND_API_KEY: apiKey,
      },
    },
  };

  await mkdir(settingsDir, { recursive: true });
  await writeFile(settingsPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
}

async function writeResendState(targetDir, { defaultSenderEmail, senderDomain }) {
  const statePath = join(targetDir, RESEND_STATE_PATH);
  await mkdir(dirname(statePath), { recursive: true });

  const lines = [
    '# Resend Setup',
    '',
    `- configured_at: ${new Date().toISOString()}`,
    '- setup_complete: true',
  ];

  if (defaultSenderEmail) {
    lines.push(`- default_sender_email: ${defaultSenderEmail}`);
  }

  if (senderDomain) {
    lines.push(`- sender_domain: ${senderDomain}`);
  }

  lines.push('- api_key_storage: .claude/settings.local.json', '');

  await writeFile(statePath, `${lines.join('\n')}`, 'utf-8');
}

export async function skillsCli(subcommand, args, targetDir) {
  // Require initialized project
  try {
    await stat(join(targetDir, '_opensquad'));
  } catch {
    await loadLocale('English');
    console.log(`\n  ${t('skillsNotInitialized')}\n`);
    return { success: false };
  }

  await loadSavedLocale(targetDir);

  try {
    if (subcommand === 'list' || !subcommand) {
      await runList(targetDir);
    } else if (subcommand === 'install') {
      const installed = await runInstall(args[0], targetDir);
      if (installed === false) return { success: false };
    } else if (subcommand === 'setup') {
      const setup = await runSetup(args[0], targetDir);
      if (setup === false) return { success: false };
    } else if (subcommand === 'repair') {
      const repair = await runRepair(args[0], targetDir);
      if (repair === false) return { success: false };
    } else if (subcommand === 'remove') {
      const removed = await runRemove(args[0], targetDir);
      if (removed === false) return { success: false };
    } else if (subcommand === 'update') {
      await runUpdate(targetDir);
    } else if (subcommand === 'update-one') {
      await runUpdateOne(args[0], targetDir);
    } else {
      console.log(`\n  ${t('skillsUnknownCommand', { cmd: subcommand })}\n`);
      return { success: false };
    }
  } catch (err) {
    console.log(`\n  ${t('skillsError', { message: err.message })}\n`);
    return { success: false };
  }

  return { success: true };
}

async function runList(targetDir) {
  console.log(`\n  Opensquad Skills\n`);

  const installed = await listInstalled(targetDir);

  if (installed.length > 0) {
    console.log(`  ${t('skillsInstalledHeader')}`);
    for (const id of installed) {
      const meta = await getSkillMeta(id);
      if (meta) {
        const desc = getLocalizedDescription(meta, getLocaleCode());
        const parts = [meta.name];
        if (meta.type) parts.push(`(${meta.type})`);
        parts.push(`- ${desc.split('.')[0]}`);
        console.log(`    ${parts.join(' ')}`);
      } else {
        console.log(`    ${id}`);
      }
    }
  } else {
    console.log(`  ${t('skillsNoneInstalled')}`);
  }

  console.log(`\n  Browse available skills at: https://github.com/renatoasse/opensquad/tree/main/skills\n`);
}

async function runInstall(id, targetDir) {
  if (!id) {
    console.log('\n  Usage: opensquad install <id>\n');
    return false;
  }

  const installed = await listInstalled(targetDir);
  if (installed.includes(id)) {
    const answer = await confirm(`\n  ${t('skillsAlreadyInstalled', { id })}`);
    // Accept 'y' (English) or 's' (Portuguese "sim") as affirmative answers
    if (answer !== 'y' && answer !== 's') return false;
    console.log(`  ${t('skillsInstalling', { id })}`);
    await installSkill(id, targetDir);
    console.log(`  ${t('skillsReinstalled', { id })}\n`);
    await logEvent('skill:install', { name: id, reinstall: true }, targetDir);
    if (id === RESEND_SKILL_ID) {
      await runResendSetup(targetDir);
    }
    return;
  }

  console.log(`\n  ${t('skillsInstalling', { id })}`);
  await installSkill(id, targetDir);
  console.log(`  ${t('skillsInstalled', { id })}\n`);
  await logEvent('skill:install', { name: id }, targetDir);

  if (id === RESEND_SKILL_ID) {
    await runResendSetup(targetDir);
  }
}

async function runSetup(id, targetDir) {
  if (id !== RESEND_SKILL_ID) {
    console.log('\n  Usage: opensquad skills setup resend\n');
    return false;
  }

  await runResendSetup(targetDir);
}

async function runRepair(id, targetDir) {
  if (id !== RESEND_SKILL_ID) {
    console.log('\n  Usage: opensquad skills repair resend\n');
    return false;
  }

  const { needsRepair, issues } = await assessResendRepair(targetDir);

  if (!needsRepair) {
    console.log('\n  Resend configuration is already healthy. No repair needed.\n');
    return;
  }

  console.log('\n  Resend configuration needs repair:\n');
  for (const issue of issues) {
    console.log(`  - ${issue}`);
  }
  console.log('');

  await runResendSetup(targetDir);
}

async function runRemove(id, targetDir) {
  if (!id) {
    console.log('\n  Usage: opensquad uninstall <id>\n');
    return false;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('skillsNotInstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('skillsRemoving', { id })}`);
  await removeSkill(id, targetDir);
  await logEvent('skill:remove', { name: id }, targetDir);
  console.log(`  ${t('skillsRemoved', { id })}\n`);
}

async function runUpdate(targetDir) {
  const installed = await listInstalled(targetDir);
  if (installed.length === 0) {
    console.log(`\n  ${t('skillsUpdateNone')}\n`);
    return;
  }

  console.log(`\n  ${t('skillsUpdating')}`);
  for (const id of installed) {
    console.log(`  ${t('skillsInstalling', { id })}`);
    await installSkill(id, targetDir);
    console.log(`  ${t('skillsInstalled', { id })}`);
  }
  await logEvent('skill:update', { count: installed.length }, targetDir);
  console.log(`\n  ${t('skillsUpdateDone', { count: installed.length })}\n`);
}

async function runUpdateOne(id, targetDir) {
  if (!id) {
    console.log('\n  Usage: opensquad update <name>\n');
    return;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('skillsNotInstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('skillsInstalling', { id })}`);
  await installSkill(id, targetDir);
  await logEvent('skill:update', { name: id }, targetDir);
  console.log(`  ${t('skillsInstalled', { id })}\n`);
}

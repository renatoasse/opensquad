import { createInterface } from 'node:readline';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { listInstalled, installSkill, removeSkill, getSkillMeta, getLocalizedDescription } from './skills.js';
import {
  getEmailProviderDefinition,
  inspectEmailProvider,
  providerNeedsRepair,
  providerNeedsSetup,
  recommendEmailProvider,
  selectEmailProvider,
  writeEmailProviderSettings,
  writeEmailProviderState,
} from './email-providers.js';
import { loadLocale, t, getLocaleCode } from './i18n.js';
import { loadSavedLocale } from './init.js';
import { logEvent } from './logger.js';
import { createPrompt } from './prompt.js';

const RESEND_PROVIDER = getEmailProviderDefinition('resend');
const RESEND_SKILL_ID = RESEND_PROVIDER.id;

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
  const currentProvider = await inspectEmailProvider(targetDir, RESEND_SKILL_ID);
  if (currentProvider.status === 'configured') {
    console.log('\n  Resend configuration is already healthy. No setup needed.\n');
    return;
  }

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

    await writeEmailProviderSettings(targetDir, RESEND_PROVIDER, { RESEND_API_KEY: apiKey });
    await writeEmailProviderState(targetDir, RESEND_PROVIDER, {
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

  const provider = await inspectEmailProvider(targetDir, RESEND_SKILL_ID);
  if (providerNeedsSetup(provider) || providerNeedsRepair(provider)) {
    await runResendSetup(targetDir);
    return;
  }

  console.log('\n  Resend configuration is already healthy. No setup needed.\n');
}

async function runRepair(id, targetDir) {
  if (id !== RESEND_SKILL_ID) {
    console.log('\n  Usage: opensquad skills repair resend\n');
    return false;
  }

  const { selection, provider, configuredProviders } = await selectEmailProvider({ targetDir });
  if (selection === 'ambiguous') {
    console.log('\n  Multiple email providers are configured:\n');
    for (const record of configuredProviders) {
      console.log(`  - ${record.id} (${record.status})`);
    }
    console.log('');
    return;
  }

  if (selection === 'recommended') {
    const recommendation = recommendEmailProvider({ targetDir });
    if (recommendation) {
      console.log('\n  No configured email provider was found. Recommending Resend as the default v1 provider.\n');
    }
    await runResendSetup(targetDir);
    return;
  }

  if (provider && provider.healthy) {
    console.log('\n  Resend configuration is already healthy. No repair needed.\n');
    return;
  }

  if (provider && providerNeedsRepair(provider)) {
    console.log('\n  Resend configuration needs repair:\n');
    for (const issue of provider.issues) {
      console.log(`  - ${issue}`);
    }
    console.log('');
  }

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

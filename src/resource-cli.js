/**
 * Generic CLI handler factory for skills and agents.
 * Eliminates DRY violation between skills-cli.js and agents-cli.js.
 */
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { confirm, isYes } from './cli-utils.js';
import { loadLocale, t, getLocaleCode } from './i18n.js';
import { loadSavedLocale } from './init.js';

/**
 * Create a CLI handler for a resource type (skill or agent).
 *
 * @param {object} config
 * @param {string} config.resourceName - Display name ("Skills" or "Agents")
 * @param {string} config.i18nPrefix - Translation key prefix ("skills" or "agents")
 * @param {string} config.browseUrl - URL shown in list footer
 * @param {string} config.usageInstall - Usage hint for install
 * @param {string} config.usageRemove - Usage hint for remove
 * @param {string} config.usageUpdate - Usage hint for update
 * @param {Function} config.listInstalled - List installed resources
 * @param {Function} config.install - Install a resource
 * @param {Function} config.remove - Remove a resource
 * @param {Function} config.getMeta - Get metadata for display
 * @param {Function} config.getLocalizedDescription - Get localized description
 * @param {Function} config.formatListItem - Format a single list item (meta → string)
 */
export function createResourceCli(config) {
  const {
    i18nPrefix: p,
    browseUrl,
    usageInstall,
    usageRemove,
    usageUpdate,
    listInstalled,
    install,
    remove,
    getMeta,
    getLocalizedDescription,
    formatListItem,
    resourceName,
  } = config;

  async function runList(targetDir) {
    console.log(`\n  Opensquad ${resourceName}\n`);
    const installed = await listInstalled(targetDir);

    if (installed.length > 0) {
      console.log(`  ${t(`${p}InstalledHeader`)}`);
      for (const id of installed) {
        const meta = await getMeta(id);
        if (meta) {
          const desc = getLocalizedDescription(meta, getLocaleCode());
          console.log(`    ${formatListItem(meta, desc)}`);
        } else {
          console.log(`    ${id}`);
        }
      }
    } else {
      console.log(`  ${t(`${p}NoneInstalled`)}`);
    }

    console.log(`\n  Browse available: ${browseUrl}\n`);
  }

  async function runInstall(id, targetDir) {
    if (!id) {
      console.log(`\n  Usage: ${usageInstall}\n`);
      return false;
    }

    const installed = await listInstalled(targetDir);
    if (installed.includes(id)) {
      const answer = await confirm(`\n  ${t(`${p}AlreadyInstalled`, { id })}`);
      if (!isYes(answer)) return false;
      console.log(`  ${t(`${p}Installing`, { id })}`);
      await install(id, targetDir);
      console.log(`  ${t(`${p}Reinstalled`, { id })}\n`);
      return true;
    }

    console.log(`\n  ${t(`${p}Installing`, { id })}`);
    await install(id, targetDir);
    console.log(`  ${t(`${p}Installed`, { id })}\n`);
    return true;
  }

  async function runRemove(id, targetDir) {
    if (!id) {
      console.log(`\n  Usage: ${usageRemove}\n`);
      return false;
    }

    const installed = await listInstalled(targetDir);
    if (!installed.includes(id)) {
      console.log(`\n  ${t(`${p}NotInstalled`, { id })}\n`);
      return false;
    }

    console.log(`\n  ${t(`${p}Removing`, { id })}`);
    await remove(id, targetDir);
    console.log(`  ${t(`${p}Removed`, { id })}\n`);
    return true;
  }

  async function runUpdate(targetDir) {
    const installed = await listInstalled(targetDir);
    if (installed.length === 0) {
      console.log(`\n  ${t(`${p}UpdateNone`)}\n`);
      return true;
    }

    console.log(`\n  ${t(`${p}Updating`)}`);
    await Promise.all(installed.map(async (id) => {
      await install(id, targetDir);
      console.log(`  ${t(`${p}Installed`, { id })}`);
    }));
    console.log(`\n  ${t(`${p}UpdateDone`, { count: installed.length })}\n`);
    return true;
  }

  async function runUpdateOne(id, targetDir) {
    if (!id) {
      console.log(`\n  Usage: ${usageUpdate}\n`);
      return false;
    }

    const installed = await listInstalled(targetDir);
    if (!installed.includes(id)) {
      console.log(`\n  ${t(`${p}NotInstalled`, { id })}\n`);
      return false;
    }

    console.log(`\n  ${t(`${p}Installing`, { id })}`);
    await install(id, targetDir);
    console.log(`  ${t(`${p}Installed`, { id })}\n`);
    return true;
  }

  /** Main CLI dispatch */
  return async function cli(subcommand, args, targetDir) {
    // Require initialized project
    try {
      await stat(join(targetDir, '_opensquad'));
    } catch {
      await loadLocale('English');
      console.log(`\n  ${t(`${p}NotInitialized`)}\n`);
      return { success: false };
    }

    await loadSavedLocale(targetDir);

    try {
      const handlers = {
        list: () => runList(targetDir),
        install: () => runInstall(args[0], targetDir),
        remove: () => runRemove(args[0], targetDir),
        update: () => runUpdate(targetDir),
        'update-one': () => runUpdateOne(args[0], targetDir),
      };

      const handler = handlers[subcommand || 'list'];
      if (!handler) {
        console.log(`\n  ${t(`${p}UnknownCommand`, { cmd: subcommand })}\n`);
        return { success: false };
      }

      const result = await handler();
      if (result === false) return { success: false };
    } catch (err) {
      console.log(`\n  ${t(`${p}Error`, { message: err.message })}\n`);
      return { success: false };
    }

    return { success: true };
  };
}

#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';
import { agentsCli } from '../src/agents-cli.js';

const { positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];
const cwd = process.cwd();

/** Run a command handler and set exit code on failure. */
async function run(fn, ...args) {
  const result = await fn(...args);
  if (!result?.success) process.exitCode = 1;
}

try {
  // Auto-start Open Notebook if configured (skip for init/services/dashboard/help)
  if (command && !['init', 'services', 'dashboard'].includes(command)) {
    try {
      const { ensureServices } = await import('../src/services.js');
      await ensureServices(cwd);
    } catch (err) {
      if (err?.code !== 'ERR_MODULE_NOT_FOUND') {
        console.warn(`  ⚠️  Services check: ${err.message}`);
      }
    }
  }

  if (command === 'init') {
    await init(cwd);
  } else if (command === 'install') {
    await run(skillsCli, 'install', positionals.slice(1), cwd);
  } else if (command === 'uninstall') {
    await run(skillsCli, 'remove', positionals.slice(1), cwd);
  } else if (command === 'update') {
    const target = positionals[1];
    if (target) {
      await run(skillsCli, 'update-one', [target], cwd);
    } else {
      await run(update, cwd);
    }
  } else if (command === 'skills') {
    const subcommand = positionals[1] || 'list';
    await run(skillsCli, subcommand, positionals.slice(2), cwd);
  } else if (command === 'agents') {
    const subcommand = positionals[1] || 'list';
    await run(agentsCli, subcommand, positionals.slice(2), cwd);
  } else if (command === 'dashboard') {
    const { startDashboard } = await import('../src/dashboard.js');
    const ok = await startDashboard(cwd);
    if (!ok) process.exitCode = 1;
  } else if (command === 'services') {
    const { startServices, stopServices, healthCheck, indexDocs } = await import('../src/services.js');
    const sub = positionals[1] || 'start';
    const serviceHandlers = { start: startServices, stop: stopServices, health: healthCheck, index: indexDocs };
    const handler = serviceHandlers[sub];
    if (handler) {
      await handler(cwd);
    } else {
      console.log(`  Unknown services command: ${sub}`);
      console.log(`  Available: ${Object.keys(serviceHandlers).join(', ')}`);
      process.exitCode = 1;
    }
  } else {
    console.log(`
  opensquad — Multi-agent orchestration for Claude Code

  Usage:
    npx opensquad init                    Initialize Opensquad
    npx opensquad update                  Update Opensquad core
    npx opensquad install <name>          Install a skill
    npx opensquad uninstall <name>        Remove a skill
    npx opensquad update <name>           Update a specific skill
    npx opensquad skills                  List installed skills
    npx opensquad agents                  List installed agents
    npx opensquad agents install <name>   Install a predefined agent
    npx opensquad agents remove <name>    Remove an agent
    npx opensquad agents update           Update all agents
    npx opensquad dashboard               Open pixel-art dashboard (watch agents work!)
    npx opensquad services start          Start Open Notebook + SurrealDB
    npx opensquad services stop           Stop services
    npx opensquad services health         Check service health
    npx opensquad services index          Index .md files into Open Notebook

  Learn more: https://github.com/renatoasse/opensquad
  `);
    if (command) process.exitCode = 1;
  }
} catch (err) {
  console.error(`\n  [ERROR] ${err.message}\n`);
  process.exitCode = 1;
}

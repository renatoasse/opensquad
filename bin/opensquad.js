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

// Auto-start Open Notebook if configured (skip for init/services/help)
if (command && !['init', 'services'].includes(command)) {
  try {
    const { ensureServices } = await import('../src/services.js');
    await ensureServices(cwd);
  } catch {
    // Silent — services module may not be needed
  }
}

if (command === 'init') {
  await init(cwd);
} else if (command === 'install') {
  // npx opensquad install <name>
  const result = await skillsCli('install', positionals.slice(1), cwd);
  if (!result.success) process.exitCode = 1;
} else if (command === 'uninstall') {
  // npx opensquad uninstall <name>
  const result = await skillsCli('remove', positionals.slice(1), cwd);
  if (!result.success) process.exitCode = 1;
} else if (command === 'update') {
  const target = positionals[1];
  if (target) {
    // npx opensquad update <name> → update specific skill
    const result = await skillsCli('update-one', [target], cwd);
    if (!result.success) process.exitCode = 1;
  } else {
    // npx opensquad update → update core
    const result = await update(cwd);
    if (!result.success) process.exitCode = 1;
  }
} else if (command === 'skills') {
  // Backward compat: npx opensquad skills list|install|remove|update
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await skillsCli(subcommand, args, cwd);
  if (!result.success) process.exitCode = 1;
} else if (command === 'agents') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await agentsCli(subcommand, args, cwd);
  if (!result.success) process.exitCode = 1;
} else if (command === 'services') {
  const { startServices, stopServices, healthCheck, indexDocs } = await import('../src/services.js');
  const sub = positionals[1] || 'start';
  if (sub === 'start') {
    await startServices(cwd);
  } else if (sub === 'stop') {
    await stopServices(cwd);
  } else if (sub === 'health') {
    await healthCheck(cwd);
  } else if (sub === 'index') {
    await indexDocs(cwd);
  } else {
    console.log(`  Unknown services command: ${sub}`);
    console.log(`  Available: start, stop, health, index`);
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
    npx opensquad services start           Start Open Notebook + SurrealDB
    npx opensquad services stop            Stop services
    npx opensquad services health          Check service health
    npx opensquad services index           Index .md files into Open Notebook

  Learn more: https://github.com/renatoasse/opensquad
  `);
  if (command) process.exitCode = 1;
}

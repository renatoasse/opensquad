#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';
import { agentsCli } from '../src/agents-cli.js';
import { companyCli } from '../src/company-cli.js';
import { productCli } from '../src/product-cli.js';
import { squadCli } from '../src/squad-cli.js';
import { historyCli } from '../src/history-cli.js';
import { backupCli } from '../src/backup-cli.js';

const { positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];

if (command === 'init') {
  await init(process.cwd());
} else if (command === 'install') {
  // npx opensquad install <name>
  const result = await skillsCli('install', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'uninstall') {
  // npx opensquad uninstall <name>
  const result = await skillsCli('remove', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'update') {
  const target = positionals[1];
  if (target) {
    // npx opensquad update <name> → update specific skill
    const result = await skillsCli('update-one', [target], process.cwd());
    if (!result.success) process.exitCode = 1;
  } else {
    // npx opensquad update → update core
    const result = await update(process.cwd());
    if (!result.success) process.exitCode = 1;
  }
} else if (command === 'skills') {
  // Backward compat: npx opensquad skills list|install|remove|update
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await skillsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'agents') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await agentsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'company') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await companyCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'product') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await productCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'squad') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await squadCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'history') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await historyCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'backup') {
  const subcommand = positionals[1];
  // Handle 'opensquad backup stats' as a subcommand
  if (subcommand === 'stats') {
    const result = await backupCli('stats', [], process.cwd());
    if (!result.success) process.exitCode = 1;
  } else {
    const args = positionals.slice(1);
    const result = await backupCli('backup', args, process.cwd());
    if (!result.success) process.exitCode = 1;
  }
} else if (command === 'restore') {
  const args = positionals.slice(1);
  const result = await backupCli('restore', args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'migrate') {
  // Migration from MD files to SQLite
  const { migrateToSqlite } = await import('../src/migrate-to-sqlite.js');
  const result = await migrateToSqlite(process.cwd());
  if (!result.success) process.exitCode = 1;
} else {
  console.log(`
  opensquad — Multi-agent orchestration for Claude Code

  Usage:
    npx opensquad init                    Initialize Opensquad
    npx opensquad update                  Update Opensquad core

  Skills & Agents:
    npx opensquad install <name>          Install a skill
    npx opensquad uninstall <name>        Remove a skill
    npx opensquad update <name>           Update a specific skill
    npx opensquad skills                  List installed skills
    npx opensquad agents                  List installed agents
    npx opensquad agents install <name>   Install a predefined agent
    npx opensquad agents remove <name>    Remove an agent
    npx opensquad agents update           Update all agents

  Multi-Company Management:
    npx opensquad company                 Manage companies
    npx opensquad company list            List all companies
    npx opensquad company add             Add a new company
    npx opensquad company switch <slug>   Switch active company
    npx opensquad company current         Show current company

    npx opensquad product                 Manage products
    npx opensquad product list            List products
    npx opensquad product add             Add a new product
    npx opensquad product switch <slug>   Switch active product

    npx opensquad squad                   Manage squads
    npx opensquad squad list              List squads
    npx opensquad squad add               Add a new squad
    npx opensquad squad show <code>       Show squad details

  History & Backup:
    npx opensquad history                 View run history
    npx opensquad history <squad>         View squad-specific history
    npx opensquad backup [path]           Backup database
    npx opensquad restore <path>          Restore from backup
    npx opensquad migrate                 Migrate MD data to SQLite

  Learn more: https://github.com/renatoasse/opensquad
  `);
  if (command) process.exitCode = 1;
}

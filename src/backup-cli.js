/**
 * Backup CLI Module for Opensquad
 *
 * Backup and restore the SQLite database.
 */

import { cp, stat, mkdir, readdir } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import select from '@inquirer/select';
import input from '@inquirer/input';
import { initDb, getDbPath, closeDb, getStats } from './db.js';

/**
 * Backup CLI entry point
 * @param {string} subcommand - backup or restore
 * @param {string[]} args - Command arguments
 * @param {string} projectDir - Project directory
 * @returns {Promise<{success: boolean}>}
 */
export async function backupCli(subcommand, args, projectDir) {
  try {
    switch (subcommand) {
      case 'backup':
        return await backupCmd(args[0], projectDir);
      case 'restore':
        return await restoreCmd(args[0], projectDir);
      case 'stats':
        return await statsCmd(projectDir);
      default:
        console.log(`
  opensquad backup — Backup and restore data

  Usage:
    opensquad backup [path]             Backup database to a file
    opensquad restore <path>            Restore database from a backup
    opensquad backup stats              Show database statistics

  Examples:
    opensquad backup ~/backups/         Backup to ~/backups/opensquad-2026-03-12.db
    opensquad backup mybackup.db        Backup to mybackup.db
    opensquad restore ~/backups/opensquad-2026-03-12.db
        `);
        return { success: true };
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false };
  }
}

/**
 * Backup the database
 * @param {string} destPath - Destination path (file or directory)
 * @param {string} projectDir
 */
async function backupCmd(destPath, projectDir) {
  await initDb(projectDir);
  const dbPath = getDbPath();

  // Check if database exists
  try {
    await stat(dbPath);
  } catch {
    console.log('\n  ❌ No database found. Nothing to backup.\n');
    return { success: false };
  }

  // Determine destination
  let finalPath;
  const date = new Date().toISOString().split('T')[0];
  const defaultName = `opensquad-${date}.db`;

  if (!destPath) {
    // Ask for destination
    const dest = await input({
      message: 'Backup destination (file or directory):',
      default: `./${defaultName}`
    });
    destPath = dest;
  }

  // Check if destPath is a directory
  try {
    const destStat = await stat(destPath);
    if (destStat.isDirectory()) {
      finalPath = join(destPath, defaultName);
    } else {
      finalPath = destPath;
    }
  } catch {
    // Path doesn't exist, assume it's a file path
    finalPath = destPath;
  }

  // Ensure parent directory exists
  await mkdir(dirname(finalPath), { recursive: true });

  // Close database before copying
  closeDb();

  // Copy database file
  await cp(dbPath, finalPath);

  // Also copy WAL file if exists
  try {
    await stat(`${dbPath}-wal`);
    await cp(`${dbPath}-wal`, `${finalPath}-wal`);
  } catch {
    // No WAL file
  }

  // Also copy SHM file if exists
  try {
    await stat(`${dbPath}-shm`);
    await cp(`${dbPath}-shm`, `${finalPath}-shm`);
  } catch {
    // No SHM file
  }

  console.log(`\n  ✅ Database backed up to: ${finalPath}\n`);

  // Show stats
  await initDb(projectDir);
  const stats = getStats();
  console.log('  Backup contains:');
  console.log(`  📊 ${stats.companies} companies`);
  console.log(`  📦 ${stats.products} products`);
  console.log(`  📋 ${stats.squads} squads`);
  console.log(`  🔄 ${stats.runs.total} runs`);
  console.log(`  🧠 ${stats.memories} memories\n`);

  return { success: true };
}

/**
 * Restore the database
 * @param {string} sourcePath - Source backup file
 * @param {string} projectDir
 */
async function restoreCmd(sourcePath, projectDir) {
  if (!sourcePath) {
    // Look for backup files in common locations
    const backupFiles = [];
    const searchPaths = ['.', './backups', projectDir, join(projectDir, 'backups')];

    for (const searchPath of searchPaths) {
      try {
        const files = await readdir(searchPath);
        for (const file of files) {
          if (file.startsWith('opensquad-') && file.endsWith('.db')) {
            backupFiles.push(join(searchPath, file));
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    if (backupFiles.length === 0) {
      console.log('\n  ❌ No backup files found. Please specify the backup file path.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select backup to restore:',
      choices: backupFiles.map(f => ({
        name: f,
        value: f
      }))
    });

    sourcePath = choice;
  }

  // Check if source exists
  try {
    await stat(sourcePath);
  } catch {
    console.log(`\n  ❌ Backup file not found: ${sourcePath}\n`);
    return { success: false };
  }

  // Confirm restore
  const confirm = await select({
    message: `This will REPLACE your current database with the backup. Are you sure?`,
    choices: [
      { name: 'No, cancel', value: false },
      { name: 'Yes, restore from backup', value: true }
    ]
  });

  if (!confirm) {
    console.log('\n  Cancelled.\n');
    return { success: true };
  }

  // Initialize to get the database path
  await initDb(projectDir);
  const dbPath = getDbPath();

  // Close database before copying
  closeDb();

  // Create backup of current database
  const backupOfCurrent = `${dbPath}.bak-${Date.now()}`;
  try {
    await cp(dbPath, backupOfCurrent);
    console.log(`  ℹ️  Current database backed up to: ${basename(backupOfCurrent)}`);
  } catch {
    // No current database
  }

  // Copy backup to database location
  await cp(sourcePath, dbPath);

  // Also copy WAL file if exists
  try {
    await stat(`${sourcePath}-wal`);
    await cp(`${sourcePath}-wal`, `${dbPath}-wal`);
  } catch {
    // No WAL file
  }

  // Also copy SHM file if exists
  try {
    await stat(`${sourcePath}-shm`);
    await cp(`${sourcePath}-shm`, `${dbPath}-shm`);
  } catch {
    // No SHM file
  }

  console.log(`\n  ✅ Database restored from: ${sourcePath}\n`);

  // Show stats
  await initDb(projectDir);
  const stats = getStats();
  console.log('  Restored data:');
  console.log(`  📊 ${stats.companies} companies`);
  console.log(`  📦 ${stats.products} products`);
  console.log(`  📋 ${stats.squads} squads`);
  console.log(`  🔄 ${stats.runs.total} runs`);
  console.log(`  🧠 ${stats.memories} memories\n`);

  return { success: true };
}

/**
 * Show database statistics
 * @param {string} projectDir
 */
async function statsCmd(projectDir) {
  await initDb(projectDir);
  const stats = getStats();

  console.log(`
  Database Statistics:

  📊 Companies: ${stats.companies}
  📦 Products: ${stats.products}
  📋 Squads: ${stats.squads}

  🔄 Runs:
     Total: ${stats.runs.total}
     ✅ Completed: ${stats.runs.completed}
     ❌ Failed: ${stats.runs.failed}
     ⏱️  Avg Duration: ${stats.runs.avgDurationMs ? `${(stats.runs.avgDurationMs / 1000).toFixed(1)}s` : '-'}

  🧠 Memories: ${stats.memories}

  📁 Database: ${getDbPath()}
`);

  return { success: true };
}

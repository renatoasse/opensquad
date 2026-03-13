/**
 * History CLI Module for Opensquad
 *
 * View execution history from the SQLite database.
 */

import select from '@inquirer/select';
import {
  initDb,
  listAllRuns,
  listRuns,
  getRunById,
  listRunSteps,
  getSquadByCode,
  getSquadById,
  listAllSquads
} from './db.js';

/**
 * Format duration in a human-readable way
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
function formatDuration(ms) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format date in a readable way
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return date.toLocaleString();
}

/**
 * Get status icon
 * @param {string} status
 * @returns {string}
 */
function getStatusIcon(status) {
  switch (status) {
    case 'completed': return '✅';
    case 'running': return '🔄';
    case 'failed': return '❌';
    case 'pending': return '⏳';
    default: return '❔';
  }
}

/**
 * History CLI entry point
 * @param {string} subcommand - Optional squad code or subcommand
 * @param {string[]} args - Command arguments
 * @param {string} projectDir - Project directory
 * @returns {Promise<{success: boolean}>}
 */
export async function historyCli(subcommand, args, projectDir) {
  try {
    await initDb(projectDir);

    if (!subcommand || subcommand === 'list') {
      return await listHistoryCmd(args[0]);
    } else if (subcommand === 'show') {
      return await showRunCmd(args[0]);
    } else {
      // Assume subcommand is a squad code
      return await listSquadHistoryCmd(subcommand);
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false };
  }
}

/**
 * List all history
 * @param {string} limitArg
 */
async function listHistoryCmd(limitArg) {
  const limit = limitArg ? parseInt(limitArg, 10) : 20;
  const runs = listAllRuns({ limit });

  if (runs.length === 0) {
    console.log('\n  No runs found. Execute a squad to see history here.\n');
    return { success: true };
  }

  console.log('\n  Run History:\n');
  console.log('  Status  Squad                   Topic                           Duration   Date');
  console.log('  ─────────────────────────────────────────────────────────────────────────────────');

  for (const run of runs) {
    const icon = getStatusIcon(run.status);
    const squadName = (run.squad_name || 'Unknown').padEnd(20).slice(0, 20);
    const topic = (run.topic || '-').padEnd(30).slice(0, 30);
    const duration = formatDuration(run.duration_ms).padEnd(10);
    const date = new Date(run.started_at).toLocaleDateString();

    console.log(`  ${icon}      ${squadName}  ${topic}  ${duration} ${date}`);
  }

  console.log('');
  console.log(`  Showing ${runs.length} most recent runs.`);
  console.log('  Run `opensquad history <squad-code>` for squad-specific history.');
  console.log('  Run `opensquad history show <run-id>` for run details.\n');

  return { success: true };
}

/**
 * List history for a specific squad
 * @param {string} squadCode
 */
async function listSquadHistoryCmd(squadCode) {
  let squad;

  if (squadCode) {
    squad = getSquadByCode(squadCode);
    if (!squad) {
      console.log(`\n  ❌ Squad with code "${squadCode}" not found.\n`);
      return { success: false };
    }
  } else {
    const squads = listAllSquads();
    if (squads.length === 0) {
      console.log('\n  No squads found.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select squad to view history:',
      choices: squads.map(s => ({
        name: `${s.icon} ${s.name} (${s.code})${s.company_name ? ` - ${s.company_name}` : ''}`,
        value: s.id
      }))
    });

    squad = getSquadById(choice);
  }

  const runs = listRuns(squad.id, { limit: 50 });

  if (runs.length === 0) {
    console.log(`\n  No runs found for squad "${squad.name}".\n`);
    return { success: true };
  }

  console.log(`\n  Run History for ${squad.icon} ${squad.name}:\n`);
  console.log('  Status  Topic                                     Duration   Date');
  console.log('  ─────────────────────────────────────────────────────────────────────');

  for (const run of runs) {
    const icon = getStatusIcon(run.status);
    const topic = (run.topic || '-').padEnd(40).slice(0, 40);
    const duration = formatDuration(run.duration_ms).padEnd(10);
    const date = new Date(run.started_at).toLocaleDateString();

    console.log(`  ${icon}      ${topic}  ${duration} ${date}`);
  }

  console.log('');
  console.log(`  Total: ${runs.length} runs\n`);

  // Show statistics
  const completed = runs.filter(r => r.status === 'completed').length;
  const failed = runs.filter(r => r.status === 'failed').length;
  const avgDuration = runs
    .filter(r => r.status === 'completed' && r.duration_ms)
    .reduce((sum, r, _, arr) => sum + r.duration_ms / arr.length, 0);

  console.log('  Statistics:');
  console.log(`  ✅ Completed: ${completed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏱️  Avg Duration: ${formatDuration(avgDuration)}\n`);

  return { success: true };
}

/**
 * Show details of a specific run
 * @param {string} runId
 */
async function showRunCmd(runId) {
  if (!runId) {
    const runs = listAllRuns({ limit: 20 });
    if (runs.length === 0) {
      console.log('\n  No runs found.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select run to view:',
      choices: runs.map(r => ({
        name: `${getStatusIcon(r.status)} ${r.squad_name} - ${r.topic || 'No topic'} (${new Date(r.started_at).toLocaleDateString()})`,
        value: r.id
      }))
    });

    runId = choice;
  }

  const run = getRunById(runId);
  if (!run) {
    console.log(`\n  ❌ Run with ID "${runId}" not found.\n`);
    return { success: false };
  }

  const squad = getSquadById(run.squad_id);
  const steps = listRunSteps(run.id);

  console.log(`
  Run Details:

  ${getStatusIcon(run.status)} Status: ${run.status.toUpperCase()}
  Squad: ${squad ? `${squad.icon} ${squad.name}` : 'Unknown'}
  Topic: ${run.topic || '-'}
  Started: ${formatDate(run.started_at)}
  Completed: ${formatDate(run.completed_at)}
  Duration: ${formatDuration(run.duration_ms)}
  ${run.error_message ? `Error: ${run.error_message}` : ''}
`);

  if (steps.length > 0) {
    console.log('  Steps:\n');
    console.log('  #   Agent                Status      Duration');
    console.log('  ───────────────────────────────────────────────');

    for (const step of steps) {
      const icon = getStatusIcon(step.status);
      const num = String(step.step_number).padStart(2);
      const agent = step.agent_name.padEnd(18).slice(0, 18);
      const status = step.status.padEnd(10);
      const duration = formatDuration(step.duration_ms);

      console.log(`  ${num}  ${agent} ${icon} ${status} ${duration}`);
    }
    console.log('');
  }

  if (run.run_folder) {
    console.log(`  Output folder: ${run.run_folder}\n`);
  }

  return { success: true };
}

/**
 * Squad Generator Module for Opensquad
 *
 * Generates squad.yaml and agent files from SQLite database.
 * Used when execution needs file-based configuration.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  initDb,
  getSquadByCode,
  getSquadById,
  listSquadAgents,
  getProductById,
  getCompanyById
} from './db.js';

/**
 * Generate squad files from database
 * @param {string} projectDir - Project directory
 * @param {string} squadCode - Squad code
 * @returns {Promise<{success: boolean, path: string}>}
 */
export async function generateSquadFiles(projectDir, squadCode) {
  await initDb(projectDir);

  const squad = getSquadByCode(squadCode);
  if (!squad) {
    throw new Error(`Squad "${squadCode}" not found`);
  }

  const squadDir = join(projectDir, 'squads', squadCode);
  await mkdir(squadDir, { recursive: true });

  // Generate squad.yaml
  const yamlContent = generateSquadYaml(squad);
  await writeFile(join(squadDir, 'squad.yaml'), yamlContent, 'utf-8');

  // Generate agent files
  const agents = listSquadAgents(squad.id);
  if (agents.length > 0) {
    const agentsDir = join(squadDir, 'agents');
    await mkdir(agentsDir, { recursive: true });

    for (const agent of agents) {
      const agentContent = generateAgentMd(agent);
      await writeFile(join(agentsDir, `${agent.agent_id}.md`), agentContent, 'utf-8');
    }
  }

  // Generate pipeline files if configured
  if (squad.pipeline_config) {
    const pipelineDir = join(squadDir, 'pipeline');
    await mkdir(pipelineDir, { recursive: true });

    const pipelineContent = generatePipelineYaml(squad, agents);
    await writeFile(join(pipelineDir, 'run.yaml'), pipelineContent, 'utf-8');
  }

  return { success: true, path: squadDir };
}

/**
 * Generate squad.yaml content
 * @param {Object} squad
 * @returns {string}
 */
function generateSquadYaml(squad) {
  const lines = [
    '# Squad Configuration',
    '# Generated from Opensquad SQLite database',
    '',
    'squad:',
    `  code: "${squad.code}"`,
    `  name: "${squad.name}"`,
  ];

  if (squad.description) {
    lines.push(`  description: "${squad.description}"`);
  }

  if (squad.icon) {
    lines.push(`  icon: "${squad.icon}"`);
  }

  if (squad.format) {
    lines.push(`  format: "${squad.format}"`);
  }

  if (squad.performance_mode) {
    lines.push(`  performance_mode: "${squad.performance_mode}"`);
  }

  if (squad.target_audience) {
    lines.push(`  target_audience: "${squad.target_audience}"`);
  }

  if (squad.product_id) {
    lines.push(`  product_id: "${squad.product_id}"`);
  }

  if (squad.skills && squad.skills.length > 0) {
    lines.push('  skills:');
    for (const skill of squad.skills) {
      lines.push(`    - "${skill}"`);
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * Generate agent markdown file content
 * @param {Object} agent
 * @returns {string}
 */
function generateAgentMd(agent) {
  const lines = [
    '---',
    `id: "${agent.agent_id}"`,
    `name: "${agent.name}"`,
  ];

  if (agent.icon) {
    lines.push(`icon: "${agent.icon}"`);
  }

  if (agent.role) {
    lines.push(`role: "${agent.role}"`);
  }

  if (agent.execution) {
    lines.push(`execution: "${agent.execution}"`);
  }

  if (agent.skills && agent.skills.length > 0) {
    lines.push('skills:');
    for (const skill of agent.skills) {
      lines.push(`  - "${skill}"`);
    }
  }

  lines.push('---');
  lines.push('');

  if (agent.persona) {
    lines.push(agent.persona);
  }

  return lines.join('\n') + '\n';
}

/**
 * Generate pipeline YAML content
 * @param {Object} squad
 * @param {Array} agents
 * @returns {string}
 */
function generatePipelineYaml(squad, agents) {
  const lines = [
    '# Pipeline Configuration',
    '# Generated from Opensquad SQLite database',
    '',
    'pipeline:',
    `  name: "${squad.name} Pipeline"`,
    '  steps:',
  ];

  for (const agent of agents) {
    lines.push(`    - agent: "${agent.agent_id}"`);
    lines.push(`      name: "${agent.name}"`);
    if (agent.execution) {
      lines.push(`      execution: "${agent.execution}"`);
    }
  }

  if (squad.pipeline_config) {
    const config = typeof squad.pipeline_config === 'string'
      ? JSON.parse(squad.pipeline_config)
      : squad.pipeline_config;

    if (config.checkpoints) {
      lines.push('');
      lines.push('  checkpoints:');
      for (const checkpoint of config.checkpoints) {
        lines.push(`    - after: "${checkpoint.after}"`);
        lines.push(`      message: "${checkpoint.message}"`);
      }
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * Generate context file for a squad
 * @param {string} projectDir
 * @param {string} squadCode
 * @returns {Promise<{success: boolean, path: string}>}
 */
export async function generateContextFile(projectDir, squadCode) {
  await initDb(projectDir);

  const squad = getSquadByCode(squadCode);
  if (!squad) {
    throw new Error(`Squad "${squadCode}" not found`);
  }

  const product = squad.product_id ? getProductById(squad.product_id) : null;
  const company = product ? getCompanyById(product.company_id) : null;

  const squadDir = join(projectDir, 'squads', squadCode);
  await mkdir(squadDir, { recursive: true });

  const contextPath = join(squadDir, '_context.md');
  const content = generateContextMd(company, product, squad);
  await writeFile(contextPath, content, 'utf-8');

  return { success: true, path: contextPath };
}

/**
 * Generate context markdown content
 * @param {Object} company
 * @param {Object} product
 * @param {Object} squad
 * @returns {string}
 */
function generateContextMd(company, product, squad) {
  const lines = [
    '# Contexto do Squad',
    '',
    '> Este arquivo é gerado automaticamente a partir do banco SQLite.',
    '> Não edite manualmente - use os comandos `opensquad company/product edit`.',
    '',
  ];

  if (company) {
    lines.push('## Empresa');
    lines.push('');
    lines.push(`**${company.icon} ${company.name}**`);
    lines.push('');
    if (company.description) lines.push(company.description);
    lines.push('');
    if (company.sector) lines.push(`- **Setor:** ${company.sector}`);
    if (company.target_audience) lines.push(`- **Público-alvo:** ${company.target_audience}`);
    if (company.tone_of_voice) lines.push(`- **Tom de voz:** ${company.tone_of_voice}`);
    if (company.website) lines.push(`- **Website:** ${company.website}`);
    lines.push('');
  }

  if (product) {
    lines.push('## Produto');
    lines.push('');
    lines.push(`**${product.icon} ${product.name}**`);
    lines.push('');
    if (product.description) lines.push(product.description);
    lines.push('');
    if (product.target_audience) lines.push(`- **Público-alvo:** ${product.target_audience}`);
    if (product.tone_of_voice) lines.push(`- **Tom de voz:** ${product.tone_of_voice}`);
    if (product.value_proposition) lines.push(`- **Proposta de valor:** ${product.value_proposition}`);
    if (product.key_features) lines.push(`- **Features:** ${product.key_features.join(', ')}`);
    lines.push('');
  }

  lines.push('## Squad');
  lines.push('');
  lines.push(`**${squad.icon} ${squad.name}** (\`${squad.code}\`)`);
  lines.push('');
  if (squad.description) lines.push(squad.description);
  lines.push('');
  if (squad.format) lines.push(`- **Formato:** ${squad.format}`);
  if (squad.target_audience) lines.push(`- **Público-alvo:** ${squad.target_audience}`);
  if (squad.performance_mode) lines.push(`- **Modo:** ${squad.performance_mode}`);
  if (squad.skills) lines.push(`- **Skills:** ${squad.skills.join(', ')}`);

  return lines.join('\n') + '\n';
}

/**
 * Sync all squads from database to files
 * @param {string} projectDir
 * @returns {Promise<{success: boolean, count: number}>}
 */
export async function syncAllSquads(projectDir) {
  await initDb(projectDir);

  const { listAllSquads } = await import('./db.js');
  const squads = listAllSquads();

  let count = 0;
  for (const squad of squads) {
    try {
      await generateSquadFiles(projectDir, squad.code);
      await generateContextFile(projectDir, squad.code);
      count++;
    } catch (e) {
      console.error(`  ⚠️  Failed to sync squad ${squad.code}: ${e.message}`);
    }
  }

  return { success: true, count };
}

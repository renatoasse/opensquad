/**
 * Context Loader Module for Opensquad
 *
 * Loads company and product context from SQLite for squad execution.
 */

import {
  initDb,
  getSquadByCode,
  getProductById,
  getCompanyById,
  getActiveContext,
  listSquadAgents
} from './db.js';

/**
 * Load full context for a squad execution
 * @param {string} projectDir - Project directory
 * @param {string} squadCode - Squad code
 * @returns {Promise<Object>} Full context for squad execution
 */
export async function loadSquadContext(projectDir, squadCode) {
  await initDb(projectDir);

  const squad = getSquadByCode(squadCode);
  if (!squad) {
    throw new Error(`Squad "${squadCode}" not found`);
  }

  // Load product and company
  let product = null;
  let company = null;

  if (squad.product_id) {
    product = getProductById(squad.product_id);
    if (product) {
      company = getCompanyById(product.company_id);
    }
  }

  // If no product assigned, try active context
  if (!product) {
    const active = getActiveContext();
    if (active.product) {
      product = active.product;
      company = active.company;
    } else if (active.company) {
      company = active.company;
    }
  }

  // Load squad agents
  const agents = listSquadAgents(squad.id);

  return {
    squad,
    product,
    company,
    agents,
    context: buildContextMarkdown(company, product, squad)
  };
}

/**
 * Build context markdown for agents
 * @param {Object} company
 * @param {Object} product
 * @param {Object} squad
 * @returns {string}
 */
function buildContextMarkdown(company, product, squad) {
  const sections = [];

  // Company section
  if (company) {
    sections.push(`# Empresa: ${company.name}

${company.description || ''}

${company.sector ? `**Setor:** ${company.sector}` : ''}
${company.target_audience ? `**Público-alvo:** ${company.target_audience}` : ''}
${company.tone_of_voice ? `**Tom de voz:** ${company.tone_of_voice}` : ''}
${company.website ? `**Website:** ${company.website}` : ''}

**Redes Sociais:**
${company.social_instagram ? `- Instagram: ${company.social_instagram}` : ''}
${company.social_linkedin ? `- LinkedIn: ${company.social_linkedin}` : ''}
${company.social_twitter ? `- Twitter/X: ${company.social_twitter}` : ''}
`.trim());
  }

  // Product section
  if (product) {
    sections.push(`# Produto: ${product.name}

${product.description || ''}

${product.target_audience ? `**Público-alvo:** ${product.target_audience}` : ''}
${product.tone_of_voice ? `**Tom de voz:** ${product.tone_of_voice}` : ''}
${product.value_proposition ? `**Proposta de valor:** ${product.value_proposition}` : ''}
${product.key_features ? `**Principais features:** ${product.key_features.join(', ')}` : ''}
`.trim());
  }

  // Squad section
  if (squad) {
    sections.push(`# Squad: ${squad.name}

${squad.description || ''}

${squad.format ? `**Formato:** ${squad.format}` : ''}
${squad.target_audience ? `**Público-alvo específico:** ${squad.target_audience}` : ''}
${squad.performance_mode ? `**Modo de performance:** ${squad.performance_mode}` : ''}
${squad.skills ? `**Skills disponíveis:** ${squad.skills.join(', ')}` : ''}
`.trim());
  }

  return sections.filter(s => s.length > 0).join('\n\n---\n\n');
}

/**
 * Get effective target audience (with inheritance)
 * @param {Object} squad
 * @param {Object} product
 * @param {Object} company
 * @returns {string|null}
 */
export function getEffectiveTargetAudience(squad, product, company) {
  return squad?.target_audience || product?.target_audience || company?.target_audience || null;
}

/**
 * Get effective tone of voice (with inheritance)
 * @param {Object} squad
 * @param {Object} product
 * @param {Object} company
 * @returns {string|null}
 */
export function getEffectiveToneOfVoice(squad, product, company) {
  // Squad doesn't have tone_of_voice, so skip it
  return product?.tone_of_voice || company?.tone_of_voice || null;
}

/**
 * Build a JSON context object for API consumption
 * @param {string} projectDir
 * @param {string} squadCode
 * @returns {Promise<Object>}
 */
export async function buildJsonContext(projectDir, squadCode) {
  const { squad, product, company, agents } = await loadSquadContext(projectDir, squadCode);

  return {
    company: company ? {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      website: company.website,
      sector: company.sector,
      target_audience: company.target_audience,
      tone_of_voice: company.tone_of_voice,
      social: {
        instagram: company.social_instagram,
        linkedin: company.social_linkedin,
        twitter: company.social_twitter
      }
    } : null,

    product: product ? {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      target_audience: product.target_audience,
      tone_of_voice: product.tone_of_voice,
      value_proposition: product.value_proposition,
      key_features: product.key_features
    } : null,

    squad: {
      id: squad.id,
      code: squad.code,
      name: squad.name,
      description: squad.description,
      format: squad.format,
      performance_mode: squad.performance_mode,
      target_audience: squad.target_audience,
      skills: squad.skills
    },

    agents: agents.map(a => ({
      id: a.agent_id,
      name: a.name,
      role: a.role,
      execution: a.execution,
      skills: a.skills,
      position: a.position
    })),

    effective: {
      target_audience: getEffectiveTargetAudience(squad, product, company),
      tone_of_voice: getEffectiveToneOfVoice(squad, product, company)
    }
  };
}

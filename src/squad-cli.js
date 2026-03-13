/**
 * Squad CLI Module for Opensquad
 *
 * Manages squads in the SQLite database.
 */

import input from '@inquirer/input';
import select from '@inquirer/select';
import {
  initDb,
  createSquad,
  listSquads,
  listAllSquads,
  getSquadById,
  getSquadByCode,
  updateSquad,
  deleteSquad,
  getActiveProductId,
  getProductById,
  getCompanyById,
  listAllProducts
} from './db.js';

/**
 * Generate a slug from a name
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Squad CLI entry point
 * @param {string} subcommand - list, add, edit, delete, show
 * @param {string[]} args - Command arguments
 * @param {string} projectDir - Project directory
 * @returns {Promise<{success: boolean}>}
 */
export async function squadCli(subcommand, args, projectDir) {
  try {
    await initDb(projectDir);

    switch (subcommand) {
      case 'list':
        return await listSquadsCmd(args[0]);
      case 'add':
        return await addSquadCmd();
      case 'edit':
        return await editSquadCmd(args[0]);
      case 'delete':
        return await deleteSquadCmd(args[0]);
      case 'show':
        return await showSquadCmd(args[0]);
      default:
        console.log(`
  opensquad squad — Manage squads

  Usage:
    opensquad squad list [--all]        List squads (--all for all products)
    opensquad squad add                 Add a new squad (interactive)
    opensquad squad edit [code]         Edit a squad
    opensquad squad show [code]         Show squad details
    opensquad squad delete <code>       Delete a squad
        `);
        return { success: true };
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false };
  }
}

/**
 * List squads
 * @param {string} flag - Optional --all flag
 */
async function listSquadsCmd(flag) {
  const showAll = flag === '--all';

  if (showAll) {
    const squads = listAllSquads();

    if (squads.length === 0) {
      console.log('\n  No squads found. Run `opensquad squad add` to create one.\n');
      return { success: true };
    }

    let currentProduct = null;

    console.log('\n  Squads:\n');
    for (const squad of squads) {
      const productKey = squad.product_id || 'unassigned';
      if (currentProduct !== productKey) {
        currentProduct = productKey;
        if (squad.product_name) {
          const product = getProductById(squad.product_id);
          const company = product ? getCompanyById(product.company_id) : null;
          console.log(`\n  ${company ? `${company.icon} ${company.name} > ` : ''}${product?.icon || '📦'} ${squad.product_name}`);
        } else {
          console.log('\n  📋 Unassigned');
        }
      }
      console.log(`    ${squad.icon} ${squad.name} (${squad.code})`);
    }
    console.log('');

    return { success: true };
  }

  // Show squads for active product only
  const productId = getActiveProductId();

  if (!productId) {
    console.log('\n  No active product. Run `opensquad product switch` to select one first.');
    console.log('  Or use `opensquad squad list --all` to see all squads.\n');
    return { success: false };
  }

  const product = getProductById(productId);
  const company = product ? getCompanyById(product.company_id) : null;
  const squads = listSquads(productId);

  if (squads.length === 0) {
    console.log(`\n  No squads found for ${product?.icon || '📦'} ${product?.name || 'Unknown'}.`);
    console.log('  Run `opensquad squad add` to create one.\n');
    return { success: true };
  }

  console.log(`\n  Squads for ${company ? `${company.icon} ${company.name} > ` : ''}${product?.icon || '📦'} ${product?.name || 'Unknown'}:\n`);
  for (const squad of squads) {
    console.log(`  ${squad.icon} ${squad.name} (${squad.code})`);
  }
  console.log('');

  return { success: true };
}

/**
 * Add a new squad
 */
async function addSquadCmd() {
  let productId = getActiveProductId();

  if (!productId) {
    const products = listAllProducts();
    if (products.length === 0) {
      console.log('\n  No products found. Create a company and product first.\n');
      return { success: false };
    }

    const productChoice = await select({
      message: 'Select product for this squad (or skip):',
      choices: [
        { name: '📋 No product (standalone squad)', value: null },
        ...products.map(p => ({
          name: `${p.icon} ${p.name} (${p.company_name})`,
          value: p.id
        }))
      ]
    });

    productId = productChoice;
  }

  const product = productId ? getProductById(productId) : null;
  const company = product ? getCompanyById(product.company_id) : null;

  const header = product
    ? `📝 Add New Squad for ${company ? `${company.icon} ${company.name} > ` : ''}${product.icon} ${product.name}`
    : '📝 Add New Squad';

  console.log(`\n  ${header}\n`);

  const name = await input({
    message: 'Squad name:',
    validate: (v) => v.trim().length > 0 || 'Name is required'
  });

  const suggestedCode = slugify(name);
  const code = await input({
    message: 'Code (unique identifier):',
    default: suggestedCode,
    validate: (v) => {
      if (v.trim().length === 0) return 'Code is required';
      if (!/^[a-z0-9-]+$/.test(v)) return 'Code must be lowercase letters, numbers, and hyphens only';
      if (getSquadByCode(v)) return 'A squad with this code already exists';
      return true;
    }
  });

  const description = await input({
    message: 'Description:',
  });

  const format = await input({
    message: 'Format (e.g., instagram-feed, blog-post, video-script):',
  });

  const performanceMode = await select({
    message: 'Performance mode:',
    choices: [
      { name: '🚀 High Performance (faster, more API calls)', value: 'alta-performance' },
      { name: '💰 Economic (slower, fewer API calls)', value: 'economico' }
    ]
  });

  const targetAudience = await input({
    message: 'Target audience (leave empty to inherit from product/company):',
  });

  const skillsRaw = await input({
    message: 'Skills (comma-separated, e.g., web_search, image-creator):',
  });

  const skills = skillsRaw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const icon = await input({
    message: 'Icon emoji:',
    default: '📋'
  });

  const squad = createSquad({
    product_id: productId,
    code: code.trim(),
    name: name.trim(),
    description: description.trim() || null,
    icon: icon.trim() || '📋',
    format: format.trim() || null,
    performance_mode: performanceMode,
    target_audience: targetAudience.trim() || null,
    skills: skills.length > 0 ? skills : null
  });

  console.log(`\n  ✅ Squad "${squad.name}" created with code "${squad.code}"!\n`);

  return { success: true };
}

/**
 * Edit a squad
 * @param {string} codeArg
 */
async function editSquadCmd(codeArg) {
  let squad;

  if (codeArg) {
    squad = getSquadByCode(codeArg);
    if (!squad) {
      console.log(`\n  ❌ Squad with code "${codeArg}" not found.\n`);
      return { success: false };
    }
  } else {
    const squads = listAllSquads();
    if (squads.length === 0) {
      console.log('\n  No squads found. Run `opensquad squad add` to create one.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select squad to edit:',
      choices: squads.map(s => ({
        name: `${s.icon} ${s.name} (${s.code})${s.product_name ? ` - ${s.product_name}` : ''}`,
        value: s.id
      }))
    });

    squad = getSquadById(choice);
  }

  console.log(`\n  📝 Editing: ${squad.icon} ${squad.name}\n`);

  const name = await input({
    message: 'Squad name:',
    default: squad.name,
    validate: (v) => v.trim().length > 0 || 'Name is required'
  });

  const description = await input({
    message: 'Description:',
    default: squad.description || ''
  });

  const format = await input({
    message: 'Format:',
    default: squad.format || ''
  });

  const performanceMode = await select({
    message: 'Performance mode:',
    choices: [
      { name: '🚀 High Performance', value: 'alta-performance' },
      { name: '💰 Economic', value: 'economico' }
    ],
    default: squad.performance_mode === 'economico' ? 1 : 0
  });

  const targetAudience = await input({
    message: 'Target audience:',
    default: squad.target_audience || ''
  });

  const currentSkills = squad.skills ? squad.skills.join(', ') : '';
  const skillsRaw = await input({
    message: 'Skills (comma-separated):',
    default: currentSkills
  });

  const skills = skillsRaw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const icon = await input({
    message: 'Icon emoji:',
    default: squad.icon || '📋'
  });

  updateSquad(squad.id, {
    name: name.trim(),
    description: description.trim() || null,
    format: format.trim() || null,
    performance_mode: performanceMode,
    target_audience: targetAudience.trim() || null,
    skills: skills.length > 0 ? skills : null,
    icon: icon.trim() || '📋'
  });

  console.log(`\n  ✅ Squad "${name}" updated!\n`);
  return { success: true };
}

/**
 * Show squad details
 * @param {string} codeArg
 */
async function showSquadCmd(codeArg) {
  let squad;

  if (codeArg) {
    squad = getSquadByCode(codeArg);
    if (!squad) {
      console.log(`\n  ❌ Squad with code "${codeArg}" not found.\n`);
      return { success: false };
    }
  } else {
    const squads = listAllSquads();
    if (squads.length === 0) {
      console.log('\n  No squads found.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select squad to view:',
      choices: squads.map(s => ({
        name: `${s.icon} ${s.name} (${s.code})${s.product_name ? ` - ${s.product_name}` : ''}`,
        value: s.id
      }))
    });

    squad = getSquadById(choice);
  }

  const product = squad.product_id ? getProductById(squad.product_id) : null;
  const company = product ? getCompanyById(product.company_id) : null;

  console.log(`
  Squad Details:

  ${squad.icon} ${squad.name}
  Code: ${squad.code}
  ${product ? `Product: ${product.icon} ${product.name}` : ''}
  ${company ? `Company: ${company.icon} ${company.name}` : ''}
  ${squad.description ? `Description: ${squad.description}` : ''}
  ${squad.format ? `Format: ${squad.format}` : ''}
  ${squad.performance_mode ? `Performance: ${squad.performance_mode}` : ''}
  ${squad.target_audience ? `Target Audience: ${squad.target_audience}` : ''}
  ${squad.skills ? `Skills: ${squad.skills.join(', ')}` : ''}
  Created: ${squad.created_at}
  Updated: ${squad.updated_at}
`);

  return { success: true };
}

/**
 * Delete a squad
 * @param {string} codeArg
 */
async function deleteSquadCmd(codeArg) {
  let squad;

  if (codeArg) {
    squad = getSquadByCode(codeArg);
    if (!squad) {
      console.log(`\n  ❌ Squad with code "${codeArg}" not found.\n`);
      return { success: false };
    }
  } else {
    const squads = listAllSquads();
    if (squads.length === 0) {
      console.log('\n  No squads found.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select squad to delete:',
      choices: squads.map(s => ({
        name: `${s.icon} ${s.name} (${s.code})${s.product_name ? ` - ${s.product_name}` : ''}`,
        value: s.id
      }))
    });

    squad = getSquadById(choice);
  }

  const confirm = await select({
    message: `Are you sure you want to delete "${squad.name}"? This will also delete all run history.`,
    choices: [
      { name: 'No, cancel', value: false },
      { name: 'Yes, delete', value: true }
    ]
  });

  if (!confirm) {
    console.log('\n  Cancelled.\n');
    return { success: true };
  }

  deleteSquad(squad.id);

  console.log(`\n  ✅ Squad "${squad.name}" deleted.\n`);
  return { success: true };
}

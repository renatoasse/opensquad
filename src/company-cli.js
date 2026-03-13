/**
 * Company CLI Module for Opensquad
 *
 * Manages companies in the SQLite database.
 */

import input from '@inquirer/input';
import select from '@inquirer/select';
import {
  initDb,
  createCompany,
  listCompanies,
  getCompanyBySlug,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getActiveCompanyId,
  setActiveCompanyId,
  setActiveProductId
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
 * Company CLI entry point
 * @param {string} subcommand - list, add, edit, switch, current, delete
 * @param {string[]} args - Command arguments
 * @param {string} projectDir - Project directory
 * @returns {Promise<{success: boolean}>}
 */
export async function companyCli(subcommand, args, projectDir) {
  try {
    await initDb(projectDir);

    switch (subcommand) {
      case 'list':
        return await listCompaniesCmd();
      case 'add':
        return await addCompanyCmd();
      case 'edit':
        return await editCompanyCmd(args[0]);
      case 'switch':
        return await switchCompanyCmd(args[0]);
      case 'current':
        return await currentCompanyCmd();
      case 'delete':
        return await deleteCompanyCmd(args[0]);
      default:
        console.log(`
  opensquad company — Manage companies

  Usage:
    opensquad company list              List all companies
    opensquad company add               Add a new company (interactive)
    opensquad company edit [slug]       Edit a company
    opensquad company switch <slug>     Switch active company
    opensquad company current           Show current active company
    opensquad company delete <slug>     Delete a company
        `);
        return { success: true };
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false };
  }
}

/**
 * List all companies
 */
async function listCompaniesCmd() {
  const companies = listCompanies();
  const activeId = getActiveCompanyId();

  if (companies.length === 0) {
    console.log('\n  No companies found. Run `opensquad company add` to create one.\n');
    return { success: true };
  }

  console.log('\n  Companies:\n');
  for (const company of companies) {
    const isActive = company.id === activeId;
    const marker = isActive ? '●' : '○';
    const activeLabel = isActive ? ' ← active' : '';
    console.log(`  ${marker} ${company.icon} ${company.name} (${company.slug})${activeLabel}`);
  }
  console.log('');

  return { success: true };
}

/**
 * Add a new company
 */
async function addCompanyCmd() {
  console.log('\n  📝 Add New Company\n');

  const name = await input({
    message: 'Company name:',
    validate: (v) => v.trim().length > 0 || 'Name is required'
  });

  const suggestedSlug = slugify(name);
  const slug = await input({
    message: 'Slug (URL-friendly identifier):',
    default: suggestedSlug,
    validate: (v) => {
      if (v.trim().length === 0) return 'Slug is required';
      if (!/^[a-z0-9-]+$/.test(v)) return 'Slug must be lowercase letters, numbers, and hyphens only';
      if (getCompanyBySlug(v)) return 'A company with this slug already exists';
      return true;
    }
  });

  const description = await input({
    message: 'Description (optional):',
  });

  const website = await input({
    message: 'Website (optional):',
  });

  const sector = await input({
    message: 'Sector (e.g., Technology, SaaS, E-commerce):',
  });

  const targetAudience = await input({
    message: 'Target audience:',
  });

  const toneOfVoice = await input({
    message: 'Tone of voice (e.g., Professional, Casual, Technical):',
  });

  const socialInstagram = await input({
    message: 'Instagram handle (optional, e.g., @company):',
  });

  const socialLinkedin = await input({
    message: 'LinkedIn URL (optional):',
  });

  const socialTwitter = await input({
    message: 'Twitter/X handle (optional, e.g., @company):',
  });

  const icon = await input({
    message: 'Icon emoji:',
    default: '🏢'
  });

  const company = createCompany({
    name: name.trim(),
    slug: slug.trim(),
    description: description.trim() || null,
    website: website.trim() || null,
    sector: sector.trim() || null,
    target_audience: targetAudience.trim() || null,
    tone_of_voice: toneOfVoice.trim() || null,
    social_instagram: socialInstagram.trim() || null,
    social_linkedin: socialLinkedin.trim() || null,
    social_twitter: socialTwitter.trim() || null,
    icon: icon.trim() || '🏢'
  });

  // Set as active if it's the first company
  const allCompanies = listCompanies();
  if (allCompanies.length === 1) {
    setActiveCompanyId(company.id);
    console.log(`\n  ✅ Company "${company.name}" created and set as active!\n`);
  } else {
    console.log(`\n  ✅ Company "${company.name}" created!`);
    console.log(`  Run \`opensquad company switch ${company.slug}\` to make it active.\n`);
  }

  return { success: true };
}

/**
 * Edit a company
 * @param {string} slugArg
 */
async function editCompanyCmd(slugArg) {
  let company;

  if (slugArg) {
    company = getCompanyBySlug(slugArg);
    if (!company) {
      console.log(`\n  ❌ Company with slug "${slugArg}" not found.\n`);
      return { success: false };
    }
  } else {
    const companies = listCompanies();
    if (companies.length === 0) {
      console.log('\n  No companies found. Run `opensquad company add` to create one.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select company to edit:',
      choices: companies.map(c => ({
        name: `${c.icon} ${c.name} (${c.slug})`,
        value: c.id
      }))
    });

    company = getCompanyById(choice);
  }

  console.log(`\n  📝 Editing: ${company.icon} ${company.name}\n`);

  const name = await input({
    message: 'Company name:',
    default: company.name,
    validate: (v) => v.trim().length > 0 || 'Name is required'
  });

  const description = await input({
    message: 'Description:',
    default: company.description || ''
  });

  const website = await input({
    message: 'Website:',
    default: company.website || ''
  });

  const sector = await input({
    message: 'Sector:',
    default: company.sector || ''
  });

  const targetAudience = await input({
    message: 'Target audience:',
    default: company.target_audience || ''
  });

  const toneOfVoice = await input({
    message: 'Tone of voice:',
    default: company.tone_of_voice || ''
  });

  const socialInstagram = await input({
    message: 'Instagram handle:',
    default: company.social_instagram || ''
  });

  const socialLinkedin = await input({
    message: 'LinkedIn URL:',
    default: company.social_linkedin || ''
  });

  const socialTwitter = await input({
    message: 'Twitter/X handle:',
    default: company.social_twitter || ''
  });

  const icon = await input({
    message: 'Icon emoji:',
    default: company.icon || '🏢'
  });

  updateCompany(company.id, {
    name: name.trim(),
    description: description.trim() || null,
    website: website.trim() || null,
    sector: sector.trim() || null,
    target_audience: targetAudience.trim() || null,
    tone_of_voice: toneOfVoice.trim() || null,
    social_instagram: socialInstagram.trim() || null,
    social_linkedin: socialLinkedin.trim() || null,
    social_twitter: socialTwitter.trim() || null,
    icon: icon.trim() || '🏢'
  });

  console.log(`\n  ✅ Company "${name}" updated!\n`);
  return { success: true };
}

/**
 * Switch active company
 * @param {string} slugArg
 */
async function switchCompanyCmd(slugArg) {
  let company;

  if (slugArg) {
    company = getCompanyBySlug(slugArg);
    if (!company) {
      console.log(`\n  ❌ Company with slug "${slugArg}" not found.\n`);
      return { success: false };
    }
  } else {
    const companies = listCompanies();
    if (companies.length === 0) {
      console.log('\n  No companies found. Run `opensquad company add` to create one.\n');
      return { success: false };
    }

    const activeId = getActiveCompanyId();

    const choice = await select({
      message: 'Select company to activate:',
      choices: companies.map(c => ({
        name: `${c.icon} ${c.name} (${c.slug})${c.id === activeId ? ' ← current' : ''}`,
        value: c.id
      }))
    });

    company = getCompanyById(choice);
  }

  setActiveCompanyId(company.id);
  // Clear product selection when switching companies
  setActiveProductId(null);

  console.log(`\n  ✅ Switched to ${company.icon} ${company.name}\n`);
  return { success: true };
}

/**
 * Show current active company
 */
async function currentCompanyCmd() {
  const activeId = getActiveCompanyId();

  if (!activeId) {
    console.log('\n  No active company. Run `opensquad company switch` to select one.\n');
    return { success: true };
  }

  const company = getCompanyById(activeId);
  if (!company) {
    console.log('\n  Active company not found. Run `opensquad company switch` to select one.\n');
    return { success: true };
  }

  console.log(`
  Active Company:

  ${company.icon} ${company.name}
  Slug: ${company.slug}
  ${company.description ? `Description: ${company.description}` : ''}
  ${company.website ? `Website: ${company.website}` : ''}
  ${company.sector ? `Sector: ${company.sector}` : ''}
  ${company.target_audience ? `Target Audience: ${company.target_audience}` : ''}
  ${company.tone_of_voice ? `Tone of Voice: ${company.tone_of_voice}` : ''}
`);

  return { success: true };
}

/**
 * Delete a company
 * @param {string} slugArg
 */
async function deleteCompanyCmd(slugArg) {
  let company;

  if (slugArg) {
    company = getCompanyBySlug(slugArg);
    if (!company) {
      console.log(`\n  ❌ Company with slug "${slugArg}" not found.\n`);
      return { success: false };
    }
  } else {
    const companies = listCompanies();
    if (companies.length === 0) {
      console.log('\n  No companies found.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select company to delete:',
      choices: companies.map(c => ({
        name: `${c.icon} ${c.name} (${c.slug})`,
        value: c.id
      }))
    });

    company = getCompanyById(choice);
  }

  const confirm = await select({
    message: `Are you sure you want to delete "${company.name}"? This will also delete all products and squads.`,
    choices: [
      { name: 'No, cancel', value: false },
      { name: 'Yes, delete', value: true }
    ]
  });

  if (!confirm) {
    console.log('\n  Cancelled.\n');
    return { success: true };
  }

  deleteCompany(company.id);

  // Clear active context if deleted company was active
  const activeId = getActiveCompanyId();
  if (activeId === company.id) {
    setActiveCompanyId(null);
    setActiveProductId(null);
  }

  console.log(`\n  ✅ Company "${company.name}" deleted.\n`);
  return { success: true };
}

/**
 * Product CLI Module for Opensquad
 *
 * Manages products in the SQLite database.
 */

import input from '@inquirer/input';
import select from '@inquirer/select';
import {
  initDb,
  createProduct,
  listProducts,
  listAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getActiveCompanyId,
  getActiveProductId,
  setActiveProductId,
  getCompanyById,
  listCompanies
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
 * Product CLI entry point
 * @param {string} subcommand - list, add, edit, switch, current, delete
 * @param {string[]} args - Command arguments
 * @param {string} projectDir - Project directory
 * @returns {Promise<{success: boolean}>}
 */
export async function productCli(subcommand, args, projectDir) {
  try {
    await initDb(projectDir);

    switch (subcommand) {
      case 'list':
        return await listProductsCmd(args[0]);
      case 'add':
        return await addProductCmd();
      case 'edit':
        return await editProductCmd(args[0]);
      case 'switch':
        return await switchProductCmd(args[0]);
      case 'current':
        return await currentProductCmd();
      case 'delete':
        return await deleteProductCmd(args[0]);
      default:
        console.log(`
  opensquad product — Manage products

  Usage:
    opensquad product list [--all]      List products (--all for all companies)
    opensquad product add               Add a new product (interactive)
    opensquad product edit [slug]       Edit a product
    opensquad product switch <slug>     Switch active product
    opensquad product current           Show current active product
    opensquad product delete <slug>     Delete a product
        `);
        return { success: true };
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false };
  }
}

/**
 * List products
 * @param {string} flag - Optional --all flag
 */
async function listProductsCmd(flag) {
  const showAll = flag === '--all';

  if (showAll) {
    const products = listAllProducts();

    if (products.length === 0) {
      console.log('\n  No products found. Run `opensquad product add` to create one.\n');
      return { success: true };
    }

    const activeProductId = getActiveProductId();
    let currentCompany = null;

    console.log('\n  Products:\n');
    for (const product of products) {
      if (currentCompany !== product.company_slug) {
        currentCompany = product.company_slug;
        const company = getCompanyById(product.company_id);
        console.log(`\n  ${company.icon} ${company.name}`);
      }

      const isActive = product.id === activeProductId;
      const marker = isActive ? '●' : '○';
      const activeLabel = isActive ? ' ← active' : '';
      console.log(`    ${marker} ${product.icon} ${product.name} (${product.slug})${activeLabel}`);
    }
    console.log('');

    return { success: true };
  }

  // Show products for active company only
  const companyId = getActiveCompanyId();

  if (!companyId) {
    console.log('\n  No active company. Run `opensquad company switch` to select one first.\n');
    return { success: false };
  }

  const company = getCompanyById(companyId);
  const products = listProducts(companyId);
  const activeProductId = getActiveProductId();

  if (products.length === 0) {
    console.log(`\n  No products found for ${company.icon} ${company.name}.`);
    console.log('  Run `opensquad product add` to create one.\n');
    return { success: true };
  }

  console.log(`\n  Products for ${company.icon} ${company.name}:\n`);
  for (const product of products) {
    const isActive = product.id === activeProductId;
    const marker = isActive ? '●' : '○';
    const activeLabel = isActive ? ' ← active' : '';
    console.log(`  ${marker} ${product.icon} ${product.name} (${product.slug})${activeLabel}`);
  }
  console.log('');

  return { success: true };
}

/**
 * Add a new product
 */
async function addProductCmd() {
  let companyId = getActiveCompanyId();

  if (!companyId) {
    const companies = listCompanies();
    if (companies.length === 0) {
      console.log('\n  No companies found. Run `opensquad company add` first.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select company for this product:',
      choices: companies.map(c => ({
        name: `${c.icon} ${c.name} (${c.slug})`,
        value: c.id
      }))
    });

    companyId = choice;
  }

  const company = getCompanyById(companyId);
  console.log(`\n  📝 Add New Product for ${company.icon} ${company.name}\n`);

  const name = await input({
    message: 'Product name:',
    validate: (v) => v.trim().length > 0 || 'Name is required'
  });

  const suggestedSlug = slugify(name);
  const slug = await input({
    message: 'Slug (URL-friendly identifier):',
    default: suggestedSlug,
    validate: (v) => {
      if (v.trim().length === 0) return 'Slug is required';
      if (!/^[a-z0-9-]+$/.test(v)) return 'Slug must be lowercase letters, numbers, and hyphens only';
      if (getProductBySlug(companyId, v)) return 'A product with this slug already exists in this company';
      return true;
    }
  });

  const description = await input({
    message: 'Description:',
  });

  const targetAudience = await input({
    message: 'Target audience (leave empty to inherit from company):',
  });

  const toneOfVoice = await input({
    message: 'Tone of voice (leave empty to inherit from company):',
  });

  const valueProposition = await input({
    message: 'Value proposition:',
  });

  const keyFeaturesRaw = await input({
    message: 'Key features (comma-separated):',
  });

  const keyFeatures = keyFeaturesRaw
    .split(',')
    .map(f => f.trim())
    .filter(f => f.length > 0);

  const icon = await input({
    message: 'Icon emoji:',
    default: '📦'
  });

  const product = createProduct({
    company_id: companyId,
    name: name.trim(),
    slug: slug.trim(),
    description: description.trim() || null,
    target_audience: targetAudience.trim() || null,
    tone_of_voice: toneOfVoice.trim() || null,
    value_proposition: valueProposition.trim() || null,
    key_features: keyFeatures.length > 0 ? keyFeatures : null,
    icon: icon.trim() || '📦'
  });

  // Set as active if it's the first product for this company
  const companyProducts = listProducts(companyId);
  if (companyProducts.length === 1) {
    setActiveProductId(product.id);
    console.log(`\n  ✅ Product "${product.name}" created and set as active!\n`);
  } else {
    console.log(`\n  ✅ Product "${product.name}" created!`);
    console.log(`  Run \`opensquad product switch ${product.slug}\` to make it active.\n`);
  }

  return { success: true };
}

/**
 * Edit a product
 * @param {string} slugArg
 */
async function editProductCmd(slugArg) {
  let product;
  const companyId = getActiveCompanyId();

  if (slugArg && companyId) {
    product = getProductBySlug(companyId, slugArg);
    if (!product) {
      console.log(`\n  ❌ Product with slug "${slugArg}" not found in active company.\n`);
      return { success: false };
    }
  } else {
    const products = companyId ? listProducts(companyId) : listAllProducts();
    if (products.length === 0) {
      console.log('\n  No products found. Run `opensquad product add` to create one.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select product to edit:',
      choices: products.map(p => ({
        name: `${p.icon} ${p.name} (${p.slug})${p.company_name ? ` - ${p.company_name}` : ''}`,
        value: p.id
      }))
    });

    product = getProductById(choice);
  }

  console.log(`\n  📝 Editing: ${product.icon} ${product.name}\n`);

  const name = await input({
    message: 'Product name:',
    default: product.name,
    validate: (v) => v.trim().length > 0 || 'Name is required'
  });

  const description = await input({
    message: 'Description:',
    default: product.description || ''
  });

  const targetAudience = await input({
    message: 'Target audience:',
    default: product.target_audience || ''
  });

  const toneOfVoice = await input({
    message: 'Tone of voice:',
    default: product.tone_of_voice || ''
  });

  const valueProposition = await input({
    message: 'Value proposition:',
    default: product.value_proposition || ''
  });

  const currentFeatures = product.key_features ? product.key_features.join(', ') : '';
  const keyFeaturesRaw = await input({
    message: 'Key features (comma-separated):',
    default: currentFeatures
  });

  const keyFeatures = keyFeaturesRaw
    .split(',')
    .map(f => f.trim())
    .filter(f => f.length > 0);

  const icon = await input({
    message: 'Icon emoji:',
    default: product.icon || '📦'
  });

  updateProduct(product.id, {
    name: name.trim(),
    description: description.trim() || null,
    target_audience: targetAudience.trim() || null,
    tone_of_voice: toneOfVoice.trim() || null,
    value_proposition: valueProposition.trim() || null,
    key_features: keyFeatures.length > 0 ? keyFeatures : null,
    icon: icon.trim() || '📦'
  });

  console.log(`\n  ✅ Product "${name}" updated!\n`);
  return { success: true };
}

/**
 * Switch active product
 * @param {string} slugArg
 */
async function switchProductCmd(slugArg) {
  let product;
  const companyId = getActiveCompanyId();

  if (slugArg && companyId) {
    product = getProductBySlug(companyId, slugArg);
    if (!product) {
      console.log(`\n  ❌ Product with slug "${slugArg}" not found in active company.\n`);
      return { success: false };
    }
  } else {
    const products = companyId ? listProducts(companyId) : listAllProducts();
    if (products.length === 0) {
      const msg = companyId
        ? 'No products found in active company. Run `opensquad product add` to create one.'
        : 'No products found. Run `opensquad company switch` then `opensquad product add`.';
      console.log(`\n  ${msg}\n`);
      return { success: false };
    }

    const activeId = getActiveProductId();

    const choice = await select({
      message: 'Select product to activate:',
      choices: products.map(p => ({
        name: `${p.icon} ${p.name} (${p.slug})${p.company_name ? ` - ${p.company_name}` : ''}${p.id === activeId ? ' ← current' : ''}`,
        value: p.id
      }))
    });

    product = getProductById(choice);
  }

  setActiveProductId(product.id);

  console.log(`\n  ✅ Switched to ${product.icon} ${product.name}\n`);
  return { success: true };
}

/**
 * Show current active product
 */
async function currentProductCmd() {
  const activeId = getActiveProductId();

  if (!activeId) {
    console.log('\n  No active product. Run `opensquad product switch` to select one.\n');
    return { success: true };
  }

  const product = getProductById(activeId);
  if (!product) {
    console.log('\n  Active product not found. Run `opensquad product switch` to select one.\n');
    return { success: true };
  }

  const company = getCompanyById(product.company_id);

  console.log(`
  Active Product:

  ${product.icon} ${product.name}
  Company: ${company ? `${company.icon} ${company.name}` : 'Unknown'}
  Slug: ${product.slug}
  ${product.description ? `Description: ${product.description}` : ''}
  ${product.target_audience ? `Target Audience: ${product.target_audience}` : ''}
  ${product.tone_of_voice ? `Tone of Voice: ${product.tone_of_voice}` : ''}
  ${product.value_proposition ? `Value Proposition: ${product.value_proposition}` : ''}
  ${product.key_features ? `Key Features: ${product.key_features.join(', ')}` : ''}
`);

  return { success: true };
}

/**
 * Delete a product
 * @param {string} slugArg
 */
async function deleteProductCmd(slugArg) {
  let product;
  const companyId = getActiveCompanyId();

  if (slugArg && companyId) {
    product = getProductBySlug(companyId, slugArg);
    if (!product) {
      console.log(`\n  ❌ Product with slug "${slugArg}" not found in active company.\n`);
      return { success: false };
    }
  } else {
    const products = companyId ? listProducts(companyId) : listAllProducts();
    if (products.length === 0) {
      console.log('\n  No products found.\n');
      return { success: false };
    }

    const choice = await select({
      message: 'Select product to delete:',
      choices: products.map(p => ({
        name: `${p.icon} ${p.name} (${p.slug})${p.company_name ? ` - ${p.company_name}` : ''}`,
        value: p.id
      }))
    });

    product = getProductById(choice);
  }

  const confirm = await select({
    message: `Are you sure you want to delete "${product.name}"? This will also affect associated squads.`,
    choices: [
      { name: 'No, cancel', value: false },
      { name: 'Yes, delete', value: true }
    ]
  });

  if (!confirm) {
    console.log('\n  Cancelled.\n');
    return { success: true };
  }

  deleteProduct(product.id);

  // Clear active product if deleted product was active
  const activeId = getActiveProductId();
  if (activeId === product.id) {
    setActiveProductId(null);
  }

  console.log(`\n  ✅ Product "${product.name}" deleted.\n`);
  return { success: true };
}

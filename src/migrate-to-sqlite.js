/**
 * Migration Module for Opensquad
 *
 * Migrates existing MD/YAML data to SQLite database.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import {
  initDb,
  createCompany,
  createProduct,
  createSquad,
  createSquadAgent,
  getCompanyBySlug,
  getProductBySlug,
  getSquadByCode,
  setActiveCompanyId,
  setActiveProductId
} from './db.js';

/**
 * Parse a simple YAML file
 * @param {string} content
 * @returns {Object}
 */
function parseSimpleYaml(content) {
  const result = {};
  let currentKey = null;
  let currentIndent = 0;
  let currentObj = result;
  const stack = [{ obj: result, indent: -1 }];

  const lines = content.split('\n');

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Calculate indent level
    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Handle list items
    if (trimmed.startsWith('- ')) {
      const listItem = trimmed.slice(2).trim();
      if (currentKey && Array.isArray(currentObj[currentKey])) {
        // Check if it's a key: value pair
        const colonIdx = listItem.indexOf(':');
        if (colonIdx > 0 && !listItem.startsWith('"')) {
          const itemKey = listItem.slice(0, colonIdx).trim();
          let itemValue = listItem.slice(colonIdx + 1).trim();
          // Remove quotes
          if ((itemValue.startsWith('"') && itemValue.endsWith('"')) ||
              (itemValue.startsWith("'") && itemValue.endsWith("'"))) {
            itemValue = itemValue.slice(1, -1);
          }
          currentObj[currentKey].push({ [itemKey]: itemValue });
        } else {
          currentObj[currentKey].push(listItem);
        }
      }
      continue;
    }

    // Handle key: value pairs
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      let value = trimmed.slice(colonIdx + 1).trim();

      // Adjust stack based on indent
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }
      currentObj = stack[stack.length - 1].obj;

      if (value === '' || value === '|' || value === '>') {
        // Nested object or multiline string
        if (value === '' || value === '|' || value === '>') {
          // Special case: keys that expect arrays
          if (key === 'skills' || key === 'agents') {
            currentObj[key] = [];
            currentKey = key;
            // Don't push to stack - list items will be added directly
          } else {
            currentObj[key] = value === '' ? {} : '';
            currentKey = key;
            stack.push({ obj: currentObj[key], indent });
            currentObj = currentObj[key];
          }
        }
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        const items = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        currentObj[key] = items.filter(s => s.length > 0);
        currentKey = key;
      } else {
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // Handle booleans
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        // Handle numbers
        else if (/^-?\d+$/.test(value)) value = parseInt(value, 10);
        else if (/^-?\d+\.\d+$/.test(value)) value = parseFloat(value);

        currentObj[key] = value;
        currentKey = key;

        // Check if this key expects an array
        if (key === 'skills' || key === 'agents') {
          if (!Array.isArray(currentObj[key])) {
            currentObj[key] = [];
          }
        }
      }
    }
  }

  return result;
}

/**
 * Parse markdown frontmatter
 * @param {string} content
 * @returns {Object}
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = parseSimpleYaml(match[1]);
  const body = content.slice(match[0].length).trim();

  return { frontmatter, body };
}

/**
 * Migrate existing data to SQLite
 * @param {string} projectDir - Project directory
 * @returns {Promise<{success: boolean}>}
 */
export async function migrateToSqlite(projectDir) {
  try {
    await initDb(projectDir);

    console.log('\n  🔄 Migrating data to SQLite...\n');

    let companiesCreated = 0;
    let productsCreated = 0;
    let squadsCreated = 0;
    let agentsCreated = 0;

    // 1. Migrate company from _opensquad/_memory/company.md
    const companyMdPath = join(projectDir, '_opensquad', '_memory', 'company.md');
    try {
      const companyContent = await readFile(companyMdPath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(companyContent);

      // Try to extract company info from markdown
      let companyName = frontmatter.name || frontmatter.company || 'Default Company';
      let companySlug = frontmatter.slug || slugify(companyName);

      // Try to parse structured info from body
      const nameMatch = body.match(/(?:^|\n)#+\s*(.+?)(?:\n|$)/);
      if (nameMatch) companyName = nameMatch[1].trim();

      // Check if company already exists
      if (!getCompanyBySlug(companySlug)) {
        const company = createCompany({
          name: companyName,
          slug: companySlug,
          description: frontmatter.description || extractSection(body, 'Descrição') || extractSection(body, 'Description'),
          website: frontmatter.website,
          sector: frontmatter.sector || frontmatter.setor,
          target_audience: frontmatter.target_audience || frontmatter.publico_alvo || extractSection(body, 'Público-alvo') || extractSection(body, 'Público') || extractSection(body, 'Target'),
          tone_of_voice: frontmatter.tone_of_voice || frontmatter.tom_de_voz || extractSection(body, 'Tom de Voz') || extractSection(body, 'Tone'),
          social_instagram: frontmatter.instagram,
          social_linkedin: frontmatter.linkedin,
          social_twitter: frontmatter.twitter,
          icon: frontmatter.icon || '🏢'
        });

        setActiveCompanyId(company.id);
        console.log(`  ✅ Company migrated: ${company.name}`);
        companiesCreated++;
      } else {
        console.log(`  ℹ️  Company "${companySlug}" already exists, skipping.`);
      }
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.log(`  ⚠️  Could not read company.md: ${e.message}`);
      }
    }

    // 2. Migrate squads from squads/*/squad.yaml
    const squadsDir = join(projectDir, 'squads');
    try {
      const squadDirs = await readdir(squadsDir);

      for (const squadCode of squadDirs) {
        // Skip hidden and underscore directories
        if (squadCode.startsWith('.') || squadCode.startsWith('_')) continue;

        const squadPath = join(squadsDir, squadCode);
        const squadStat = await stat(squadPath);

        if (!squadStat.isDirectory()) continue;

        // Read squad.yaml
        const yamlPath = join(squadPath, 'squad.yaml');
        try {
          const yamlContent = await readFile(yamlPath, 'utf-8');
          const config = parseSimpleYaml(yamlContent);
          const squadConfig = config.squad || config;

          // Check if squad already exists
          if (!getSquadByCode(squadConfig.code || squadCode)) {
            const squad = createSquad({
              code: squadConfig.code || squadCode,
              name: squadConfig.name || squadCode,
              description: squadConfig.description,
              icon: squadConfig.icon || '📋',
              format: squadConfig.format,
              performance_mode: squadConfig.performance_mode || squadConfig.performanceMode,
              target_audience: squadConfig.target_audience || squadConfig.targetAudience,
              skills: squadConfig.skills
            });

            console.log(`  ✅ Squad migrated: ${squad.name} (${squad.code})`);
            squadsCreated++;

            // Migrate agents from agents/*.md
            const agentsDir = join(squadPath, 'agents');
            try {
              const agentFiles = await readdir(agentsDir);

              let position = 0;
              for (const agentFile of agentFiles) {
                if (!agentFile.endsWith('.md')) continue;

                const agentPath = join(agentsDir, agentFile);
                const agentContent = await readFile(agentPath, 'utf-8');
                const { frontmatter, body } = parseFrontmatter(agentContent);

                const agentId = agentFile.replace('.md', '');

                createSquadAgent({
                  squad_id: squad.id,
                  agent_id: frontmatter.id || agentId,
                  name: frontmatter.name || agentId,
                  icon: frontmatter.icon,
                  role: frontmatter.role,
                  execution: frontmatter.execution || 'inline',
                  skills: frontmatter.skills,
                  persona: body,
                  position: position++
                });

                console.log(`    ✅ Agent migrated: ${frontmatter.name || agentId}`);
                agentsCreated++;
              }
            } catch (e) {
              if (e.code !== 'ENOENT') {
                console.log(`    ⚠️  Could not read agents: ${e.message}`);
              }
            }
          } else {
            console.log(`  ℹ️  Squad "${squadCode}" already exists, skipping.`);
          }
        } catch (e) {
          if (e.code !== 'ENOENT') {
            console.log(`  ⚠️  Could not read squad.yaml for ${squadCode}: ${e.message}`);
          }
        }
      }
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.log(`  ⚠️  Could not read squads directory: ${e.message}`);
      }
    }

    console.log(`
  Migration complete!

  📊 Companies: ${companiesCreated}
  📦 Products: ${productsCreated}
  📋 Squads: ${squadsCreated}
  👤 Agents: ${agentsCreated}

  Your data is now stored in _opensquad/data/opensquad.db
  Use 'opensquad backup' to backup your data.
`);

    return { success: true };
  } catch (error) {
    console.error(`  ❌ Migration failed: ${error.message}`);
    return { success: false };
  }
}

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
 * Extract a section from markdown content
 * @param {string} content
 * @param {string} heading
 * @returns {string|null}
 */
function extractSection(content, heading) {
  const regex = new RegExp(`#+\\s*${heading}[:\\s]*\\n([^#]+)`, 'i');
  const match = content.match(regex);
  if (match) {
    return match[1].trim();
  }
  return null;
}

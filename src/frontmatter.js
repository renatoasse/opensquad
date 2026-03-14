/**
 * Shared YAML frontmatter parser for skill/agent .md files.
 * Avoids duplicating regex-based parsing across modules.
 */

const SUPPORTED_LOCALES = ['pt-BR', 'es'];

/**
 * Parse YAML frontmatter from a markdown string.
 * Returns null if no frontmatter block found.
 */
export function parseFrontmatter(raw) {
  const content = raw.replace(/\r\n/g, '\n');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return match[1];
}

/**
 * Extract a simple scalar value from frontmatter.
 */
export function getField(fm, key, fallback = '') {
  const match = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : fallback;
}

/**
 * Extract a description that may use YAML folded scalar (>).
 */
export function getDescription(fm, key = 'description') {
  // folded scalar
  const blockMatch = fm.match(new RegExp(`^${key}:\\s*>\\s*\\n((?:\\s{2,}.+\\n?)+)`, 'm'));
  if (blockMatch) return blockMatch[1].replace(/\n\s*/g, ' ').trim();
  // inline
  const inlineMatch = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return inlineMatch ? inlineMatch[1].trim() : '';
}

/**
 * Extract localized descriptions (description_pt-BR, description_es, etc.)
 */
export function getLocalizedDescriptions(fm) {
  const descriptions = {};
  for (const code of SUPPORTED_LOCALES) {
    const desc = getDescription(fm, `description_${code}`);
    if (desc) descriptions[code] = desc;
  }
  return descriptions;
}

/**
 * Extract a YAML list (lines starting with "  - ").
 */
export function getList(fm, key) {
  const section = fm.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s+.+\\n?)+)`, 'm'));
  if (!section) return [];
  return section[1]
    .split('\n')
    .map((line) => line.match(/^\s+-\s+(.+)/)?.[1]?.trim())
    .filter(Boolean);
}

/**
 * Get the version field from frontmatter content string.
 */
export function getVersion(content) {
  const fm = parseFrontmatter(content);
  if (!fm) return null;
  return getField(fm, 'version') || null;
}

/**
 * Get localized description based on current locale.
 */
export function getLocalizedDescription(meta, localeCode) {
  if (localeCode && localeCode !== 'en' && meta.descriptions?.[localeCode]) {
    return meta.descriptions[localeCode];
  }
  return meta.description;
}

/**
 * Validate a resource ID (skill or agent).
 */
export function validateResourceId(id, resourceType = 'resource') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error(`Invalid ${resourceType} id: '${id}'`);
  }
}

export { SUPPORTED_LOCALES };

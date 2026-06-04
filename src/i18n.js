import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, 'locales');

const LANG_MAP = {
  'Português (Brasil)': 'pt-BR',
  'English': 'en',
  'Español': 'es',
};

let strings = {};
let fallback = {};
let currentCode = 'en';

export async function loadLocale(langLabel) {
  const code = LANG_MAP[langLabel] || 'en';
  currentCode = code;

  const enPath = join(LOCALES_DIR, 'en.json');
  fallback = JSON.parse(await readFile(enPath, 'utf-8'));

  if (code === 'en') {
    strings = fallback;
    return;
  }

  try {
    const localePath = join(LOCALES_DIR, `${code}.json`);
    strings = JSON.parse(await readFile(localePath, 'utf-8'));
  } catch {
    strings = fallback;
  }
}

export function getLocaleCode() {
  return currentCode;
}

export function t(key, vars = {}) {
  let str = strings[key] ?? fallback[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}

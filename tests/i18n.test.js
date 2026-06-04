import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLocale, t, getLocaleCode } from '../src/i18n.js';

test('loadLocale loads English by default', async () => {
  await loadLocale('English');
  assert.equal(t('success'), '✅ Opensquad initialized successfully!');
});

test('loadLocale loads Portuguese locale', async () => {
  await loadLocale('Português (Brasil)');
  assert.equal(t('success'), '✅ Opensquad inicializado com sucesso!');
});

test('t falls back to English for missing keys', async () => {
  await loadLocale('Português (Brasil)');
  assert.equal(t('_test_fallback_only'), 'English fallback works');
});

test('t interpolates variables', async () => {
  await loadLocale('English');
  assert.equal(t('createdFile', { path: 'foo/bar.md' }), '📄 Created foo/bar.md');
});

test('t returns key name for completely unknown keys', async () => {
  await loadLocale('English');
  assert.equal(t('nonExistentKey'), 'nonExistentKey');
});

test('loadLocale falls back to English for unknown language', async () => {
  await loadLocale('Klingon');
  assert.equal(t('success'), '✅ Opensquad initialized successfully!');
});

test('all locales have update keys', async () => {
  const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/locales');
  const UPDATE_KEYS = [
    'updateNotInitialized',
    'updateStarting',
    'updateStartingUnknown',
    'updatedFile',
    'updateSuccess',
    'updatePreserved',
    'updateFileCount',
    'updateLatestHint',
  ];
  const localeFiles = ['en', 'pt-BR', 'es'];

  for (const locale of localeFiles) {
    const content = JSON.parse(
      await readFile(join(LOCALES_DIR, `${locale}.json`), 'utf-8')
    );
    for (const key of UPDATE_KEYS) {
      assert.ok(key in content, `${locale}.json missing key: ${key}`);
    }
  }
});

test('getLocaleCode returns "en" by default', async () => {
  await loadLocale('English');
  assert.equal(getLocaleCode(), 'en');
});

test('getLocaleCode returns "pt-BR" after loading Portuguese locale', async () => {
  await loadLocale('Português (Brasil)');
  assert.equal(getLocaleCode(), 'pt-BR');
});

test('getLocaleCode returns "es" after loading Spanish locale', async () => {
  await loadLocale('Español');
  assert.equal(getLocaleCode(), 'es');
});

test('all locales have skills keys', async () => {
  const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/locales');
  const SKILLS_KEYS = [
    'skillsNotInitialized',
    'skillsFetching',
    'skillsInstalledHeader',
    'skillsAvailableHeader',
    'skillsInstalling',
    'skillsInstalled',
    'skillsRemoving',
    'skillsRemoved',
    'skillsUpdating',
    'skillsUpdateDone',
    'skillsUpdateNone',
    'skillsError',
  ];
  const localeFiles = ['en', 'pt-BR', 'es'];
  for (const locale of localeFiles) {
    const content = JSON.parse(
      await readFile(join(LOCALES_DIR, `${locale}.json`), 'utf-8')
    );
    for (const key of SKILLS_KEYS) {
      assert.ok(key in content, `${locale}.json missing key: ${key}`);
    }
  }
});

test('all locales have step1Cursor key', async () => {
  const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/locales');
  const localeFiles = ['en', 'pt-BR', 'es'];

  for (const locale of localeFiles) {
    const content = JSON.parse(
      await readFile(join(LOCALES_DIR, `${locale}.json`), 'utf-8')
    );
    assert.ok('step1Cursor' in content, `${locale}.json missing key: step1Cursor`);
    assert.ok(
      content.step1Cursor.length > 0,
      `${locale}.json: step1Cursor must not be empty`
    );
  }
});

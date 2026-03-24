# Testing Patterns

**Analysis Date:** 2026-03-24

## Test Framework

**Runner:**
- Node's built-in test runner is used via `node --test`.
- The repository script in `package.json` runs `node --test tests/*.test.js`.

**Assertion Library:**
- Assertions come from `node:assert/strict`.
- Common matchers are `assert.equal`, `assert.deepEqual`, `assert.ok`, `assert.match`, `assert.rejects`, and `assert.doesNotReject`.

**Run Commands:**
```bash
npm test
node --test tests/init.test.js
node --test tests/update.test.js
node --test tests/*.test.js
```

## Test File Organization

**Location:**
- Tests live in `tests/` and sit beside each domain module by name, for example `tests/skills.test.js` for `src/skills.js`.
- There is no separate `__tests__/` tree.

**Naming:**
- Unit and integration-style tests both use the `.test.js` suffix.
- The suite does not currently distinguish `.spec.js`, `.integration.test.js`, or `.e2e.test.js` files.

**Structure:**
```
tests/
  agents.test.js
  i18n.test.js
  init.test.js
  logger.test.js
  runs.test.js
  skills.test.js
  update.test.js
```

## Test Structure

**Suite Organization:**
```typescript
test('feature behavior', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    // arrange
    // act
    // assert
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
```

**Patterns:**
- Tests are usually flat, with one `test(...)` per behavior rather than nested `describe` blocks.
- Shared setup is handled inline in each test, usually with `mkdtemp()` and `try/finally` cleanup.
- The dominant pattern is arrange/act/assert, even when the comments are omitted.

## Mocking

**Framework:**
- No dedicated mocking framework is used in the current suite.
- The repo does not use Jest/Vitest mocks like `vi.mock()` or `jest.fn()`.

**Patterns:**
```typescript
const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
await init(tempDir, { _skipPrompts: true });
await writeFile(join(tempDir, 'CLAUDE.md'), 'garbage content', 'utf-8');
await update(tempDir);
```

**What to Mock:**
- External services are not mocked because the current tests mostly avoid live network calls.
- Filesystem and CLI workflows are exercised against real temporary directories.
- Locale loading, logging, and update flows are verified through real module calls.

**What NOT to Mock:**
- Pure helpers such as `formatDuration()` and `t()` are tested directly.
- Filesystem behavior is usually left real so the tests cover actual copying, reading, and cleanup semantics.

## Fixtures and Factories

**Test Data:**
```typescript
const SAMPLE_SKILL_MD = `---\nname: seo-optimizer\nversion: 1.2.0\ntype: tool\ndescription: SEO Optimizer\n---\n# SEO Optimizer\n`;
```

**Location:**
- Fixtures are typically inline constants inside the relevant test file, such as `SAMPLE_SKILL_MD` in `tests/skills.test.js`.
- Temporary working directories are the main reusable fixture mechanism, created with `mkdtemp(join(tmpdir(), ...))`.

## Coverage

**Requirements:**
- No coverage threshold is configured in `package.json`.
- Coverage is not enforced in CI by a dedicated script in the sampled files.

**Configuration:**
- There is no visible `--coverage` command in the repo scripts.
- Coverage exclusions are therefore not explicitly defined in the current setup.

**View Coverage:**
```bash
npm test
```

## Test Types

**Unit Tests:**
- Pure helpers and small utilities are covered directly, such as `formatDuration()` in `tests/runs.test.js` and locale helpers in `tests/i18n.test.js`.
- These tests stay fast and usually avoid any setup beyond a function call.

**Integration Tests:**
- Most of the suite is filesystem integration-style testing against temporary directories.
- `tests/init.test.js`, `tests/update.test.js`, `tests/skills.test.js`, and `tests/agents.test.js` validate copy, install, update, and removal workflows end to end within a temp project.

**E2E Tests:**
- No browser or full UI E2E runner is present in the tracked tests.
- Although the repo contains Playwright config files under `templates/_opensquad/config/playwright.config.json` and `_opensquad/config/playwright.config.json`, they are template/runtime assets rather than a dedicated test suite.

## Common Patterns

**Async Testing:**
```typescript
test('does async work', async () => {
  const result = await loadLocale('English');
  assert.equal(getLocaleCode(), 'en');
});
```

**Error Testing:**
```typescript
await assert.rejects(
  () => installSkill('nonexistent', dir),
  /not found/
);
```

**Snapshot Testing:**
- Snapshot testing is not used in the current repository.
- File content is asserted directly with `readFile()` and string checks instead.

*Testing analysis: 2026-03-24*
*Update when test patterns change*

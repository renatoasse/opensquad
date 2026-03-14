import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync, execFile } from 'node:child_process';
import { platform } from 'node:os';

const SERVICES_DIR = '.opensquad-services';
const COMPOSE_FILE = 'docker-compose.yml';
const CONFIG_FILE = 'config.json';

// Common Docker Desktop paths per platform
const DOCKER_DESKTOP_PATHS = {
  win32: [
    'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
    `${process.env.LOCALAPPDATA || ''}\\Docker\\Docker Desktop.exe`,
  ],
  darwin: ['/Applications/Docker.app/Contents/MacOS/Docker Desktop'],
  linux: ['/usr/bin/docker-desktop', '/opt/docker-desktop/bin/docker-desktop'],
};

const BASE_ENDPOINTS = [
  { name: 'Open Notebook API', url: 'http://localhost:5055/health' },
  { name: 'Open Notebook UI', url: 'http://localhost:8502' },
  { name: 'SurrealDB', url: 'http://localhost:8000/health' },
];

const LM_STUDIO_ENDPOINT = { name: 'LM Studio', url: 'http://localhost:1234/v1/models', optional: true };

async function loadConfig(targetDir) {
  try {
    const raw = await readFile(join(targetDir, SERVICES_DIR, CONFIG_FILE), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { knowledgeBase: 'none', lmStudio: false };
  }
}

function getEndpoints(config) {
  const endpoints = [...BASE_ENDPOINTS];
  if (config.lmStudio) {
    endpoints.push(LM_STUDIO_ENDPOINT);
  }
  return endpoints;
}

function getComposePath(targetDir) {
  return join(targetDir, SERVICES_DIR, COMPOSE_FILE);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if Docker daemon is running.
 */
function isDockerRunning() {
  try {
    execFileSync('docker', ['info'], { stdio: 'pipe', timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Try to launch Docker Desktop automatically.
 * Returns true if Docker became available, false otherwise.
 */
async function ensureDocker() {
  if (isDockerRunning()) return true;

  // Find Docker Desktop executable
  const os = platform();
  const paths = DOCKER_DESKTOP_PATHS[os] || [];
  let dockerPath = null;

  for (const p of paths) {
    try {
      await stat(p);
      dockerPath = p;
      break;
    } catch {
      continue;
    }
  }

  if (!dockerPath) {
    console.log('  ⚠️  Docker Desktop not found. Install: https://docker.com/products/docker-desktop');
    return false;
  }

  // Launch Docker Desktop (detached, non-blocking)
  console.log('  🐳 Starting Docker Desktop...');
  const child = execFile(dockerPath, [], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref(); // Don't wait for Docker Desktop process

  // Wait for Docker daemon to be ready (max 5min — cold start on Windows/WSL2 can be slow)
  process.stdout.write('  ⏳ Waiting for Docker daemon');
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    process.stdout.write('.');
    if (isDockerRunning()) {
      console.log('\n  ✅ Docker Desktop ready.');
      return true;
    }
  }

  console.log('\n  ⚠️  Docker Desktop started but daemon not ready yet (timeout 5min).');
  console.log('  Wait a moment and try again: npx opensquad services start');
  return false;
}

async function httpGet(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

async function httpPost(url, body, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`POST ${url} returned ${response.status}: ${text}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`POST ${url} returned invalid JSON: ${text.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function findMarkdownFiles(dir, baseDir, results = []) {
  const EXCLUDED = ['node_modules', '.git', '.opensquad-services', 'surreal_data', 'notebook_data'];

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (EXCLUDED.includes(entry.name)) continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Prevent symlink traversal outside project
      try {
        const real = await realpath(fullPath);
        if (!real.startsWith(baseDir)) continue;
      } catch { continue; }
      await findMarkdownFiles(fullPath, baseDir, results);
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Reads init config and ensures ALL configured services are running.
 * Called automatically before any opensquad command (except init/services).
 *
 * Based on config.json from init:
 * - knowledgeBase === 'open-notebook' → Docker Desktop + SurrealDB + Open Notebook
 * - lmStudio === true → LM Studio daemon
 */
export async function ensureServices(targetDir) {
  const config = await loadConfig(targetDir);
  if (config.knowledgeBase !== 'open-notebook') return;

  const composePath = getComposePath(targetDir);
  try {
    await stat(composePath);
  } catch {
    return; // No docker-compose.yml — not configured
  }

  // 1. Ensure LM Studio is running (if configured)
  if (config.lmStudio) {
    await ensureLmStudio();
  }

  // 2. Check if Open Notebook API is already up
  const apiStatus = await httpGet('http://localhost:5055/health', 2000);
  if (apiStatus.ok) return; // All services already running

  // 3. Ensure Docker Desktop is running
  const dockerReady = await ensureDocker();
  if (!dockerReady) return;

  // 4. Start containers (SurrealDB + Open Notebook)
  console.log('  🐳 Starting Open Notebook services...');
  try {
    execFileSync('docker', ['compose', '-f', composePath, 'up', '-d'], {
      stdio: 'pipe',
      maxBuffer: 5 * 1024 * 1024,
      timeout: 60000,
    });

    // Wait for API health (max 30s with progress dots)
    const MAX_RETRIES = 10;
    process.stdout.write('  ⏳ Waiting for API');
    for (let i = 0; i < MAX_RETRIES; i++) {
      await sleep(3000);
      process.stdout.write('.');
      const check = await httpGet('http://localhost:5055/health', 2000);
      if (check.ok) {
        console.log('\n  ✅ Open Notebook services ready.');
        return;
      }
    }
    console.log('\n  ⚠️  Services started but API not ready yet (timeout 30s).');
    console.log('  Check: npx opensquad services health');
  } catch {
    console.log('  ⚠️  Could not start containers. Run: npx opensquad services start');
  }
}

/**
 * Ensure LM Studio daemon is running for local embeddings.
 */
async function ensureLmStudio() {
  // Check if already responding
  const status = await httpGet('http://localhost:1234/v1/models', 2000);
  if (status.ok) return;

  // Try `lms` CLI (LM Studio's command-line tool)
  try {
    execFileSync('lms', ['status'], { stdio: 'pipe', timeout: 5000 });
    // lms exists but server not responding — start it
    console.log('  🤖 Starting LM Studio daemon...');
    execFileSync('lms', ['server', 'start'], { stdio: 'pipe', timeout: 15000 });

    // Wait for it to be ready
    for (let i = 0; i < 5; i++) {
      await sleep(2000);
      const check = await httpGet('http://localhost:1234/v1/models', 2000);
      if (check.ok) {
        console.log('  ✅ LM Studio ready.');
        return;
      }
    }
    console.log('  ⚠️  LM Studio started but not responding yet.');
  } catch {
    // lms CLI not found — user needs to open LM Studio manually
    console.log('  ⚠️  LM Studio not running. Open LM Studio app or run: lms server start');
  }
}

export async function startServices(targetDir) {
  const composePath = getComposePath(targetDir);

  try {
    await stat(composePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`  [ERROR] docker-compose.yml not found at ${composePath}`);
      console.error(`  Run opensquad init first to set up services.`);
      return;
    }
    throw err;
  }

  // Ensure Docker Desktop is running
  const dockerReady = await ensureDocker();
  if (!dockerReady) return;

  console.log('  Starting Open Notebook services...');
  try {
    execFileSync('docker', ['compose', '-f', composePath, 'up', '-d'], { stdio: 'inherit' });
  } catch (err) {
    console.error(`  [ERROR] Failed to start services: ${err.message}`);
    return;
  }

  console.log('  Waiting for services to initialize...');
  await sleep(5000);

  const status = await healthCheck(targetDir);
  const allUp = Object.values(status).every((s) => s === 'up' || s === 'optional');

  if (allUp) {
    console.log('\n  All services are running.');
  } else {
    console.log('\n  Some services failed to start. Check logs with: docker compose logs');
  }
}

export async function stopServices(targetDir) {
  const composePath = getComposePath(targetDir);

  try {
    await stat(composePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`  [ERROR] docker-compose.yml not found at ${composePath}`);
      return;
    }
    throw err;
  }

  console.log('  Stopping Open Notebook services...');
  try {
    execFileSync('docker', ['compose', '-f', composePath, 'down'], { stdio: 'inherit' });
  } catch (err) {
    console.error(`  [ERROR] Failed to stop services: ${err.message}`);
    console.error('  Is Docker installed and running?');
    return;
  }
  console.log('  Services stopped.');
}

export async function healthCheck(targetDir) {
  const config = await loadConfig(targetDir);
  const endpoints = getEndpoints(config);
  const status = {};

  console.log('\n  Service Health Check');
  console.log('  --------------------');

  for (const endpoint of endpoints) {
    const result = await httpGet(endpoint.url);
    const isUp = result.ok;

    if (isUp) {
      status[endpoint.name] = 'up';
      console.log(`  [UP]   ${endpoint.name} (${endpoint.url})`);
    } else if (endpoint.optional) {
      status[endpoint.name] = 'optional';
      console.log(`  [DOWN] ${endpoint.name} (${endpoint.url}) — optional`);
    } else {
      status[endpoint.name] = 'down';
      console.log(`  [DOWN] ${endpoint.name} (${endpoint.url})`);
    }
  }

  console.log('');
  return status;
}

export async function indexDocs(targetDir) {
  const API_BASE = 'http://localhost:5055/api';
  const MIN_CONTENT_LENGTH = 100;
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB max per file

  // Verify API is reachable
  const apiStatus = await httpGet('http://localhost:5055/health');
  if (!apiStatus.ok) {
    console.error('  [ERROR] Open Notebook API is not reachable at http://localhost:5055');
    console.error('  Start services first with: opensquad services start');
    return;
  }

  // Find all markdown files
  console.log('  Scanning for documentation files...');
  const files = await findMarkdownFiles(targetDir, targetDir);

  if (files.length === 0) {
    console.log('  No .md files found.');
    return;
  }

  console.log(`  Found ${files.length} markdown file(s). Filtering by content length...`);

  // Filter files with enough content
  const validFiles = [];
  for (const filePath of files) {
    try {
      const fileStat = await stat(filePath);
      if (fileStat.size > MAX_FILE_SIZE) continue; // Skip oversized files
      const content = await readFile(filePath, 'utf-8');
      if (content.length >= MIN_CONTENT_LENGTH) {
        validFiles.push({ path: filePath, content });
      }
    } catch {
      // Skip unreadable files
    }
  }

  if (validFiles.length === 0) {
    console.log('  No files with sufficient content (>= 100 chars).');
    return;
  }

  console.log(`  Indexing ${validFiles.length} file(s) into Open Notebook...\n`);

  // Find or create notebook
  let notebookId;
  try {
    const notebook = await httpPost(`${API_BASE}/notebooks`, { name: 'OpenSquad Docs' });
    notebookId = notebook.id;
    console.log(`  Created notebook "OpenSquad Docs" (${notebookId})`);
  } catch {
    // Notebook may already exist — try to find it
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      let notebooks;
      try {
        const res = await fetch(`${API_BASE}/notebooks`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        notebooks = await res.json();
      } finally {
        clearTimeout(timer);
      }
      const existing = (Array.isArray(notebooks) ? notebooks : notebooks.data || [])
        .find((n) => n.name === 'OpenSquad Docs');
      if (existing) {
        notebookId = existing.id;
        console.log(`  Using existing notebook "OpenSquad Docs" (${notebookId})`);
      } else {
        console.error('  [ERROR] Failed to create or find notebook.');
        return;
      }
    } catch (err) {
      console.error(`  [ERROR] Failed to access notebooks: ${err.message}`);
      return;
    }
  }

  // Index each file
  let indexed = 0;
  let failed = 0;

  for (const file of validFiles) {
    const relativePath = relative(targetDir, file.path).replace(/\\/g, '/');

    try {
      await httpPost(`${API_BASE}/sources/json`, {
        notebook_id: notebookId,
        content: file.content,
        title: relativePath,
        type: 'text',
      });
      indexed++;
      console.log(`  [${indexed}/${validFiles.length}] Indexed: ${relativePath}`);
    } catch (err) {
      failed++;
      console.error(`  [FAIL] ${relativePath}: ${err.message}`);
    }
  }

  console.log(`\n  Indexing complete: ${indexed} succeeded, ${failed} failed.`);
}

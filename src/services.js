import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const SERVICES_DIR = '.opensquad-services';
const COMPOSE_FILE = 'docker-compose.yml';
const CONFIG_FILE = 'config.json';

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

    return response.json();
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

  console.log('  Starting Open Notebook services...');
  try {
    execFileSync('docker', ['compose', '-f', composePath, 'up', '-d'], { stdio: 'inherit' });
  } catch {
    console.error('  [ERROR] Failed to start services. Is Docker installed and running?');
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
  } catch {
    console.error('  [ERROR] Failed to stop services. Is Docker installed and running?');
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
      await httpPost(`${API_BASE}/sources`, {
        notebook_id: notebookId,
        content: file.content,
        title: relativePath,
        source_type: 'text',
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

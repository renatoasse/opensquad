import { join } from 'node:path';
import { stat } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { platform, networkInterfaces } from 'node:os';

const DASHBOARD_DIR = 'dashboard';
const DASHBOARD_PORT = 5173;
const IS_WIN = platform() === 'win32';

/**
 * Get the first non-internal IPv4 address (LAN IP).
 */
function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

/**
 * Check if the dashboard's node_modules exist.
 */
async function hasNodeModules(dashboardPath) {
  try {
    await stat(join(dashboardPath, 'node_modules'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Open a URL in the default browser (best-effort).
 */
function openBrowser(url) {
  try {
    if (IS_WIN) {
      spawn('cmd', ['/c', 'start', url], { detached: true, stdio: 'ignore' }).unref();
    } else if (platform() === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch {
    // Best-effort — browser open is not critical
  }
}

/**
 * Wait for a URL to respond with HTTP 200 (max ~15s).
 */
async function waitForReady(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return true;
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

/**
 * Start the Opensquad pixel-art dashboard (Vite dev server).
 *
 * - Installs dependencies if needed
 * - Launches `npm run dev --host --strict-port` in the background
 * - Polls for readiness before opening the browser
 */
export async function startDashboard(targetDir) {
  if (!targetDir || typeof targetDir !== 'string') {
    console.error('  [ERROR] Invalid target directory.');
    return false;
  }

  const dashboardPath = join(targetDir, DASHBOARD_DIR);

  // Check if dashboard directory exists
  try {
    await stat(join(dashboardPath, 'package.json'));
  } catch {
    console.error('  [ERROR] Dashboard not found at', dashboardPath);
    console.error('  Make sure you ran: npx opensquad init');
    return false;
  }

  // Install dependencies if needed
  if (!(await hasNodeModules(dashboardPath))) {
    console.log('  📦 Installing dashboard dependencies...');
    try {
      execFileSync('npm', ['install'], {
        cwd: dashboardPath,
        stdio: 'pipe',
        shell: IS_WIN,
        timeout: 120000,
      });
      console.log('  ✅ Dependencies installed.');
    } catch (err) {
      console.error(`  [ERROR] npm install failed: ${err.message}`);
      return false;
    }
  }

  // Start Vite dev server (detached) with --host for LAN + --strict-port to fail fast
  console.log('  🎮 Starting Opensquad Dashboard...');
  const devArgs = ['run', 'dev', '--', '--host', '--strict-port'];
  const child = IS_WIN
    ? spawn('cmd', ['/c', 'npm', ...devArgs], { cwd: dashboardPath, detached: true, stdio: 'ignore' })
    : spawn('npm', devArgs, { cwd: dashboardPath, detached: true, stdio: 'ignore' });

  let spawnFailed = false;
  child.on('error', (err) => {
    spawnFailed = true;
    console.error(`  [ERROR] Failed to start dashboard: ${err.message}`);
  });
  child.unref();

  // Poll for readiness instead of blind sleep
  const url = `http://localhost:${DASHBOARD_PORT}`;
  const ready = await waitForReady(url);

  if (spawnFailed || !ready) {
    console.error(`  [ERROR] Dashboard did not start on port ${DASHBOARD_PORT}.`);
    console.error(`  Check if port ${DASHBOARD_PORT} is already in use.`);
    return false;
  }

  // Open browser
  openBrowser(url);

  // Show URLs
  const localIp = getLocalIp();
  console.log(`  🖥️  Dashboard running at ${url}`);
  if (localIp) {
    console.log(`  🌐 LAN access: http://${localIp}:${DASHBOARD_PORT}`);
  }
  console.log('  👀 Watch your agents work in real-time!');
  return true;
}

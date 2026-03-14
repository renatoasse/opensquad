import { join } from 'node:path';
import { stat } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { platform } from 'node:os';

const DASHBOARD_DIR = 'dashboard';

/**
 * Resolve `npm` executable — on Windows, `npm` is a .cmd file and must
 * be invoked through the shell or with its full extension.
 */
function npmCommand() {
  return platform() === 'win32' ? 'npm.cmd' : 'npm';
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
 * Start the Opensquad pixel-art dashboard (Vite dev server).
 *
 * - Installs dependencies if needed
 * - Launches `npm run dev` in the background
 * - Opens the browser automatically
 */
export async function startDashboard(targetDir) {
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
      execFileSync(npmCommand(), ['install'], {
        cwd: dashboardPath,
        stdio: 'pipe',
        timeout: 120000,
      });
      console.log('  ✅ Dependencies installed.');
    } catch (err) {
      console.error(`  [ERROR] npm install failed: ${err.message}`);
      return false;
    }
  }

  // Start Vite dev server (detached, non-blocking)
  console.log('  🎮 Starting Opensquad Dashboard...');
  const isWin = platform() === 'win32';
  const child = isWin
    ? spawn('cmd', ['/c', 'npm', 'run', 'dev'], {
        cwd: dashboardPath,
        detached: true,
        stdio: 'ignore',
      })
    : spawn('npm', ['run', 'dev'], {
        cwd: dashboardPath,
        detached: true,
        stdio: 'ignore',
      });
  child.unref();

  // Give Vite a moment to start
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Open browser
  const url = 'http://localhost:5173';
  try {
    const os = platform();
    if (os === 'win32') {
      spawn('cmd', ['/c', 'start', url], { detached: true, stdio: 'ignore' }).unref();
    } else if (os === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch {
    // Browser open is best-effort
  }

  console.log(`  🖥️  Dashboard running at ${url}`);
  console.log('  👀 Watch your agents work in real-time!');
  return true;
}

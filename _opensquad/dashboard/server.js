#!/usr/bin/env node
/**
 * Opensquad Dashboard Server
 * Roda com: node _opensquad/dashboard/server.js
 * Abre em:  http://localhost:3000
 */

import http from 'http';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT      = process.env.PORT || 3000;
const ROOT      = path.resolve(__dirname, '../..');   // raiz do opensquad
const SQUADS_DIR = path.join(ROOT, 'squads');

// ── helpers ─────────────────────────────────────────────────────────────────

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function readText(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch { return null; }
}

// ── route: /api/squads ────────────────────────────────────────────────────────

function handleSquads(res) {
  const squads = [];
  if (!fs.existsSync(SQUADS_DIR)) return json(res, squads);

  for (const name of fs.readdirSync(SQUADS_DIR)) {
    const dir = path.join(SQUADS_DIR, name);
    try { if (!fs.statSync(dir).isDirectory()) continue; }
    catch { continue; }

    // state ativo (pipeline rodando agora)
    const activeState = readJSON(path.join(dir, 'state.json'));

    // último run arquivado
    let lastRun = null;
    const outputDir = path.join(dir, 'output');
    if (fs.existsSync(outputDir)) {
      const runs = fs.readdirSync(outputDir)
        .filter(d => /^\d{4}-\d{2}-\d{2}-\d{6}$/.test(d))
        .sort()
        .reverse();
      if (runs.length) {
        lastRun = readJSON(path.join(outputDir, runs[0], 'state.json'));
        if (lastRun) lastRun._runId = runs[0];
      }
    }

    // runs.md → histórico
    let runs = [];
    const runsText = readText(path.join(dir, '_memory', 'runs.md'));
    if (runsText) {
      runs = runsText
        .split('\n')
        .filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('Run ID'))
        .map(l => {
          const cols = l.split('|').map(s => s.trim()).filter(Boolean);
          return cols.length >= 5
            ? { date: cols[0], runId: cols[1], tema: cols[2], output: cols[3], resultado: cols[4] }
            : null;
        })
        .filter(Boolean);
    }

    squads.push({ name, activeState, lastRun, runs });
  }

  json(res, squads);
}

// ── main server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/squads') return handleSquads(res);

  // serve index.html para qualquer outra rota
  const htmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(htmlPath));
  } else {
    res.writeHead(404);
    res.end('index.html not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n  ◉ Opensquad Dashboard`);
  console.log(`  → http://localhost:${PORT}\n`);
});

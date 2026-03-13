/**
 * SQLite Database Module for Opensquad
 *
 * This module is the single source of truth for all Opensquad data.
 * Uses better-sqlite3 for synchronous, fast SQLite operations.
 */

import Database from 'better-sqlite3';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

let db = null;
let dbPath = null;

/**
 * Initialize the database connection
 * @param {string} projectDir - The project directory where _opensquad lives
 * @returns {Database} The database instance
 */
export async function initDb(projectDir) {
  if (db) return db;

  dbPath = join(projectDir, '_opensquad', 'data', 'opensquad.db');
  await mkdir(dirname(dbPath), { recursive: true });

  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  runMigrations(db);

  return db;
}

/**
 * Get the database instance (must call initDb first)
 * @returns {Database}
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb(projectDir) first.');
  }
  return db;
}

/**
 * Get the database file path
 * @returns {string}
 */
export function getDbPath() {
  return dbPath;
}

/**
 * Close the database connection
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
    dbPath = null;
  }
}

/**
 * Run database migrations
 * @param {Database} database
 */
function runMigrations(database) {
  // Create migrations table if not exists
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrations = [
    {
      name: '001_initial_schema',
      sql: `
        -- Companies
        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          website TEXT,
          sector TEXT,
          target_audience TEXT,
          tone_of_voice TEXT,
          social_instagram TEXT,
          social_linkedin TEXT,
          social_twitter TEXT,
          icon TEXT DEFAULT '🏢',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Products
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          description TEXT,
          target_audience TEXT,
          tone_of_voice TEXT,
          value_proposition TEXT,
          key_features TEXT,
          icon TEXT DEFAULT '📦',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(company_id, slug)
        );

        -- Squads
        CREATE TABLE IF NOT EXISTS squads (
          id TEXT PRIMARY KEY,
          product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT DEFAULT '📋',
          format TEXT,
          performance_mode TEXT,
          target_audience TEXT,
          skills TEXT,
          pipeline_config TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Squad Agents
        CREATE TABLE IF NOT EXISTS squad_agents (
          id TEXT PRIMARY KEY,
          squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
          agent_id TEXT NOT NULL,
          name TEXT NOT NULL,
          icon TEXT,
          role TEXT,
          execution TEXT DEFAULT 'inline',
          skills TEXT,
          persona TEXT,
          position INTEGER,
          created_at TEXT NOT NULL
        );

        -- Runs (execution history)
        CREATE TABLE IF NOT EXISTS runs (
          id TEXT PRIMARY KEY,
          squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'running',
          topic TEXT,
          run_folder TEXT,
          started_at TEXT NOT NULL,
          completed_at TEXT,
          duration_ms INTEGER,
          step_count INTEGER,
          current_step INTEGER DEFAULT 1,
          error_message TEXT
        );

        -- Run Steps
        CREATE TABLE IF NOT EXISTS run_steps (
          id TEXT PRIMARY KEY,
          run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
          step_number INTEGER NOT NULL,
          agent_id TEXT NOT NULL,
          agent_name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          started_at TEXT,
          completed_at TEXT,
          duration_ms INTEGER,
          output_file TEXT
        );

        -- Memories
        CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY,
          squad_id TEXT REFERENCES squads(id) ON DELETE SET NULL,
          product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
          company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
          category TEXT NOT NULL,
          content TEXT NOT NULL,
          source_run_id TEXT REFERENCES runs(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          relevance_score REAL DEFAULT 1.0
        );

        -- Active Context (selected company/product)
        CREATE TABLE IF NOT EXISTS active_context (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
        CREATE INDEX IF NOT EXISTS idx_squads_product ON squads(product_id);
        CREATE INDEX IF NOT EXISTS idx_squad_agents_squad ON squad_agents(squad_id);
        CREATE INDEX IF NOT EXISTS idx_runs_squad ON runs(squad_id);
        CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
        CREATE INDEX IF NOT EXISTS idx_run_steps_run ON run_steps(run_id);
        CREATE INDEX IF NOT EXISTS idx_memories_squad ON memories(squad_id);
        CREATE INDEX IF NOT EXISTS idx_memories_product ON memories(product_id);
        CREATE INDEX IF NOT EXISTS idx_memories_company ON memories(company_id);
      `
    }
  ];

  const appliedMigrations = database.prepare('SELECT name FROM _migrations').all();
  const appliedNames = new Set(appliedMigrations.map(m => m.name));

  for (const migration of migrations) {
    if (!appliedNames.has(migration.name)) {
      database.exec(migration.sql);
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name);
      console.log(`  ✓ Applied migration: ${migration.name}`);
    }
  }
}

// ============================================================================
// COMPANY OPERATIONS
// ============================================================================

/**
 * Create a new company
 * @param {Object} data - Company data
 * @returns {Object} The created company
 */
export function createCompany(data) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO companies (id, name, slug, description, website, sector, target_audience,
      tone_of_voice, social_instagram, social_linkedin, social_twitter, icon, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.name,
    data.slug,
    data.description || null,
    data.website || null,
    data.sector || null,
    data.target_audience || null,
    data.tone_of_voice || null,
    data.social_instagram || null,
    data.social_linkedin || null,
    data.social_twitter || null,
    data.icon || '🏢',
    now,
    now
  );

  return getCompanyById(id);
}

/**
 * Get a company by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getCompanyById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
}

/**
 * Get a company by slug
 * @param {string} slug
 * @returns {Object|null}
 */
export function getCompanyBySlug(slug) {
  const db = getDb();
  return db.prepare('SELECT * FROM companies WHERE slug = ?').get(slug);
}

/**
 * List all companies
 * @returns {Array}
 */
export function listCompanies() {
  const db = getDb();
  return db.prepare('SELECT * FROM companies ORDER BY name').all();
}

/**
 * Update a company
 * @param {string} id
 * @param {Object} data
 * @returns {Object}
 */
export function updateCompany(id, data) {
  const db = getDb();
  const now = new Date().toISOString();

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE companies SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getCompanyById(id);
}

/**
 * Delete a company
 * @param {string} id
 */
export function deleteCompany(id) {
  const db = getDb();
  // Clear active context if deleting the active company
  const activeId = getActiveCompanyId();
  if (activeId === id) {
    db.prepare("DELETE FROM active_context WHERE key = 'company_id'").run();
    db.prepare("DELETE FROM active_context WHERE key = 'product_id'").run();
  }
  db.prepare('DELETE FROM companies WHERE id = ?').run(id);
}

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

/**
 * Create a new product
 * @param {Object} data - Product data
 * @returns {Object} The created product
 */
export function createProduct(data) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO products (id, company_id, name, slug, description, target_audience,
      tone_of_voice, value_proposition, key_features, icon, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.company_id,
    data.name,
    data.slug,
    data.description || null,
    data.target_audience || null,
    data.tone_of_voice || null,
    data.value_proposition || null,
    data.key_features ? JSON.stringify(data.key_features) : null,
    data.icon || '📦',
    now,
    now
  );

  return getProductById(id);
}

/**
 * Get a product by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getProductById(id) {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (product && product.key_features) {
    product.key_features = JSON.parse(product.key_features);
  }
  return product;
}

/**
 * Get a product by slug within a company
 * @param {string} companyId
 * @param {string} slug
 * @returns {Object|null}
 */
export function getProductBySlug(companyId, slug) {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE company_id = ? AND slug = ?').get(companyId, slug);
  if (product && product.key_features) {
    product.key_features = JSON.parse(product.key_features);
  }
  return product;
}

/**
 * List all products for a company
 * @param {string} companyId
 * @returns {Array}
 */
export function listProducts(companyId) {
  const db = getDb();
  const products = db.prepare('SELECT * FROM products WHERE company_id = ? ORDER BY name').all(companyId);
  return products.map(p => {
    if (p.key_features) p.key_features = JSON.parse(p.key_features);
    return p;
  });
}

/**
 * List all products across all companies
 * @returns {Array}
 */
export function listAllProducts() {
  const db = getDb();
  const products = db.prepare(`
    SELECT p.*, c.name as company_name, c.slug as company_slug
    FROM products p
    JOIN companies c ON p.company_id = c.id
    ORDER BY c.name, p.name
  `).all();
  return products.map(p => {
    if (p.key_features) p.key_features = JSON.parse(p.key_features);
    return p;
  });
}

/**
 * Update a product
 * @param {string} id
 * @param {Object} data
 * @returns {Object}
 */
export function updateProduct(id, data) {
  const db = getDb();
  const now = new Date().toISOString();

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      if (key === 'key_features' && Array.isArray(value)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getProductById(id);
}

/**
 * Delete a product
 * @param {string} id
 */
export function deleteProduct(id) {
  const db = getDb();
  // Clear active product if deleting the active product
  const activeId = getActiveProductId();
  if (activeId === id) {
    db.prepare("DELETE FROM active_context WHERE key = 'product_id'").run();
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

// ============================================================================
// SQUAD OPERATIONS
// ============================================================================

/**
 * Create a new squad
 * @param {Object} data - Squad data
 * @returns {Object} The created squad
 */
export function createSquad(data) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO squads (id, product_id, code, name, description, icon, format,
      performance_mode, target_audience, skills, pipeline_config, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.product_id || null,
    data.code,
    data.name,
    data.description || null,
    data.icon || '📋',
    data.format || null,
    data.performance_mode || null,
    data.target_audience || null,
    data.skills ? JSON.stringify(data.skills) : null,
    data.pipeline_config ? JSON.stringify(data.pipeline_config) : null,
    now,
    now
  );

  return getSquadById(id);
}

/**
 * Get a squad by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getSquadById(id) {
  const db = getDb();
  const squad = db.prepare('SELECT * FROM squads WHERE id = ?').get(id);
  if (squad) {
    if (squad.skills) squad.skills = JSON.parse(squad.skills);
    if (squad.pipeline_config) squad.pipeline_config = JSON.parse(squad.pipeline_config);
  }
  return squad;
}

/**
 * Get a squad by code
 * @param {string} code
 * @returns {Object|null}
 */
export function getSquadByCode(code) {
  const db = getDb();
  const squad = db.prepare('SELECT * FROM squads WHERE code = ?').get(code);
  if (squad) {
    if (squad.skills) squad.skills = JSON.parse(squad.skills);
    if (squad.pipeline_config) squad.pipeline_config = JSON.parse(squad.pipeline_config);
  }
  return squad;
}

/**
 * List squads for a product
 * @param {string} productId
 * @returns {Array}
 */
export function listSquads(productId) {
  const db = getDb();
  const squads = db.prepare('SELECT * FROM squads WHERE product_id = ? ORDER BY name').all(productId);
  return squads.map(s => {
    if (s.skills) s.skills = JSON.parse(s.skills);
    if (s.pipeline_config) s.pipeline_config = JSON.parse(s.pipeline_config);
    return s;
  });
}

/**
 * List all squads
 * @returns {Array}
 */
export function listAllSquads() {
  const db = getDb();
  const squads = db.prepare(`
    SELECT s.*, p.name as product_name, p.slug as product_slug,
           c.name as company_name, c.slug as company_slug
    FROM squads s
    LEFT JOIN products p ON s.product_id = p.id
    LEFT JOIN companies c ON p.company_id = c.id
    ORDER BY c.name, p.name, s.name
  `).all();
  return squads.map(s => {
    if (s.skills) s.skills = JSON.parse(s.skills);
    if (s.pipeline_config) s.pipeline_config = JSON.parse(s.pipeline_config);
    return s;
  });
}

/**
 * Update a squad
 * @param {string} id
 * @param {Object} data
 * @returns {Object}
 */
export function updateSquad(id, data) {
  const db = getDb();
  const now = new Date().toISOString();

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      if ((key === 'skills' || key === 'pipeline_config') && typeof value === 'object') {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE squads SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getSquadById(id);
}

/**
 * Delete a squad
 * @param {string} id
 */
export function deleteSquad(id) {
  const db = getDb();
  db.prepare('DELETE FROM squads WHERE id = ?').run(id);
}

// ============================================================================
// SQUAD AGENT OPERATIONS
// ============================================================================

/**
 * Create a squad agent
 * @param {Object} data
 * @returns {Object}
 */
export function createSquadAgent(data) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO squad_agents (id, squad_id, agent_id, name, icon, role, execution, skills, persona, position, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.squad_id,
    data.agent_id,
    data.name,
    data.icon || null,
    data.role || null,
    data.execution || 'inline',
    data.skills ? JSON.stringify(data.skills) : null,
    data.persona || null,
    data.position || 0,
    now
  );

  return getSquadAgentById(id);
}

/**
 * Get a squad agent by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getSquadAgentById(id) {
  const db = getDb();
  const agent = db.prepare('SELECT * FROM squad_agents WHERE id = ?').get(id);
  if (agent && agent.skills) agent.skills = JSON.parse(agent.skills);
  return agent;
}

/**
 * List agents for a squad
 * @param {string} squadId
 * @returns {Array}
 */
export function listSquadAgents(squadId) {
  const db = getDb();
  const agents = db.prepare('SELECT * FROM squad_agents WHERE squad_id = ? ORDER BY position').all(squadId);
  return agents.map(a => {
    if (a.skills) a.skills = JSON.parse(a.skills);
    return a;
  });
}

/**
 * Update a squad agent
 * @param {string} id
 * @param {Object} data
 * @returns {Object}
 */
export function updateSquadAgent(id, data) {
  const db = getDb();

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      if (key === 'skills' && Array.isArray(value)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  }

  values.push(id);

  db.prepare(`UPDATE squad_agents SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getSquadAgentById(id);
}

/**
 * Delete a squad agent
 * @param {string} id
 */
export function deleteSquadAgent(id) {
  const db = getDb();
  db.prepare('DELETE FROM squad_agents WHERE id = ?').run(id);
}

/**
 * Delete all agents for a squad
 * @param {string} squadId
 */
export function deleteSquadAgents(squadId) {
  const db = getDb();
  db.prepare('DELETE FROM squad_agents WHERE squad_id = ?').run(squadId);
}

// ============================================================================
// RUN OPERATIONS
// ============================================================================

/**
 * Create a new run
 * @param {Object} data
 * @returns {Object}
 */
export function createRun(data) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO runs (id, squad_id, status, topic, run_folder, started_at, step_count, current_step)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.squad_id,
    data.status || 'running',
    data.topic || null,
    data.run_folder || null,
    now,
    data.step_count || 0,
    data.current_step || 1
  );

  return getRunById(id);
}

/**
 * Get a run by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getRunById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM runs WHERE id = ?').get(id);
}

/**
 * List runs for a squad
 * @param {string} squadId
 * @param {Object} options - { limit, offset }
 * @returns {Array}
 */
export function listRuns(squadId, options = {}) {
  const db = getDb();
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  return db.prepare(`
    SELECT * FROM runs
    WHERE squad_id = ?
    ORDER BY started_at DESC
    LIMIT ? OFFSET ?
  `).all(squadId, limit, offset);
}

/**
 * List all runs
 * @param {Object} options - { limit, offset }
 * @returns {Array}
 */
export function listAllRuns(options = {}) {
  const db = getDb();
  const limit = options.limit || 100;
  const offset = options.offset || 0;

  return db.prepare(`
    SELECT r.*, s.name as squad_name, s.code as squad_code
    FROM runs r
    JOIN squads s ON r.squad_id = s.id
    ORDER BY r.started_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
}

/**
 * Update a run
 * @param {string} id
 * @param {Object} data
 * @returns {Object}
 */
export function updateRun(id, data) {
  const db = getDb();

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'id' && key !== 'started_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  values.push(id);

  db.prepare(`UPDATE runs SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getRunById(id);
}

/**
 * Complete a run
 * @param {string} id
 * @param {string} status - 'completed' or 'failed'
 * @param {string} errorMessage - Optional error message
 * @returns {Object}
 */
export function completeRun(id, status, errorMessage = null) {
  const db = getDb();
  const now = new Date().toISOString();

  const run = getRunById(id);
  if (!run) return null;

  const startedAt = new Date(run.started_at);
  const durationMs = new Date(now) - startedAt;

  db.prepare(`
    UPDATE runs
    SET status = ?, completed_at = ?, duration_ms = ?, error_message = ?
    WHERE id = ?
  `).run(status, now, durationMs, errorMessage, id);

  return getRunById(id);
}

// ============================================================================
// RUN STEP OPERATIONS
// ============================================================================

/**
 * Create a run step
 * @param {Object} data
 * @returns {Object}
 */
export function createRunStep(data) {
  const db = getDb();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO run_steps (id, run_id, step_number, agent_id, agent_name, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.run_id,
    data.step_number,
    data.agent_id,
    data.agent_name,
    data.status || 'pending'
  );

  return getRunStepById(id);
}

/**
 * Get a run step by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getRunStepById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM run_steps WHERE id = ?').get(id);
}

/**
 * List steps for a run
 * @param {string} runId
 * @returns {Array}
 */
export function listRunSteps(runId) {
  const db = getDb();
  return db.prepare('SELECT * FROM run_steps WHERE run_id = ? ORDER BY step_number').all(runId);
}

/**
 * Start a run step
 * @param {string} id
 * @returns {Object}
 */
export function startRunStep(id) {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE run_steps SET status = 'running', started_at = ? WHERE id = ?
  `).run(now, id);

  return getRunStepById(id);
}

/**
 * Complete a run step
 * @param {string} id
 * @param {string} outputFile
 * @returns {Object}
 */
export function completeRunStep(id, outputFile = null) {
  const db = getDb();
  const now = new Date().toISOString();

  const step = getRunStepById(id);
  if (!step) return null;

  const startedAt = step.started_at ? new Date(step.started_at) : new Date();
  const durationMs = new Date(now) - startedAt;

  db.prepare(`
    UPDATE run_steps
    SET status = 'completed', completed_at = ?, duration_ms = ?, output_file = ?
    WHERE id = ?
  `).run(now, durationMs, outputFile, id);

  return getRunStepById(id);
}

/**
 * Fail a run step
 * @param {string} id
 * @returns {Object}
 */
export function failRunStep(id) {
  const db = getDb();
  const now = new Date().toISOString();

  const step = getRunStepById(id);
  if (!step) return null;

  const startedAt = step.started_at ? new Date(step.started_at) : new Date();
  const durationMs = new Date(now) - startedAt;

  db.prepare(`
    UPDATE run_steps
    SET status = 'failed', completed_at = ?, duration_ms = ?
    WHERE id = ?
  `).run(now, durationMs, id);

  return getRunStepById(id);
}

// ============================================================================
// MEMORY OPERATIONS
// ============================================================================

/**
 * Create a memory
 * @param {Object} data
 * @returns {Object}
 */
export function createMemory(data) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO memories (id, squad_id, product_id, company_id, category, content, source_run_id, created_at, relevance_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.squad_id || null,
    data.product_id || null,
    data.company_id || null,
    data.category,
    data.content,
    data.source_run_id || null,
    now,
    data.relevance_score || 1.0
  );

  return getMemoryById(id);
}

/**
 * Get a memory by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getMemoryById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM memories WHERE id = ?').get(id);
}

/**
 * List memories for a squad
 * @param {string} squadId
 * @returns {Array}
 */
export function listSquadMemories(squadId) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM memories
    WHERE squad_id = ?
    ORDER BY relevance_score DESC, created_at DESC
  `).all(squadId);
}

/**
 * List memories for a product
 * @param {string} productId
 * @returns {Array}
 */
export function listProductMemories(productId) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM memories
    WHERE product_id = ?
    ORDER BY relevance_score DESC, created_at DESC
  `).all(productId);
}

/**
 * List memories for a company
 * @param {string} companyId
 * @returns {Array}
 */
export function listCompanyMemories(companyId) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM memories
    WHERE company_id = ?
    ORDER BY relevance_score DESC, created_at DESC
  `).all(companyId);
}

/**
 * Delete a memory
 * @param {string} id
 */
export function deleteMemory(id) {
  const db = getDb();
  db.prepare('DELETE FROM memories WHERE id = ?').run(id);
}

// ============================================================================
// ACTIVE CONTEXT OPERATIONS
// ============================================================================

/**
 * Get the active company ID
 * @returns {string|null}
 */
export function getActiveCompanyId() {
  const db = getDb();
  const row = db.prepare('SELECT value FROM active_context WHERE key = ?').get('company_id');
  return row ? row.value : null;
}

/**
 * Set the active company ID
 * @param {string} companyId
 */
export function setActiveCompanyId(companyId) {
  const db = getDb();
  db.prepare(`
    INSERT INTO active_context (key, value) VALUES ('company_id', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(companyId);
}

/**
 * Get the active product ID
 * @returns {string|null}
 */
export function getActiveProductId() {
  const db = getDb();
  const row = db.prepare('SELECT value FROM active_context WHERE key = ?').get('product_id');
  return row ? row.value : null;
}

/**
 * Set the active product ID
 * @param {string} productId
 */
export function setActiveProductId(productId) {
  const db = getDb();
  db.prepare(`
    INSERT INTO active_context (key, value) VALUES ('product_id', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(productId);
}

/**
 * Get the full active context
 * @returns {Object} { company: Object|null, product: Object|null }
 */
export function getActiveContext() {
  const companyId = getActiveCompanyId();
  const productId = getActiveProductId();

  return {
    company: companyId ? getCompanyById(companyId) : null,
    product: productId ? getProductById(productId) : null
  };
}

/**
 * Clear active context
 */
export function clearActiveContext() {
  const db = getDb();
  db.prepare('DELETE FROM active_context').run();
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get statistics for the database
 * @returns {Object}
 */
export function getStats() {
  const db = getDb();

  const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const squadCount = db.prepare('SELECT COUNT(*) as count FROM squads').get().count;
  const runCount = db.prepare('SELECT COUNT(*) as count FROM runs').get().count;
  const memoryCount = db.prepare('SELECT COUNT(*) as count FROM memories').get().count;

  const completedRuns = db.prepare("SELECT COUNT(*) as count FROM runs WHERE status = 'completed'").get().count;
  const failedRuns = db.prepare("SELECT COUNT(*) as count FROM runs WHERE status = 'failed'").get().count;

  const avgDuration = db.prepare(`
    SELECT AVG(duration_ms) as avg FROM runs WHERE status = 'completed' AND duration_ms IS NOT NULL
  `).get().avg;

  return {
    companies: companyCount,
    products: productCount,
    squads: squadCount,
    runs: {
      total: runCount,
      completed: completedRuns,
      failed: failedRuns,
      avgDurationMs: avgDuration ? Math.round(avgDuration) : null
    },
    memories: memoryCount
  };
}

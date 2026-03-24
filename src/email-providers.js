import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const EMAIL_PROVIDER_REGISTRY = [
  {
    id: 'resend',
    capability: 'email',
    skill_id: 'resend',
    config_path: '.claude/settings.local.json',
    state_path: '_opensquad/_memory/resend.md',
    default_recommendation: true,
    setup: {
      command: 'npx',
      args: ['-y', 'resend-mcp'],
      env: ['RESEND_API_KEY'],
    },
  },
];

const PROVIDER_LOOKUP = new Map(EMAIL_PROVIDER_REGISTRY.map((provider) => [provider.id, provider]));

function cloneProviderDefinition(provider) {
  if (!provider) return null;
  return {
    ...provider,
    setup: provider.setup
      ? {
          ...provider.setup,
          args: Array.isArray(provider.setup.args) ? [...provider.setup.args] : provider.setup.args,
          env: Array.isArray(provider.setup.env) ? [...provider.setup.env] : provider.setup.env,
        }
      : provider.setup,
  };
}

export function getEmailProviderDefinition(providerId) {
  return cloneProviderDefinition(PROVIDER_LOOKUP.get(providerId) || null);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function readJsonFile(filePath) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${filePath}`, { cause: err });
    }
    throw err;
  }
}

function parseProviderState(raw) {
  const fields = {};

  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*-\s*([^:]+):\s*(.*)$/);
    if (match) {
      fields[match[1].trim()] = match[2].trim();
    }
  }

  return fields;
}

async function readProviderState(targetDir, provider) {
  const statePath = join(targetDir, provider.state_path);

  try {
    const raw = await readFile(statePath, 'utf-8');
    return { raw, fields: parseProviderState(raw) };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function isProviderServerConfigValid(provider, config) {
  if (!provider?.setup || !config || typeof config !== 'object') return false;

  const commandValid = config.command === provider.setup.command;
  const argsValid = Array.isArray(config.args)
    && config.args.length === provider.setup.args.length
    && config.args.every((value, index) => value === provider.setup.args[index]);
  const envName = Array.isArray(provider.setup.env) ? provider.setup.env[0] : provider.setup.env;
  const envValid = config.env && typeof config.env === 'object' && isNonEmptyString(config.env[envName]);

  return commandValid && argsValid && envValid;
}

function buildProviderRecord(provider, overrides = {}) {
  return {
    ...provider,
    ...overrides,
  };
}

export async function inspectEmailProvider(targetDir, providerId) {
  const provider = getEmailProviderDefinition(providerId);

  if (!provider) {
    throw new Error(`Unknown email provider '${providerId}'`);
  }

  const settings = await readJsonFile(join(targetDir, provider.config_path));
  const currentServers = settings.mcpServers && typeof settings.mcpServers === 'object'
    ? settings.mcpServers
    : {};
  const config = currentServers[provider.id] && typeof currentServers[provider.id] === 'object'
    ? currentServers[provider.id]
    : null;
  const state = await readProviderState(targetDir, provider);
  const issues = [];

  if (!config) {
    issues.push(`mcpServers.${provider.id} is missing or incomplete`);
  } else if (!isProviderServerConfigValid(provider, config)) {
    issues.push(`mcpServers.${provider.id} does not match the bundled provider configuration`);
  }

  if (!state) {
    issues.push('workspace memory file is missing');
  } else {
    const { fields } = state;
    if (fields.setup_complete !== 'true') {
      issues.push('setup_complete marker is missing');
    }
    if (!isNonEmptyString(fields.configured_at)) {
      issues.push('configured_at marker is missing');
    }
  }

  let status = 'needs_setup';
  if (config && state && issues.length === 0) {
    status = 'configured';
  } else if (config || state) {
    status = 'needs_repair';
  }

  return buildProviderRecord(provider, {
    config,
    state,
    issues,
    status,
    configured: Boolean(config),
    healthy: status === 'configured',
  });
}

export async function listConfiguredEmailProviders(targetDir) {
  const configuredProviders = [];

  for (const provider of EMAIL_PROVIDER_REGISTRY) {
    if (provider.capability !== 'email') continue;
    const record = await inspectEmailProvider(targetDir, provider.id);
    if (record.configured) configuredProviders.push(record);
  }

  return configuredProviders;
}

export function providerNeedsSetup(providerRecord) {
  return providerRecord?.status === 'needs_setup';
}

export function providerNeedsRepair(providerRecord) {
  return providerRecord?.status === 'needs_repair';
}

export function recommendEmailProvider(context = {}) {
  const providers = EMAIL_PROVIDER_REGISTRY.filter((provider) => provider.capability === 'email');
  const defaultProvider = providers.find((provider) => provider.default_recommendation) || providers[0] || null;

  if (!defaultProvider) return null;

  const record = buildProviderRecord(cloneProviderDefinition(defaultProvider), {
    status: 'needs_setup',
    configured: false,
    healthy: false,
    selected: 'recommended',
    issues: [],
  });

  if (context.targetDir) {
    record.targetDir = context.targetDir;
  }

  return record;
}

export async function selectEmailProvider(context = {}) {
  const targetDir = context.targetDir;
  const explicitProviderId = context.explicitProviderId || context.providerId || context.selectedProviderId || null;
  const configuredProviders = targetDir ? await listConfiguredEmailProviders(targetDir) : [];

  if (explicitProviderId) {
    return {
      selection: 'explicit',
      provider: targetDir
        ? await inspectEmailProvider(targetDir, explicitProviderId)
        : getEmailProviderDefinition(explicitProviderId),
      configuredProviders,
    };
  }

  if (configuredProviders.length === 1) {
    return {
      selection: 'configured',
      provider: configuredProviders[0],
      configuredProviders,
    };
  }

  if (configuredProviders.length > 1) {
    return {
      selection: 'ambiguous',
      provider: null,
      configuredProviders,
    };
  }

  return {
    selection: 'recommended',
    provider: recommendEmailProvider(context),
    configuredProviders,
  };
}

export async function writeEmailProviderSettings(targetDir, providerRecord, envValues) {
  if (!providerRecord?.id || !providerRecord?.config_path || !providerRecord?.setup) {
    throw new Error('Invalid provider record');
  }

  const settingsPath = join(targetDir, providerRecord.config_path);
  const settingsDir = dirname(settingsPath);
  const config = await readJsonFile(settingsPath);
  const currentServers = config.mcpServers && typeof config.mcpServers === 'object'
    ? config.mcpServers
    : {};
  const currentProviderConfig = currentServers[providerRecord.id] && typeof currentServers[providerRecord.id] === 'object'
    ? currentServers[providerRecord.id]
    : {};
  const currentEnv = currentProviderConfig.env && typeof currentProviderConfig.env === 'object'
    ? currentProviderConfig.env
    : {};

  config.mcpServers = {
    ...currentServers,
    [providerRecord.id]: {
      ...currentProviderConfig,
      command: providerRecord.setup.command,
      args: Array.isArray(providerRecord.setup.args) ? [...providerRecord.setup.args] : providerRecord.setup.args,
      env: {
        ...currentEnv,
        ...envValues,
      },
    },
  };

  await mkdir(settingsDir, { recursive: true });
  await writeFile(settingsPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
}

export async function writeEmailProviderState(targetDir, providerRecord, details = {}) {
  if (!providerRecord?.state_path) {
    throw new Error('Invalid provider record');
  }

  const statePath = join(targetDir, providerRecord.state_path);
  await mkdir(dirname(statePath), { recursive: true });

  const lines = [
    `# ${providerRecord.id[0].toUpperCase()}${providerRecord.id.slice(1)} Setup`,
    '',
    `- configured_at: ${new Date().toISOString()}`,
    '- setup_complete: true',
  ];

  if (details.defaultSenderEmail) {
    lines.push(`- default_sender_email: ${details.defaultSenderEmail}`);
  }

  if (details.senderDomain) {
    lines.push(`- sender_domain: ${details.senderDomain}`);
  }

  lines.push(`- api_key_storage: ${providerRecord.config_path}`, '');

  await writeFile(statePath, `${lines.join('\n')}`, 'utf-8');
}

import { listInstalled, installAgent, removeAgent, getAgentMeta, getLocalizedDescription } from './agents.js';
import { createResourceCli } from './resource-cli.js';

export const agentsCli = createResourceCli({
  resourceName: 'Agents',
  i18nPrefix: 'agents',
  browseUrl: 'https://github.com/renatoasse/opensquad/tree/main/agents',
  usageInstall: 'opensquad agents install <id>',
  usageRemove: 'opensquad agents remove <id>',
  usageUpdate: 'opensquad update <name>',
  listInstalled,
  install: installAgent,
  remove: removeAgent,
  getMeta: getAgentMeta,
  getLocalizedDescription,
  formatListItem: (meta, desc) => {
    const parts = [];
    if (meta.icon) parts.push(meta.icon);
    parts.push(meta.name);
    if (meta.category) parts.push(`(${meta.category})`);
    parts.push(`- ${desc.split('.')[0]}`);
    return parts.join(' ');
  },
});

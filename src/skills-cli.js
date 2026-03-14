import { listInstalled, installSkill, removeSkill, getSkillMeta, getLocalizedDescription } from './skills.js';
import { createResourceCli } from './resource-cli.js';

export const skillsCli = createResourceCli({
  resourceName: 'Skills',
  i18nPrefix: 'skills',
  browseUrl: 'https://github.com/renatoasse/opensquad/tree/main/skills',
  usageInstall: 'opensquad install <id>',
  usageRemove: 'opensquad uninstall <id>',
  usageUpdate: 'opensquad update <name>',
  listInstalled,
  install: installSkill,
  remove: removeSkill,
  getMeta: getSkillMeta,
  getLocalizedDescription,
  formatListItem: (meta, desc) => {
    const parts = [meta.name];
    if (meta.type) parts.push(`(${meta.type})`);
    parts.push(`- ${desc.split('.')[0]}`);
    return parts.join(' ');
  },
});

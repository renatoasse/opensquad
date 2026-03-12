import { t } from './i18n.js';

export function createPrompt() {
  return {
    async ask(question) {
      const { default: input } = await import('@inquirer/input');
      return input({ message: question });
    },
    async choose(question, options) {
      const { default: select } = await import('@inquirer/select');

      const choices = options.map(opt => ({
        name: opt.label,
        value: opt,
      }));

      return select({
        message: `  ${question}`,
        choices,
        loop: false,
      });
    },
    async multiChoose(question, options, { validate } = {}) {
      const { default: checkbox, Separator } = await import('@inquirer/checkbox');

      const choices = options.map(opt => {
        if (opt.separator) return new Separator(opt.label);
        return {
          name: opt.label,
          value: opt.value,
          checked: opt.checked ?? false,
          disabled: opt.disabled ? t('comingSoon') : false,
        };
      });

      return checkbox({
        message: `  ${question}`,
        choices,
        loop: false,
        validate: validate ?? ((selected) =>
          selected.length > 0 || t('atLeastOneIde')),
      });
    },
    close() {},
  };
}

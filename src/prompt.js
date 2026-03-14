import { t } from './i18n.js';

// Cached dynamic imports — avoid re-importing on every call.
let _input, _select, _checkbox, _Separator;
async function getInput() { return _input ??= (await import('@inquirer/input')).default; }
async function getSelect() { return _select ??= (await import('@inquirer/select')).default; }
async function getCheckbox() {
  if (!_checkbox) {
    const mod = await import('@inquirer/checkbox');
    _checkbox = mod.default;
    _Separator = mod.Separator;
  }
  return { checkbox: _checkbox, Separator: _Separator };
}

export function createPrompt() {
  return {
    async ask(question) {
      const input = await getInput();
      return input({ message: question });
    },
    async choose(question, options) {
      const select = await getSelect();

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
      const { checkbox, Separator } = await getCheckbox();

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
    // No-op: inquirer prompts are self-contained and do not hold persistent
    // resources (streams, timers, etc.) that need explicit teardown.
    close() {},
  };
}

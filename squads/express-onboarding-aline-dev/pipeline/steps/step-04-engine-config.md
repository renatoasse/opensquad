---
execution: inline
agent: "squads/express-onboarding-aline-dev/agents/anderson-arch"
outputFile: "squads/express-onboarding-aline-dev/output/engine-config.json"
model_tier: powerful
---

# Step 04: Anderson Arch — Engine Config e Roadmap MVP

## Context Loading
- `squads/express-onboarding-aline-dev/_build/discovery.yaml`
- `squads/express-onboarding-aline-dev/memory.md`

## Instructions
1. Ler submissão do formulário técnico no app Aline Builds
2. Executar `tasks/processar-formulario.md`
3. Executar `tasks/gerar-engine-config.md` → `engine-config.json`
4. Executar `tasks/gerar-roadmap-mvp.md` → `roadmap-mvp.md`
5. Executar `tasks/registrar-log-arch.md`
6. Notificar no Telegram (thread_id: 2)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 2:
"📐 Anderson Arch: Engine config para [cliente] — [N] módulos — Roadmap MVP ✅"

## Quality Criteria
- [ ] `engine-config.json` é JSON válido
- [ ] `roadmap-mvp.md` cobre no máximo 4 épicos
- [ ] memory.md com resumo técnico

## Veto Conditions
1. JSON com sintaxe inválida
2. Roadmap com escopo fora do MVP

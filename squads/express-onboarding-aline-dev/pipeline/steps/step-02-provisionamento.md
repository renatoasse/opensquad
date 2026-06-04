---
execution: subagent
agent: "squads/express-onboarding-aline-dev/agents/kevin-keeper"
outputFile: "squads/express-onboarding-aline-dev/output/keeper-log.md"
model_tier: fast
---

# Step 02: Kevin Keeper — Provisionamento e Boas-Vindas VIP

## Context Loading
- `squads/express-onboarding-aline-dev/_build/discovery.yaml`
- `squads/express-onboarding-aline-dev/memory.md`

## Instructions
1. Validar payload Hotmart (pagamento aprovado R$ 7.100)
2. Extrair nome, email, transaction_id
3. Executar `tasks/criar-repositorio.md` via `github_api`
4. Executar `tasks/enviar-boas-vindas.md` via `email_sender`
5. Executar `tasks/registrar-log-keeper.md`
6. Notificar no Telegram (thread_id: 3)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 3:
"🎩 Kevin Keeper: [cliente] — Repositório [url] ✅ — E-mail enviado ✅"

## Quality Criteria
- [ ] Repositório criado como privado
- [ ] E-mail contém link do repositório e formulário técnico
- [ ] memory.md atualizado com run_id e status

## Veto Conditions
1. E-mail enviado antes da confirmação da URL do repositório
2. Log não registrar resultado final

---
execution: subagent
agent: "squads/sucesso-retencao-aline-dev/agents/kelly"
outputFile: "squads/sucesso-retencao-aline-dev/output/kelly-monitoramento.md"
model_tier: fast
---

# Step 01: Kelly QA — Monitoramento Contínuo de Integrações

## Context Loading
- `squads/sucesso-retencao-aline-dev/_build/discovery.yaml`
- `squads/sucesso-retencao-aline-dev/memory.md`

## Instructions
1. Executar `tasks/testar-webhooks.md` para validar Stripe, WhatsApp e Instagram
2. Confirmar status 200 para cada endpoint
3. Em caso de falha, executar `tasks/notificar-falhas.md` imediatamente
4. Executar `tasks/registrar-log-vera.md`
5. Notificar no Telegram (thread_id: 3)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 3:
"✅ Kelly QA: [N] endpoints verificados — ✅ Todos OK"
Em falha: "✅ Kelly QA: 🚨 Falha em [endpoint] — Status [código]"

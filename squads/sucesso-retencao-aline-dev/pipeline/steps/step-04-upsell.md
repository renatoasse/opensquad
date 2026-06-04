---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/lavinia"
outputFile: "squads/sucesso-retencao-aline-dev/output/lavinis-upsell.md"
model_tier: fast
---

# Step 04: Lavínis Expansão — Análise de Uso e Upsell

## Instructions
1. Executar `tasks/avaliar-uso.md` para verificar percentual de consumo
2. Se cliente >80%, executar `tasks/fazer-pitch-upsell.md`
3. Indicar upgrade: `https://pay.hotmart.com/U103223194X?off=s845q5lt`
4. Sugerir Elite Onboarding (R$ 2.900) ou aumento de plano
5. Executar `tasks/registrar-log-ladeira.md`
6. Notificar no Telegram (thread_id: 4)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 4:
"🚀 Lavínis Expansão: [cliente] em [N]% de uso — Upsell enviado ✅"

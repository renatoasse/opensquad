---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/maite"
outputFile: "squads/sucesso-retencao-aline-dev/output/maite-concierge.md"
model_tier: fast
---

# Step 08: Maitê Concierge — Ofertas por Fidelidade

## Instructions
1. Verificar clientes com 3 ou 6 meses de recorrência estável
2. Selecionar oferta: módulo novo, upgrade de agentes, template SaaS
3. Enviar proposta personalizada com desconto por fidelidade
4. Registrar oferta enviada
5. Notificar no Telegram (thread_id: 18)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 18:
"🤝 Maitê Concierge: [cliente] — [3/6 meses] — Oferta: [upgrade] — Enviada ✅"

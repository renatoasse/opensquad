---
agent: barbara-blueprint
step: radar_blueprints
execution: inline
model_tier: powerful
inputFile: ""
outputFile: "squads/vendas-lucrativas/output/blueprints-processados.md"
---

# Step 01 — Barbara Blueprint: Radar de Blueprints

## Objetivo
Barbara identifica novos blueprints registrados (via Firestore/webhook), entra em contato com o lead e inicia o funil de conversão.

## Processo
1. Verifique novos blueprints na fila de entrada
2. Para cada lead, entre em contato com a mensagem padrão ajustada ao contexto
3. Registre cada contato realizado e o status da resposta
4. Salve o relatório de blueprints processados
5. Notifique no Telegram (thread_id: 6)

## Formato de Saída
Salve em `squads/vendas-lucrativas/output/blueprints-processados.md`:
- Total de blueprints processados
- Por lead: nome, app, contato realizado, status
- Próximos passos

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 6:
"⚡ Barbara Blueprint: [N] blueprints processados — [N] contatos realizados"

---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/ronaldo"
outputFile: "squads/sucesso-retencao-aline-dev/output/ronaldo-roi.md"
model_tier: fast
---

# Step 03: Ronaldo ROI — Relatório Semanal de ROI

## Instructions
1. Executar `tasks/analisar-logs.md` para consolidar leads, mensagens e tarefas
2. Executar `tasks/gerar-relatorio-roi.md` (Horas Humanas Economizadas)
3. Enviar e-mail com assunto "Seu lucro da semana com a Aline Dev Agentics"
4. Executar `tasks/registrar-log-natan.md`
5. Notificar no Telegram (thread_id: 5)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 5:
"📈 Ronaldo ROI: R$ [valor] economizados vs R$ 563 mensalidade — [cliente]"

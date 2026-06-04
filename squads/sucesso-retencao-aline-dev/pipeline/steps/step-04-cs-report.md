---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/celina"
outputFile: "squads/sucesso-retencao-aline-dev/output/celina-cs.md"
model_tier: powerful
---

# Step 04: Celina CS — Relatório de Eficiência High-Ticket

## Instructions
1. Conectar à VPS e ler logs_execucao dos clientes Setup
2. Compilar: tarefas executadas, tokens gastos, horas economizadas
3. Gerar minirrelatório de eficiência
4. Enviar para cada cliente no Telegram
5. Registrar envio e notificar no Telegram (thread_id: 16)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 16:
"💎 Celina CS: [cliente] — [N] tarefas — [N] tokens — [N]h economizadas ✅"

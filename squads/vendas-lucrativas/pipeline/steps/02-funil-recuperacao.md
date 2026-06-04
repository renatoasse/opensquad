---
agent: leandro-funil
step: funil_recuperacao
execution: inline
model_tier: powerful
inputFile: "squads/vendas-lucrativas/output/blueprints-processados.md"
outputFile: "squads/vendas-lucrativas/output/carrinhos-recuperados.md"
---

# Step 02 — Leandro Funil: Recuperação de Carrinhos Abandonados

## Objetivo
Leandro monitora carrinhos abandonados e blueprints não pagos, disparando comunicações de resgate e remarketing.

## Processo
1. Leia o relatório de blueprints processados pela Barbara
2. Identifique blueprints não pagos e carrinhos abandonados
3. Dispare mensagens de recuperação para cada lead
4. Registre os resgates e reengajamentos
5. Salve o relatório de recuperação
6. Notifique no Telegram (thread_id: 8)

## Formato de Saída
Salve em `squads/vendas-lucrativas/output/carrinhos-recuperados.md`:
- Total de leads em recuperação
- Por lead: nome, estágio, abordagem, resultado
- Taxa de recuperação

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 8:
"🔄 Leandro Funil: [N] carrinhos recuperados — [N] leads reengajados"

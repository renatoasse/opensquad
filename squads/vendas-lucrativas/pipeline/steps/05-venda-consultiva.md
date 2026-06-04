---
agent: flavio-fechador
step: venda_consultiva
execution: inline
model_tier: powerful
inputFile: "squads/vendas-lucrativas/output/carrinhos-recuperados.md"
outputFile: "squads/vendas-lucrativas/output/fechamentos-high-ticket.md"
---

# Step 03 — Flávio Fechador: Venda Consultiva High-Ticket

## Objetivo
Flávio realiza vendas consultivas 1x1 focadas no Engine SaaS White-Label (R$ 7.100) e High-Ticket (R$ 4.210).

## Processo
1. Leia os leads recuperados e qualificados
2. Para cada lead com potencial high-ticket, realize abordagem consultiva
3. Quebre objeções usando a linha editorial de vendas
4. Registre cada conversa e resultado
5. Salve o relatório de fechamentos
6. Notifique no Telegram (thread_id: 7)

## Formato de Saída
Salve em `squads/vendas-lucrativas/output/fechamentos-high-ticket.md`:
- Total de abordagens high-ticket
- Por lead: nome, objeções, resultado
- Faturamento potencial e realizado

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 7:
"🔥 Flávio Fechador: [N] abordagens — [N] objeções quebradas — R$ [valor] em pipeline"

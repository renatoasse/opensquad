---
agent: jose-closer
step: proposta_high_ticket
execution: inline
model_tier: powerful
inputFile: "squads/vendas-lucrativas/output/leads-triados.md"
outputFile: "squads/vendas-lucrativas/output/propostas-comerciais.md"
---

# Step 06 — José Closer: Propostas Comerciais High-Ticket

## Objetivo
José redige propostas comerciais ultra personalizadas para leads qualificados pela Eleonora, cria links de checkout Hotmart e prepara scripts de WhatsApp.

## Processo
1. Leia o relatório de leads qualificados da Eleonora
2. Para cada lead qualificado (alto/médio potencial):
   - Redija proposta personalizada: nome do app, dor, solução, investimento
   - Gere link de checkout Hotmart para o produto (Arquiteto MVP R$52 / High-Ticket R$4.210 / Setup R$7.100)
   - Prepare script de WhatsApp para abordagem
3. Salve o pacote de propostas
4. Notifique no Telegram (thread_id: 20)

## Formato de Saída
Salve em `squads/vendas-lucrativas/output/propostas-comerciais.md`:
- Total de propostas redigidas
- Por lead: nome, produto, valor, link checkout, script WhatsApp
- Valor total em pipeline

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 20:
"🎯 José Closer: [N] propostas — R$ [valor] pipeline — [N] scripts WhatsApp"

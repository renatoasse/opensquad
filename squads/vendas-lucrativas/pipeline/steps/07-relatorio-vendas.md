---
agent: georgia-gerente
step: relatorio_vendas
execution: inline
model_tier: powerful
inputFile: "squads/vendas-lucrativas/output/propostas-comerciais.md"
outputFile: "squads/vendas-lucrativas/output/relatorio-vendas.md"
---

# Step 07 — Geórgia Gerente: Relatório de Fechamento Semanal

## Objetivo
Geórgia compila o relatório de fechamento do ciclo semanal: conteúdo (Criador de Conteúdo) → leads (Prospecção B2B) → vendas (Vendas Lucrativas). Este relatório encerra o fluxo da semana anterior.

## Processo
1. Leia todos os outputs da run:
   - `squads/vendas-lucrativas/output/leads-triados.md`
   - `squads/vendas-lucrativas/output/propostas-comerciais.md`
   - `squads/vendas-lucrativas/output/fechamentos-high-ticket.md`
   - `squads/vendas-lucrativas/output/blueprints-processados.md`
2. Compile o relatório de vendas
3. Salve o relatório
4. Poste no Telegram (thread_id: 1 — geral)

## Formato de Saída
Salve em `squads/vendas-lucrativas/output/relatorio-vendas.md`:

```markdown
# 📊 Relatório de Vendas — [Data]

## Leads
- Triados: [N] → Qualificados: [N]
- Alto potencial: [N] | Médio: [N] | Baixo: [N]

## Propostas
- Enviadas: [N]
- Valor total em pipeline: R$ [valor]

## Fechamentos
- Arquiteto MVP (R$52): [N]
- High-Ticket (R$4.210): [N]
- Setup White-Label (R$7.100): [N]

## Faturamento
- Realizado: R$ [valor]
- Pipeline: R$ [valor]

## Próximos Passos
- Leads para follow-up: [N]
- Ajustes na abordagem: [insights]
```

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 1 (geral):
"📊 Relatório Semanal de Vendas\n\n✅ Leads triados: [N]\n📋 Propostas: [N] (R$ [valor])\n💰 Fechamentos: [N] MVP · [N] HT · [N] Setup\n📈 Faturamento: R$ [valor]\n\n👉 Próximos passos: [resumo]"

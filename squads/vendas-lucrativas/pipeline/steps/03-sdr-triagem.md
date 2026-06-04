---
agent: eleonora-sdr
step: sdr_triagem
execution: inline
model_tier: powerful
inputFile: "squads/prospeccao-b2b-sp/output/leads-formatados.md"
outputFile: "squads/vendas-lucrativas/output/leads-triados.md"
---

# Step 05 — Eleonora SDR: Triagem de Leads Frios

## Objetivo
Eleonora tria os leads frios das redes sociais (Prospecção B2B de sexta) e do Arquiteto MVP, qualificando quem tem potencial para virar cliente.

## Processo
1. Leia os leads extraídos pela Prospecção B2B:
   - `squads/prospeccao-b2b-sp/output/leads-formatados.md`
   - `squads/prospeccao-b2b-sp/output/leads-diagnosticados.md`
2. Analise cada lead: perfil do negócio, fit com produtos Aline Dev, potencial de conversão
3. Classifique como: alto, médio ou baixo potencial
4. Salve o relatório de triagem
5. Notifique no Telegram (thread_id: 19)

## Formato de Saída
Salve em `squads/vendas-lucrativas/output/leads-triados.md`:
- Total de leads triados
- Por lead: nome, negócio, fit, potencial, recomendação
- Leads qualificados para proposta (encaminhados ao José)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 19:
"🔍 Eleonora SDR: [N] leads triados — [N] qualificados — [N] alto potencial"

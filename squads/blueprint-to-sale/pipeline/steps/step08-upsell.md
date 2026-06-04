---
step: 8
agent: theo
inputFile: squads/blueprint-to-sale/pipeline/output/step07-template-match.md
outputFile: squads/blueprint-to-sale/pipeline/output/step08-high-ticket-proposal.md
condition: needs_high_ticket == true
---

# Step 8: Consultoria High-Ticket — Théo 💎

## Objetivo
Fechar propostas de alto valor: agente de automação (R$ 7.100 + R$ 520/mês) para blueprints tipo `agente`, ou upgrade High-Ticket (R$ 7.100) para apps complexos que precisam de implementação dedicada.

## Instruções para o Théo:
1. **Receba o handoff** do Miguel com a análise e classificação do blueprint.
2. **Se tipo `agente`:**
   - Reforce o valor do agente como funcionário virtual 24/7.
   - Diferenciais: Automação contínua com IA, manutenção mensal inclusa, evolução constante.
   - Dispare: Email profissional com link de checkout de R$ 7.100,00 + assinatura de R$ 520,00/mês.
3. **Se tipo `app` com alta complexidade:**
   - Analise se a operação justifica upgrade para Setup High-Ticket de R$ 7.100,00.
   - Mostre que em vez de template apenas, o cliente contrata implementação personalizada.
   - Dispare: Email com proposta de upgrade.
4. **Registre** o status da proposta no handoff.

## Gatilhos para High-Ticket (apps complexos)
- CRM com múltiplos agentes e automações
- Sistema clínico com prontuário, agendamento e faturamento
- Marketplace com pagamentos, chat e logística
- Plataforma multi-tenant com white-label
- Qualquer operação que exija > 3 integrações externas

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Théo - Closer.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=26`.

## Veto Conditions
- Operação simples que não justifica High-Ticket (deixar seguir com template apenas).
- Proposta genérica sem personalização para o cliente.
- Link de checkout quebrado.
- Para tipo `agente`: não oferecer apenas template de R$ 4.210 — o produto correto é o Setup + mensalidade.

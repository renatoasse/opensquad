---
step: 8
agent: theo
inputFile: squads/blueprint-to-sale/pipeline/output/step07-template-match.md
outputFile: squads/blueprint-to-sale/pipeline/output/step08-high-ticket-proposal.md
condition: needs_high_ticket == true
---

# Step 8: Consultoria High-Ticket — Théo 💎

## Objetivo
Para blueprints complexos (CRM agêntico, sistema clínico com automação profunda), elaborar proposta comercial personalizada de R$ 7.100,00 mostrando o valor do Setup de Implementação.

## Instruções para o Théo:
1. **Receba o handoff** do Miguel com a análise do blueprint.
2. **Analise a complexidade:** Identifique se a operação realmente justifica o High-Ticket.
3. **Elabore a proposta:** Mostre que em vez de apenas código bruto, o cliente contrata uma equipe de robôs.
4. **Diferenciais:** Automação completa, suporte dedicado, deploy gerenciado, atualizações contínuas.
5. **Dispare:** Email profissional com link de checkout de R$ 7.100,00.
6. **Registre** o status da proposta no handoff.

## Gatilhos para High-Ticket
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

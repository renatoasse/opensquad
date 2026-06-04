---
name: Payment Webhook Processor (Hotmart)
description: Processamento e verificação de status de vendas via webhooks Hotmart.
type: prompt
version: 1.0.0
categories: [fintech, automation]
env: [HOTMART_WEBHOOK_SECRET]
---

# Payment Webhook Skill

## Protocolo de Atuação
1. **Validação de Token:** Verifique a autenticidade do webhook usando o `HOTMART_WEBHOOK_SECRET`.
2. **Status Mapeado:**
   - `approved` / `completed`: Gatilho para o Keeper entregar o repositório.
   - `canceled` / `refunded`: Gatilho para revogar acesso (se aplicável) e registrar no CRM.
3. **Handoff:** Atualize o `state.json` do squad com o `purchase_status` para ramificação do pipeline.

## Segredos:
Use a variável `${HOTMART_WEBHOOK_SECRET}` para validação.

---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/ravi"
outputFile: "squads/sucesso-retencao-aline-dev/output/ravi-triagem.md"
model_tier: fast
---

# Step 02: Ravi Suporte — Triagem e Defesa dos Termos

## Instructions
1. Verificar novas solicitações de suporte (Replit, e-mail)
2. Identificar pedidos de reembolso ou customização braçal
3. Resgatar Log de Aceite dos Termos (data, hora, IP)
4. Responder com política de não-reembolso (produto self-service digital)
5. Registrar interação e notificar no Telegram (thread_id: 15)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 15:
"🛡️ Ravi Suporte: [N] solicitações — [N] reembolsos bloqueados"

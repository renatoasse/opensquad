---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/gael"
outputFile: "squads/sucesso-retencao-aline-dev/output/gael-killswitch.md"
model_tier: fast
---

# Step 06: Gael Kill-Switch — Cobrança e Suspensão

## Instructions
1. Verificar status das assinaturas Hotmart
2. Se atraso: notificar cliente com link de regularização
3. Se não regularizar: avisar Firestore → flag suspended
4. Engine congelada na VPS
5. Se regularizar: reverter para active
6. Notificar no Telegram (thread_id: 17)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 17:
"🔒 Gael Kill-Switch: [cliente] — [ação: notificado/suspenso/regularizado]"

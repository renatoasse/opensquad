---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/alex"
outputFile: "squads/sucesso-retencao-aline-dev/output/alex-auditoria.md"
model_tier: powerful
---

# Step 02: Alex Auditor — Auditoria de Performance e Tokens

## Instructions
1. Executar `tasks/auditar-performance.md` (LCP, FID, CLS, tokens)
2. Executar `tasks/sugerir-otimizacoes.md`
3. Executar `tasks/registrar-log-turbo.md`
4. Notificar no Telegram (thread_id: 2)

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 2:
"⚡ Alex Auditor: LCP [valor] — FID [valor] — CLS [valor] — Tokens: [N] — [status]"

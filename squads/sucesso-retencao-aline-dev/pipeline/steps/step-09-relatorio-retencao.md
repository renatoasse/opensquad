---
execution: inline
agent: "squads/sucesso-retencao-aline-dev/agents/georgia"
outputFile: "squads/sucesso-retencao-aline-dev/output/relatorio-retencao.md"
model_tier: powerful
---

# Step 09: Geórgia Gerente — Relatório Semanal de Retenção

## Instructions
1. Leia outputs de todos os steps:
   - `output/ravi-triagem.md`
   - `output/kelly-monitoramento.md`
   - `output/alex-auditoria.md`
   - `output/celina-cs.md`
   - `output/ronaldo-roi.md`
   - `output/gael-killswitch.md`
   - `output/lavinis-upsell.md`
   - `output/maite-concierge.md`
2. Compile relatório executivo semanal
3. Poste no Telegram (thread_id: 1 — geral)

## Formato
```markdown
# 📊 Relatório Semanal — Sucesso & Retenção

## 🛡️ Suporte
- Solicitações: [N] | Reembolsos bloqueados: [N]

## ✅ Integrações
- Endpoints OK: [N] | Falhas: [N]

## ⚡ Performance
- LCP [valor] | FID [valor] | CLS [valor]
- Tokens: [N] | Gargalos: [N]

## 💎 CS High-Ticket
- Clientes atendidos: [N] | Horas economizadas: [N]

## 📈 ROI
- Economia: R$ [valor] | Mensalidade: R$ 520

## 🔒 Kill-Switch
- Inadimplentes: [N] | Suspensos: [N] | Regularizados: [N]

## 🚀 Upsell
- Upsells enviados: [N]

## 🤝 Concierge
- Ofertas de fidelidade: [N]

## 🎯 Resumo
[parágrafo com visão geral e próximos passos]
```

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 1 (geral):
"📊 Relatório Semanal de Retenção\n\n🛡️ Suporte: [N] reembolsos bloqueados\n💎 CS: [N] clientes | [N]h economizadas\n📈 ROI: R$ [valor] vs R$ 520\n🔒 Kill-Switch: [N] suspensos\n🚀 Upsell: [N] enviados\n🤝 Concierge: [N] ofertas"

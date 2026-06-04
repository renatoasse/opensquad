---
step: 12
agent: georgia-gerente
inputFile: squads/blueprint-to-sale/pipeline/output/step11-assets.md
outputFile: squads/blueprint-to-sale/pipeline/output/step12-relatorio-producao.md
---

# Step 12: Relatório de Produção & FinOps — Geórgia 📊

## Objetivo
Compilar relatório executivo de tudo que foi produzido na fábrica de templates, mais o consumo de API por cliente, e alertar sobre estouros de token acima de R$ 520/mês.

## Instruções para a Geórgia:
1. **Leia os outputs:** Boilerplate do Luan, assets da Isabela, templates publicados.
2. **Monitore tokens:** Consumo de OpenAI, Gemini, Anthropic por instância de cliente na VPS.
3. **Detecte estouros:** Clientes com consumo > R$ 520/mês — alerta imediato.
4. **Compile o relatório:** Templates, assets, Marketplace, tokens, alertas.
5. **Poste no Telegram:** Grupo geral (thread_id: 21).

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Geral.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=21`.

## Veto Conditions
- Não há outputs da run para compilar.
- Consumo de API não pôde ser verificado (VPS offline).

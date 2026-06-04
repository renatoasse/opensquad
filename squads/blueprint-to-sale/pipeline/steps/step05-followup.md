---
step: 5
agent: oracle
inputFile: squads/blueprint-to-sale/pipeline/output/step04-sales-sent.md
outputFile: squads/blueprint-to-sale/pipeline/output/step05-followup-report.md
condition: purchase_status != 'completed'
---

# Step 5: Follow-up Sniper de Mercado

## Objetivo
Tirar o usuário de "cima do muro" com dados e insights.

## Instruções para o Oracle:
1. **Aguarde/Verifique:** Verificado após 48h sem compra.
2. **Pesquisa Adicional:** Traga uma estatística nova e impactante do setor.
3. **Escrita:** Email consultivo: "Vimos o potencial, aqui está um dado extra para o seu negócio".
4. **Reforce a oferta.**

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Otávio Follow-up Strategic.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=7`.

## Veto Conditions
- Dados de mercado falsos ou não citados.
- Email agressivo demais.

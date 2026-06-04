---
step: 6
agent: keeper
inputFile: squads/blueprint-to-sale/pipeline/output/step03-github-report.md
outputFile: squads/blueprint-to-sale/pipeline/output/step06-delivery-done.md
condition: purchase_status == 'completed'
---

# Step 6: Entrega e Sucesso do Cliente

## Objetivo
Transferir a posse e celebrar o novo negócio do cliente.

## Instruções para o Keeper:
1. **Webhook Detection:** Atuado quando a compra é confirmada.
2. **Convite GitHub:** Use `github_api` para adicionar o comprador como admin.
3. **Email de Boas-vindas:** Um guia "Agora o Negócio é Seu" impecável.
4. **Encerramento:** Marque a pipeline como completa.

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Paulo Pós Venda.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=8`.

## Veto Conditions
- UserGithub inválido ou não processado.
- Email de entrega sem manual de deploy.

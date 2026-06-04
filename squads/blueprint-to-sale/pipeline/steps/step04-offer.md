---
step: 4
agent: mercury
inputFile: squads/blueprint-to-sale/pipeline/output/step03-github-report.md
outputFile: squads/blueprint-to-sale/pipeline/output/step04-sales-sent.md
---

# Step 4: Campanha de Oferta Irresistível

## Objetivo
Disparar o email comercial para o usuário do blueprint.

## Instruções para o Mercury:
1. **Puxe os metadados:** Nome do usuário, Email, URL do repositório pronto, tipo do blueprint (app ou agente).
2. **Redija o Pitch conforme o tipo:**
   - `app` → Foque no valor de R$ 4.210,00 e no tempo economizado com o template pronto.
   - `agente` → Foque no valor do Setup de R$ 7.100,00 + R$ 520/mês de manutenção. Destaque que o cliente contrata uma equipe de robôs, não apenas código.
3. **Template HTML:** Use um design elegante compatível com a marca Aline Builds.
4. **Envio:** Dispare via `email_sender`.
5. **Acompanhamento:** Marque no state que a oferta foi enviada e o tipo de produto ofertado.

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Eduardo Email marketing.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=3`.

## Veto Conditions
- Erro gramatical no pitch.
- Link de checkout quebrado ou ausente.
- Tom de voz informal demais.

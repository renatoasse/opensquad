---
step: 3
agent: atlas
inputFile: squads/blueprint-to-sale/pipeline/output/step02-app-codebase.md
outputFile: squads/blueprint-to-sale/pipeline/output/step03-github-report.md
---

# Step 3: Publicação e Baseline SecOps

## Objetivo
Criar o repositório GitHub e garantir que o código esteja implantado profissionalmente.

## Instruções para o Atlas:
1. **Crie o Repo:** Nome `alinebuilds-{appname}-mvp`.
2. **Prepare o README:** Use um template premium com badges e prints/mockups simulados.
3. **Auditoria:** Verifique segredos.
4. **Push:** Realize o `git push` inicial.
5. **Retorne metadados:** URL do repositório e ID.

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Allan DevOps.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=2`.

## Veto Conditions
- Repositório criado como público.
- README desordenado.
- Segredos comitados.

---
step: 1
agent: sage
inputFile: firestore://blueprints?orderBy=createdAt&direction=desc&limit=1
outputFile: squads/blueprint-to-sale/pipeline/output/step01-blueprint-analysis.md
---

# Step 1: Análise e Briefing Estratégico

## Objetivo
Capturar a ideia bruta do blueprint e transformá-la em um plano de execução comercial e técnico de alto nível.

## Instruções para o Sage:
1. **Leia o contexto do Firestore** (fornecido pelo trigger).
2. **Extraia:** Nome do App, Problema, Audiência, Features principais.
3. **Pesquise o Mercado:** Encontre ao menos 2 concorrentes ou tendências de nicho.
4. **Mapeie o MVP:** Defina quais das 12 features do marketplace são mais adequadas.
5. **Gere o Handoff:** Um documento com seções: [Análise de Mercado], [Stack Técnica], [Features MVP], [Dicionário i18n Inicial].

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Samuel Estrategista de Negócios.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=10`.

## Veto Conditions
- O blueprint não tem email do usuário.
- O nome do app é genérico demais.
- Não há uma stack técnica definida.

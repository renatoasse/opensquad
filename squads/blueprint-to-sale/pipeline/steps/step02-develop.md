---
step: 2
agent: forge
inputFile: squads/blueprint-to-sale/pipeline/output/step01-blueprint-analysis.md
outputFile: squads/blueprint-to-sale/pipeline/output/step02-app-codebase.md
---

# Step 2: Desenvolvimento do Forjador

## Objetivo
Construir a base de código do MVP baseada no marketplace da Aline Builds, aplicando i18n e White-label.

## Instruções para o Forge:
1. **Estruture o Projeto:** Use o padrão Next.js (App Router).
2. **Configure o White-Label:** Crie `config/brand.ts` com cores e nome baseados na análise do Sage.
3. **Execute Traduções:** Gere os arquivos JSON para os 5 idiomas usando o briefing.
4. **Codifique o Core:** Implemente a Landing Page com Section Hero, Features e Pricing.
5. **Gere o Snapshot:** Liste todos os arquivos e o conteúdo mestre para o Atlas.

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Flávia Full stack developer.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=4`.

## Veto Conditions
- Faltam idiomas no dicionário.
- Variáveis de marca estão hardcoded.
- O README técnico é inexistente.

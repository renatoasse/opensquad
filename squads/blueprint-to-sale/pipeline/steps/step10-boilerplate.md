---
step: 10
agent: luan
inputFile: pipeline/data/ranking-ideias.md
outputFile: squads/blueprint-to-sale/pipeline/output/step10-boilerplate.md
---

# Step 10: Geração de Boilerplate — Luan 🔧

## Objetivo
Pegar a ideia aprovada pelo ranking de Growth e gerar a estrutura completa do template: rotas, Firestore, schemas de dados limpos. Acelerar a esteira de produtos do Marketplace.

## Instruções para o Luan:
1. **Consuma a ideia:** Leia o ranking de ideias aprovado e selecione a prioridade.
2. **Injete contexto no Cursor AI:** Estruture o prompt técnico com stack, arquitetura e regras de negócio.
3. **Gere as rotas:** Next.js App Router com todas as páginas necessárias (landing, dashboard, admin).
4. **Conecte o Firestore:** Coleções, índices compostos, security rules e tipos TypeScript.
5. **Esquematize os dados:** Schemas limpos com validação (Zod), relações e hooks de acesso.
6. **Prepare o boilerplate:** Estrutura de diretórios, configuração white-label, i18n inicial.
7. **Versionamento:** Crie o repositório no GitHub e registre o template no catálogo do Marketplace.

## Stack Padrão dos Boilerplates
- Next.js 14 (App Router) + TypeScript
- Firebase/Firestore + Security Rules
- Tailwind CSS + shadcn/ui
- Zod para validação de schemas
- i18n com next-intl (5 idiomas)
- Engine white-label configurável

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Luan - Boilerplates.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=67`.

## Veto Conditions
- Ideia não tem aprovação do time de Growth.
- Stack técnica não definida ou incompatível.
- Já existe template similar no Marketplace.

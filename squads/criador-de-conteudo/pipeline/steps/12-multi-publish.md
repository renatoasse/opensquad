---
agent: sofia-social
step: multi_publish
execution: inline
model_tier: fast
inputFile: "squads/criador-de-conteudo/output/veredito-final.md"
outputFile: "squads/criador-de-conteudo/output/publish-report.md"
---

# Step 12 — Sofia Social: Multi-Publish

## Objetivo
Sofia Social publica o conteúdo aprovado no LinkedIn, X (Twitter) e Google Meu Negócio da Aline Builds.

## Processo

1. **Verifique o veredito** em `squads/criador-de-conteudo/output/veredito-final.md`.
   - Se status for `REPROVADO`, PARE.

2. **Leia o conteúdo final:**
   - `squads/criador-de-conteudo/output/linkedin-post.md` (post LinkedIn)
   - `squads/criador-de-conteudo/output/twitter-thread.md` (thread Twitter/X)
   - `squads/criador-de-conteudo/output/content-pack.md` (artigo, vídeo, GMB)
   - `squads/criador-de-conteudo/output/design-brief.md` (infográfico)

3. **Publicação LinkedIn:**
   - Texto do artigo + hashtags estratégicas + link.
   - Use `linkedin-automation`.

4. **Publicação X (Twitter):**
   - Use `twitter-automation` para postar a Thread/Tweet gerada.

5. **Publicação GMB:**
   - Use `google-business-automation` para criar o post "What's New".

6. **Relatório:** Salve o relatório geral de multi-publicação.

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/publish-report.md`:

```markdown
# Relatório de Multi-Publicação — [Nome do SaaS]
**Data:** [data]

## Status por Rede
- **LinkedIn:** [✅ OK / ❌ Erro]
- **X (Twitter):** [✅ OK / ❌ Erro]
- **Google Meu Negócio:** [✅ OK / ❌ Erro]
```

## Notificação Telegram
Após salvar o relatório, notifique nos tópicos do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (sofia-social)
- Envie no seu tópico: `📣 *Sofia Social:* Publicação concluída! ✅ LinkedIn | ✅ X | ✅ GMB`
- Envie no tópico geral (thread_id: 1): `📣 *Squad Criador de Conteúdo:* Pipeline concluído! Conteúdo publicado com sucesso.`

## Veto Conditions
- NUNCA publicar sem o aval escrito da Vera.
- Confirmar sempre com a Aline antes de disparar.

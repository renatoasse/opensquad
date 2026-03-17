---
execution: inline
agent: creator
inputFile: squads/insta-mvp/output/seo-brief.md
outputFile: squads/insta-mvp/output/carousel-draft.md
format: instagram-feed
---

# Step 08: Criar carrossel e legenda (Carla)

## Context Loading

- Notícia escolhida (step 03)
- Ângulo escolhido (step 06)
- Tom escolhido (step 07)
- `squads/insta-mvp/output/{run_id}/seo-brief.md` — caption_brief e hashtag_set do Sérgio
- `squads/insta-mvp/pipeline/data/tone-of-voice.md`
- `squads/insta-mvp/pipeline/data/triangulation-guide.md`
- `squads/insta-mvp/pipeline/data/output-examples.md`
- `_opensquad/core/best-practices/instagram-feed.md` (injetado pelo Runner via format)
- `squads/insta-mvp/agents/creator.agent.md` e tarefas create-instagram-feed, optimize-instagram-feed

## Instructions

1. Carregar notícia, ângulo, tom e seo-brief.
2. Executar agente **Carla Carrossel**: tarefas create-instagram-feed e optimize-instagram-feed. A legenda é definida **em conjunto** com o brief do Sérgio: Carla redige; Sérgio fará a finalização (hashtags e ajustes SEO) no step 09.
3. Produzir carrossel (formato + slides) e caption_draft (sem bloco de hashtags).
4. Gravar em `squads/insta-mvp/output/{run_id}/carousel-draft.md`. Step 09 (Sérgio) usará caption_draft para entregar legenda final + hashtags.

## Output Format

Formato definido em create-instagram-feed e optimize-instagram-feed: format, slides[], caption_draft.

## Veto Conditions

- Falha se capa não tiver título forte ou se algum slide tiver &lt; 40 palavras sem justificativa.
- Falha se caption_draft não tiver gancho nos primeiros 125 caracteres.

## Quality Criteria

- [ ] 8–10 slides (ou 6–10 conforme formato); 40–80 palavras por slide.
- [ ] caption_draft com gancho e CTA; triangulação natural.

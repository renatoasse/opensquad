---
execution: inline
agent: seo
inputFile: squads/insta-mvp/output/carousel-draft.md
outputFile: squads/insta-mvp/output/caption-final.md
format: instagram-feed
---

# Step 09: Finalizar legenda e hashtags (Sérgio)

## Context Loading

- `squads/insta-mvp/output/{run_id}/carousel-draft.md` — caption_draft da Carla
- `squads/insta-mvp/output/{run_id}/seo-brief.md` — hashtag_set e caption_brief
- `squads/insta-mvp/pipeline/data/quality-criteria.md`
- `squads/insta-mvp/agents/seo.agent.md` e tarefa optimize-caption-hashtags

## Instructions

1. Carregar carousel-draft (caption_draft) e seo-brief (hashtag_set).
2. Executar agente **Sérgio SEO**: tarefa optimize-caption-hashtags. A legenda é **co-definida** com a Carla; aqui Sérgio finaliza: ajusta primeiros 125 (keywords/triangulação se necessário), formatação e anexa bloco de hashtags.
3. Produzir caption_final (texto completo + hashtags) e optimization_notes.
4. Gravar em `squads/insta-mvp/output/{run_id}/caption-final.md`. O conteúdo completo (carrossel + esta legenda) será revisado por Renata no step 10.

## Output Format

YAML com caption_final (texto com hashtags no final), hashtags_final, optimization_notes. O Runner pode manter também o carousel-draft para o step 10 (reviewer precisa dos slides + legenda).

## Veto Conditions

- Falha se caption_final &gt; 2200 caracteres.
- Falha se mais de 15 hashtags ou hashtag banido.

## Quality Criteria

- [ ] caption_final ≤ 2200 caracteres; 5–15 hashtags.
- [ ] Primeiros 125 caracteres preservam ou melhoram o gancho.
